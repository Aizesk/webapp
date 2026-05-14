import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { SigninCardComponent } from './components/signin-card/signin-card.component';
import { AuthProvider } from '../../../shared/models/auth-provider.model';
import { SignUpRequest } from '../../../shared/models/sign-up-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [SigninCardComponent],
  templateUrl: './signin-page.component.html',
  styleUrl: './signin-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninPageComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly brandName = 'Aizesk';
  protected readonly title = 'Registro';
  protected readonly subtitle = 'Crea tu cuenta en Aizesk';
  protected readonly loginCtaLabel = '¿Ya tienes una cuenta?';
  protected readonly loginLinkLabel = 'Inicia sesión';

  protected readonly socialProviders: AuthProvider[] = [
    { id: 'google', label: 'Registrarme con Google', icon: 'google' }
  ];

  protected onProviderSelected(provider: AuthProvider): void {
    console.log('provider selected', provider);
  }

  protected onFormSubmitted(payload: SignUpRequest): void {
    this.authService.register(payload).subscribe({
      next: () => {
        this.snackBar.open('¡Registro exitoso! Bienvenido a Aizesk.', 'Cerrar', { duration: 5000, panelClass: ['success-snackbar'] });
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.snackBar.open(err.message || 'Error al registrar usuario', 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  protected onNavigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  protected onBack(): void {
    this.location.back();
  }
}
