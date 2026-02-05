/**
 * Backend API response models for Dashboard.
 * Maps directly to Java: com.aizesk.reporting.dto.DashboardSnapshot
 */

/**
 * TopSource from backend - represents a platform income source.
 */
export interface TopSource {
  readonly platform: string;
  readonly totalAmount: number;
  readonly percentage: number;
}

/**
 * Transaction DTO from backend
 */
export interface TransactionDto {
  readonly id: number;
  readonly userId: string;
  readonly type: string;
  readonly amount: number;
  readonly currency: string;
  readonly description: string;
  readonly category: string;
  readonly transactionDate: string;
}

/**
 * Monthly Stats from backend - for charts
 * Maps to Java: com.aizesk.reporting.dto.MonthlyStats
 */
export interface MonthlyStatsDto {
  readonly month: string;
  readonly year: number;
  readonly label: string;
  readonly income: number;
  readonly expense: number;
  readonly balance: number;
  readonly transactionCount: number;
}

/**
 * DashboardStats from backend - aggregated financial data.
 * Matches Java: com.aizesk.reporting.dto.DashboardSnapshot
 */
export interface DashboardStats {
  readonly userId: string;
  readonly totalIncome: number;
  readonly totalExpense: number;
  readonly totalBalance: number;
  readonly incomePercentage: number;
  readonly expensePercentage: number;
  readonly transactionCount: number;
  readonly expensesByCategory: { [key: string]: number };
  readonly incomesByCategory: { [key: string]: number };
  readonly incomesByOrigin: { [key: string]: number };
  readonly expensesByOrigin: { [key: string]: number };
  readonly countByOrigin: { [key: string]: number };
  readonly recentTransactions: TransactionDto[];
  readonly generatedAt: string;
}
