import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-header',
  standalone: true,
  templateUrl: './login-header.component.html',
  styleUrl: './login-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginHeaderComponent {
  @Input({ required: true }) brandName!: string;
  @Input({ required: true }) title!: string;
  @Input() brandInitials?: string;
  @Input() description?: string;

  protected get brandMarkLabel(): string {
    const initials = this.brandInitials?.trim();
    if (initials) {
      return initials;
    }

    if (!this.brandName) {
      return '';
    }

    return this.brandName.charAt(0);
  }
}
