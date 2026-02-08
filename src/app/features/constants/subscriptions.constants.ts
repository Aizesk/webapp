/**
 * Subscription Constants
 * Centralized constants for subscription-related functionality
 */

// ========== Plan Types ==========
export const PLAN_TYPE = {
  FREE: 'FREE',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type PlanTypeValue = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

// ========== Subscription Status ==========
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  PAST_DUE: 'PAST_DUE',
  TRIALING: 'TRIALING',
  PENDING: 'PENDING',
} as const;

export type SubscriptionStatusValue =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// ========== Billing Periods ==========
export const BILLING_PERIOD = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export type BillingPeriodValue = (typeof BILLING_PERIOD)[keyof typeof BILLING_PERIOD];

// ========== UI Labels (Spanish) ==========
export const SUBSCRIPTION_LABELS = {
  // Page
  PAGE_TITLE: 'Planes y Precios',
  PAGE_SUBTITLE: 'Gestiona tu suscripción',
  PAGE_CTA: 'Elige el plan perfecto para ti',
  PAGE_DESCRIPTION:
    'Gestiona tus ingresos de múltiples plataformas con las herramientas que necesitas. Cancela en cualquier momento.',

  // Billing
  BILLING_MONTHLY: 'Mensual',
  BILLING_YEARLY: 'Anual',
  BILLING_SAVE: 'Ahorra 20%',
  PER_MONTH: '/mes',
  PER_YEAR: '/año',
  BILLED_ANNUALLY: 'facturado anualmente',

  // Plan Actions
  SELECT_PLAN: 'Seleccionar Plan',
  START_FREE: 'Comenzar Gratis',
  CURRENT_PLAN: 'Tu Plan Actual',
  UPGRADE: 'Mejorar Plan',
  DOWNGRADE: 'Cambiar Plan',
  CANCEL: 'Cancelar Suscripción',
  REACTIVATE: 'Reactivar Suscripción',

  // Plan Names
  PLAN_FREE: 'Gratuito',
  PLAN_PROFESSIONAL: 'Profesional',
  PLAN_ENTERPRISE: 'Enterprise',

  // Status
  STATUS_ACTIVE: 'Activa',
  STATUS_CANCELLED: 'Cancelada',
  STATUS_EXPIRED: 'Expirada',
  STATUS_PAST_DUE: 'Pago pendiente',
  STATUS_TRIALING: 'Período de prueba',

  // Badges
  RECOMMENDED: 'Recomendado',
  MOST_POPULAR: 'Más Popular',
  BEST_VALUE: 'Mejor Valor',

  // Limits
  TRANSACTIONS: 'transacciones',
  PLATFORMS: 'plataformas',
  UNLIMITED: 'Ilimitadas',

  // FAQ
  FAQ_TITLE: '¿Tienes preguntas?',
  FAQ_CONTACT: 'Estamos aquí para ayudarte. Contáctanos en',

  // Messages
  SUBSCRIPTION_CANCELLED: 'Tu suscripción ha sido cancelada',
  SUBSCRIPTION_REACTIVATED: 'Tu suscripción ha sido reactivada',
  PLAN_CHANGED: 'Tu plan ha sido actualizado',
  PAYMENT_ADDED: 'Método de pago agregado',
  PAYMENT_REMOVED: 'Método de pago eliminado',

  // Errors
  ERROR_LOADING_PLANS: 'Error al cargar los planes',
  ERROR_SUBSCRIPTION: 'Error al procesar la suscripción',
  ERROR_PAYMENT: 'Error al procesar el pago',

  // Modal - Change Plan
  MODAL_CHANGE_PLAN_TITLE: 'Cambiar de Plan',
  MODAL_UPGRADE_DESCRIPTION: 'Estás a punto de mejorar tu plan a',
  MODAL_DOWNGRADE_DESCRIPTION: 'Estás a punto de cambiar tu plan a',
  MODAL_CHANGE_BENEFITS: 'Los cambios se aplicarán inmediatamente.',
  MODAL_CONFIRM: 'Confirmar',
  MODAL_CONFIRM_PAYMENT: 'Continuar al pago',
  MODAL_CANCEL: 'Cancelar',
  MODAL_PAYMENT_REDIRECT: 'Serás redirigido a la pasarela de pago segura.',

  // Modal - Downgrade to FREE (from paid plan)
  MODAL_DOWNGRADE_FREE_TITLE: 'Cambiar al Plan Gratuito',
  MODAL_DOWNGRADE_FREE_DESCRIPTION: 'Estás a punto de cambiar al plan Gratuito.',
  MODAL_DOWNGRADE_FREE_WARNING:
    'Mantendrás acceso a todas las funcionalidades de tu plan actual hasta el final de tu período de facturación.',
  MODAL_DOWNGRADE_FREE_INFO: 'Después de esa fecha, pasarás automáticamente al plan Gratuito.',
  MODAL_DOWNGRADE_FREE_CONFIRM: 'Confirmar cambio',

  // Modal - Cancel Subscription
  MODAL_CANCEL_TITLE: 'Cancelar Suscripción',
  MODAL_CANCEL_DESCRIPTION: '¿Estás seguro de que deseas cancelar tu suscripción de pago?',
  MODAL_CANCEL_WARNING:
    'Mantendrás acceso a las funcionalidades premium hasta el final de tu período de facturación. Después, tu cuenta pasará automáticamente al plan Gratuito.',
  MODAL_CANCEL_INFO: 'Podrás volver a actualizar tu plan en cualquier momento.',
  MODAL_CANCEL_CONFIRM: 'Sí, cancelar suscripción',
  MODAL_CANCEL_KEEP: 'Mantener mi plan actual',

  // Price Change
  PRICE_INCREASE: 'Tu nuevo precio será',
  PRICE_DECREASE: 'Tu nuevo precio será',
  PRICE_FREE: 'No tendrás cargos mensuales',
} as const;

