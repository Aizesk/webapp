import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-signin-divider',
  standalone: true,
  templateUrl: './signin-divider.component.html',
  styleUrl: './signin-divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninDividerComponent {
  @Input() label = 'o continúa con';
}
