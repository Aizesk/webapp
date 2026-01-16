import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-recovery-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './recovery-password-page.component.html',
  styleUrl: './recovery-password-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecoveryPasswordPageComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly brandName = 'Aizesk';
  protected readonly title = 'Recuperación de contraseña';
  protected readonly subtitle = 'Introduzca correo electrónico de registro';
  protected readonly fieldPlaceholder = 'Correo electrónico';
  protected readonly submitLabel = 'Recuperar contraseña';

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    console.log('password recovery request', email);
  }

  protected get emailHasError(): boolean {
    const control = this.form.controls.email;
    return control.invalid && control.touched;
  }
}
