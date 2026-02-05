import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, shareReplay, of, catchError, BehaviorSubject, combineLatest, switchMap } from 'rxjs';
import {
  MonthlyIncomeVsExpensePoint,
  ChannelRevenueShare
} from '../../shared/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { RouterLink } from '@angular/router';

// ========== INTERFACES ==========

interface PlatformOption {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly accentColorLight: string;
}

interface DateRangeOption {
  readonly id: string;
  readonly label: string;
  readonly months: number;
}

interface ChartDataPoint {
  readonly label: string;
  readonly income: number;
  readonly expense: number;
  readonly x: number;
  readonly incomeY: number;
  readonly expenseY: number;
}

interface PlatformBreakdown {
  readonly platform: string;
  readonly income: number;
  readonly expense: number;
  readonly net: number;
  readonly percentage: number;
  readonly color: string;
  readonly icon: string;
}

interface KpiCard {
  readonly label: string;
  readonly value: number;
  readonly trend: string;
  readonly trendPositive: boolean;
  readonly icon: string;
  readonly accentColor: string;
}

@Component({
  selector: 'app-main-dashboard-page',
  standalone: true,
  imports: [CommonModule, TopNavbarComponent, RouterLink],
  templateUrl: './main-dashboard-page.component.html',
  styleUrls: ['./main-dashboard-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainDashboardPageComponent {
  private readonly dashboardService = inject(DashboardService);
  protected readonly navItems = MAIN_NAV_ITEMS;

  // ========== PLATFORM OPTIONS (from backend origins) ==========
  protected readonly platforms: readonly PlatformOption[] = [
    {
      id: 'GLOBAL',
      name: 'Global',
      icon: 'bar_chart',
      accentColor: '#2563EB',
      accentColorLight: 'rgba(37, 99, 235, 0.1)'
    },
    {
      id: 'AMAZON',
      name: 'Amazon',
      icon: 'storefront',
      accentColor: '#FF9900',
      accentColorLight: 'rgba(255, 153, 0, 0.1)'
    },
    {
      id: 'SHOPIFY',
      name: 'Shopify',
      icon: 'shopping_bag',
      accentColor: '#96BF48',
      accentColorLight: 'rgba(150, 191, 72, 0.1)'
    },
    {
      id: 'MANUAL',
      name: 'Manual',
      icon: 'edit_note',
      accentColor: '#8B5CF6',
      accentColorLight: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  // ========== DATE RANGE OPTIONS ==========
  protected readonly dateRanges: readonly DateRangeOption[] = [
    { id: 'current-month', label: 'Mes Actual', months: 1 },
    { id: 'last-3-months', label: 'Últimos 3 meses', months: 3 },
    { id: 'last-6-months', label: 'Últimos 6 meses', months: 6 },
    { id: 'last-year', label: 'Último año', months: 12 }
  ];

  // ========== REACTIVE STATE ==========
  protected readonly selectedPlatform = signal<string>('GLOBAL');
  protected readonly selectedDateRange = signal<string>('last-6-months');

  // Chart dimensions
  private readonly CHART_WIDTH = 600;
  private readonly CHART_HEIGHT = 200;
  private readonly CHART_PADDING = 40;

  // Platform colors map
  private readonly platformColors: { [key: string]: { color: string; icon: string } } = {
    'AMAZON': { color: '#FF9900', icon: 'storefront' },
    'SHOPIFY': { color: '#96BF48', icon: 'shopping_bag' },
    'MANUAL': { color: '#8B5CF6', icon: 'edit_note' },
    'EBAY': { color: '#0064D2', icon: 'store' },
    'OTHER': { color: '#6B7280', icon: 'category' }
  };

  // ========== DASHBOARD VIEW MODEL ==========
  protected readonly dashboardVm$ = this.dashboardService.getDashboard().pipe(
    map((snapshot) => {
      const channelRevenue = snapshot.channelRevenue || [];
      const monthlyData = snapshot.monthlyIncomeVsExpense || [];

      // Calculate totals
      const totalIncome = channelRevenue.reduce((sum, c) => sum + c.amount, 0);
      const totalExpense = snapshot.summaryCards?.find(c => c.label.includes('Gasto'))?.value || 0;
      const totalBalance = totalIncome - Math.abs(totalExpense);

      // Build KPI cards
      const kpiCards = this.buildKpiCards(snapshot.summaryCards || [], totalIncome, totalExpense, totalBalance);

      // Build chart data
      const chartData = this.buildChartData(monthlyData);
      const incomePath = this.buildLinePath(chartData, 'income');
      const expensePath = this.buildLinePath(chartData, 'expense');

      // Build platform breakdown
      const platformBreakdown = this.buildPlatformBreakdown(channelRevenue, totalIncome);

      // Calculate Y-axis ticks
      const maxValue = Math.max(
        ...monthlyData.map(p => Math.max(p.income, p.expense)),
        1
      );
      const yAxisMax = Math.ceil(maxValue / 5000) * 5000;
      const yAxisTicks = this.generateYAxisTicks(yAxisMax, 5);

      return {
        kpiCards,
        chartData,
        incomePath,
        expensePath,
        platformBreakdown,
        yAxisTicks,
        yAxisMax,
        totalIncome,
        totalExpense: Math.abs(totalExpense),
        totalBalance,
        transactionCount: channelRevenue.reduce((sum, c) => sum + (c.percentage > 0 ? 1 : 0), 0),
        availablePlatforms: this.getAvailablePlatforms(channelRevenue)
      };
    }),
    catchError((error) => {
      console.error('Dashboard load error:', error);
      return of(this.getEmptyViewModel());
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ========== EVENT HANDLERS ==========
  selectPlatform(platformId: string): void {
    this.selectedPlatform.set(platformId);
  }

  selectDateRange(rangeId: string): void {
    this.selectedDateRange.set(rangeId);
  }

  getSelectedPlatform(): PlatformOption | undefined {
    return this.platforms.find(p => p.id === this.selectedPlatform());
  }

  trackByPlatform(index: number, item: PlatformOption): string {
    return item.id;
  }

  trackByRange(index: number, item: DateRangeOption): string {
    return item.id;
  }

  trackByBreakdown(index: number, item: PlatformBreakdown): string {
    return item.platform;
  }

  // ========== PRIVATE METHODS ==========

  private buildKpiCards(
    summaryCards: readonly { label: string; value: number; trend: string; trendColor: string }[],
    totalIncome: number,
    totalExpense: number,
    totalBalance: number
  ): KpiCard[] {
    return [
      {
        label: 'Ingresos Netos',
        value: totalIncome,
        trend: summaryCards[0]?.trend || '+0%',
        trendPositive: !summaryCards[0]?.trend?.startsWith('-'),
        icon: 'trending_up',
        accentColor: '#10B981'
      },
      {
        label: 'Gastos Netos',
        value: Math.abs(totalExpense),
        trend: summaryCards[1]?.trend || '+0%',
        trendPositive: summaryCards[1]?.trend?.startsWith('-') || false,
        icon: 'trending_down',
        accentColor: '#EF4444'
      },
      {
        label: 'Balance Neto',
        value: totalBalance,
        trend: summaryCards[2]?.trend || '+0%',
        trendPositive: totalBalance >= 0,
        icon: 'account_balance',
        accentColor: totalBalance >= 0 ? '#2563EB' : '#EF4444'
      }
    ];
  }

  private buildChartData(data: readonly MonthlyIncomeVsExpensePoint[]): ChartDataPoint[] {
    if (data.length === 0) return [];

    const maxIncome = Math.max(...data.map(p => p.income), 1);
    const maxExpense = Math.max(...data.map(p => p.expense), 1);
    const maxValue = Math.max(maxIncome, maxExpense);
    const chartWidth = this.CHART_WIDTH - this.CHART_PADDING * 2;
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

    return data.map((point, index) => ({
      label: point.label,
      income: point.income,
      expense: point.expense,
      x: this.CHART_PADDING + index * stepX,
      incomeY: this.CHART_HEIGHT - (point.income / maxValue) * (this.CHART_HEIGHT - 20),
      expenseY: this.CHART_HEIGHT - (point.expense / maxValue) * (this.CHART_HEIGHT - 20)
    }));
  }

  private buildLinePath(data: ChartDataPoint[], type: 'income' | 'expense'): string {
    if (data.length === 0) return '';

    return data
      .map((point, index) => {
        const y = type === 'income' ? point.incomeY : point.expenseY;
        return `${index === 0 ? 'M' : 'L'}${point.x},${y}`;
      })
      .join(' ');
  }

  private buildPlatformBreakdown(
    channelRevenue: readonly ChannelRevenueShare[],
    totalIncome: number
  ): PlatformBreakdown[] {
    return channelRevenue
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map(channel => {
        const platformKey = channel.channel.toUpperCase();
        const config = this.platformColors[platformKey] || this.platformColors['OTHER'];
        return {
          platform: channel.channel,
          income: channel.amount,
          expense: 0,
          net: channel.amount,
          percentage: totalIncome > 0 ? Math.round((channel.amount / totalIncome) * 100) : 0,
          color: channel.color || config.color,
          icon: config.icon
        };
      });
  }

  private generateYAxisTicks(max: number, count: number): number[] {
    const step = max / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(max - i * step));
  }

  private getAvailablePlatforms(channelRevenue: readonly ChannelRevenueShare[]): string[] {
    return ['GLOBAL', ...channelRevenue.filter(c => c.amount > 0).map(c => c.channel.toUpperCase())];
  }

  private getEmptyViewModel() {
    return {
      kpiCards: [] as KpiCard[],
      chartData: [] as ChartDataPoint[],
      incomePath: '',
      expensePath: '',
      platformBreakdown: [] as PlatformBreakdown[],
      yAxisTicks: [0],
      yAxisMax: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalBalance: 0,
      transactionCount: 0,
      availablePlatforms: ['GLOBAL']
    };
  }
}
