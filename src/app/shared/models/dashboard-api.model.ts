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
  readonly origin?: string;
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
 * Trend Data from backend - dynamic granularity (daily/monthly).
 * Maps to Java: com.aizesk.reporting.infrastructure.web.DashboardApiController.TrendDataDto
 *
 * Used for time-series charts with gap filling:
 * - For ranges <= 90 days: returns DAILY data points (e.g., "02 Feb")
 * - For ranges > 90 days: returns MONTHLY data points (e.g., "Feb 2025")
 */
export interface TrendDataDto {
  readonly label: string;
  readonly date: string;
  readonly income: number;
  readonly expense: number;
  readonly balance: number;
  readonly transactionCount: number;
  readonly granularity: 'DAILY' | 'MONTHLY';
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
