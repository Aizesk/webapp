/**
 * Subscription Models
 * TypeScript interfaces aligned with backend DTOs
 */

// ========== Enums ==========

export type PlanType = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAST_DUE'
  | 'TRIALING'
  | 'PENDING';

export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';

// ========== Plan ==========

export interface SubscriptionPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly monthlyPrice: number;
  readonly yearlyPrice: number;
  readonly transactionLimit: number;
  readonly platformLimit: number;
  readonly features: readonly string[];
  readonly isPopular: boolean;
  readonly isUnlimited: boolean;
  readonly active: boolean;
}

// ========== Usage (nested in Subscription response from backend) ==========

export interface UsageResponse {
  readonly transactionsUsed: number;
  readonly transactionLimit: number;
  readonly remainingTransactions: number;
  readonly usagePercentage: number;
  readonly platformsConnected: number;
  readonly platformLimit: number;
}

// ========== Subscription ==========

export interface Subscription {
  readonly id: string;
  readonly userId: string;
  readonly plan: SubscriptionPlan;
  readonly status: SubscriptionStatus;
  readonly startDate: string;
  readonly endDate?: string;
  readonly nextBillingDate?: string;
  readonly autoRenew: boolean;
  readonly usage: UsageResponse;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ========== Invoice ==========

export interface Invoice {
  readonly id: string;
  readonly subscriptionId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly description: string;
  readonly invoiceDate: string;
  readonly dueDate: string;
  readonly paidAt?: string;
  readonly invoiceUrl?: string;
}

// ========== Payment Method ==========

export interface PaymentMethod {
  readonly id: string;
  readonly userId: string;
  readonly brand: string;
  readonly last4: string;
  readonly expiryMonth: number;
  readonly expiryYear: number;
  readonly isDefault: boolean;
}

// ========== Request DTOs ==========

export interface CreateSubscriptionRequest {
  readonly planType: PlanType;
  readonly paymentMethodId?: string;
}

export interface ChangePlanRequest {
  readonly newPlanType: PlanType;
}

export interface CheckoutSessionRequest {
  readonly planType: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
}

export interface CheckoutSessionResponse {
  readonly checkoutUrl: string;
  readonly sessionId: string;
  readonly isMock: boolean;
}

export interface AddPaymentMethodRequest {
  readonly cardNumber: string;
  readonly expiryMonth: number;
  readonly expiryYear: number;
  readonly cvc: string;
  readonly cardHolderName: string;
}

// ========== Response DTOs ==========

export interface MessageResponse {
  readonly message: string;
}

// ========== Utility Types ==========

export interface SubscriptionLimits {
  readonly canAddPlatform: boolean;
  readonly canProcessTransaction: boolean;
  readonly transactionsRemaining: number;
  readonly platformsRemaining: number;
  readonly usagePercentage: number;
}
