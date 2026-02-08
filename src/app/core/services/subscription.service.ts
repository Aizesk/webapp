import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    SubscriptionPlan,
    Subscription,
    Invoice,
    PaymentMethod,
    CreateSubscriptionRequest,
    ChangePlanRequest,
    AddPaymentMethodRequest,
    MessageResponse,
    PlanType
} from '../../shared/models/subscription.model';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrls.subscriptions;

    // State signals
    private readonly _plans = signal<SubscriptionPlan[]>([]);
    private readonly _currentSubscription = signal<Subscription | null>(null);
    private readonly _invoices = signal<Invoice[]>([]);
    private readonly _paymentMethods = signal<PaymentMethod[]>([]);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Public readonly signals
    readonly plans = this._plans.asReadonly();
    readonly currentSubscription = this._currentSubscription.asReadonly();
    readonly invoices = this._invoices.asReadonly();
    readonly paymentMethods = this._paymentMethods.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();

    // Computed signals
    readonly currentPlan = computed(() => {
        return this._currentSubscription()?.plan || null;
    });

    readonly hasActiveSubscription = computed(() => {
        const sub = this._currentSubscription();
        return sub !== null && (sub.status === 'ACTIVE' || sub.status === 'TRIALING');
    });

    readonly usagePercentage = computed(() => {
        const sub = this._currentSubscription();
        if (!sub || sub.plan.isUnlimited) return 0;
        return Math.min(100, (sub.transactionsUsed / sub.plan.transactionLimit) * 100);
    });

    readonly transactionsRemaining = computed(() => {
        const sub = this._currentSubscription();
        if (!sub) return 0;
        if (sub.plan.isUnlimited) return Infinity;
        return Math.max(0, sub.plan.transactionLimit - sub.transactionsUsed);
    });

    readonly platformsRemaining = computed(() => {
        const sub = this._currentSubscription();
        if (!sub) return 0;
        if (sub.plan.platformLimit === -1) return Infinity;
        return Math.max(0, sub.plan.platformLimit - sub.platformsConnected);
    });

    // ==================== Plans ====================

    loadPlans(): Observable<SubscriptionPlan[]> {
        this._isLoading.set(true);
        return this.http.get<SubscriptionPlan[]>(`${this.apiUrl}/plans`).pipe(
            tap(plans => {
                this._plans.set(plans);
                this._isLoading.set(false);
            }),
            catchError(err => {
                this._error.set('Error loading plans');
                this._isLoading.set(false);
                console.error('Error loading plans:', err);
                return of([]);
            })
        );
    }

    getPlanById(planType: PlanType): Observable<SubscriptionPlan> {
        return this.http.get<SubscriptionPlan>(`${this.apiUrl}/plans/${planType}`);
    }

    // ==================== Current Subscription ====================

    loadCurrentSubscription(): Observable<Subscription | null> {
        this._isLoading.set(true);
        return this.http.get<Subscription>(`${this.apiUrl}/current`).pipe(
            tap(subscription => {
                this._currentSubscription.set(subscription);
                this._isLoading.set(false);
            }),
            catchError(err => {
                // 404 means no subscription exists
                if (err.status === 404) {
                    this._currentSubscription.set(null);
                } else {
                    this._error.set('Error loading subscription');
                    console.error('Error loading subscription:', err);
                }
                this._isLoading.set(false);
                return of(null);
            })
        );
    }

    subscribe(request: CreateSubscriptionRequest): Observable<Subscription> {
        return this.http.post<Subscription>(`${this.apiUrl}/subscribe`, request).pipe(
            tap(subscription => {
                this._currentSubscription.set(subscription);
            })
        );
    }

    changePlan(request: ChangePlanRequest): Observable<Subscription> {
        return this.http.put<Subscription>(`${this.apiUrl}/change-plan`, request).pipe(
            tap(subscription => {
                this._currentSubscription.set(subscription);
            })
        );
    }

    cancelSubscription(): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.apiUrl}/cancel`, {}).pipe(
            tap(() => {
                // Reload subscription to get updated status
                this.loadCurrentSubscription().subscribe();
            })
        );
    }

    reactivateSubscription(): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.apiUrl}/reactivate`, {}).pipe(
            tap(() => {
                this.loadCurrentSubscription().subscribe();
            })
        );
    }

    // ==================== Limit Checks ====================

    canAddPlatform(): Observable<boolean> {
        const remaining = this.platformsRemaining();
        return of(remaining > 0);
    }

    canProcessTransaction(): Observable<boolean> {
        const remaining = this.transactionsRemaining();
        return of(remaining > 0);
    }

    // ==================== Invoices ====================

    loadInvoices(): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`).pipe(
            tap(invoices => {
                this._invoices.set(invoices);
            }),
            catchError(err => {
                console.error('Error loading invoices:', err);
                return of([]);
            })
        );
    }

    getInvoice(invoiceId: string): Observable<Invoice> {
        return this.http.get<Invoice>(`${this.apiUrl}/invoices/${invoiceId}`);
    }

    // ==================== Payment Methods ====================

    loadPaymentMethods(): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment-methods`).pipe(
            tap(methods => {
                this._paymentMethods.set(methods);
            }),
            catchError(err => {
                console.error('Error loading payment methods:', err);
                return of([]);
            })
        );
    }

    addPaymentMethod(request: AddPaymentMethodRequest): Observable<PaymentMethod> {
        return this.http.post<PaymentMethod>(`${this.apiUrl}/payment-methods`, request).pipe(
            tap(method => {
                this._paymentMethods.update(methods => [...methods, method]);
            })
        );
    }

    deletePaymentMethod(paymentMethodId: string): Observable<MessageResponse> {
        return this.http.delete<MessageResponse>(`${this.apiUrl}/payment-methods/${paymentMethodId}`).pipe(
            tap(() => {
                this._paymentMethods.update(methods =>
                    methods.filter(m => m.id !== paymentMethodId)
                );
            })
        );
    }

    setDefaultPaymentMethod(paymentMethodId: string): Observable<MessageResponse> {
        return this.http.put<MessageResponse>(
            `${this.apiUrl}/payment-methods/${paymentMethodId}/default`,
            {}
        ).pipe(
            tap(() => {
                this._paymentMethods.update(methods =>
                    methods.map(m => ({
                        ...m,
                        isDefault: m.id === paymentMethodId
                    }))
                );
            })
        );
    }

    // ==================== Utility Methods ====================

    /**
     * Initialize the service by loading plans and current subscription
     */
    initialize(): void {
        this.loadPlans().subscribe();
        this.loadCurrentSubscription().subscribe();
    }

    /**
     * Clear all cached data
     */
    clearCache(): void {
        this._plans.set([]);
        this._currentSubscription.set(null);
        this._invoices.set([]);
        this._paymentMethods.set([]);
        this._error.set(null);
    }
}
