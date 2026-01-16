/**
 * Backend API response model for Transactions.
 * Maps directly to Java: com.aizesk.transaction.transaction_service.application.dto.TransactionResponse
 */
export interface TransactionApiResponse {
  readonly id: string;
  readonly amount: number;
  readonly date: string; // ISO 8601 LocalDateTime from backend
  readonly description: string;
  readonly platform: string;
  readonly category: string;
  readonly status: string;
  readonly origin: string;
}
