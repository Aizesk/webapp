import { Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { AppNavItem } from '../../shared/models/navigation.model';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  description: string;
  features: string[];
  recommended?: boolean;
  color: string;
}

@Component({
  selector: 'app-subscriptions-page',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, TopNavbarComponent],
  templateUrl: './subscriptions-page.component.html',
  styleUrls: ['./subscriptions-page.component.css'],
})
export class SubscriptionsPageComponent {
  navItems: ReadonlyArray<AppNavItem> = [
    { label: 'Inicio', path: '/main-dashboard', exact: false },
    { label: 'Dashboard', path: '/main-dashboard', exact: true },
    { label: 'Transacciones', path: '/transactions', exact: false },
    { label: 'Conexiones', path: '/platform-connections', exact: false },
    { label: 'Informes', path: '/reports', exact: false },
  ];

  selectedBilling: 'monthly' | 'yearly' = 'monthly';
  selectedPlanId: string | null = null;

  plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      billing: 'monthly',
      description: 'Perfecto para empezar y probar la plataforma',
      color: '#64748b',
      features: [
        'Hasta 50 transacciones/mes',
        '1 conexión de plataforma',
        'Reportes básicos',
        'Soporte por email',
        'Retención de datos 30 días',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 19,
      billing: 'monthly',
      description: 'Ideal para creadores de contenido individuales',
      color: '#0ea5e9',
      features: [
        'Hasta 500 transacciones/mes',
        '3 conexiones de plataforma',
        'Reportes avanzados',
        'Exportación de datos',
        'Soporte prioritario',
        'Retención de datos 90 días',
        'Conciliación automática',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 49,
      billing: 'monthly',
      description: 'Para profesionales que necesitan más control',
      color: '#6366f1',
      recommended: true,
      features: [
        'Transacciones ilimitadas',
        '10 conexiones de plataforma',
        'Reportes personalizados',
        'API de integración',
        'Soporte 24/7',
        'Retención de datos ilimitada',
        'Conciliación automática avanzada',
        'Alertas personalizadas',
        'Multi-usuario (hasta 3)',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      billing: 'monthly',
      description: 'Solución completa para equipos y empresas',
      color: '#8b5cf6',
      features: [
        'Todo en Professional',
        'Conexiones ilimitadas',
        'Gestor de cuenta dedicado',
        'Capacitación personalizada',
        'SLA garantizado',
        'Multi-usuario ilimitado',
        'Integraciones personalizadas',
        'Auditoría y compliance',
        'Soporte técnico dedicado',
      ],
    },
  ];

  get displayedPlans(): SubscriptionPlan[] {
    return this.plans.map((plan) => ({
      ...plan,
      price: this.selectedBilling === 'yearly' ? Math.floor(plan.price * 10) : plan.price,
    }));
  }

  toggleBilling(billing: 'monthly' | 'yearly'): void {
    this.selectedBilling = billing;
  }

  selectPlan(planId: string): void {
    this.selectedPlanId = planId;
    console.log('Plan seleccionado:', planId, 'Facturación:', this.selectedBilling);
    // Aquí puedes agregar la lógica para procesar la suscripción
  }

  isPlanSelected(planId: string): boolean {
    return this.selectedPlanId === planId;
  }
}
