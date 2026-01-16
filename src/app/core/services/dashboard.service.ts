import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardStats, TopSource } from '../../shared/models/dashboard-api.model';
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

/**
 * Dashboard Service with HYBRID STRATEGY:
 * - Fetches real data from backend (totalIncome, totalExpenses, netSavings, topSources)
 * - Maps and fills missing visualization data with defaults/mocks
 * - Ensures UI never breaks even if backend returns minimal data
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = environment.apiUrls.reporting;

  // Reactive state
  private readonly _snapshot = signal<DashboardSnapshot | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly snapshot = this._snapshot.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch dashboard stats from backend and map to full DashboardSnapshot.
   * Uses HYBRID approach: real totals + mock visualization data.
   */
  getDashboard(): Observable<DashboardSnapshot> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).pipe(
      map(stats => this.mapToSnapshot(stats)),
      tap(snapshot => {
        this._snapshot.set(snapshot);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        this._error.set(err.message || 'Error loading dashboard');
        // Return fallback snapshot so UI doesn't break
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

  // ========== MAPPING LOGIC (HYBRID STRATEGY) ==========

  /**
   * Maps backend DashboardStats to full DashboardSnapshot.
   * Real data: totalIncome, totalExpenses, netSavings, topSources
   * Mock data: weeklyIncome, monthlyIncomeVsExpense, transactions, accounts, reconciliation
   */
  private mapToSnapshot(stats: DashboardStats): DashboardSnapshot {
    return {
      summaryCards: this.buildSummaryCards(stats),
      weeklyIncome: this.generateDefaultWeeklyIncome(stats.totalIncome),
      monthlyIncomeVsExpense: this.generateDefaultMonthlyData(stats.totalIncome, stats.totalExpenses),
      transactions: this.generateDefaultTransactions(),
      accounts: this.generateDefaultAccounts(),
      channelRevenue: this.mapTopSourcesToChannelRevenue(stats.topSources),
      reconciliation: this.generateDefaultReconciliation()
    };
  }

  /**
   * Build summary cards from real backend data.
   */
  private buildSummaryCards(stats: DashboardStats): readonly SummaryCard[] {
    return [
      {
        label: 'Ingresos Netos',
        value: stats.totalIncome,
        trend: '+0%', // Backend doesn't provide trend yet
        trendColor: 'positive',
        sparkline: this.generateSparkline(7, stats.totalIncome)
      },
      {
        label: 'Gastos Netos',
        value: stats.totalExpenses,
        trend: '-0%',
        trendColor: 'negative',
        sparkline: this.generateSparkline(7, stats.totalExpenses)
      },
      {
        label: 'Ahorro Neto',
        value: stats.netSavings,
        trend: '+0%',
        trendColor: stats.netSavings >= 0 ? 'positive' : 'negative',
        sparkline: this.generateSparkline(7, stats.netSavings)
      }
    ];
  }

  /**
   * Map backend TopSource[] to frontend ChannelRevenueShare[].
   * Uses real data from backend!
   */
  private mapTopSourcesToChannelRevenue(sources: TopSource[]): readonly ChannelRevenueShare[] {
    const colors = ['#0f62fe', '#16a34a', '#f97316', '#8b5cf6', '#0ea5e9', '#c026d3'];

    if (!sources || sources.length === 0) {
      return this.generateDefaultChannelRevenue();
    }

    return sources.map((source, index) => ({
      channel: source.platform,
      amount: source.totalAmount,
      percentage: source.percentage,
      color: colors[index % colors.length]
    }));
  }

  // ========== DEFAULT/MOCK DATA GENERATORS ==========

  private generateDefaultWeeklyIncome(totalIncome: number): readonly WeeklyIncomePoint[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const baseAmount = totalIncome > 0 ? totalIncome / 6 : 30;

    return months.map(label => ({
      label,
      amount: Math.round(baseAmount * (0.8 + Math.random() * 0.4))
    }));
  }

  private generateDefaultMonthlyData(
    totalIncome: number,
    totalExpenses: number
  ): readonly MonthlyIncomeVsExpensePoint[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'];
    const baseIncome = totalIncome > 0 ? totalIncome / 8 : 20;
    const baseExpense = totalExpenses > 0 ? totalExpenses / 8 : 15;

    return months.map(label => ({
      label,
      income: Math.round(baseIncome * (0.8 + Math.random() * 0.4)),
      expense: Math.round(baseExpense * (0.8 + Math.random() * 0.4))
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
        { label: 'Ahorro Neto', value: 0, trend: '+0%', trendColor: 'positive', sparkline: [0, 0, 0, 0, 0, 0, 0] }
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
