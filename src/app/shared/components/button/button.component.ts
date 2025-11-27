import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'ghost' | 'ghost-subtle' | 'soft';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS_MAP: Record<ButtonVariant, string> = {
  primary: 'app-button--primary',
  ghost: 'app-button--ghost',
  'ghost-subtle': 'app-button--ghost-subtle',
  soft: 'app-button--soft'
};

const SIZE_CLASS_MAP: Record<ButtonSize, string> = {
  sm: 'app-button--sm',
  md: 'app-button--md',
  lg: 'app-button--lg'
};

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() block = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  protected get buttonClassList(): readonly string[] {
    const classes = [VARIANT_CLASS_MAP[this.variant], SIZE_CLASS_MAP[this.size]];
    if (this.block) {
      classes.push('app-button--block');
    }
    return classes;
  }
}
