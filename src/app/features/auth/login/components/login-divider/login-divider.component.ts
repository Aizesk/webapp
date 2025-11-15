import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-divider',
  standalone: true,
  templateUrl: './login-divider.component.html',
  styleUrl: './login-divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginDividerComponent {
  @Input() label = 'o';
}
