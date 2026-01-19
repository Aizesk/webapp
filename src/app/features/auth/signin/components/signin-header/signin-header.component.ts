import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-signin-header',
  standalone: true,
  templateUrl: './signin-header.component.html',
  styleUrl: './signin-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninHeaderComponent {
  @Input({ required: true }) brandName!: string;
  @Input({ required: true }) title!: string;
  @Input() description?: string;
  @Output() back = new EventEmitter<void>();
}
