import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, AfterViewInit, NgZone, inject } from '@angular/core';
import { AuthProvider } from '../../../../../shared/models/auth-provider.model';
import { environment } from '../../../../../../environments/environment';

declare let google: any;

@Component({
  selector: 'app-social-login-button',
  standalone: true,
  templateUrl: './social-login-button.component.html',
  styleUrl: './social-login-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLoginButtonComponent implements AfterViewInit {
  private readonly ngZone = inject(NgZone);
  @Input({ required: true }) provider!: AuthProvider;
  @Output() selectProvider = new EventEmitter<AuthProvider>();
  @Output() googleCredential = new EventEmitter<string>();

  ngAfterViewInit(): void {
    if (this.provider.id === 'google') {
      this.initGoogleButton();
    }
  }

  private initGoogleButton(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: (environment as any).googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.googleCredential.emit(response.credential);
          });
        }
      });

      google.accounts.id.renderButton(
        document.getElementById('google-button-container')!,
        { theme: 'outline', size: 'large', width: 250 }
      );
    }
  }

  protected onClick(): void {
    if (!this.provider.disabled) {
      this.selectProvider.emit(this.provider);
    }
  }
}
