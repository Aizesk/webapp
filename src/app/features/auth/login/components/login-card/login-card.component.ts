import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LoginHeaderComponent } from '../login-header/login-header.component';
import { SocialLoginButtonComponent } from '../social-login-button/social-login-button.component';
import { LoginDividerComponent } from '../login-divider/login-divider.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { AuthProvider } from '../../../../../shared/models/auth-provider.model';
import { LoginCredentials } from '../../../../../shared/models/login-credentials.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [
    LoginHeaderComponent,
    SocialLoginButtonComponent,
    LoginDividerComponent,
    LoginFormComponent,
    ButtonComponent
  ],
  templateUrl: './login-card.component.html',
  styleUrl: './login-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginCardComponent {
  @Input({ required: true }) brandName!: string;
  @Input({ required: true }) title!: string;
  @Input() brandInitials = '';
  @Input() description?: string;
  @Input() providers: readonly AuthProvider[] = [];
  @Input() rememberLabel = 'Mantener sesión iniciada';
  @Input() forgotPasswordLabel = '¿Has olvidado tu contraseña?';
  @Input() submitLabel = 'Acceder';
  @Input() isLoading = false;
  @Input() errorMessage: string | null = null;

  @Output() providerSelected = new EventEmitter<AuthProvider>();
  @Output() credentialsSubmitted = new EventEmitter<LoginCredentials>();
  @Output() forgotPassword = new EventEmitter<void>();
  @Output() backHome = new EventEmitter<void>();

  protected onProviderSelected(provider: AuthProvider): void {
    this.providerSelected.emit(provider);
  }

  protected onCredentialsSubmitted(credentials: LoginCredentials): void {
    this.credentialsSubmitted.emit(credentials);
  }

  protected onForgotPassword(): void {
    this.forgotPassword.emit();
  }

  protected onBackHome(): void {
    this.backHome.emit();
  }
}
