import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';
import { TransactionApiResponse } from '../../shared/models/transaction-api.model';
import { DetailedTransaction, TransactionMetric } from '../../shared/models/transactions.model';

/**
 * Request DTO for creating a new transaction.
 */
export interface CreateTransactionRequest {
  readonly amount: number;
  readonly description: string;
  readonly platform: string;
  readonly category: string;
  readonly origin: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly apiUrl = environment.apiUrls.transactions;

  // Reactive state
  private readonly _transactions = signal<DetailedTransaction[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _currentPage = signal<number>(0);
  private readonly _totalPages = signal<number>(0);
  private readonly _totalElements = signal<number>(0);

  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();

  // Computed metrics (placeholder - backend may provide these in future)
  readonly metrics = computed<TransactionMetric[]>(() => {
    const txs = this._transactions();
    const totalIncome = txs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const count = txs.length;

    return [
      {
        label: 'Ingresos Totales',
        value: totalIncome,
        currency: 'USD',
        trend: '+0% vs último mes',
        isPositive: true
      },
      {
        label: 'Transacciones',
        value: count,
        trend: '+0% vs último mes',
        isPositive: true
      },
      {
        label: 'Pedidos',
        value: Math.floor(count * 0.6),
        trend: '+0% vs último mes',
        isPositive: true
      },
      {
        label: 'Clientes Activos',
        value: 0,
        trend: '+0% vs último mes',
        isPositive: true
      }
    ];
  });

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch paginated transactions from backend.
   */
  getTransactions(page: number = 0, size: number = 20): Observable<PaginatedResponse<DetailedTransaction>> {
    this._loading.set(true);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<TransactionApiResponse>>(this.apiUrl, { params }).pipe(
      map(response => this.mapPaginatedResponse(response)),
      tap(response => {
        this._transactions.set(response.content);
        this._currentPage.set(response.currentPage);
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
   * Create a new transaction.
   */
  createTransaction(request: CreateTransactionRequest): Observable<DetailedTransaction> {
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
   * Load next page of transactions.
   */
  loadNextPage(): Observable<PaginatedResponse<DetailedTransaction>> {
    const nextPage = this._currentPage() + 1;
    if (nextPage >= this._totalPages()) {
      return throwError(() => new Error('No more pages'));
    }
    return this.getTransactions(nextPage);
  }

  /**
   * Refresh transactions (reload first page).
   */
  refresh(): Observable<PaginatedResponse<DetailedTransaction>> {
    return this.getTransactions(0);
  }

  // ========== Private Mapping Methods ==========

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
    const dateTime = new Date(tx.date);

    return {
      id: tx.id,
      origin: tx.origin,
      date: dateTime.toISOString().split('T')[0], // Extract date part
      time: dateTime.toTimeString().split(' ')[0], // Extract time part (derived from date)
      description: tx.description,
      platform: tx.platform,
      amount: tx.amount,
      status: this.mapStatus(tx.status),
      category: tx.category,
      // Optional fields not in backend - set to undefined
      fee: undefined,
      manual: undefined,
      paymentMethod: undefined,
      reference: undefined,
      customer: undefined
    };
  }

  /**
   * Map backend status string to frontend status enum.
   */
  private mapStatus(status: string): DetailedTransaction['status'] {
    const statusMap: Record<string, DetailedTransaction['status']> = {
      'RECEIVED': 'Recibido',
      'PAID': 'Pagado',
      'PROCESSING': 'Procesando',
      'COMPLETED': 'Completado',
      'PENDING': 'Pendiente',
      'SENT': 'Enviado',
      // Direct mappings if backend uses Spanish
      'Recibido': 'Recibido',
      'Pagado': 'Pagado',
      'Procesando': 'Procesando',
      'Completado': 'Completado',
      'Pendiente': 'Pendiente',
      'Enviado': 'Enviado'
    };
    return statusMap[status] || 'Pendiente';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error loading transactions';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Unauthorized - Please login again';
    }
    return throwError(() => new Error(message));
  }
}
