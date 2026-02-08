import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  BillingPeriodValue
} from '../constants/subscriptions.constants';

@Component({
  selector: 'app-subscriptions-page',
  standalone: true,
  imports: [CommonModule, TopNavbarComponent],
  templateUrl: './subscriptions-page.component.html',
  styleUrls: ['./subscriptions-page.component.css'],
})
export class SubscriptionsPageComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);

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

  // From service
  readonly plans = this.subscriptionService.plans;
  readonly currentSubscription = this.subscriptionService.currentSubscription;
  readonly isLoading = this.subscriptionService.isLoading;

  // Computed: plans with adjusted prices based on billing period
  readonly displayedPlans = computed(() => {
    const plans = this.plans();
    const billing = this.selectedBilling();

    return plans.map(plan => ({
      ...plan,
      displayPrice: billing === BILLING_PERIOD.YEARLY
        ? calculateYearlyPrice(plan.monthlyPrice)
        : plan.monthlyPrice,
      color: PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS] || '#6366f1'
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
    return this.plans().find(p => p.id === planId) || null;
  });

  ngOnInit(): void {
    // Load plans and current subscription from the service
    this.subscriptionService.loadPlans().subscribe();
    this.subscriptionService.loadCurrentSubscription().subscribe();
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
      }
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

    this.selectedPlanId.set(planId);

    // If selecting free plan, can subscribe directly
    if (planId === PLAN_TYPE.FREE) {
      this.subscribeToPlan(planId);
    } else {
      // For paid plans, would navigate to checkout
      console.log('Selected plan:', planId, 'Billing:', this.selectedBilling());
      // TODO: Navigate to checkout flow
    }
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
        }
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
        }
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
