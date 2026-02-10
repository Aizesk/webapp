import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { SubscriptionService } from '../../core/services/subscription.service';
import { SubscriptionPlan } from '../../shared/models/subscription.model';
import {
  PLAN_TYPE,
  BILLING_PERIOD,
  SUBSCRIPTION_LABELS,
  PLAN_COLORS,
  calculateYearlyPrice,
  BillingPeriodValue,
  getPlanDisplayName,
} from '../constants/subscriptions.constants';

type ModalType = 'change-plan' | 'cancel' | null;

@Component({
  selector: 'app-subscriptions-page',
  standalone: true,
  imports: [CommonModule, TopNavbarComponent],
  templateUrl: './subscriptions-page.component.html',
  styleUrls: ['./subscriptions-page.component.css'],
})
export class SubscriptionsPageComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly route = inject(ActivatedRoute);

  // Navigation
  protected readonly navItems = MAIN_NAV_ITEMS;

  // Expose constants for template
  protected readonly PLAN = PLAN_TYPE;
  protected readonly BILLING = BILLING_PERIOD;
  protected readonly LABELS = SUBSCRIPTION_LABELS;
  protected readonly COLORS = PLAN_COLORS;

  // State
  readonly selectedBilling = signal<BillingPeriodValue>(BILLING_PERIOD.MONTHLY);
  readonly selectedPlanId = signal<string | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly checkoutMessage = signal<{
    type: 'success' | 'error' | 'cancelled';
    text: string;
  } | null>(null);

  // Modal State
  readonly showModal = signal<ModalType>(null);
  readonly pendingPlanChange = signal<SubscriptionPlan | null>(null);

  // From service
  readonly plans = this.subscriptionService.plans;
  readonly currentSubscription = this.subscriptionService.currentSubscription;
  readonly isLoading = this.subscriptionService.isLoading;

  // Computed: plans with adjusted prices based on billing period
  readonly displayedPlans = computed(() => {
    const plans = this.plans();
    const billing = this.selectedBilling();

    return plans.map((plan) => ({
      ...plan,
      displayPrice:
        billing === BILLING_PERIOD.YEARLY
          ? calculateYearlyPrice(plan.monthlyPrice)
          : plan.monthlyPrice,
      color: PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS] || '#6366f1',
    }));
  });

  // Computed: current plan ID
  readonly currentPlanId = computed(() => {
    return this.currentSubscription()?.plan?.id || null;
  });

  // Computed: current plan details
  readonly currentPlan = computed(() => {
    const planId = this.currentPlanId();
    if (!planId) return null;
    return this.plans().find((p) => p.id === planId) || null;
  });

  // Computed: check if pending change is an upgrade
  readonly isUpgrade = computed(() => {
    const pending = this.pendingPlanChange();
    const current = this.currentPlan();
    if (!pending || !current) return false;
    return pending.monthlyPrice > current.monthlyPrice;
  });

  // Computed: get pending plan display name
  readonly pendingPlanName = computed(() => {
    const pending = this.pendingPlanChange();
    return pending ? getPlanDisplayName(pending.id) : '';
  });

  // Computed: get pending plan price
  readonly pendingPlanPrice = computed(() => {
    const pending = this.pendingPlanChange();
    if (!pending) return 0;
    return this.selectedBilling() === BILLING_PERIOD.YEARLY
      ? calculateYearlyPrice(pending.monthlyPrice)
      : pending.monthlyPrice;
  });

  // Computed: check if current plan is FREE
  readonly isFreePlan = computed(() => {
    const planId = this.currentPlanId();
    return planId === PLAN_TYPE.FREE;
  });

  // Computed: check if pending plan requires payment
  readonly requiresPayment = computed(() => {
    const pending = this.pendingPlanChange();
    return pending !== null && pending.monthlyPrice > 0;
  });

  // Computed: check if this is a downgrade from paid to FREE
  readonly isDowngradeToFree = computed(() => {
    const pending = this.pendingPlanChange();
    const current = this.currentPlan();
    if (!pending || !current) return false;
    return pending.id === PLAN_TYPE.FREE && current.monthlyPrice > 0;
  });

  ngOnInit(): void {
    // Load plans and current subscription from the service
    this.subscriptionService.loadPlans().subscribe();
    this.subscriptionService.loadCurrentSubscription().subscribe();

    // Handle checkout return from Stripe
    this.route.queryParams.subscribe((params) => {
      if (params['checkout'] === 'success') {
        this.checkoutMessage.set({
          type: 'success',
          text: '¡Pago completado! Tu suscripción ha sido activada.',
        });
        // Reload subscription to get updated status
        this.subscriptionService.loadCurrentSubscription().subscribe();
        // Clear the query params after showing message
        setTimeout(() => this.checkoutMessage.set(null), 5000);
      } else if (params['checkout'] === 'cancelled') {
        this.checkoutMessage.set({
          type: 'cancelled',
          text: 'El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.',
        });
        setTimeout(() => this.checkoutMessage.set(null), 5000);
      }
    });
  }

  reactivateSubscription(): void {
    this.isProcessing.set(true);
    this.subscriptionService.reactivateSubscription().subscribe({
      next: () => {
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Error reactivating subscription:', err);
        this.isProcessing.set(false);
      },
    });
  }

  toggleBilling(billing: BillingPeriodValue): void {
    this.selectedBilling.set(billing);
  }

  selectPlan(planId: string): void {
    // If it's the current plan, don't do anything
    if (this.isCurrentPlan(planId)) {
      return;
    }

    const selectedPlan = this.plans().find((p) => p.id === planId);
    if (!selectedPlan) return;

    this.selectedPlanId.set(planId);
    this.pendingPlanChange.set(selectedPlan);
    this.showModal.set('change-plan');
  }

  // Modal Actions
  openCancelModal(): void {
    this.showModal.set('cancel');
  }

  closeModal(): void {
    this.showModal.set(null);
    this.pendingPlanChange.set(null);
  }

  confirmPlanChange(): void {
    const pending = this.pendingPlanChange();
    if (!pending) return;

    this.isProcessing.set(true);
    this.closeModal();

    // If the new plan requires payment (upgrade to paid plan), redirect to Stripe Checkout
    if (pending.monthlyPrice > 0) {
      this.subscriptionService
        .createCheckoutSession({
          planType: pending.id,
          successUrl: window.location.origin + '/subscriptions?checkout=success',
          cancelUrl: window.location.origin + '/subscriptions?checkout=cancelled',
        })
        .subscribe({
          next: (response) => {
            this.isProcessing.set(false);
            // Redirect to Stripe Checkout
            window.location.href = response.checkoutUrl;
          },
          error: (err) => {
            console.error('Error creating checkout session:', err);
            this.isProcessing.set(false);
          },
        });
      return;
    }

    // For downgrade to FREE plan, change directly
    const currentSub = this.currentSubscription();

    if (currentSub) {
      // Change existing plan to FREE
      this.subscriptionService.changePlan({ newPlanType: pending.id as any }).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.selectedPlanId.set(null);
        },
        error: (err) => {
          console.error('Error changing plan:', err);
          this.isProcessing.set(false);
        },
      });
    } else {
      // Create new FREE subscription
      this.subscriptionService.subscribe({ planType: pending.id as any }).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.selectedPlanId.set(null);
        },
        error: (err) => {
          console.error('Error subscribing:', err);
          this.isProcessing.set(false);
        },
      });
    }
  }

  confirmCancelSubscription(): void {
    this.isProcessing.set(true);
    this.closeModal();

    this.subscriptionService.cancelSubscription().subscribe({
      next: () => {
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Error cancelling subscription:', err);
        this.isProcessing.set(false);
      },
    });
  }

  subscribeToPlan(planId: string): void {
    this.isProcessing.set(true);

    const currentSub = this.currentSubscription();

    if (currentSub) {
      // Change existing plan
      this.subscriptionService.changePlan({ newPlanType: planId as any }).subscribe({
        next: () => {
          this.isProcessing.set(false);
        },
        error: (err) => {
          console.error('Error changing plan:', err);
          this.isProcessing.set(false);
        },
      });
    } else {
      // Create new subscription
      this.subscriptionService.subscribe({ planType: planId as any }).subscribe({
        next: () => {
          this.isProcessing.set(false);
        },
        error: (err) => {
          console.error('Error subscribing:', err);
          this.isProcessing.set(false);
        },
      });
    }
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentPlanId() === planId;
  }

  isPlanSelected(planId: string): boolean {
    return this.selectedPlanId() === planId;
  }

  getButtonText(plan: SubscriptionPlan): string {
    if (this.isCurrentPlan(plan.id)) {
      return SUBSCRIPTION_LABELS.CURRENT_PLAN;
    }
    if (this.isPlanSelected(plan.id)) {
      return SUBSCRIPTION_LABELS.SELECT_PLAN;
    }
    if (plan.monthlyPrice === 0) {
      return SUBSCRIPTION_LABELS.START_FREE;
    }
    return SUBSCRIPTION_LABELS.SELECT_PLAN;
  }

  getPlanColor(planId: string): string {
    return PLAN_COLORS[planId as keyof typeof PLAN_COLORS] || '#6366f1';
  }
}
