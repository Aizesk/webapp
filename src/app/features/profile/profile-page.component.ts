import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { UserService } from '../../core/services/user.service';
import { UserProfile, UpdateProfileRequest } from '../../shared/models/user.model';
import { AuthService, ActiveSession } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ContactPreference {
  readonly key: string;
  readonly label: string;
  readonly description: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [TopNavbarComponent, ReactiveFormsModule, NgFor, NgIf, NgClass],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('avatarFileInput') avatarFileInput!: ElementRef<HTMLInputElement>;

  protected readonly navItems = MAIN_NAV_ITEMS;

  // Loading state
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isUploadingAvatar = signal<boolean>(false);

  // Sessions state
  protected readonly showSessions = signal<boolean>(false);
  protected readonly isLoadingSessions = signal<boolean>(false);
  protected readonly isRevokingSession = signal<string | null>(null);
  protected readonly isRevokingAll = signal<boolean>(false);
  protected readonly activeSessions = signal<ActiveSession[]>([]);
  protected readonly totalSessions = signal<number>(0);

  // Avatar preview (local file selected but not yet uploaded, or current avatar)
  protected readonly avatarPreviewUrl = signal<string | null>(null);

  // User profile from backend
  protected readonly userProfile = this.userService.profile;

  // Computed user summary for template
  protected readonly userSummary = computed(() => {
    const profile = this.userProfile();
    if (!profile) {
      return {
        name: 'Cargando...',
        role: '',
        email: '',
        plan: '',
        joinedAt: '',
        location: '',
        avatarInitials: '...',
        avatarUrl: null as string | null,
        lastUpdate: '',
      };
    }
    return {
      name: profile.fullName,
      role: profile.role || 'Usuario',
      email: profile.email,
      plan: profile.plan || 'Free',
      joinedAt: profile.joinedAt ? `Miembro desde ${this.formatDate(profile.joinedAt)}` : '',
      location: profile.location || 'No especificada',
      avatarInitials: profile.avatarInitials || this.getInitials(profile.fullName),
      avatarUrl: this.userService.getAvatarFullUrl(profile.avatarUrl),
      lastUpdate: profile.lastUpdate ? `Actualizado ${this.formatRelativeDate(profile.lastUpdate)}` : '',
    };
  });

  // Computed account status from real data
  protected readonly accountStatus = computed(() => {
    const profile = this.userProfile();
    const sessions = this.totalSessions();
    const items: { status: 'success' | 'warning' | 'info'; text: string }[] = [];

    if (profile) {
      // Sessions info
      if (sessions > 0) {
        items.push({
          status: sessions > 3 ? 'warning' : 'success',
          text: sessions === 1
            ? '1 sesión activa'
            : `${sessions} sesiones activas`,
        });
      }

      // Last login
      if (profile.lastLoginAt) {
        items.push({
          status: 'success',
          text: `Último acceso ${this.formatRelativeDate(profile.lastLoginAt)}`,
        });
      }

      // Notification preferences
      if (profile.preferences) {
        const enabledCount = [
          profile.preferences.billingAlerts,
          profile.preferences.weeklyDigest,
          profile.preferences.securityEvents,
          profile.preferences.productResearch,
        ].filter(Boolean).length;

        items.push({
          status: enabledCount >= 3 ? 'success' : enabledCount > 0 ? 'info' : 'warning',
          text: `${enabledCount} de 4 notificaciones activadas`,
        });
      }

      // Account age
      if (profile.joinedAt) {
        items.push({
          status: 'info',
          text: `Cuenta creada ${this.formatRelativeDate(profile.joinedAt)}`,
        });
      }
    }

    return items;
  });

  protected readonly contactPreferences: readonly ContactPreference[] = [
    {
      key: 'billingAlerts',
      label: 'Alertas de facturación',
      description: 'Recibe avisos cada vez que se procese un cargo o reintento.',
    },
    {
      key: 'weeklyDigest',
      label: 'Resumen semanal',
      description: 'Informe consolidado de métricas clave enviado los lunes.',
    },
    {
      key: 'securityEvents',
      label: 'Eventos de seguridad',
      description: 'Notificaciones cuando alguien inicia sesión desde un nuevo dispositivo.',
    },
    {
      key: 'productResearch',
      label: 'Investigación de producto',
      description: 'Participa en estudios beta y pruebas de nuevas funciones.',
    },
  ];

  protected readonly accountForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    city: [''],
    postalCode: [''],
    country: [''],
  });

  protected readonly securityForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected readonly preferencesForm = this.fb.nonNullable.group({
    billingAlerts: [true],
    weeklyDigest: [true],
    securityEvents: [true],
    productResearch: [false],
  });

  ngOnInit(): void {
    this.loadProfile();
    this.loadSessionCount();
  }

  /**
   * Load only the session count for the account status card.
   */
  private loadSessionCount(): void {
    this.authService.getActiveSessions().subscribe({
      next: (response) => {
        this.totalSessions.set(response.totalSessions);
      },
      error: () => { /* silently ignore - not critical */ }
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.isLoading.set(false);
        this.populateAccountForm(profile);
        // Set avatar preview from profile
        if (profile.avatarUrl) {
          this.avatarPreviewUrl.set(this.userService.getAvatarFullUrl(profile.avatarUrl));
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading profile:', err);
        this.snackBar.open(
          'Error al cargar el perfil. Por favor, recarga la página.',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private populateAccountForm(profile: UserProfile): void {
    this.accountForm.patchValue({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address?.street || '',
      city: profile.address?.city || '',
      postalCode: profile.address?.postalCode || '',
      country: profile.address?.country || '',
    });
  }

  protected get passwordMismatch(): boolean {
    const { newPassword, confirmPassword } = this.securityForm.value;
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  // ==================== Avatar Methods ====================

  protected triggerAvatarUpload(): void {
    this.avatarFileInput.nativeElement.click();
  }

  protected onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open(
        'Formato de imagen no válido. Usa JPEG, PNG, GIF o WebP.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    // Validate file size (5 MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open(
        'La imagen es demasiado grande. Máximo 5 MB.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    this.isUploadingAvatar.set(true);
    this.userService.uploadAvatar(file).subscribe({
      next: (response) => {
        this.isUploadingAvatar.set(false);
        // Update preview with server URL
        const fullUrl = this.userService.getAvatarFullUrl(response.avatarUrl);
        if (fullUrl) {
          this.avatarPreviewUrl.set(fullUrl + '?t=' + Date.now());
        }
        this.snackBar.open('Foto de perfil actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        console.error('Error uploading avatar:', err);
        // Revert preview
        const profile = this.userProfile();
        this.avatarPreviewUrl.set(
          profile?.avatarUrl ? this.userService.getAvatarFullUrl(profile.avatarUrl) : null
        );
        this.snackBar.open(
          err.message || 'Error al subir la foto de perfil',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });

    // Reset input so user can re-select same file
    input.value = '';
  }

  protected deleteAvatar(): void {
    this.isUploadingAvatar.set(true);
    this.userService.deleteAvatar().subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.avatarPreviewUrl.set(null);
        this.snackBar.open('Foto de perfil eliminada', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        console.error('Error deleting avatar:', err);
        this.snackBar.open(
          err.message || 'Error al eliminar la foto de perfil',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  // ==================== Form Handlers ====================

  protected handleAccountSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.accountForm.getRawValue();

    const request: UpdateProfileRequest = {
      fullName: formValue.fullName,
      phone: formValue.phone || undefined,
      address: {
        street: formValue.address || null,
        city: formValue.city || null,
        state: null,
        postalCode: formValue.postalCode || null,
        country: formValue.country || null,
      }
    };

    this.userService.updateProfile(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error updating profile:', err);
        this.snackBar.open(
          err.message || 'Error al actualizar el perfil',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  protected resetAccountForm(): void {
    const profile = this.userProfile();
    if (profile) {
      this.populateAccountForm(profile);
    }
  }

  protected handleSecuritySubmit(): void {
    if (this.securityForm.invalid || this.passwordMismatch) {
      this.securityForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.securityForm.getRawValue();

    // Use AuthService for password changes (passwords are stored in auth-service)
    this.authService.changePassword(
      formValue.currentPassword,
      formValue.newPassword,
      formValue.confirmPassword
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.securityForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });

        this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error changing password:', err);
        this.snackBar.open(
          err.message || 'Error al cambiar la contraseña',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  protected handlePreferencesSubmit(): void {
    const preferences = this.preferencesForm.getRawValue();
    console.log('Saving preferences:', preferences);
    this.snackBar.open('Preferencias guardadas', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  protected disableAllPreferences(): void {
    this.preferencesForm.setValue({
      billingAlerts: false,
      weeklyDigest: false,
      securityEvents: false,
      productResearch: false,
    });
  }

  // Helper methods
  private getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } catch {
      return dateString;
    }
  }

  private formatRelativeDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'hoy';
      if (diffDays === 1) return 'ayer';
      if (diffDays < 7) return `hace ${diffDays} días`;
      if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
      return `hace ${Math.floor(diffDays / 30)} meses`;
    } catch {
      return '';
    }
  }

  // ==================== Session Management ====================

  protected toggleSessions(): void {
    const showing = !this.showSessions();
    this.showSessions.set(showing);
    if (showing) {
      this.loadSessions();
    }
  }

  protected loadSessions(): void {
    this.isLoadingSessions.set(true);
    this.authService.getActiveSessions().subscribe({
      next: (response) => {
        this.activeSessions.set(response.sessions);
        this.totalSessions.set(response.totalSessions);
        this.isLoadingSessions.set(false);
      },
      error: (err) => {
        this.isLoadingSessions.set(false);
        console.error('Error loading sessions:', err);
        this.snackBar.open(
          'Error al cargar las sesiones activas',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  protected revokeSession(sessionId: string): void {
    this.isRevokingSession.set(sessionId);
    this.authService.revokeSession(sessionId).subscribe({
      next: () => {
        this.isRevokingSession.set(null);
        // Remove from local list
        this.activeSessions.update(sessions =>
          sessions.filter(s => s.id !== sessionId)
        );
        this.totalSessions.update(count => count - 1);
        this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isRevokingSession.set(null);
        console.error('Error revoking session:', err);
        this.snackBar.open(
          err.message || 'Error al cerrar la sesión',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  protected revokeAllOtherSessions(): void {
    this.isRevokingAll.set(true);
    this.authService.revokeAllOtherSessions().subscribe({
      next: (response) => {
        this.isRevokingAll.set(false);
        // Keep only current session
        this.activeSessions.update(sessions =>
          sessions.filter(s => s.currentSession)
        );
        this.totalSessions.set(this.activeSessions().length);
        this.snackBar.open(response.message, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isRevokingAll.set(false);
        console.error('Error revoking all sessions:', err);
        this.snackBar.open(
          err.message || 'Error al cerrar las sesiones',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  protected parseDeviceInfo(userAgent: string): { browser: string; os: string; icon: string } {
    if (!userAgent) return { browser: 'Desconocido', os: 'Desconocido', icon: '🌐' };

    let browser = 'Navegador desconocido';
    let os = 'Sistema desconocido';
    let icon = '🌐';

    // Detect browser
    if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      icon = '🦊';
    } else if (userAgent.includes('Edg/')) {
      browser = 'Microsoft Edge';
      icon = '🔵';
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Google Chrome';
      icon = '🟢';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
      icon = '🧭';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      browser = 'Opera';
      icon = '🔴';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      os = 'iOS';
    }

    return { browser, os, icon };
  }

  protected formatSessionDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
