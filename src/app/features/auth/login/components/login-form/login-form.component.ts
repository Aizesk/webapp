import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';
import { LoginCredentials } from '../../../../../shared/models/login-credentials.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

type LoginFormGroup = FormGroup<{
  readonly email: FormControl<string>;
  readonly password: FormControl<string>;
  readonly rememberSession: FormControl<boolean>;
}>;

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent {
  @Input() submitLabel = 'Acceder';
  @Input() rememberLabel = 'Mantener sesión iniciada';
  @Input() forgotPasswordLabel = '¿Has olvidado tu contraseña?';
  @Input() isLoading = false;

  @Output() submitCredentials = new EventEmitter<LoginCredentials>();
  @Output() forgotPassword = new EventEmitter<void>();

  protected readonly form: LoginFormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberSession: [false]
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitCredentials.emit(this.form.getRawValue());
  }

  protected onForgotPassword(): void {
    this.forgotPassword.emit();
  }

  protected hasError(controlName: keyof LoginFormGroup['controls']): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.invalid && control.touched);
  }
}
