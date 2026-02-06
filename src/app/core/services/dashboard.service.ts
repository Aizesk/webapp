import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardStats, MonthlyStatsDto, TransactionDto } from '../../shared/models/dashboard-api.model';
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
import {
  TimeRange,
  DEFAULT_TIME_RANGE,
  CACHE_TTL_MS,
  getPlatformConfig,
  getMonthsForRange,
  InsightSeverity,
  INSIGHT_SEVERITY_CONFIG
} from '../config/dashboard.constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Dashboard insight/recommendation for the UI.
 */
export interface DashboardInsight {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: InsightSeverity;
  readonly icon: string;
  readonly color: string;
  readonly bgColor: string;
  readonly actionLabel?: string;
  readonly actionRoute?: string;
  readonly metric?: number;
  readonly metricLabel?: string;
}

/**
 * Cache entry with timestamp for TTL validation.
 */
interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly timeRange: TimeRange;
}

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Dashboard Service - Enterprise-Grade Implementation
 *
 * Features:
 * - Signal-based reactive state management
 * - Time range filtering with query params
 * - Smart caching with TTL
 * - Parallel HTTP requests with forkJoin
 * - Insights/Alerts system
 *
 * @author Aizesk Development Team
 * @version 2.0.0
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = environment.apiUrls.reporting;

  // ==================== REACTIVE STATE (SIGNALS) ====================

  private readonly _snapshot = signal<DashboardSnapshot | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _monthlyStats = signal<MonthlyStatsDto[]>([]);
  private readonly _currentTimeRange = signal<TimeRange>(DEFAULT_TIME_RANGE);
  private readonly _insights = signal<DashboardInsight[]>([]);

  // Public readonly signals
  readonly snapshot = this._snapshot.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly monthlyStats = this._monthlyStats.asReadonly();
  readonly currentTimeRange = this._currentTimeRange.asReadonly();
  readonly insights = this._insights.asReadonly();

  // Computed signals
  readonly hasData = computed(() => this._snapshot() !== null);
  readonly isHealthy = computed(() => !this._error() && this.hasData());

  // ==================== CACHE MANAGEMENT ====================

  private cache: CacheEntry<DashboardSnapshot> | null = null;
  private pendingRequest$: Observable<DashboardSnapshot> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  // ==================== PUBLIC API ====================

  /**
   * Fetch dashboard data with optional time range filter.
   * Implements smart caching - returns cached data if valid.
   *
   * @param timeRange - Time range filter (default: '30D')
   * @param forceRefresh - Bypass cache and fetch fresh data
   * @returns Observable<DashboardSnapshot>
   */
  getDashboard(
    timeRange: TimeRange = DEFAULT_TIME_RANGE,
    forceRefresh = false
  ): Observable<DashboardSnapshot> {
    // Check cache validity
    if (!forceRefresh && this.isCacheValid(timeRange)) {
      return of(this.cache!.data);
    }

    // Return pending request if one exists (prevents duplicate calls)
    if (this.pendingRequest$) {
      return this.pendingRequest$;
    }

    this._loading.set(true);
    this._error.set(null);
    this._currentTimeRange.set(timeRange);

    const userId = this.authService.currentUser()?.userId || 'demo-user-001';
    const months = getMonthsForRange(timeRange);

    // Create shared request (prevents duplicate HTTP calls)
    this.pendingRequest$ = forkJoin({
      dashboard: this.http.get<DashboardStats>(
        `${this.apiUrl}/dashboard/${userId}`,
        { params: { range: timeRange.toLowerCase() } }
      ),
      monthly: this.http.get<MonthlyStatsDto[]>(
        `${this.apiUrl}/monthly/${userId}`,
        { params: { months: months.toString() } }
      )
    }).pipe(
      map(({ dashboard, monthly }) => {
        this._monthlyStats.set(monthly);
        return this.mapToSnapshot(dashboard, monthly);
      }),
      tap(snapshot => {
        this.updateCache(snapshot, timeRange);
        this._snapshot.set(snapshot);
        this._loading.set(false);
        this.pendingRequest$ = null;
        this.generateInsights(snapshot);
      }),
      catchError(err => {
        this._loading.set(false);
        this._error.set(err.message || 'Error loading dashboard');
        this.pendingRequest$ = null;
        const fallback = this.createFallbackSnapshot();
        this._snapshot.set(fallback);
        return of(fallback);
      }),
      shareReplay(1) // Share among multiple subscribers
    );

    return this.pendingRequest$;
  }

  /**
   * Force refresh dashboard data (bypasses cache).
   */
  refreshDashboard(timeRange?: TimeRange): Observable<DashboardSnapshot> {
    return this.getDashboard(timeRange ?? this._currentTimeRange(), true);
  }

  /**
   * Get insights/recommendations based on dashboard data.
   * Returns mocked data if no backend endpoint available.
   *
   * @returns Observable<DashboardInsight[]>
   */
  getInsights(): Observable<DashboardInsight[]> {
    // If we have a snapshot, generate insights from it
    const snapshot = this._snapshot();
    if (snapshot) {
      this.generateInsights(snapshot);
      return of(this._insights());
    }

    // Otherwise, return default insights
    return of(this.generateDefaultInsights());
  }

  /**
   * Get summary cards (convenience method).
   */
  getSummaryCards(timeRange?: TimeRange): Observable<readonly SummaryCard[]> {
    return this.getDashboard(timeRange).pipe(map(s => s.summaryCards));
  }

  /**
   * Get channel revenue data (convenience method).
   */
  getChannelRevenue(timeRange?: TimeRange): Observable<readonly ChannelRevenueShare[]> {
    return this.getDashboard(timeRange).pipe(map(s => s.channelRevenue));
  }

  /**
   * Invalidate cache manually.
   */
  invalidateCache(): void {
    this.cache = null;
    this._snapshot.set(null);
  }

  // ==================== CACHE LOGIC ====================

  private isCacheValid(timeRange: TimeRange): boolean {
    if (!this.cache) return false;
    if (this.cache.timeRange !== timeRange) return false;

    const age = Date.now() - this.cache.timestamp;
    return age < CACHE_TTL_MS;
  }

  private updateCache(data: DashboardSnapshot, timeRange: TimeRange): void {
    this.cache = {
      data,
      timestamp: Date.now(),
      timeRange
    };
  }

  // ==================== MAPPING LOGIC ====================

  private mapToSnapshot(stats: DashboardStats, monthly: MonthlyStatsDto[]): DashboardSnapshot {
    return {
      summaryCards: this.buildSummaryCards(stats, monthly),
      weeklyIncome: this.mapMonthlyToWeeklyIncome(monthly),
      monthlyIncomeVsExpense: this.mapMonthlyToComparison(monthly),
      transactions: this.mapRecentTransactions(stats.recentTransactions),
      accounts: this.generateDefaultAccounts(),
      channelRevenue: this.mapOriginToChannelRevenue(stats.incomesByOrigin || {}),
      reconciliation: this.generateDefaultReconciliation()
    };
  }

  private mapMonthlyToWeeklyIncome(monthly: MonthlyStatsDto[]): readonly WeeklyIncomePoint[] {
    return [...monthly].reverse().map(m => ({
      label: m.label,
      amount: m.income
    }));
  }

  private mapMonthlyToComparison(monthly: MonthlyStatsDto[]): readonly MonthlyIncomeVsExpensePoint[] {
    return [...monthly].reverse().map(m => ({
      label: m.month,
      income: m.income,
      expense: m.expense
    }));
  }

  private buildSummaryCards(stats: DashboardStats, monthly: MonthlyStatsDto[]): readonly SummaryCard[] {
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

  private mapRecentTransactions(transactions: TransactionDto[]): readonly TransactionItem[] {
    if (!transactions || transactions.length === 0) {
      return this.generateDefaultTransactions();
    }

    return transactions.map(tx => ({
      title: tx.description,
      description: tx.category,
      amount: tx.amount,
      positive: tx.type === 'INCOME',
      timestamp: new Date(tx.transactionDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }));
  }

  /**
   * Map backend incomesByOrigin to frontend ChannelRevenueShare[].
   * Uses centralized PLATFORM_CONFIG from dashboard.constants.ts.
   */
  private mapOriginToChannelRevenue(origins: Record<string, number>): readonly ChannelRevenueShare[] {
    if (!origins || Object.keys(origins).length === 0) {
      return this.generateDefaultChannelRevenue();
    }

    const total = Object.values(origins).reduce((sum, val) => sum + val, 0);

    return Object.entries(origins)
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([origin, amount]) => {
        const config = getPlatformConfig(origin);
        return {
          channel: config.label,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
          color: config.color
        };
      });
  }

  // ==================== INSIGHTS GENERATION ====================

  private generateInsights(snapshot: DashboardSnapshot): void {
    const insights: DashboardInsight[] = [];
    const balance = snapshot.summaryCards.find(c => c.label === 'Balance Neto');
    const income = snapshot.summaryCards.find(c => c.label === 'Ingresos Netos');

    // Balance trend insight
    if (balance && balance.value > 0) {
      const config = INSIGHT_SEVERITY_CONFIG.success;
      insights.push({
        id: 'balance-positive',
        title: 'Balance Positivo',
        description: 'Tu balance neto está en positivo. ¡Sigue así!',
        severity: 'success',
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        metric: balance.value,
        metricLabel: 'Balance actual'
      });
    } else if (balance && balance.value < 0) {
      const config = INSIGHT_SEVERITY_CONFIG.warning;
      insights.push({
        id: 'balance-negative',
        title: 'Balance Negativo',
        description: 'Tu balance está en negativo. Revisa tus gastos.',
        severity: 'warning',
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        actionLabel: 'Ver gastos',
        actionRoute: '/transactions',
        metric: Math.abs(balance.value),
        metricLabel: 'Déficit'
      });
    }

    // Revenue diversification insight
    const channelCount = snapshot.channelRevenue.filter(c => c.amount > 0).length;
    if (channelCount < 2) {
      const config = INSIGHT_SEVERITY_CONFIG.info;
      insights.push({
        id: 'diversification',
        title: 'Diversifica tus ingresos',
        description: 'Conecta más plataformas para diversificar tus fuentes de ingreso.',
        severity: 'info',
        icon: 'hub',
        color: config.color,
        bgColor: config.bgColor,
        actionLabel: 'Conectar plataforma',
        actionRoute: '/connections'
      });
    }

    // Income growth insight
    if (income?.trendColor === 'positive') {
      const config = INSIGHT_SEVERITY_CONFIG.success;
      insights.push({
        id: 'income-growth',
        title: 'Ingresos en crecimiento',
        description: `Tus ingresos han aumentado ${income.trend} respecto al mes anterior.`,
        severity: 'success',
        icon: 'trending_up',
        color: config.color,
        bgColor: config.bgColor
      });
    }

    this._insights.set(insights);
  }

  private generateDefaultInsights(): DashboardInsight[] {
    const config = INSIGHT_SEVERITY_CONFIG.info;
    return [
      {
        id: 'welcome',
        title: 'Bienvenido a Aizesk',
        description: 'Conecta tus plataformas de venta para empezar a ver tus métricas.',
        severity: 'info',
        icon: 'rocket_launch',
        color: config.color,
        bgColor: config.bgColor,
        actionLabel: 'Comenzar',
        actionRoute: '/connections'
      }
    ];
  }

  // ==================== DEFAULT DATA GENERATORS ====================

  private generateDefaultWeeklyIncome(totalIncome: number): readonly WeeklyIncomePoint[] {
    const months = ['Ene 2026', 'Dic 2025', 'Nov 2025', 'Oct 2025', 'Sep 2025', 'Ago 2025'];
    const baseAmount = totalIncome > 0 ? totalIncome / 6 : 8000;
    const distributions = [1.0, 0.92, 0.88, 0.95, 0.85, 0.90];

    return months.map((label, i) => ({
      label,
      amount: Math.round(baseAmount * distributions[i])
    }));
  }

  private generateDefaultMonthlyData(
    totalIncome: number,
    totalExpenses: number
  ): readonly MonthlyIncomeVsExpensePoint[] {
    const months = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'];
    const baseIncome = totalIncome > 0 ? totalIncome / 6 : 8000;
    const baseExpense = totalExpenses > 0 ? totalExpenses / 6 : 250;
    const incomeDistributions = [0.85, 0.90, 0.95, 0.88, 0.92, 1.0];
    const expenseDistributions = [0.60, 1.20, 0.80, 1.40, 0.90, 1.10];

    return months.map((label, i) => ({
      label,
      income: Math.round(baseIncome * incomeDistributions[i]),
      expense: Math.round(baseExpense * expenseDistributions[i])
    }));
  }

  private generateDefaultTransactions(): readonly TransactionItem[] {
    return [
      {
        title: 'Sin transacciones recientes',
        description: 'Conecta una plataforma',
        amount: 0,
        positive: true,
        timestamp: 'Ahora'
      }
    ];
  }

  private generateDefaultAccounts(): readonly ConnectedAccount[] {
    return [{ name: 'Sin cuentas', status: 'Pendiente', statusColor: 'warning' }];
  }

  private generateDefaultChannelRevenue(): readonly ChannelRevenueShare[] {
    return [{ channel: 'Sin datos', amount: 0, percentage: 100, color: '#94a3b8' }];
  }

  private generateDefaultReconciliation(): readonly ReconciliationStatus[] {
    return [{ account: 'Sin cuentas', recorded: 0, bank: 0, status: 'aligned' }];
  }

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
