import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SigninHeaderComponent } from '../signin-header/signin-header.component';
import { SigninSocialButtonComponent } from '../signin-social-button/signin-social-button.component';
import { SigninDividerComponent } from '../signin-divider/signin-divider.component';
import { SigninFormComponent } from '../signin-form/signin-form.component';
import { AuthProvider } from '../../../../../shared/models/auth-provider.model';
import { SignUpRequest } from '../../../../../shared/models/sign-up-request.model';

@Component({
  selector: 'app-signin-card',
  standalone: true,
  imports: [
    SigninHeaderComponent,
    SigninSocialButtonComponent,
    SigninDividerComponent,
    SigninFormComponent
  ],
  templateUrl: './signin-card.component.html',
  styleUrl: './signin-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninCardComponent {
  @Input({ required: true }) brandName!: string;
  @Input({ required: true }) title!: string;
  @Input() description?: string;
  @Input() providers: readonly AuthProvider[] = [];
  @Input() loginCtaLabel = '¿Ya tienes una cuenta?';
  @Input() loginLinkLabel = 'Inicia sesión';

  @Output() providerSelected = new EventEmitter<AuthProvider>();
  @Output() formSubmitted = new EventEmitter<SignUpRequest>();
  @Output() loginRequested = new EventEmitter<void>();
  @Output() backRequested = new EventEmitter<void>();

  protected onProviderSelected(provider: AuthProvider): void {
    this.providerSelected.emit(provider);
  }

  protected onFormSubmitted(payload: SignUpRequest): void {
    this.formSubmitted.emit(payload);
  }

  protected onLoginRequested(): void {
    this.loginRequested.emit();
  }

  protected onBackRequested(): void {
    this.backRequested.emit();
  }
}