// ========== Plan Colors ==========
export const PLAN_COLORS = {
  [PLAN_TYPE.FREE]: '#64748b',
  [PLAN_TYPE.PROFESSIONAL]: '#6366f1',
  [PLAN_TYPE.ENTERPRISE]: '#8b5cf6',
} as const;

// ========== Routes ==========
export const SUBSCRIPTION_ROUTES = {
  PLANS: '/subscriptions',
  CHECKOUT: '/subscriptions/checkout',
  MANAGE: '/subscriptions/manage',
  INVOICES: '/subscriptions/invoices',
} as const;

// ========== Helper Functions ==========

/**
 * Get the display name for a plan type
 */
export function getPlanDisplayName(planType: string): string {
  switch (planType) {
    case PLAN_TYPE.FREE:
      return SUBSCRIPTION_LABELS.PLAN_FREE;
    case PLAN_TYPE.PROFESSIONAL:
      return SUBSCRIPTION_LABELS.PLAN_PROFESSIONAL;
    case PLAN_TYPE.ENTERPRISE:
      return SUBSCRIPTION_LABELS.PLAN_ENTERPRISE;
    default:
      return planType;
  }
}

/**
 * Get the status display text
 */
export function getStatusDisplayText(status: string): string {
  switch (status) {
    case SUBSCRIPTION_STATUS.ACTIVE:
      return SUBSCRIPTION_LABELS.STATUS_ACTIVE;
    case SUBSCRIPTION_STATUS.CANCELLED:
      return SUBSCRIPTION_LABELS.STATUS_CANCELLED;
    case SUBSCRIPTION_STATUS.EXPIRED:
      return SUBSCRIPTION_LABELS.STATUS_EXPIRED;
    case SUBSCRIPTION_STATUS.PAST_DUE:
      return SUBSCRIPTION_LABELS.STATUS_PAST_DUE;
    case SUBSCRIPTION_STATUS.TRIALING:
      return SUBSCRIPTION_LABELS.STATUS_TRIALING;
    default:
      return status;
  }
}

/**
 * Calculate yearly price with discount
 */
export function calculateYearlyPrice(monthlyPrice: number): number {
  // 2 months free = 10 months price
  return monthlyPrice * 10;
}

/**
 * Format limit display
 */
export function formatLimit(limit: number): string {
  if (limit === -1) return SUBSCRIPTION_LABELS.UNLIMITED;
  return limit.toLocaleString('es-ES');
}
