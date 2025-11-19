export interface SummaryCard {
  readonly label: string;
  readonly value: number;
  readonly trend: string;
  readonly trendColor: 'positive' | 'negative';
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

export interface TransactionItem {
  readonly title: string;
  readonly description: string;
  readonly amount: number;
  readonly positive: boolean;
  readonly timestamp: string;
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
}
