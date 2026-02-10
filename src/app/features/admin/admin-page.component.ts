import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogOrigin =
  | 'AUTH'
  | 'API-AMAZON'
  | 'BILLING'
  | 'BACKEND'
  | 'TRANSACTIONS'
  | 'SYNC-SHOPIFY';

interface ActivityLog {
  readonly id: string;
  readonly timestamp: Date;
  readonly user: string;
  readonly level: LogLevel;
  readonly origin: LogOrigin;
  readonly message: string;
}

interface AppUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user' | 'viewer';
  readonly status: 'active' | 'suspended' | 'pending';
  readonly createdAt: Date;
  readonly lastLogin: Date | null;
}

interface AdminStat {
  readonly label: string;
  readonly value: string;
  readonly trend?: string;
  readonly trendPositive?: boolean;
  readonly icon: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [TopNavbarComponent, NgFor, NgIf, NgClass, DatePipe, FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent {
  protected readonly navItems = MAIN_NAV_ITEMS;

  protected searchQuery = '';
  protected selectedLogLevel: LogLevel | 'ALL' = 'ALL';
  protected selectedUserStatus: AppUser['status'] | 'ALL' = 'ALL';

  protected readonly stats: readonly AdminStat[] = [
    {
      label: 'Usuarios activos',
      value: '1,284',
      trend: '+12% este mes',
      trendPositive: true,
      icon: 'group',
    },
    {
      label: 'Sesiones hoy',
      value: '328',
      trend: '+5% vs ayer',
      trendPositive: true,
      icon: 'login',
    },
    {
      label: 'Errores (24h)',
      value: '7',
      trend: '-3 vs ayer',
      trendPositive: true,
      icon: 'error',
    },
    {
      label: 'Transacciones procesadas',
      value: '45,291',
      trend: '+8.4% esta semana',
      trendPositive: true,
      icon: 'receipt_long',
    },
  ];

  // TODO: Cargar logs de actividad desde el backend (GET /api/admin/activity-logs)
  protected readonly activityLogs: readonly ActivityLog[] = [];

  // TODO: Cargar usuarios desde el backend (GET /api/admin/users)
  protected readonly users: readonly AppUser[] = [];

  get filteredLogs(): readonly ActivityLog[] {
    return this.activityLogs.filter((log) => {
      const matchesLevel =
        this.selectedLogLevel === 'ALL' || log.level === this.selectedLogLevel;
      const matchesSearch =
        !this.searchQuery ||
        log.message.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }

  get filteredUsers(): readonly AppUser[] {
    return this.users.filter((user) => {
      const matchesStatus =
        this.selectedUserStatus === 'ALL' || user.status === this.selectedUserStatus;
      const matchesSearch =
        !this.searchQuery ||
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  protected getLevelClass(level: LogLevel): string {
    return `level-badge level-badge--${level.toLowerCase()}`;
  }

  protected getStatusClass(status: AppUser['status']): string {
    return `status-badge status-badge--${status}`;
  }

  protected getRoleLabel(role: AppUser['role']): string {
    const labels: Record<AppUser['role'], string> = {
      admin: 'Administrador',
      user: 'Usuario',
      viewer: 'Visor',
    };
    return labels[role];
  }

  protected getStatusLabel(status: AppUser['status']): string {
    const labels: Record<AppUser['status'], string> = {
      active: 'Activo',
      suspended: 'Suspendido',
      pending: 'Pendiente',
    };
    return labels[status];
  }

  protected handleUserAction(user: AppUser, action: 'edit' | 'suspend' | 'delete'): void {
    console.log('admin-user-action', { userId: user.id, action });
  }

  protected handleExportLogs(): void {
    console.log('admin-export-logs', { level: this.selectedLogLevel });
  }

  protected handleInviteUser(): void {
    console.log('admin-invite-user');
  }
}
