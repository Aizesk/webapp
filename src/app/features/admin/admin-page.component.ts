import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogOrigin =
  | 'AUTH'
  | 'API-AMAZON'
  | 'API-YOUTUBE'
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

  protected readonly activityLogs: readonly ActivityLog[] = [
    {
      id: 'log-1',
      timestamp: new Date('2025-10-16T18:30:05'),
      user: 'admin@app.com',
      level: 'INFO',
      origin: 'AUTH',
      message: 'Inicio de sesión exitoso (IP: 5.8.8.8)',
    },
    {
      id: 'log-2',
      timestamp: new Date('2025-10-16T18:29:14'),
      user: 'laura@empresa.com',
      level: 'WARN',
      origin: 'API-AMAZON',
      message: 'Conexión fallida: Token de Amazon expirado (ID Usuario: 1)',
    },
    {
      id: 'log-3',
      timestamp: new Date('2025-10-16T18:28:30'),
      user: 'laura@empresa.com',
      level: 'INFO',
      origin: 'BILLING',
      message: 'Usuario ha cancelado la suscripción (Paquete Pro)',
    },
    {
      id: 'log-4',
      timestamp: new Date('2025-10-16T18:25:02'),
      user: 'david@creador.com',
      level: 'INFO',
      origin: 'API-YOUTUBE',
      message: 'Conexión exitosa (ID Usuario: 112)',
    },
    {
      id: 'log-5',
      timestamp: new Date('2025-10-16T18:22:10'),
      user: 'sistema',
      level: 'ERROR',
      origin: 'BACKEND',
      message: 'Error al procesar el extracto bancario (ID Tarea: 9982)',
    },
    {
      id: 'log-6',
      timestamp: new Date('2025-10-16T18:21:03'),
      user: 'david@creador.com',
      level: 'INFO',
      origin: 'TRANSACTIONS',
      message: 'Creación manual de gasto (Monto: -150.00)',
    },
    {
      id: 'log-7',
      timestamp: new Date('2025-10-16T18:20:01'),
      user: 'sistema',
      level: 'INFO',
      origin: 'SYNC-SHOPIFY',
      message: 'Sincronización completada, 35 nuevas transacciones importadas',
    },
    {
      id: 'log-8',
      timestamp: new Date('2025-10-16T18:15:45'),
      user: 'usuario_anon',
      level: 'ERROR',
      origin: 'AUTH',
      message: 'Intento de inicio de sesión fallido (Email: intento@fallido.com)',
    },
  ];

  protected readonly users: readonly AppUser[] = [
    {
      id: 'usr-1',
      name: 'Adriana Romero',
      email: 'adriana@aizesk.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2022-03-15'),
      lastLogin: new Date('2025-10-16T09:12:00'),
    },
    {
      id: 'usr-2',
      name: 'Laura García',
      email: 'laura@empresa.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2023-06-20'),
      lastLogin: new Date('2025-10-16T18:28:30'),
    },
    {
      id: 'usr-3',
      name: 'David Martín',
      email: 'david@creador.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      lastLogin: new Date('2025-10-16T18:21:03'),
    },
    {
      id: 'usr-4',
      name: 'Carlos López',
      email: 'carlos@demo.com',
      role: 'viewer',
      status: 'suspended',
      createdAt: new Date('2024-08-05'),
      lastLogin: new Date('2025-09-01T14:00:00'),
    },
    {
      id: 'usr-5',
      name: 'María Fernández',
      email: 'maria@startup.io',
      role: 'user',
      status: 'pending',
      createdAt: new Date('2025-10-14'),
      lastLogin: null,
    },
  ];

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
