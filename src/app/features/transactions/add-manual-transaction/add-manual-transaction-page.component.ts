import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-manual-transaction-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, CurrencyPipe],
  templateUrl: './add-manual-transaction-page.component.html',
  styleUrls: ['./add-manual-transaction-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddManualTransactionPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly now = new Date();

  protected readonly platformOptions = ['Amazon', 'Shopify', 'Twitch', 'YouTube', 'Directo'];
  protected readonly categoryOptions = ['Venta de Productos', 'Suscripción/Donación', 'Ingreso por Publicidad', 'Servicios', 'Otros'];
  protected readonly statusOptions = ['Recibido', 'Pagado', 'Procesando', 'Completado', 'Pendiente', 'Enviado'];
  protected readonly paymentMethodOptions = ['Transferencia bancaria', 'Tarjeta de crédito', 'PayPal', 'Efectivo'];
  protected readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  protected readonly form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(140)]],
    platform: [this.platformOptions[0] ?? '', Validators.required],
    category: [this.categoryOptions[0] ?? '', Validators.required],
    status: [this.statusOptions[0] ?? 'Recibido', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    fee: [0, [Validators.min(0)]],
    paymentMethod: [this.paymentMethodOptions[0] ?? '', Validators.required],
    reference: ['', [Validators.required, Validators.maxLength(50)]],
    date: [this.now.toISOString().substring(0, 10), Validators.required],
    time: [this.now.toISOString().substring(11, 16), Validators.required],
    customerName: ['', [Validators.required, Validators.maxLength(80)]],
    customerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    customerId: ['', [Validators.required, Validators.maxLength(40)]],
    notes: ['']
  });

  protected get netAmount(): number {
    const { amount, fee } = this.form.getRawValue();
    const parsedAmount = Number(amount) || 0;
    const parsedFee = Number(fee) || 0;
    return Math.max(parsedAmount - parsedFee, 0);
  }

  protected handleCancel(): void {
    this.router.navigate(['/transactions']);
  }

  protected handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      origin: 'Manual',
      manual: true,
      createdAt: new Date().toISOString()
    };

    console.table(payload);
    this.router.navigate(['/transactions']);
  }
}
