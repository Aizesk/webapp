/**
 * Generic paginated response from backend.
 * Maps directly to Java: com.aizesk.transaction.dto.PagedResponse<T>
 */
export interface PaginatedResponse<T> {
  readonly content: T[];
  readonly page: number;       // Backend uses 'page'
  readonly size: number;       // Backend uses 'size'
  readonly totalElements: number;
  readonly totalPages: number;
  readonly first: boolean;
  readonly last: boolean;
  // Computed aliases for frontend convenience
  readonly currentPage?: number;
  readonly pageSize?: number;
}
