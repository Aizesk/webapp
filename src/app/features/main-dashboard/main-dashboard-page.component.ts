import { ChangeDetectionStrategy, Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, shareReplay, of, catchError, combineLatest, switchMap, distinctUntilChanged } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MonthlyIncomeVsExpensePoint,
  ChannelRevenueShare,
  CategoryExpense,
  TransactionItem
} from '../../shared/models/dashboard.model';
import { DashboardService, PlatformFilter } from '../../core/services/dashboard.service';
import { TimeRange } from '../../core/config/dashboard.constants';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { RouterLink } from '@angular/router';

// ========== INTERFACES ==========

interface PlatformOption {
  readonly id: PlatformFilter;
  readonly name: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly accentColorLight: string;
}

interface DateRangeOption {
  readonly id: TimeRange;
  readonly label: string;
  readonly months: number;
}

interface ChartDataPoint {
  readonly label: string;
  readonly date: string;
  readonly income: number;
  readonly expense: number;
  readonly x: number;
  readonly incomeY: number;
  readonly expenseY: number;
}

/**
 * Tooltip state for mouse-following tooltip.
 */
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  chartX: number;
  date: string;
  income: number;
  expense: number;
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
  imports: [
    CommonModule,
    TopNavbarComponent,
    RouterLink,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './main-dashboard-page.component.html',
  styleUrls: ['./main-dashboard-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainDashboardPageComponent {
  private readonly dashboardService = inject(DashboardService);
  protected readonly navItems = MAIN_NAV_ITEMS;

  // ========== PLATFORM OPTIONS (from backend origins) ==========
  // Main platforms (non-dropdown)
  protected readonly mainPlatforms: readonly PlatformOption[] = [
    {
      id: 'GLOBAL',
      name: 'Global',
      icon: 'bar_chart',
      accentColor: '#2563EB',
      accentColorLight: 'rgba(37, 99, 235, 0.1)'
    },
    {
      id: 'MANUAL',
      name: 'Manual',
      icon: 'edit_note',
      accentColor: '#8B5CF6',
      accentColorLight: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  // Platform connections (for dropdown)
  protected readonly platformConnections: readonly PlatformOption[] = [
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
      id: 'EBAY',
      name: 'eBay',
      icon: 'local_offer',
      accentColor: '#0064D2',
      accentColorLight: 'rgba(0, 100, 210, 0.1)'
    }
  ];

  // Combined for backward compatibility
  protected readonly platforms: readonly PlatformOption[] = [
    ...this.mainPlatforms,
    ...this.platformConnections
  ];

  // Platform dropdown state
  protected readonly showPlatformDropdown = signal<boolean>(false);

  protected readonly selectedPlatformConnection = computed(() => {
    const selected = this.selectedPlatform();
    return this.platformConnections.find(p => p.id === selected) ?? null;
  });

  protected readonly isPlatformConnectionSelected = computed(() => {
    const selected = this.selectedPlatform();
    return this.platformConnections.some(p => p.id === selected);
  });

  // ========== DATE RANGE OPTIONS (simplified, no redundant filters) ==========
  protected readonly dateRanges: readonly DateRangeOption[] = [
    { id: 'THIS_MONTH', label: 'Este Mes', months: 1 },
    { id: 'LAST_MONTH', label: 'Mes Anterior', months: 1 },
    { id: '6M', label: '6 Meses', months: 6 },
    { id: '1Y', label: '1 Año', months: 12 },
    { id: 'CUSTOM', label: 'Personalizado', months: 0 }
  ];

  // ========== REACTIVE STATE ==========
  protected readonly selectedPlatform = signal<PlatformFilter>('GLOBAL');
  protected readonly selectedDateRange = signal<TimeRange>('THIS_MONTH');

  // Custom date range state
  protected readonly customDateFrom = signal<Date | null>(null);
  protected readonly customDateTo = signal<Date | null>(null);
  protected readonly showDatePicker = signal<boolean>(false);

  // Get current date range label for display
  protected readonly currentDateRangeLabel = computed(() => {
    const rangeId = this.selectedDateRange();
    if (rangeId === 'CUSTOM') {
      const from = this.customDateFrom();
      const to = this.customDateTo();
      if (from && to) {
        return `${from.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
      }
      return 'Seleccionar fechas';
    }
    return this.dateRanges.find(r => r.id === rangeId)?.label || '30D';
  });

  // ========== TOOLTIP STATE ==========
  protected readonly tooltipState = signal<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    chartX: 0,
    date: '',
    income: 0,
    expense: 0
  });

  // ========== CATEGORY ANALYSIS TOGGLE ==========
  protected readonly categoryViewMode = signal<'expenses' | 'incomes'>('expenses');

  // Convert signals to observables for RxJS integration
  private readonly selectedPlatform$ = toObservable(this.selectedPlatform);
  private readonly selectedDateRange$ = toObservable(this.selectedDateRange);
  private readonly customDateFrom$ = toObservable(this.customDateFrom);
  private readonly customDateTo$ = toObservable(this.customDateTo);

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
  protected readonly dashboardVm$ = combineLatest([
    this.selectedDateRange$.pipe(distinctUntilChanged()),
    this.selectedPlatform$.pipe(distinctUntilChanged()),
    this.customDateFrom$,
    this.customDateTo$
  ]).pipe(
    switchMap(([timeRange, platform, customFrom, customTo]) =>
      this.dashboardService.getDashboard(timeRange, platform, false, customFrom ?? undefined, customTo ?? undefined)
    ),
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

      // Build smooth spline paths for line chart (Fintech style)
      const incomePath = this.buildSmoothPath(chartData, 'income');
      const expensePath = this.buildSmoothPath(chartData, 'expense');

      // Build area paths for gradient fill
      const incomeAreaPath = this.buildAreaPath(chartData, 'income');
      const expenseAreaPath = this.buildAreaPath(chartData, 'expense');

      // Build platform breakdown
      const platformBreakdown = this.buildPlatformBreakdown(channelRevenue, totalIncome);

      // Calculate Y-axis ticks with dynamic scaling
      const maxValue = Math.max(
        ...monthlyData.map(p => Math.max(p.income, p.expense)),
        1
      );
      
      // Determine divisor based on magnitude of data
      let divisor = 1;
      if (maxValue >= 100000) {
        divisor = 50000;
      } else if (maxValue >= 10000) {
        divisor = 5000;
      } else if (maxValue >= 1000) {
        divisor = 250;
      } else if (maxValue >= 100) {
        divisor = 25;
      } else {
        divisor = 10;
      }
      
      const yAxisMax = Math.ceil(maxValue / divisor) * divisor;
      const yAxisTicks = this.generateYAxisTicks(yAxisMax, 5);

      // Build donut chart data for platform distribution
      const donutData = this.buildDonutChartData(platformBreakdown);

      // Get category breakdowns
      const topExpenses = snapshot.expensesByCategory || [];
      const topIncomes = snapshot.incomesByCategory || [];
      const totalExpenseForCategories = snapshot.totalExpenseAmount || 0;
      const totalIncomeForCategories = snapshot.totalIncomeAmount || 0;

      // Get recent transactions (limit to 5)
      const recentTransactions = (snapshot.transactions || []).slice(0, 5);

      return {
        kpiCards,
        chartData,
        incomePath,
        expensePath,
        incomeAreaPath,
        expenseAreaPath,
        platformBreakdown,
        yAxisTicks,
        yAxisMax,
        totalIncome,
        totalExpense: Math.abs(totalExpense),
        totalBalance,
        transactionCount: channelRevenue.reduce((sum, c) => sum + (c.percentage > 0 ? 1 : 0), 0),
        availablePlatforms: this.getAvailablePlatforms(channelRevenue),
        donutData,
        topExpenses,
        topIncomes,
        totalExpenseForCategories,
        totalIncomeForCategories,
        recentTransactions
      };
    }),
    catchError((error) => {
      console.error('Dashboard load error:', error);
      return of(this.getEmptyViewModel());
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ========== EVENT HANDLERS ==========
  selectPlatform(platformId: PlatformFilter): void {
    this.selectedPlatform.set(platformId);
    // Close dropdown if selecting a main platform
    if (this.mainPlatforms.some(p => p.id === platformId)) {
      this.showPlatformDropdown.set(false);
    }
  }

  togglePlatformDropdown(): void {
    this.showPlatformDropdown.update(v => !v);
  }

  selectDateRange(rangeId: TimeRange): void {
    if (rangeId === 'CUSTOM') {
      this.showDatePicker.set(true);
    } else {
      this.showDatePicker.set(false);
      this.customDateFrom.set(null);
      this.customDateTo.set(null);
    }
    this.selectedDateRange.set(rangeId);
  }

  // Custom date range methods
  setCustomDateFrom(date: Date | null): void {
    this.customDateFrom.set(date);
    this.checkAndApplyCustomRange();
  }

  setCustomDateTo(date: Date | null): void {
    this.customDateTo.set(date);
    this.checkAndApplyCustomRange();
  }

  private checkAndApplyCustomRange(): void {
    const from = this.customDateFrom();
    const to = this.customDateTo();
    if (from && to) {
      // Close picker and trigger refresh
      this.showDatePicker.set(false);
    }
  }

  cancelCustomDateRange(): void {
    this.showDatePicker.set(false);
    this.customDateFrom.set(null);
    this.customDateTo.set(null);
    this.selectedDateRange.set('THIS_MONTH');
  }

  setCategoryViewMode(mode: 'expenses' | 'incomes'): void {
    this.categoryViewMode.set(mode);
  }

  getSelectedPlatform(): PlatformOption | undefined {
    return this.platforms.find(p => p.id === this.selectedPlatform());
  }

  trackByPlatform(index: number, item: PlatformOption): string {
    return item.id ?? 'null';
  }

  trackByRange(index: number, item: DateRangeOption): string {
    return item.id;
  }

  trackByBreakdown(index: number, item: PlatformBreakdown): string {
    return item.platform;
  }

  // ========== X-AXIS TICK LOGIC ==========
  /**
   * Determines if a label should be shown based on data density.
   * For <= 12 points: show all labels
   * For 13-30 points: show every 5th label
   * For > 30 points: show every 7th label
   * Always shows the first and last labels.
   */
  shouldShowLabel(index: number, totalPoints: number): boolean {
    if (totalPoints <= 12) {
      return true; // Show all labels for monthly data
    }

    // Always show first and last
    if (index === 0 || index === totalPoints - 1) {
      return true;
    }

    // Calculate tick interval based on density
    const tickInterval = totalPoints > 30 ? 7 : 5;
    return index % tickInterval === 0;
  }

  /**
   * Get CSS class for X-axis label visibility.
   */
  getLabelClass(index: number, totalPoints: number): string {
    return this.shouldShowLabel(index, totalPoints)
      ? 'line-chart__x-label'
      : 'line-chart__x-label line-chart__x-label--hidden';
  }

  // ========== CHART TOOLTIP HANDLERS ==========
  onChartMouseMove(event: MouseEvent, chartData: ChartDataPoint[]): void {
    const target = event.currentTarget as SVGSVGElement;
    if (!target || !chartData.length) {
      this.hideTooltip();
      return;
    }

    const rect = target.getBoundingClientRect();
    // Use clientX/Y for mouse position relative to viewport
    const mouseXPixel = event.clientX - rect.left;

    // SVG viewBox is 600x200, actual element has different dimensions
    // Scale mouse coordinates to SVG viewBox coordinates
    const svgWidth = 600;
    const scaleX = svgWidth / rect.width;
    const mouseXSvg = mouseXPixel * scaleX;

    // Chart area: x from 40 to 560 (width 520), matching the polyline scaling
    const chartStartX = 40;
    const chartEndX = 560;
    const chartWidth = chartEndX - chartStartX;

    // Clamp mouse position to chart area in SVG coordinates
    const clampedX = Math.max(chartStartX, Math.min(chartEndX, mouseXSvg));
    const relativeX = clampedX - chartStartX;

    // Find the closest data point
    const pointSpacing = chartWidth / Math.max(1, chartData.length - 1);
    const pointIndex = Math.round(relativeX / pointSpacing);
    const clampedIndex = Math.max(0, Math.min(chartData.length - 1, pointIndex));
    const dataPoint = chartData[clampedIndex];

    if (!dataPoint) {
      this.hideTooltip();
      return;
    }

    // Calculate exact X position of the data point in SVG coordinates
    const chartX = chartStartX + (clampedIndex * pointSpacing);

    this.tooltipState.set({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      chartX: chartX,
      date: dataPoint.date || dataPoint.label,
      income: dataPoint.income,
      expense: dataPoint.expense
    });
  }

  onChartMouseLeave(): void {
    this.hideTooltip();
  }

  private hideTooltip(): void {
    this.tooltipState.update(state => ({ ...state, visible: false }));
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
    if (data.length === 0) {
      // Return a single zero-point to show a flat line at the bottom
      return [{
        label: 'Sin datos',
        date: 'Sin datos',
        income: 0,
        expense: 0,
        x: this.CHART_PADDING,
        incomeY: this.CHART_HEIGHT,
        expenseY: this.CHART_HEIGHT
      }];
    }

    const maxIncome = Math.max(...data.map(p => p.income), 1);
    const maxExpense = Math.max(...data.map(p => p.expense), 1);
    const maxValue = Math.max(maxIncome, maxExpense);
    const chartWidth = this.CHART_WIDTH - this.CHART_PADDING * 2;
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

    return data.map((point, index) => ({
      label: point.label,
      date: point.label, // Use label as date for tooltip display
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

  /**
   * Build smooth cubic Bezier spline path (Fintech/Trading style)
   * Uses Catmull-Rom to Bezier conversion for natural curves
   */
  private buildSmoothPath(data: ChartDataPoint[], type: 'income' | 'expense'): string {
    if (data.length === 0) return '';
    if (data.length === 1) {
      const y = type === 'income' ? data[0].incomeY : data[0].expenseY;
      return `M${data[0].x},${y}`;
    }

    const points = data.map(p => ({
      x: p.x,
      y: type === 'income' ? p.incomeY : p.expenseY
    }));

    // Start path
    let path = `M${points[0].x},${points[0].y}`;

    // Use cubic Bezier curves with control points for smooth transitions
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Calculate control points using Catmull-Rom algorithm
      const tension = 0.3; // Lower = more smooth, higher = more angular
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    return path;
  }

  /**
   * Build area path for gradient fill (closes the curve to the bottom)
   */
  private buildAreaPath(data: ChartDataPoint[], type: 'income' | 'expense'): string {
    if (data.length === 0) return '';

    // Get the smooth line path first
    const linePath = this.buildSmoothPath(data, type);

    // Close the path to create an area (go to bottom-right, bottom-left, back to start)
    const lastX = data[data.length - 1].x;
    const firstX = data[0].x;
    const bottomY = this.CHART_HEIGHT;

    return `${linePath} L${lastX},${bottomY} L${firstX},${bottomY} Z`;
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

  /**
   * Build SVG donut chart data for platform distribution
   * Uses arc paths matching the viewBox (200x200) and stroke-based rendering
   */
  private buildDonutChartData(platforms: PlatformBreakdown[]): { segments: DonutSegment[]; total: number } {
    if (!platforms || platforms.length === 0) {
      return { segments: [], total: 0 };
    }

    const total = platforms.reduce((sum, p) => sum + p.income, 0);
    if (total === 0) {
      return { segments: [], total: 0 };
    }

    // SVG parameters matching the HTML viewBox (200x200)
    const cx = 100;
    const cy = 100;
    const r = 70; // radius matching the circle in HTML

    let startAngle = -90; // Start from top (12 o'clock)

    const segments: DonutSegment[] = platforms.map((platform) => {
      const percentage = (platform.income / total) * 100;
      const angle = (platform.income / total) * 360;
      const endAngle = startAngle + angle;
      
      // Convert angles to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      // Calculate arc endpoints
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      
      // Large arc flag: 1 if angle > 180 degrees
      const largeArc = angle > 180 ? 1 : 0;
      
      // Arc path for stroke-based donut (no fill, just the arc)
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
      
      const segment: DonutSegment = {
        platform: platform.platform,
        percentage: percentage,
        color: platform.color,
        path,
        startAngle,
        endAngle
      };
      
      startAngle = endAngle;
      return segment;
    });

    return { segments, total };
  }

  private getEmptyViewModel() {
    return {
      kpiCards: [] as KpiCard[],
      chartData: [] as ChartDataPoint[],
      incomePath: '',
      expensePath: '',
      incomeAreaPath: '',
      expenseAreaPath: '',
      platformBreakdown: [] as PlatformBreakdown[],
      yAxisTicks: [0],
      yAxisMax: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalBalance: 0,
      transactionCount: 0,
      availablePlatforms: ['GLOBAL'],
      donutData: { segments: [] as DonutSegment[], total: 0 },
      topExpenses: [] as readonly CategoryExpense[],
      topIncomes: [] as readonly CategoryExpense[],
      totalExpenseForCategories: 0,
      totalIncomeForCategories: 0,
      recentTransactions: []
    };
  }
}

interface DonutSegment {
  platform: string;
  percentage: number;
  color: string;
  path: string;
  startAngle: number;
  endAngle: number;
}
