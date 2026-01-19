import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LoginCardComponent } from './components/login-card/login-card.component';
import { AuthProvider } from '../../../shared/models/auth-provider.model';
import { LoginCredentials } from '../../../shared/models/login-credentials.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginCardComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly brandName = 'Aizesk';
  protected readonly title = 'Inicio de sesión';
  protected readonly cardDescription =
    'Accede para continuar organizando tus finanzas desde cualquier dispositivo.';

  protected readonly socialProviders: AuthProvider[] = [
    { id: 'google', label: 'Continuar con Google', icon: 'google' }
  ];

  // Reactive state for UI feedback
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onProviderSelected(provider: AuthProvider): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // OAuth login - for now just log, implement when OAuth is ready
    console.log('OAuth provider selected:', provider.id);
    this.isLoading.set(false);
  }

  protected onCredentialsSubmitted(credentials: LoginCredentials): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/main-dashboard']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Credenciales inválidas');
      }
    });
  }

  protected onForgotPassword(): void {
    this.router.navigate(['/recovery-password']);
  }

  protected onBackHome(): void {
    this.router.navigate(['/']);
  }
}
