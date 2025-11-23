import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

interface PlatformConnection {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: 'Conectado' | 'No conectado' | 'Error';
  readonly lastSync: string;
  readonly icon: string;
  readonly accent: string;
  readonly tier: 'Premium' | 'Standard';
}

@Component({
  selector: 'app-platform-connections-page',
  standalone: true,
  imports: [NgClass, ButtonComponent, TopNavbarComponent],
  templateUrl: './platform-connections-page.component.html',
  styleUrls: ['./platform-connections-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformConnectionsPageComponent {
  protected readonly navItems = MAIN_NAV_ITEMS;

  protected readonly connections: readonly PlatformConnection[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Sincroniza ingresos por anuncios, membresías y super chats.',
      status: 'Conectado',
      lastSync: 'Hace 15 minutos',
      icon: '▶️',
      accent: '#ef4444',
      tier: 'Premium',
    },
    {
      id: 'twitch',
      name: 'Twitch',
      description: 'Recopila suscripciones, bits y donaciones en tiempo real.',
      status: 'Conectado',
      lastSync: 'Hace 2 horas',
      icon: '🟣',
      accent: '#a855f7',
      tier: 'Premium',
    },
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Integra ventas de productos físicos y digitales.',
      status: 'No conectado',
      lastSync: 'Nunca',
      icon: '🛒',
      accent: '#f97316',
      tier: 'Standard',
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Centraliza pedidos, inventario y comisiones.',
      status: 'Conectado',
      lastSync: 'Hace 6 minutos',
      icon: '🛍️',
      accent: '#22c55e',
      tier: 'Premium',
    },
  ];

  protected readonly automations = [
    { label: 'Sincronización automática', enabled: true },
    { label: 'Alertas por correo', enabled: true },
    { label: 'Reintentos inteligentes', enabled: false },
  ];

  protected readonly subscriptionPlan = {
    name: 'Plan Scale',
    price: '$39',
    period: '/mes',
    features: [
      'Hasta 5 plataformas conectadas',
      'Histórico ilimitado de transacciones',
      'Reportes colaborativos en tiempo real',
      'Soporte prioritario 24/7',
    ],
  };

  protected handleAction(
    connection: PlatformConnection,
    action: 'connect' | 'disconnect' | 'sync'
  ): void {
    console.log(action, connection.id);
  }
}
