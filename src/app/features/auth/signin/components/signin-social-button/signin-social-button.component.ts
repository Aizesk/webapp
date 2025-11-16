import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthProvider } from '../../../../../shared/models/auth-provider.model';

@Component({
  selector: 'app-signin-social-button',
  standalone: true,
  templateUrl: './signin-social-button.component.html',
  styleUrl: './signin-social-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninSocialButtonComponent {
  @Input({ required: true }) provider!: AuthProvider;
  @Output() selectProvider = new EventEmitter<AuthProvider>();

  protected onClick(): void {
    if (!this.provider.disabled) {
      this.selectProvider.emit(this.provider);
    }
  }
}
