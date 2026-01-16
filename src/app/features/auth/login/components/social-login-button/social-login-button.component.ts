import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthProvider } from '../../../../../shared/models/auth-provider.model';

@Component({
  selector: 'app-social-login-button',
  standalone: true,
  templateUrl: './social-login-button.component.html',
  styleUrl: './social-login-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLoginButtonComponent {
  @Input({ required: true }) provider!: AuthProvider;
  @Output() selectProvider = new EventEmitter<AuthProvider>();

  protected onClick(): void {
    if (!this.provider.disabled) {
      this.selectProvider.emit(this.provider);
    }
  }
}
