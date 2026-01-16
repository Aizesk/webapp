import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

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
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly navItems = MAIN_NAV_ITEMS;

  protected readonly userSummary = {
    name: 'Adriana Romero',
    role: 'Revenue Manager',
    email: 'adriana@aizesk.com',
    plan: 'Professional',
    joinedAt: 'Miembro desde marzo 2022',
    location: 'Madrid, España',
    avatarInitials: 'AR',
    lastUpdate: 'Actualizado hace 3 días',
  } as const;

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
    fullName: ['Adriana Romero', [Validators.required, Validators.minLength(3)]],
    email: ['adriana@aizesk.com', [Validators.required, Validators.email]],
    phone: ['+34 600 123 456', [Validators.required]],
    address: ['Calle Mayor 123', [Validators.required]],
    city: ['Madrid', [Validators.required]],
    postalCode: ['28013', [Validators.required]],
    country: ['España', [Validators.required]],
  });

  private readonly accountDefaults = this.accountForm.getRawValue();

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

  protected get passwordMismatch(): boolean {
    const { newPassword, confirmPassword } = this.securityForm.value;
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  protected handleAccountSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    console.log('profile-account-update', this.accountForm.getRawValue());
  }

  protected resetAccountForm(): void {
    this.accountForm.reset(this.accountDefaults);
  }

  protected handleSecuritySubmit(): void {
    if (this.securityForm.invalid || this.passwordMismatch) {
      this.securityForm.markAllAsTouched();
      return;
    }

    console.log('profile-security-update', this.securityForm.getRawValue());
    this.securityForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  protected handlePreferencesSubmit(): void {
    console.log('profile-preferences-update', this.preferencesForm.getRawValue());
  }

  protected disableAllPreferences(): void {
    this.preferencesForm.setValue({
      billingAlerts: false,
      weeklyDigest: false,
      securityEvents: false,
      productResearch: false,
    });
  }
}
