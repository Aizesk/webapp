import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-reset-password-page',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, NgIf],
    templateUrl: './reset-password-page.component.html',
    styleUrl: './reset-password-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPageComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly snackBar = inject(MatSnackBar);

    protected readonly form = this.fb.nonNullable.group({
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
    });

    protected readonly brandName = 'Aizesk';
    protected readonly title = 'Restablecer contraseña';
    protected readonly subtitle = 'Introduce tu nueva contraseña';

    // UI state
    protected readonly isLoading = signal<boolean>(false);
    protected readonly isSuccess = signal<boolean>(false);
    protected readonly token = signal<string | null>(null);
    protected readonly tokenError = signal<boolean>(false);

    ngOnInit(): void {
        const tokenParam = this.route.snapshot.queryParamMap.get('token');
        if (!tokenParam) {
            this.tokenError.set(true);
        } else {
            this.token.set(tokenParam);
        }
    }

    protected onSubmit(): void {
        if (this.form.invalid || this.passwordMismatch) {
            this.form.markAllAsTouched();
            return;
        }

        const token = this.token();
        if (!token) {
            this.tokenError.set(true);
            return;
        }

        const { newPassword } = this.form.getRawValue();
        this.isLoading.set(true);

        this.http.post(`${environment.apiUrls.auth}/reset-password`, {
            token,
            newPassword
        }).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.isSuccess.set(true);
                this.snackBar.open(
                    '¡Contraseña restablecida exitosamente!',
                    'Cerrar',
                    { duration: 5000, panelClass: ['success-snackbar'] }
                );
                // Redirect to login after 2 seconds
                setTimeout(() => this.router.navigate(['/login']), 2000);
            },
            error: (err) => {
                this.isLoading.set(false);
                const message = err.error?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.';
                this.snackBar.open(message, 'Cerrar', { duration: 8000, panelClass: ['error-snackbar'] });
                console.error('Reset password error:', err);
            }
        });
    }

    protected get passwordMismatch(): boolean {
        const { newPassword, confirmPassword } = this.form.value;
        return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
    }

    protected get newPasswordHasError(): boolean {
        const control = this.form.controls.newPassword;
        return control.invalid && control.touched;
    }

    protected get confirmPasswordHasError(): boolean {
        const control = this.form.controls.confirmPassword;
        return (control.invalid && control.touched) || (control.touched && this.passwordMismatch);
    }
}
