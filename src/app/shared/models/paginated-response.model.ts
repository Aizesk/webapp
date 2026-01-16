/**
 * Generic paginated response from backend.
 * Maps directly to Java: com.aizesk.transaction.transaction_service.application.dto.PaginatedResponse<T>
 */
export interface PaginatedResponse<T> {
  readonly content: T[];
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalElements: number;
  readonly totalPages: number;
  readonly first: boolean;
  readonly last: boolean;
}
