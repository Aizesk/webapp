/**
 * Transaction Origin Enum - matches backend TransactionOrigin.java
 */
export type TransactionOrigin = 'MANUAL' | 'AMAZON' | 'SHOPIFY' | 'STRIPE' | 'PAYPAL' | 'BANK_SYNC' | 'OTHER';

/**
 * Transaction Type Enum
 */
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

/**
 * Backend API response model for Transactions.
 * Maps directly to Java: com.aizesk.transaction.dto.TransactionResponse
 * Updated after major refactoring: removed userId, added origin/updatedAt
 */
export interface TransactionApiResponse {
  readonly id: number;
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly concept: string | null;
  readonly category: string | null;
  readonly origin: TransactionOrigin;
  readonly transactionDate: string; // ISO 8601 LocalDateTime from backend
  readonly createdAt: string; // ISO 8601 LocalDateTime from backend
  readonly updatedAt: string | null; // ISO 8601 LocalDateTime from backend
}

/**
 * Request DTO for creating/updating transactions.
 * Maps to backend TransactionRequest record.
 * Note: userId is extracted from JWT token server-side.
 */
export interface TransactionApiRequest {
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency?: string; // Defaults to 'EUR' in backend
  readonly concept?: string;
  readonly category?: string;
  readonly origin?: TransactionOrigin; // Defaults to 'MANUAL' in backend
  readonly transactionDate?: string; // ISO 8601 date string
}

/**
 * KPI Summary response from /api/v1/transactions/kpi/summary
 * Maps to backend KpiSummaryResponse record.
 */
export interface KpiSummaryResponse {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netBalance: number;
  readonly transactionCount: number;
  readonly periodStart: string; // ISO 8601 date
  readonly periodEnd: string; // ISO 8601 date
}

/**
 * Filter parameters for GET /api/v1/transactions
 * Supports complex filtering with pagination for large datasets.
 */
export interface TransactionFilterParams {
  readonly page?: number;
  readonly size?: number;
  readonly sortBy?: string;
  readonly sortDir?: 'asc' | 'desc';
  readonly type?: TransactionType;
  readonly category?: string;
  readonly origin?: TransactionOrigin;
  readonly dateFrom?: string; // ISO 8601 date
  readonly dateTo?: string; // ISO 8601 date
  readonly search?: string; // Text search in concept and category
}
