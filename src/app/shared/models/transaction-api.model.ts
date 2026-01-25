/**
 * Backend API response model for Transactions.
 * Maps directly to Java: com.aizesk.transaction.dto.TransactionResponse
 */
export interface TransactionApiResponse {
  readonly id: number;
  readonly userId: string;
  readonly type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  readonly amount: number;
  readonly currency: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly transactionDate: string; // ISO 8601 LocalDateTime from backend
  readonly createdAt: string; // ISO 8601 LocalDateTime from backend
}
