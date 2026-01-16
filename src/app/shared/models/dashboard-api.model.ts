/**
 * Backend API response models for Dashboard.
 * Maps directly to Java: com.aizesk.reporting_service.reporting_service.domain.model.*
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
 * DashboardStats from backend - aggregated financial data.
 */
export interface DashboardStats {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netSavings: number;
  readonly topSources: TopSource[];
}
