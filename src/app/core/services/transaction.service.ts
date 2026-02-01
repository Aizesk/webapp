import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';
import {
  TransactionApiResponse,
  TransactionApiRequest,
  TransactionFilterParams,
  KpiSummaryResponse,
  TransactionOrigin
} from '../../shared/models/transaction-api.model';
import { DetailedTransaction, TransactionMetric } from '../../shared/models/transactions.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly apiUrl = environment.apiUrls.transactions;

  // Reactive state
  private readonly _transactions = signal<DetailedTransaction[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _currentPage = signal<number>(0);
  private readonly _totalPages = signal<number>(0);
  private readonly _totalElements = signal<number>(0);
  private readonly _kpiSummary = signal<KpiSummaryResponse | null>(null);

  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly kpiSummary = this._kpiSummary.asReadonly();

  // Computed metrics from KPI summary
  readonly metrics = computed<TransactionMetric[]>(() => {
    const kpi = this._kpiSummary();
    const txs = this._transactions();

    if (kpi) {
      return [
        {
          label: 'Ingresos Totales',
          value: kpi.totalIncome,
          currency: 'EUR',
          trend: '+0% vs último mes',
          isPositive: true
        },
        {
          label: 'Gastos Totales',
          value: kpi.totalExpenses,
          currency: 'EUR',
          trend: '+0% vs último mes',
          isPositive: false
        },
        {
          label: 'Balance Neto',
          value: kpi.netBalance,
          currency: 'EUR',
          trend: '+0% vs último mes',
          isPositive: kpi.netBalance >= 0
        },
        {
          label: 'Transacciones',
          value: kpi.transactionCount,
          trend: '+0% vs último mes',
          isPositive: true
        }
      ];
    }

    // Fallback to local calculation if KPI not loaded
    const totalIncome = txs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = txs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

    return [
      {
        label: 'Ingresos Totales',
        value: totalIncome,
        currency: 'EUR',
        trend: '+0% vs último mes',
        isPositive: true
      },
      {
        label: 'Gastos Totales',
        value: totalExpenses,
        currency: 'EUR',
        trend: '+0% vs último mes',
        isPositive: false
      },
      {
        label: 'Balance Neto',
        value: totalIncome - totalExpenses,
        currency: 'EUR',
        trend: '+0% vs último mes',
        isPositive: totalIncome >= totalExpenses
      },
      {
        label: 'Transacciones',
        value: txs.length,
        trend: '+0% vs último mes',
        isPositive: true
      }
    ];
  });

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch paginated transactions from backend with optional filters.
   * Backend extracts userId from JWT token automatically.
   */
  getTransactions(filters: TransactionFilterParams = {}): Observable<PaginatedResponse<DetailedTransaction>> {
    this._loading.set(true);

    let params = new HttpParams();

    // Build query params from filter object
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params = params.set('sortDir', filters.sortDir);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.origin) params = params.set('origin', filters.origin);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<PaginatedResponse<TransactionApiResponse>>(this.apiUrl, { params }).pipe(
      map(response => this.mapPaginatedResponse(response)),
      tap(response => {
        this._transactions.set(response.content);
        this._currentPage.set(response.page);
        this._totalPages.set(response.totalPages);
        this._totalElements.set(response.totalElements);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return this.handleError(err);
      })
    );
  }

  /**
   * Get transaction by ID.
   */
  getTransactionById(id: string | number): Observable<DetailedTransaction> {
    return this.http.get<TransactionApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapTransaction(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new transaction.
   * Note: userId is extracted from JWT token server-side.
   */
  createTransaction(request: TransactionApiRequest): Observable<DetailedTransaction> {
    return this.http.post<TransactionApiResponse>(this.apiUrl, request).pipe(
      map(response => this.mapTransaction(response)),
      tap(newTx => {
        const current = this._transactions();
        this._transactions.set([newTx, ...current]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing transaction.
   */
  updateTransaction(id: string | number, request: TransactionApiRequest): Observable<DetailedTransaction> {
    return this.http.put<TransactionApiResponse>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => this.mapTransaction(response)),
      tap(updatedTx => {
        const current = this._transactions();
        const index = current.findIndex(t => t.id === updatedTx.id);
        if (index >= 0) {
          const updated = [...current];
          updated[index] = updatedTx;
          this._transactions.set(updated);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a transaction.
   */
  deleteTransaction(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this._transactions();
        this._transactions.set(current.filter(t => t.id !== String(id)));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get KPI summary for a specific month/year or current month.
   */
  getKpiSummary(month?: number, year?: number): Observable<KpiSummaryResponse> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month.toString());
    if (year !== undefined) params = params.set('year', year.toString());

    return this.http.get<KpiSummaryResponse>(`${this.apiUrl}/kpi/summary`, { params }).pipe(
      tap(kpi => this._kpiSummary.set(kpi)),
      catchError(this.handleError)
    );
  }

  /**
   * Load next page of transactions.
   */
  loadNextPage(): Observable<PaginatedResponse<DetailedTransaction>> {
    const nextPage = this._currentPage() + 1;
    if (nextPage >= this._totalPages()) {
      return throwError(() => new Error('No more pages'));
    }
    return this.getTransactions({ page: nextPage });
  }

  /**
   * Refresh transactions (reload first page).
   */
  refresh(): Observable<PaginatedResponse<DetailedTransaction>> {
    return this.getTransactions({ page: 0 });
  }

  // ========== Private Mapping Methods ==========

  /**
   * Map TransactionOrigin to display platform name
   */
  private mapOriginToPlatform(origin: TransactionOrigin): string {
    const platformMap: Record<TransactionOrigin, string> = {
      'MANUAL': 'Manual',
      'AMAZON': 'Amazon',
      'SHOPIFY': 'Shopify',
      'STRIPE': 'Stripe',
      'PAYPAL': 'PayPal',
      'BANK_SYNC': 'Banco',
      'OTHER': 'Otro'
    };
    return platformMap[origin] || 'Manual';
  }

  /**
   * Map backend PaginatedResponse<TransactionApiResponse> to PaginatedResponse<DetailedTransaction>
   */
  private mapPaginatedResponse(
    response: PaginatedResponse<TransactionApiResponse>
  ): PaginatedResponse<DetailedTransaction> {
    return {
      ...response,
      content: response.content.map(tx => this.mapTransaction(tx))
    };
  }

  /**
   * Map backend TransactionApiResponse to frontend DetailedTransaction.
   * Fills in optional fields that don't exist in backend with defaults.
   */
  private mapTransaction(tx: TransactionApiResponse): DetailedTransaction {
    const dateTime = new Date(tx.transactionDate);

    return {
      id: String(tx.id),
      type: tx.type,
      origin: tx.origin,
      date: dateTime.toISOString().split('T')[0], // Extract date part
      time: dateTime.toTimeString().split(' ')[0], // Extract time part
      concept: tx.concept || '',
      platform: this.mapOriginToPlatform(tx.origin),
      amount: tx.amount,
      currency: tx.currency,
      status: 'Completado', // Default status since backend doesn't track this
      category: tx.category || 'Sin categoría',
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt || undefined,
      // Optional fields not in backend - set to undefined
      fee: undefined,
      manual: tx.origin === 'MANUAL',
      paymentMethod: undefined,
      reference: undefined,
      customer: undefined
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error loading transactions';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Unauthorized - Please login again';
    } else if (error.status === 403) {
      message = 'Access denied - You don\'t have permission';
    } else if (error.status === 404) {
      message = 'Transaction not found';
    }
    return throwError(() => new Error(message));
  }
}
