import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, shareReplay, of, catchError } from 'rxjs';
import {
  MonthlyIncomeVsExpensePoint,
  ChannelRevenueShare
} from '../../shared/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

interface ComboChartPoint {
  label: string;
  income: number;
  expense: number;
  barY: number;
  barHeight: number;
  expenseY: number;
}

interface DonutSegment {
  label: string;
  amount: number;
  percentage: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-main-dashboard-page',
  standalone: true,
  imports: [CommonModule, TopNavbarComponent],
  templateUrl: './main-dashboard-page.component.html',
  styleUrls: ['./main-dashboard-page.component.css', './main-dashboard-page.panels.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainDashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  protected readonly navItems = MAIN_NAV_ITEMS;

  // Chart dimensions
  private readonly CHART_HEIGHT = 220;
  private readonly BAR_GAP = 80;

  protected readonly dashboardVm$ = this.dashboardService.getDashboard().pipe(
    map((snapshot) => {
      const monthlyIncomeVsExpense = snapshot.monthlyIncomeVsExpense?.length
        ? snapshot.monthlyIncomeVsExpense
        : [];
      const transactions = snapshot.transactions?.length ? snapshot.transactions : [];
      const channelRevenue = snapshot.channelRevenue?.length ? snapshot.channelRevenue : [];

      // Calculate max values for dual Y-axis
      const incomeMax = Math.max(...monthlyIncomeVsExpense.map(p => p.income), 1);
      const expenseMax = Math.max(...monthlyIncomeVsExpense.map(p => p.expense), 1);

      // Round up to nice axis values (in thousands)
      const incomeAxisMax = Math.ceil(incomeMax / 10000) * 10;  // e.g., 20k, 30k, 60k
      const expenseAxisMax = Math.ceil(expenseMax / 100) * 0.1 + 0.5; // e.g., 0.5k, 1k

      // Generate axis ticks
      const incomeAxisTicks = this.generateAxisTicks(incomeAxisMax, 5);
      const expenseAxisTicks = this.generateExpenseAxisTicks(expenseAxisMax, 5);

      // Build combo chart data with dual axis scaling
      const comboChartData = this.buildComboChartData(
        monthlyIncomeVsExpense,
        incomeAxisMax * 1000,
        expenseAxisMax * 1000
      );

      // Build expense line path (straight lines, no curves)
      const expenseLinePath = this.buildExpenseLinePath(comboChartData);

      // Build donut chart segments
      const totalChannelRevenue = channelRevenue.reduce((sum, c) => sum + c.amount, 0);
      const donutSegments = this.buildDonutSegments(channelRevenue, totalChannelRevenue);

      return {
        summaryCards: (snapshot.summaryCards || []).map((card) => ({
          ...card,
          sparklinePath: this.buildSparkline(card.sparkline ?? [])
        })),
        monthlyIncomeVsExpense,
        transactions: transactions.map((tx) => ({
          ...tx,
          meterPercent: Math.round((Math.abs(tx.amount) / Math.max(...transactions.map(t => Math.abs(t.amount)), 1)) * 100)
        })),
        accounts: snapshot.accounts || [],
        channelRevenue,
        reconciliation: snapshot.reconciliation || [],

        // Combo Chart Data
        incomeAxisTicks,
        expenseAxisTicks,
        comboChartData,
        expenseLinePath,

        // Donut Chart Data
        totalChannelRevenue,
        donutSegments
      };
    }),
    catchError((error) => {
      console.error('Dashboard load error:', error);
      return of({
        summaryCards: [],
        monthlyIncomeVsExpense: [],
        transactions: [],
        accounts: [],
        channelRevenue: [],
        reconciliation: [],
        incomeAxisTicks: [20, 15, 10, 5, 0],
        expenseAxisTicks: [1, 0.75, 0.5, 0.25, 0],
        comboChartData: [] as ComboChartPoint[],
        expenseLinePath: '',
        totalChannelRevenue: 0,
        donutSegments: [] as DonutSegment[]
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngOnInit(): void {}

  /**
   * Generate nice axis tick values for income (integers in k)
   */
  private generateAxisTicks(max: number, count: number): number[] {
    const step = max / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(max - i * step));
  }

  /**
   * Generate expense axis ticks (can be decimals for small values)
   */
  private generateExpenseAxisTicks(max: number, count: number): number[] {
    const step = max / (count - 1);
    return Array.from({ length: count }, (_, i) => {
      const val = max - i * step;
      return Math.round(val * 100) / 100; // 2 decimal precision
    });
  }

  /**
   * Build combo chart data with separate scales for income (bars) and expense (line)
   */
  private buildComboChartData(
    data: readonly MonthlyIncomeVsExpensePoint[],
    incomeMax: number,
    expenseMax: number
  ): ComboChartPoint[] {
    return data.map((point) => {
      // Income bar height (relative to income axis)
      const incomePercent = incomeMax > 0 ? point.income / incomeMax : 0;
      const barHeight = incomePercent * this.CHART_HEIGHT;
      const barY = this.CHART_HEIGHT - barHeight;

      // Expense point position (relative to expense axis - INDEPENDENT scale!)
      const expensePercent = expenseMax > 0 ? point.expense / expenseMax : 0;
      const expenseY = this.CHART_HEIGHT - (expensePercent * this.CHART_HEIGHT);

      return {
        label: point.label,
        income: point.income,
        expense: point.expense,
        barY,
        barHeight: Math.max(barHeight, 2),
        expenseY: Math.min(expenseY, this.CHART_HEIGHT - 5) // Keep points visible
      };
    });
  }

  /**
   * Build expense line path with STRAIGHT lines (tension 0, no curves)
   */
  private buildExpenseLinePath(data: ComboChartPoint[]): string {
    if (data.length === 0) return '';

    return data
      .map((point, i) => {
        const x = i * this.BAR_GAP + 50; // Center of bar
        const y = point.expenseY;
        return `${x},${y}`;
      })
      .join(' ');
  }

  /**
   * Build donut chart segments with stroke-dasharray/offset
   */
  private buildDonutSegments(
    data: readonly ChannelRevenueShare[],
    total: number
  ): DonutSegment[] {
    const radius = 70;
    const circumference = 2 * Math.PI * radius; // ~439.82
    let offset = 0;

    // Vibrant color palette for the donut chart
    const colors = ['#007BFF', '#6F42C1', '#28A745', '#17A2B8', '#FFC107'];

    return data.map((channel, index) => {
      const percentage = total > 0 ? Math.round((channel.amount / total) * 100) : 0;
      const segmentLength = (percentage / 100) * circumference;
      const dashArray = `${segmentLength} ${circumference}`;
      const dashOffset = -offset;

      offset += segmentLength;

      return {
        label: channel.channel,
        amount: channel.amount,
        percentage,
        color: channel.color || colors[index % colors.length],
        dashArray,
        dashOffset
      };
    });
  }

  /**
   * Build sparkline path for KPI cards
   */
  private buildSparkline(values: readonly number[]): string {
    if (!values.length) return '';

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const height = 24;
    const width = 100;
    const stepX = values.length > 1 ? width / (values.length - 1) : width;

    return values
      .map((value, index) => {
        const normalized = (value - min) / range;
        const y = height - normalized * height;
        const x = index * stepX;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }
}
