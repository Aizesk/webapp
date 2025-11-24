import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { combineLatest, map, shareReplay } from 'rxjs';
import {
  MonthlyIncomeVsExpensePoint
} from '../../shared/models/dashboard.model';
import { DashboardDataService } from './data/dashboard-data.service';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

@Component({
  selector: 'app-main-dashboard-page',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, AsyncPipe, CurrencyPipe, DecimalPipe, TopNavbarComponent],
  templateUrl: './main-dashboard-page.component.html',
  styleUrls: ['./main-dashboard-page.component.css', './main-dashboard-page.panels.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainDashboardPageComponent {
  private readonly dataService = inject(DashboardDataService);

  protected readonly navItems = MAIN_NAV_ITEMS;

  protected readonly dashboardVm$ = combineLatest({
    summaryCards: this.dataService.getSummaryCards(),
    weeklyIncome: this.dataService.getWeeklyIncome(),
    monthlyIncomeVsExpense: this.dataService.getMonthlyIncomeVsExpense(),
    transactions: this.dataService.getTransactions(),
    accounts: this.dataService.getConnectedAccounts(),
    channelRevenue: this.dataService.getChannelRevenue(),
    reconciliation: this.dataService.getReconciliationStats()
  }).pipe(
    map((data) => {
      const weeklyMax = Math.max(...data.weeklyIncome.map((point) => point.amount), 1);
      const netMax = Math.max(
        ...data.monthlyIncomeVsExpense.map((point) => Math.abs(point.income - point.expense)),
        1
      );
      const transactionMax = Math.max(
        ...data.transactions.map((tx) => Math.abs(tx.amount)),
        1
      );

      return {
        ...data,
        summaryCards: data.summaryCards.map((card) => ({
          ...card,
          sparklinePath: this.buildSparkline(card.sparkline ?? [])
        })),
        weeklyIncomeViz: data.weeklyIncome.map((point) => ({
          ...point,
          percentage: Math.round((point.amount / weeklyMax) * 100)
        })),
        incomePolyline: this.buildPolyline(data.monthlyIncomeVsExpense, 'income'),
        expensePolyline: this.buildPolyline(data.monthlyIncomeVsExpense, 'expense'),
        monthlyNetBars: data.monthlyIncomeVsExpense.map((point) => {
          const net = point.income - point.expense;
          return {
            label: point.label,
            net,
            percent: Math.round((Math.abs(net) / netMax) * 100),
            positive: net >= 0
          };
        }),
        transactionMax,
        transactions: data.transactions.map((tx) => ({
          ...tx,
          meterPercent: Math.round((Math.abs(tx.amount) / transactionMax) * 100)
        }))
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private buildPolyline(
    data: readonly MonthlyIncomeVsExpensePoint[],
    key: 'income' | 'expense'
  ): string {
    const maxValue = Math.max(
      ...data.map((point) => Math.max(point.income, point.expense))
    );
    const stepX = data.length > 1 ? 100 / (data.length - 1) : 100;

    return data
      .map((point, index) => {
        const value = key === 'income' ? point.income : point.expense;
        const normalizedY = maxValue === 0 ? 100 : 100 - (value / maxValue) * 100;
        return `${index * stepX},${normalizedY.toFixed(2)}`;
      })
      .join(' ');
  }

  private buildSparkline(values: readonly number[]): string {
    if (!values.length) {
      return '';
    }
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
