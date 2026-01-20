import { ChangeDetectionStrategy, Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

interface QuickAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
  readonly variant: 'primary' | 'secondary' | 'outline';
}

interface Notification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly icon: string;
  readonly type: 'info' | 'success' | 'warning';
  readonly timestamp: string;
  readonly read: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, TopNavbarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly navItems = MAIN_NAV_ITEMS;

  // Get user name from AuthService
  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    if (user?.fullName) {
      return user.fullName.split(' ')[0]; // First name only
    }
    return 'Usuario';
  });

  protected readonly currentHour = new Date().getHours();

  protected readonly greeting = computed(() => {
    if (this.currentHour < 12) return 'Buenos días';
    if (this.currentHour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  protected readonly quickActions: readonly QuickAction[] = [
    {
      id: 'new-transaction',
      title: 'Nueva Transacción',
      description: 'Registra un nuevo ingreso o gasto manualmente',
      icon: 'add_circle',
      route: '/transactions/manual/new',
      variant: 'primary',
    },
    {
      id: 'connect-account',
      title: 'Conectar Cuenta',
      description: 'Vincula una nueva plataforma a tu perfil',
      icon: 'link',
      route: '/platform-connections',
      variant: 'secondary',
    },
    {
      id: 'monthly-report',
      title: 'Ver Reporte Mensual',
      description: 'Consulta el resumen de tus finanzas del mes',
      icon: 'analytics',
      route: '/reports',
      variant: 'outline',
    },
  ];

  // Mock notifications - will be replaced with real data
  protected readonly notifications: readonly Notification[] = [
    {
      id: '1',
      title: 'Sincronización completada',
      message: 'YouTube: Se importaron 12 nuevas transacciones',
      icon: 'check_circle',
      type: 'success',
      timestamp: 'Hace 2 horas',
      read: false,
    },
    {
      id: '2',
      title: 'Reporte mensual disponible',
      message: 'Tu resumen de diciembre 2025 está listo para descargar',
      icon: 'description',
      type: 'info',
      timestamp: 'Hace 1 día',
      read: false,
    },
    {
      id: '3',
      title: 'Reconexión requerida',
      message: 'Tu cuenta de Twitch necesita volver a autorizarse',
      icon: 'warning',
      type: 'warning',
      timestamp: 'Hace 3 días',
      read: true,
    },
  ];

  ngOnInit(): void {
    // Future: Load real notifications from service
  }

  protected navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  protected getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }
}
