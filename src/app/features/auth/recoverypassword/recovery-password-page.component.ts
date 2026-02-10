import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly brandName = 'Aizesk';
  protected readonly title = 'Recuperación de contraseña';
  protected readonly subtitle = 'Introduzca correo electrónico de registro';
  protected readonly fieldPlaceholder = 'Correo electrónico';
  protected readonly submitLabel = 'Recuperar contraseña';

  // UI state
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isSubmitted = signal<boolean>(false);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    this.isLoading.set(true);

    this.authService.requestPasswordRecovery(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
        this.snackBar.open(
          'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
          'Cerrar',
          { duration: 8000, panelClass: ['success-snackbar'] }
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        // Always show success message to prevent email enumeration
        this.isSubmitted.set(true);
        this.snackBar.open(
          'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
          'Cerrar',
          { duration: 8000, panelClass: ['success-snackbar'] }
        );
        console.error('Password recovery error:', err);
      }
    });
  }

  protected get emailHasError(): boolean {
    const control = this.form.controls.email;
    return control.invalid && control.touched;
  }
}
