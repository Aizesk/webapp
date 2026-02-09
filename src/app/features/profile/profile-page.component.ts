import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import { UserService, UserProfile, UpdateProfileRequest } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ContactPreference {
  readonly key: string;
  readonly label: string;
  readonly description: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [TopNavbarComponent, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly navItems = MAIN_NAV_ITEMS;

  // Loading state
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSaving = signal<boolean>(false);

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
      lastUpdate: profile.lastUpdate ? `Actualizado ${this.formatRelativeDate(profile.lastUpdate)}` : '',
    };
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
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.isLoading.set(false);
        this.populateAccountForm(profile);
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
}
