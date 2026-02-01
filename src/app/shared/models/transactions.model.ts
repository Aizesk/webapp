import { TransactionOrigin, TransactionType } from './transaction-api.model';

export interface TransactionMetric {
  readonly label: string;
  readonly value: number;
  readonly currency?: string;
  readonly trend: string;
  readonly isPositive: boolean;
  readonly icon?: string;
}

/**
 * Frontend transaction model.
 * Core fields map to backend TransactionApiResponse.
 * Optional fields (fee, manual, customer, etc.) are frontend-only for future extension.
 */
export interface DetailedTransaction {
  // === Core fields from backend ===
  readonly id: string;
  readonly type: TransactionType;
  readonly origin: TransactionOrigin;
  readonly date: string;
  readonly concept: string;
  readonly platform: string; // Derived from origin
  readonly amount: number;
  readonly currency: string;
  readonly status: 'Recibido' | 'Pagado' | 'Procesando' | 'Completado' | 'Pendiente' | 'Enviado';
  readonly category: string;
  readonly createdAt: string;
  readonly updatedAt?: string;

  // === Derived fields (calculated from backend data) ===
  readonly time?: string; // Extracted from backend LocalDateTime

  // === Frontend-only fields (not in backend - for future extension) ===
  readonly fee?: number;
  readonly manual?: boolean;
  readonly paymentMethod?: string;
  readonly reference?: string;
  readonly customer?: TransactionCustomer;
}

export interface PlatformDistribution {
  readonly platform: string;
  readonly amount: number;
  readonly color: string;
}

export interface TransactionCustomer {
  readonly name: string;
  readonly email: string;
  readonly id: string;
}

export interface TransactionsSnapshot {
  readonly metrics: readonly TransactionMetric[];
  readonly transactions: readonly DetailedTransaction[];
  readonly distribution: readonly PlatformDistribution[];
}
