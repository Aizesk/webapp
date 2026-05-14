export interface SummaryCard {
  readonly label: string;
  readonly value: number;
  readonly trend: string;
  readonly trendColor: 'positive' | 'negative';
  readonly sparkline?: readonly number[];
}

export interface WeeklyIncomePoint {
  readonly label: string;
  readonly amount: number;
}

export interface MonthlyIncomeVsExpensePoint {
  readonly label: string;
  readonly income: number;
  readonly expense: number;
}

export interface ChannelRevenueShare {
  readonly channel: string;
  readonly amount: number;
  readonly percentage: number;
  readonly color: string;
}

export interface ReconciliationStatus {
  readonly account: string;
  readonly recorded: number;
  readonly bank: number;
  readonly status: 'aligned' | 'warning';
}

export interface TransactionItem {
  readonly title: string;
  readonly description: string;
  readonly amount: number;
  readonly positive: boolean;
  readonly timestamp: string;
  readonly origin?: string;
}

export interface ConnectedAccount {
  readonly name: string;
  readonly status: string;
  readonly statusColor: 'success' | 'warning' | 'info';
}

export interface DashboardSnapshot {
  readonly summaryCards: readonly SummaryCard[];
  readonly weeklyIncome: readonly WeeklyIncomePoint[];
  readonly monthlyIncomeVsExpense: readonly MonthlyIncomeVsExpensePoint[];
  readonly transactions: readonly TransactionItem[];
  readonly accounts: readonly ConnectedAccount[];
  readonly channelRevenue: readonly ChannelRevenueShare[];
  readonly reconciliation: readonly ReconciliationStatus[];
  readonly expensesByCategory?: readonly CategoryExpense[];
  readonly incomesByCategory?: readonly CategoryExpense[];
  readonly totalExpenseAmount?: number;
  readonly totalIncomeAmount?: number;
}

export interface CategoryExpense {
  readonly category: string;
  readonly amount: number;
  readonly percentage: number;
  readonly color: string;
  readonly icon: string;
}
