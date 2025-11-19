import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { combineLatest, map, shareReplay } from 'rxjs';
import {
  ConnectedAccount,
  MonthlyIncomeVsExpensePoint,
  SummaryCard,
  TransactionItem,
  WeeklyIncomePoint
} from '../../shared/models/dashboard.model';
import { DashboardDataService } from './data/dashboard-data.service';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

@Component({
  selector: 'app-main-dashboard-page',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, AsyncPipe, CurrencyPipe, TopNavbarComponent],
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
    accounts: this.dataService.getConnectedAccounts()
  }).pipe(
    map((data) => ({
      ...data,
      incomePolyline: this.buildPolyline(data.monthlyIncomeVsExpense, 'income'),
      expensePolyline: this.buildPolyline(data.monthlyIncomeVsExpense, 'expense')
    })),
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
}
