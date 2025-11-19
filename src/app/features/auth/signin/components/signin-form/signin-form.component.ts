import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { SignUpRequest } from '../../../../../shared/models/sign-up-request.model';

const COUNTRIES = ['México', 'Colombia', 'Argentina', 'España', 'Chile', 'Perú'];

type SigninFormControls = FormGroup<{
  readonly fullName: FormControl<string>;
  readonly email: FormControl<string>;
  readonly password: FormControl<string>;
  readonly confirmPassword: FormControl<string>;
  readonly address: FormControl<string>;
  readonly country: FormControl<string>;
  readonly phone: FormControl<string>;
  readonly jobTitle: FormControl<string>;
  readonly acceptTerms: FormControl<boolean>;
}>;

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './signin-form.component.html',
  styleUrl: './signin-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninFormComponent {
  @Output() submitRequest = new EventEmitter<SignUpRequest>();

  protected readonly countries = COUNTRIES;
  protected readonly form: SigninFormControls;
  protected passwordVisible = false;
  protected confirmPasswordVisible = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      address: [''],
      country: ['', Validators.required],
      phone: [''],
      jobTitle: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...raw } = this.form.getRawValue();
    this.submitRequest.emit({
      ...raw,
      address: raw.address || undefined,
      country: raw.country || undefined,
      phone: raw.phone || undefined,
      jobTitle: raw.jobTitle || undefined
    });
  }

  protected passwordsMatch(): boolean {
    const { password, confirmPassword } = this.form.getRawValue();
    return password === confirmPassword;
  }

  protected hasError(controlName: keyof SigninFormControls['controls']): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.invalid && control.touched);
  }

  protected toggleVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
      return;
    }

    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
