import { ChangeDetectionStrategy, Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { InAppNotification, NotificationType } from '../../shared/models/notifications.model';
import {
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
  NOTIFICATION_LABELS,
  NOTIFICATION_ROUTES,
  getNotificationIconForType,
  getRelativeTimeString
} from '../constants/notifications.constants';

interface QuickAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
  readonly variant: 'primary' | 'secondary' | 'outline';
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
  private readonly notificationService = inject(NotificationService);

  protected readonly navItems = MAIN_NAV_ITEMS;

  // Expose constants for template
  protected readonly STATUS = NOTIFICATION_STATUS;
  protected readonly TYPE = NOTIFICATION_TYPE;
  protected readonly LABELS = NOTIFICATION_LABELS;
  protected readonly ROUTES = NOTIFICATION_ROUTES;

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

  // Use real notifications from NotificationService
  protected readonly notifications = this.notificationService.recentNotifications;

  ngOnInit(): void {
    // Notifications are loaded via NotificationService WebSocket connection
  }

  protected navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  protected getNotificationIcon(type: NotificationType): string {
    return getNotificationIconForType(type);
  }

  protected getRelativeTime(dateString: string): string {
    return getRelativeTimeString(dateString);
  }

  protected isUnread(notification: InAppNotification): boolean {
    return notification.status === NOTIFICATION_STATUS.UNREAD;
  }
}
