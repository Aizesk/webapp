import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardStats, TrendDataDto, TransactionDto } from '../../shared/models/dashboard-api.model';
import {
  DashboardSnapshot,
  SummaryCard,
  WeeklyIncomePoint,
  MonthlyIncomeVsExpensePoint,
  ChannelRevenueShare,
  ReconciliationStatus,
  TransactionItem,
  ConnectedAccount,
  CategoryExpense
} from '../../shared/models/dashboard.model';
import { AuthService } from './auth.service';
import {
  TimeRange,
  DEFAULT_TIME_RANGE,
  CACHE_TTL_MS,
  getPlatformConfig,
  getDaysForRange,
  InsightSeverity,
  INSIGHT_SEVERITY_CONFIG,
  PlatformOrigin,
  CustomDateRange
} from '../config/dashboard.constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Platform filter type - includes 'GLOBAL' for all platforms.
 */
export type PlatformFilter = PlatformOrigin | 'GLOBAL' | null;

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
  readonly origin: PlatformFilter;
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
 * - Platform origin filtering (AMAZON, SHOPIFY, etc.)
 * - Smart caching with TTL
 * - Parallel HTTP requests with forkJoin
 * - Insights/Alerts system
 *
 * @author Aizesk Development Team
 * @version 3.0.0
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = environment.apiUrls.reporting;

  // ==================== REACTIVE STATE (SIGNALS) ====================

  private readonly _snapshot = signal<DashboardSnapshot | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _trendData = signal<TrendDataDto[]>([]);
  private readonly _currentTimeRange = signal<TimeRange>(DEFAULT_TIME_RANGE);
  private readonly _currentOrigin = signal<PlatformFilter>('GLOBAL');
  private readonly _insights = signal<DashboardInsight[]>([]);

  // Public readonly signals
  readonly snapshot = this._snapshot.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly trendData = this._trendData.asReadonly();
  readonly currentTimeRange = this._currentTimeRange.asReadonly();
  readonly currentOrigin = this._currentOrigin.asReadonly();
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
   * Fetch dashboard data with time range and origin filters.
   * Implements smart caching - returns cached data if valid.
   *
   * @param timeRange - Time range filter (default: '30D')
   * @param origin - Platform origin filter (default: 'GLOBAL' = all platforms)
   * @param forceRefresh - Bypass cache and fetch fresh data
   * @param customStartDate - Custom start date (for CUSTOM range)
   * @param customEndDate - Custom end date (for CUSTOM range)
   * @returns Observable<DashboardSnapshot>
   */
  getDashboard(
    timeRange: TimeRange = DEFAULT_TIME_RANGE,
    origin: PlatformFilter = 'GLOBAL',
    forceRefresh = false,
    customStartDate?: Date,
    customEndDate?: Date
  ): Observable<DashboardSnapshot> {
    // Check cache validity (skip cache for custom ranges)
    const isCustomRange = timeRange === 'CUSTOM' || timeRange === 'THIS_MONTH' || timeRange === 'LAST_MONTH';
    if (!forceRefresh && !isCustomRange && this.isCacheValid(timeRange, origin)) {
      return of(this.cache!.data);
    }

    // Return pending request if one exists (prevents duplicate calls)
    if (this.pendingRequest$) {
      return this.pendingRequest$;
    }

    this._loading.set(true);
    this._error.set(null);
    this._currentTimeRange.set(timeRange);
    this._currentOrigin.set(origin);

    const userId = this.authService.currentUser()?.userId || 'demo-user-001';

    // Build query params for both endpoints
    const dashboardParams = this.buildParams(timeRange, origin, customStartDate, customEndDate);
    const trendParams = this.buildTrendParams(timeRange, origin, customStartDate, customEndDate);

    // Create shared request (prevents duplicate HTTP calls)
    this.pendingRequest$ = forkJoin({
      dashboard: this.http.get<DashboardStats>(
        `${this.apiUrl}/dashboard/${userId}`,
        { params: dashboardParams }
      ),
      trend: this.http.get<TrendDataDto[]>(
        `${this.apiUrl}/trend/${userId}`,
        { params: trendParams }
      )
    }).pipe(
      map(({ dashboard, trend }) => {
        this._trendData.set(trend);
        return this.mapToSnapshot(dashboard, trend);
      }),
      tap(snapshot => {
        this.updateCache(snapshot, timeRange, origin);
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
  refreshDashboard(timeRange?: TimeRange, origin?: PlatformFilter): Observable<DashboardSnapshot> {
    return this.getDashboard(
      timeRange ?? this._currentTimeRange(),
      origin ?? this._currentOrigin(),
      true
    );
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

  // ==================== PRIVATE HELPERS ====================

  private buildParams(timeRange: TimeRange, origin: PlatformFilter, customStartDate?: Date, customEndDate?: Date): HttpParams {
    let params = new HttpParams();
    const now = new Date();

    // Handle special date ranges
    if (timeRange === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      params = params.set('startDate', firstDay.toISOString().split('T')[0]);
      params = params.set('endDate', lastDay.toISOString().split('T')[0]);
    } else if (timeRange === 'LAST_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      params = params.set('startDate', firstDay.toISOString().split('T')[0]);
      params = params.set('endDate', lastDay.toISOString().split('T')[0]);
    } else if (timeRange === 'CUSTOM' && customStartDate && customEndDate) {
      params = params.set('startDate', customStartDate.toISOString().split('T')[0]);
      params = params.set('endDate', customEndDate.toISOString().split('T')[0]);
    } else {
      params = params.set('range', timeRange.toLowerCase());
    }

    if (origin && origin !== 'GLOBAL') {
      params = params.set('origin', origin);
    }
    return params;
  }

  private buildTrendParams(timeRange: TimeRange, origin: PlatformFilter, customStartDate?: Date, customEndDate?: Date): HttpParams {
    let params = new HttpParams();
    const now = new Date();

    // Handle special date ranges
    if (timeRange === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      params = params.set('startDate', firstDay.toISOString().split('T')[0]);
      params = params.set('endDate', lastDay.toISOString().split('T')[0]);
    } else if (timeRange === 'LAST_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      params = params.set('startDate', firstDay.toISOString().split('T')[0]);
      params = params.set('endDate', lastDay.toISOString().split('T')[0]);
    } else if (timeRange === 'CUSTOM' && customStartDate && customEndDate) {
      params = params.set('startDate', customStartDate.toISOString().split('T')[0]);
      params = params.set('endDate', customEndDate.toISOString().split('T')[0]);
    } else {
      params = params.set('range', timeRange.toLowerCase());
    }

    if (origin && origin !== 'GLOBAL') {
      params = params.set('origin', origin);
    }
    return params;
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

  private isCacheValid(timeRange: TimeRange, origin: PlatformFilter): boolean {
    if (!this.cache) return false;
    if (this.cache.timeRange !== timeRange) return false;
    if (this.cache.origin !== origin) return false;

    const age = Date.now() - this.cache.timestamp;
    return age < CACHE_TTL_MS;
  }

  private updateCache(data: DashboardSnapshot, timeRange: TimeRange, origin: PlatformFilter): void {
    this.cache = {
      data,
      timestamp: Date.now(),
      timeRange,
      origin
    };
  }

  // ==================== MAPPING LOGIC ====================

  private mapToSnapshot(stats: DashboardStats, trend: TrendDataDto[]): DashboardSnapshot {
    const expensesByCategory = this.mapCategoryData(stats.expensesByCategory || {}, 'expense');
    const incomesByCategory = this.mapCategoryData(stats.incomesByCategory || {}, 'income');
    
    // Calculate totals for percentage bars
    const totalExpenseAmount = Object.values(stats.expensesByCategory || {}).reduce((sum, val) => sum + Math.abs(val), 0);
    const totalIncomeAmount = Object.values(stats.incomesByCategory || {}).reduce((sum, val) => sum + Math.abs(val), 0);
    
    return {
      summaryCards: this.buildSummaryCards(stats, trend),
      weeklyIncome: this.mapTrendToWeeklyIncome(trend),
      monthlyIncomeVsExpense: this.mapTrendToComparison(trend),
      transactions: this.mapRecentTransactions(stats.recentTransactions),
      accounts: this.generateDefaultAccounts(),
      channelRevenue: this.mapOriginToChannelRevenue(stats.incomesByOrigin || {}),
      reconciliation: this.generateDefaultReconciliation(),
      expensesByCategory,
      incomesByCategory,
      totalExpenseAmount,
      totalIncomeAmount
    };
  }

  private mapCategoryData(data: Record<string, number>, type: 'income' | 'expense'): readonly CategoryExpense[] {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }

    const total = Object.values(data).reduce((sum, val) => sum + Math.abs(val), 0);
    
    // Category configurations with colors and icons
    const categoryConfig: Record<string, { color: string; icon: string }> = {
      'Alimentación': { color: '#EF4444', icon: 'restaurant' },
      'Software y Herramientas': { color: '#8B5CF6', icon: 'code' },
      'Publicidad': { color: '#F59E0B', icon: 'campaign' },
      'Envíos': { color: '#3B82F6', icon: 'local_shipping' },
      'Comisiones': { color: '#EC4899', icon: 'receipt_long' },
      'Inventario': { color: '#10B981', icon: 'inventory_2' },
      'Servicios Profesionales': { color: '#6366F1', icon: 'work' },
      'Impuestos': { color: '#14B8A6', icon: 'account_balance' },
      'Devoluciones': { color: '#F97316', icon: 'keyboard_return' },
      'Vivienda': { color: '#0EA5E9', icon: 'home' },
      'Regalos': { color: '#A855F7', icon: 'redeem' },
      'Suministros': { color: '#22C55E', icon: 'bolt' },
      'Restaurantes': { color: '#F43F5E', icon: 'local_dining' },
      'Transporte': { color: '#6366F1', icon: 'directions_car' },
      'Ventas Online': { color: '#10B981', icon: 'shopping_cart' },
      'Entretenimiento': { color: '#EC4899', icon: 'theaters' },
      'Salud': { color: '#14B8A6', icon: 'health_and_safety' },
      'Educación': { color: '#3B82F6', icon: 'school' },
      'Ropa': { color: '#F59E0B', icon: 'checkroom' },
      'Otros': { color: '#6B7280', icon: 'category' }
    };

    return Object.entries(data)
      .filter(([, amount]) => amount !== 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5) // Top 5 categories
      .map(([category, amount]) => {
        const config = categoryConfig[category] || { color: '#6B7280', icon: 'category' };
        return {
          category,
          amount: Math.abs(amount),
          percentage: total > 0 ? Math.round((Math.abs(amount) / total) * 100) : 0,
          color: config.color,
          icon: config.icon
        };
      });
  }

  private mapTrendToWeeklyIncome(trend: TrendDataDto[]): readonly WeeklyIncomePoint[] {
    // Backend returns data in chronological order (oldest first) - keep it that way
    return trend.map(t => ({
      label: t.label,
      amount: t.income
    }));
  }

  private mapTrendToComparison(trend: TrendDataDto[]): readonly MonthlyIncomeVsExpensePoint[] {
    // Backend returns data in chronological order (oldest first)
    // No need to reverse - keep left=past, right=present for proper chart display
    return trend.map(t => ({
      label: t.label,
      income: t.income,
      expense: t.expense
    }));
  }

  private buildSummaryCards(stats: DashboardStats, trend: TrendDataDto[]): readonly SummaryCard[] {
    // Data is now in chronological order (oldest first)
    // Current period is the LAST element, previous period is second to last
    const currentPeriod = trend[trend.length - 1];
    const previousPeriod = trend[trend.length - 2];

    const incomeTrend = previousPeriod?.income > 0
      ? ((currentPeriod.income - previousPeriod.income) / previousPeriod.income * 100).toFixed(1)
      : '0';
    const expenseTrend = previousPeriod?.expense > 0
      ? ((currentPeriod.expense - previousPeriod.expense) / previousPeriod.expense * 100).toFixed(1)
      : '0';

    return [
      {
        label: 'Ingresos Netos',
        value: stats.totalIncome,
        trend: `${Number(incomeTrend) >= 0 ? '+' : ''}${incomeTrend}%`,
        trendColor: Number(incomeTrend) >= 0 ? 'positive' : 'negative',
        sparkline: trend.map(t => t.income) // Already in chronological order
      },
      {
        label: 'Gastos Netos',
        value: stats.totalExpense,
        trend: `${Number(expenseTrend) >= 0 ? '+' : ''}${expenseTrend}%`,
        trendColor: Number(expenseTrend) <= 0 ? 'positive' : 'negative',
        sparkline: trend.map(t => t.expense) // Already in chronological order
      },
      {
        label: 'Balance Neto',
        value: stats.totalBalance,
        trend: `${Number(incomeTrend) >= 0 ? '+' : ''}${incomeTrend}%`,
        trendColor: stats.totalBalance >= 0 ? 'positive' : 'negative',
        sparkline: trend.map(t => t.balance) // Already in chronological order
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
      }),
      origin: tx.origin || 'MANUAL'
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
