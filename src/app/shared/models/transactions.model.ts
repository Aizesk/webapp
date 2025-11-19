export interface TransactionMetric {
  readonly label: string;
  readonly value: number;
  readonly currency?: string;
  readonly trend: string;
  readonly isPositive: boolean;
  readonly icon?: string;
}

export interface DetailedTransaction {
  readonly id: string;
  readonly origin: string;
  readonly date: string;
  readonly time?: string;
  readonly description: string;
  readonly platform: string;
  readonly amount: number;
  readonly fee?: number;
  readonly status: 'Recibido' | 'Pagado' | 'Procesando' | 'Completado' | 'Pendiente' | 'Enviado';
  readonly category: string;
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
