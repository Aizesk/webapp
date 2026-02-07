/**
 * Dashboard Configuration Constants
 * Centralized platform configuration for colors, labels, and icons.
 *
 * @author Aizesk Development Team
 * @version 2.0.0
 */

// ============================================================================
// TIME RANGE CONFIGURATION
// ============================================================================

/**
 * Available time ranges for dashboard filtering.
 * Maps to backend query parameter values.
 */
export type TimeRange = '1D' | '7D' | '30D' | '3M' | '6M' | '1Y' | 'CUSTOM' | 'THIS_MONTH' | 'LAST_MONTH';

export interface TimeRangeConfig {
  readonly label: string;
  readonly shortLabel: string;
  readonly months: number;
  readonly days: number;
  readonly queryParam: string;
}

export const TIME_RANGE_CONFIG: Readonly<Record<TimeRange, TimeRangeConfig>> = {
  '1D': { label: 'Hoy', shortLabel: '1D', months: 1, days: 1, queryParam: '1d' },
  '7D': { label: 'Última semana', shortLabel: '7D', months: 1, days: 7, queryParam: '7d' },
  '30D': { label: 'Último mes', shortLabel: '30D', months: 1, days: 30, queryParam: '30d' },
  '3M': { label: 'Últimos 3 meses', shortLabel: '3M', months: 3, days: 90, queryParam: '3m' },
  '6M': { label: 'Últimos 6 meses', shortLabel: '6M', months: 6, days: 180, queryParam: '6m' },
  '1Y': { label: 'Último año', shortLabel: '1Y', months: 12, days: 365, queryParam: '1y' },
  'CUSTOM': { label: 'Personalizado', shortLabel: 'Custom', months: 0, days: 0, queryParam: 'custom' },
  'THIS_MONTH': { label: 'Este Mes', shortLabel: 'Este Mes', months: 1, days: 30, queryParam: 'this_month' },
  'LAST_MONTH': { label: 'Mes Anterior', shortLabel: 'Mes Ant.', months: 1, days: 30, queryParam: 'last_month' }
} as const;

/**
 * Custom date range interface for CUSTOM filter.
 */
export interface CustomDateRange {
  readonly startDate: Date;
  readonly endDate: Date;
}

/**
 * Get days count for a time range.
 */
export function getDaysForRange(range: TimeRange): number {
  return TIME_RANGE_CONFIG[range].days;
}

export const DEFAULT_TIME_RANGE: TimeRange = '30D';

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

/**
 * Platform origin identifiers matching backend TransactionOrigin enum.
 */
export type PlatformOrigin =
  | 'AMAZON'
  | 'SHOPIFY'
  | 'EBAY'
  | 'ETSY'
  | 'WOOCOMMERCE'
  | 'WALLAPOP'
  | 'MANUAL'
  | 'OTHER';

export interface PlatformConfig {
  readonly label: string;
  readonly color: string;
  readonly colorLight: string;
  readonly icon: string;
  readonly description?: string;
}

/**
 * Centralized platform configuration.
 * Brand colors sourced from official platform guidelines.
 */
export const PLATFORM_CONFIG: Readonly<Record<PlatformOrigin, PlatformConfig>> = {
  AMAZON: {
    label: 'Amazon',
    color: '#FF9900',
    colorLight: 'rgba(255, 153, 0, 0.1)',
    icon: 'storefront',
    description: 'Amazon Seller Central'
  },
  SHOPIFY: {
    label: 'Shopify',
    color: '#96BF48',
    colorLight: 'rgba(150, 191, 72, 0.1)',
    icon: 'shopping_bag',
    description: 'Shopify Store'
  },
  EBAY: {
    label: 'eBay',
    color: '#0064D2',
    colorLight: 'rgba(0, 100, 210, 0.1)',
    icon: 'local_offer',
    description: 'eBay Marketplace'
  },
  ETSY: {
    label: 'Etsy',
    color: '#F56400',
    colorLight: 'rgba(245, 100, 0, 0.1)',
    icon: 'palette',
    description: 'Etsy Shop'
  },
  WOOCOMMERCE: {
    label: 'WooCommerce',
    color: '#96588A',
    colorLight: 'rgba(150, 88, 138, 0.1)',
    icon: 'store',
    description: 'WooCommerce Store'
  },
  WALLAPOP: {
    label: 'Wallapop',
    color: '#13C1AC',
    colorLight: 'rgba(19, 193, 172, 0.1)',
    icon: 'swap_horiz',
    description: 'Wallapop'
  },
  MANUAL: {
    label: 'Manual',
    color: '#6B7280',
    colorLight: 'rgba(107, 114, 128, 0.1)',
    icon: 'edit_note',
    description: 'Entradas manuales'
  },
  OTHER: {
    label: 'Otros',
    color: '#8B5CF6',
    colorLight: 'rgba(139, 92, 246, 0.1)',
    icon: 'more_horiz',
    description: 'Otras plataformas'
  }
} as const;

/**
 * Default platform config for unknown origins.
 */
export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  label: 'Desconocido',
  color: '#94A3B8',
  colorLight: 'rgba(148, 163, 184, 0.1)',
  icon: 'help_outline'
};

// ============================================================================
// INSIGHT CONFIGURATION
// ============================================================================

/**
 * Insight severity levels for dashboard alerts/recommendations.
 */
export type InsightSeverity = 'info' | 'warning' | 'success' | 'critical';

export interface InsightConfig {
  readonly color: string;
  readonly bgColor: string;
  readonly icon: string;
}

export const INSIGHT_SEVERITY_CONFIG: Readonly<Record<InsightSeverity, InsightConfig>> = {
  info: {
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: 'info'
  },
  warning: {
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: 'warning'
  },
  success: {
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: 'check_circle'
  },
  critical: {
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: 'error'
  }
} as const;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Cache TTL in milliseconds.
 * Default: 5 minutes.
 */
export const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Maximum cache entries per time range.
 */
export const MAX_CACHE_ENTRIES = 5;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get platform configuration by origin ID.
 * Returns default config for unknown origins.
 */
export function getPlatformConfig(origin: string): PlatformConfig {
  const normalizedOrigin = origin.toUpperCase() as PlatformOrigin;
  return PLATFORM_CONFIG[normalizedOrigin] ?? DEFAULT_PLATFORM_CONFIG;
}

/**
 * Get time range configuration.
 */
export function getTimeRangeConfig(range: TimeRange): TimeRangeConfig {
  return TIME_RANGE_CONFIG[range];
}

/**
 * Get months count for a time range (for API calls).
 */
export function getMonthsForRange(range: TimeRange): number {
  return TIME_RANGE_CONFIG[range].months;
}
