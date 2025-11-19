import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoginCardComponent } from './components/login-card/login-card.component';
import { AuthProvider } from '../../../shared/models/auth-provider.model';
import { LoginCredentials } from '../../../shared/models/login-credentials.model';
import { Router } from '@angular/router';

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

  protected readonly brandName = 'Aizesk';
  protected readonly title = 'Inicio de sesión';
  protected readonly cardDescription =
    'Accede para continuar organizando tus finanzas desde cualquier dispositivo.';

  protected readonly socialProviders: AuthProvider[] = [
    { id: 'google', label: 'Continuar con Google', icon: 'google' }
  ];

  protected onProviderSelected(provider: AuthProvider): void {
    console.log('provider selected', provider);
  }

  protected onCredentialsSubmitted(credentials: LoginCredentials): void {
    console.log('credentials submitted', credentials);
  }

  protected onForgotPassword(): void {
    this.router.navigate(['/recovery-password']);
  }
}
