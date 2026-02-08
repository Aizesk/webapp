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

// ========== Subscription ==========

export interface Subscription {
    readonly id: string;
    readonly userId: string;
    readonly plan: SubscriptionPlan;
    readonly status: SubscriptionStatus;
    readonly stripeCustomerId?: string;
    readonly stripeSubscriptionId?: string;
    readonly startDate: string;
    readonly endDate?: string;
    readonly nextBillingDate?: string;
    readonly autoRenew: boolean;
    readonly transactionsUsed: number;
    readonly platformsConnected: number;
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
