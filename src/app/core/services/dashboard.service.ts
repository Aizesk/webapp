import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardStats, MonthlyStatsDto } from '../../shared/models/dashboard-api.model';
import {
  DashboardSnapshot,
  SummaryCard,
  WeeklyIncomePoint,
  MonthlyIncomeVsExpensePoint,
  ChannelRevenueShare,
  ReconciliationStatus,
  TransactionItem,
  ConnectedAccount
} from '../../shared/models/dashboard.model';
import { AuthService } from './auth.service';

/**
 * Dashboard Service - Full Backend Integration
 * Fetches real data from MS Reporting service including monthly stats
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = environment.apiUrls.reporting;

  // Reactive state
  private readonly _snapshot = signal<DashboardSnapshot | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _monthlyStats = signal<MonthlyStatsDto[]>([]);

  readonly snapshot = this._snapshot.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly monthlyStats = this._monthlyStats.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  /**
   * Fetch dashboard stats AND monthly data from backend.
   * Uses parallel requests for efficiency.
   */
  getDashboard(): Observable<DashboardSnapshot> {
    this._loading.set(true);
    this._error.set(null);

    const userId = this.authService.currentUser()?.userId || 'demo-user-001';

    // Parallel requests to both endpoints
    return forkJoin({
      dashboard: this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/${userId}`),
      monthly: this.http.get<MonthlyStatsDto[]>(`${this.apiUrl}/monthly/${userId}?months=6`)
    }).pipe(
      map(({ dashboard, monthly }) => {
        this._monthlyStats.set(monthly);
        return this.mapToSnapshot(dashboard, monthly);
      }),
      tap(snapshot => {
        this._snapshot.set(snapshot);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        this._error.set(err.message || 'Error loading dashboard');
        const fallback = this.createFallbackSnapshot();
        this._snapshot.set(fallback);
        return of(fallback);
      })
    );
  }

  /**
   * Get individual summary cards (convenience method).
   */
  getSummaryCards(): Observable<readonly SummaryCard[]> {
    return this.getDashboard().pipe(map(s => s.summaryCards));
  }

  /**
   * Get channel revenue data (convenience method).
   */
  getChannelRevenue(): Observable<readonly ChannelRevenueShare[]> {
    return this.getDashboard().pipe(map(s => s.channelRevenue));
  }

  // ========== MAPPING LOGIC - REAL DATA FROM BACKEND ==========

  /**
   * Maps backend DashboardStats + MonthlyStats to full DashboardSnapshot.
   * Uses REAL data from MS Reporting service.
   */
  private mapToSnapshot(stats: DashboardStats, monthly: MonthlyStatsDto[]): DashboardSnapshot {
    return {
      summaryCards: this.buildSummaryCards(stats, monthly),
      weeklyIncome: this.mapMonthlyToWeeklyIncome(monthly),
      monthlyIncomeVsExpense: this.mapMonthlyToComparison(monthly),
      transactions: this.mapRecentTransactions(stats.recentTransactions),
      accounts: this.generateDefaultAccounts(),
      channelRevenue: this.mapCategoriesToChannelRevenue(stats.incomesByCategory),
      reconciliation: this.generateDefaultReconciliation()
    };
  }

  /**
   * Map monthly stats to bar chart format.
   * Reverses order for chronological display (Ago 2025 → Ene 2026).
   */
  private mapMonthlyToWeeklyIncome(monthly: MonthlyStatsDto[]): readonly WeeklyIncomePoint[] {
    // Reverse to show chronological order (oldest to newest: left to right)
    return [...monthly].reverse().map(m => ({
      label: m.label,
      amount: m.income
    }));
  }

  /**
   * Map monthly stats to line chart comparison format.
   * Reverses order for chronological display (oldest first).
   */
  private mapMonthlyToComparison(monthly: MonthlyStatsDto[]): readonly MonthlyIncomeVsExpensePoint[] {
    // Reverse to show chronological order (oldest to newest)
    return [...monthly].reverse().map(m => ({
      label: m.month,
      income: m.income,
      expense: m.expense
    }));
  }

  /**
   * Build summary cards from real backend data with trend calculation.
   */
  private buildSummaryCards(stats: DashboardStats, monthly: MonthlyStatsDto[]): readonly SummaryCard[] {
    // Calculate trend from monthly data (current month vs previous)
    const currentMonth = monthly[0];
    const previousMonth = monthly[1];

    const incomeTrend = previousMonth?.income > 0
      ? ((currentMonth.income - previousMonth.income) / previousMonth.income * 100).toFixed(1)
      : '0';
    const expenseTrend = previousMonth?.expense > 0
      ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense * 100).toFixed(1)
      : '0';

    return [
      {
        label: 'Ingresos Netos',
        value: stats.totalIncome,
        trend: `${Number(incomeTrend) >= 0 ? '+' : ''}${incomeTrend}%`,
        trendColor: Number(incomeTrend) >= 0 ? 'positive' : 'negative',
        sparkline: monthly.map(m => m.income).reverse()
      },
      {
        label: 'Gastos Netos',
        value: stats.totalExpense,
        trend: `${Number(expenseTrend) >= 0 ? '+' : ''}${expenseTrend}%`,
        trendColor: Number(expenseTrend) <= 0 ? 'positive' : 'negative',
        sparkline: monthly.map(m => m.expense).reverse()
      },
      {
        label: 'Balance Neto',
        value: stats.totalBalance,
        trend: `${Number(incomeTrend) >= 0 ? '+' : ''}${incomeTrend}%`,
        trendColor: stats.totalBalance >= 0 ? 'positive' : 'negative',
        sparkline: monthly.map(m => m.balance).reverse()
      }
    ];
  }

  /**
   * Fix UTF-8 encoding issues from backend (double-encoded characters).
   * Handles Ã³ -> ó pattern from MySQL/JDBC misconfiguration.
   */
  private fixEncoding(text: string): string {
    if (!text) return text;
    // Fix common double-encoded UTF-8 patterns (ÃÂ -> single char)
    return text
      .replace(/ÃÂ³/g, 'ó')
      .replace(/ÃÂ±/g, 'ñ')
      .replace(/ÃÂ¡/g, 'á')
      .replace(/ÃÂ©/g, 'é')
      .replace(/ÃÂº/g, 'ú')
      .replace(/ÃÂ­/g, 'í')
      // Single level encoding issues
      .replace(/Ã³/g, 'ó')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã­/g, 'í');
  }

  /**
   * Map backend recentTransactions to frontend TransactionItem[].
   */
  private mapRecentTransactions(transactions: import('../../shared/models/dashboard-api.model').TransactionDto[]): readonly TransactionItem[] {
    if (!transactions || transactions.length === 0) {
      return this.generateDefaultTransactions();
    }

    return transactions.map(tx => ({
      title: this.fixEncoding(tx.description),
      description: this.fixEncoding(tx.category),
      amount: tx.amount,
      positive: tx.type === 'INCOME',
      timestamp: new Date(tx.transactionDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }));
  }

  /**
   * Map backend incomesByCategory to frontend ChannelRevenueShare[].
   */
  private mapCategoriesToChannelRevenue(categories: { [key: string]: number }): readonly ChannelRevenueShare[] {
    const colors = ['#0f62fe', '#16a34a', '#f97316', '#8b5cf6', '#0ea5e9', '#c026d3'];

    if (!categories || Object.keys(categories).length === 0) {
      return this.generateDefaultChannelRevenue();
    }

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

    return Object.entries(categories).map(([category, amount], index) => ({
      channel: this.fixEncoding(category),
      amount: amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }

  // ========== DEFAULT/MOCK DATA GENERATORS ==========

  /**
   * Generate monthly income data with proper month labels.
   * Shows last 6 months ending in current month (Jan 2026).
   */
  private generateDefaultWeeklyIncome(totalIncome: number): readonly WeeklyIncomePoint[] {
    // Months in reverse chronological order from Jan 2026
    const months = ['Ene 2026', 'Dic 2025', 'Nov 2025', 'Oct 2025', 'Sep 2025', 'Ago 2025'];
    const baseAmount = totalIncome > 0 ? totalIncome / 6 : 8000;

    // Use deterministic distribution based on total income (not random)
    const distributions = [1.0, 0.92, 0.88, 0.95, 0.85, 0.90];

    return months.map((label, i) => ({
      label,
      amount: Math.round(baseAmount * distributions[i])
    }));
  }

  /**
   * Generate monthly comparison data with proper chronological order.
   * Shows Aug 2025 to Jan 2026 for comparison chart.
   */
  private generateDefaultMonthlyData(
    totalIncome: number,
    totalExpenses: number
  ): readonly MonthlyIncomeVsExpensePoint[] {
    // Months in chronological order ending in current month
    const months = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'];
    const baseIncome = totalIncome > 0 ? totalIncome / 6 : 8000;
    const baseExpense = totalExpenses > 0 ? totalExpenses / 6 : 250;

    // Deterministic distributions for reproducible charts
    const incomeDistributions = [0.85, 0.90, 0.95, 0.88, 0.92, 1.0];
    // More variable expense distribution to show real variation in purple line
    const expenseDistributions = [0.60, 1.20, 0.80, 1.40, 0.90, 1.10];

    return months.map((label, i) => ({
      label,
      income: Math.round(baseIncome * incomeDistributions[i]),
      expense: Math.round(baseExpense * expenseDistributions[i])
    }));
  }

  private generateDefaultTransactions(): readonly TransactionItem[] {
    return [
      { title: 'Sin transacciones recientes', description: 'Conecta una plataforma', amount: 0, positive: true, timestamp: 'Ahora' }
    ];
  }

  private generateDefaultAccounts(): readonly ConnectedAccount[] {
    return [
      { name: 'Sin cuentas', status: 'Pendiente', statusColor: 'warning' }
    ];
  }

  private generateDefaultChannelRevenue(): readonly ChannelRevenueShare[] {
    return [
      { channel: 'Sin datos', amount: 0, percentage: 100, color: '#94a3b8' }
    ];
  }

  private generateDefaultReconciliation(): readonly ReconciliationStatus[] {
    return [
      { account: 'Sin cuentas', recorded: 0, bank: 0, status: 'aligned' }
    ];
  }

  private generateSparkline(points: number, baseValue: number): readonly number[] {
    const result: number[] = [];
    const variance = baseValue > 0 ? baseValue * 0.1 : 5;
    let current = baseValue > 0 ? baseValue * 0.7 : 10;

    for (let i = 0; i < points; i++) {
      current = current + (Math.random() - 0.4) * variance;
      result.push(Math.max(0, Math.round(current)));
    }
    return result;
  }

  /**
   * Create a complete fallback snapshot when backend fails.
   */
  private createFallbackSnapshot(): DashboardSnapshot {
    return {
      summaryCards: [
        { label: 'Ingresos Netos', value: 0, trend: '+0%', trendColor: 'positive', sparkline: [0, 0, 0, 0, 0, 0, 0] },
        { label: 'Gastos Netos', value: 0, trend: '-0%', trendColor: 'negative', sparkline: [0, 0, 0, 0, 0, 0, 0] },
        { label: 'Balance Neto', value: 0, trend: '+0%', trendColor: 'positive', sparkline: [0, 0, 0, 0, 0, 0, 0] }
      ],
      weeklyIncome: this.generateDefaultWeeklyIncome(0),
      monthlyIncomeVsExpense: this.generateDefaultMonthlyData(0, 0),
      transactions: this.generateDefaultTransactions(),
      accounts: this.generateDefaultAccounts(),
      channelRevenue: this.generateDefaultChannelRevenue(),
      reconciliation: this.generateDefaultReconciliation()
    };
  }
}
