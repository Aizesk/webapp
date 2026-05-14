import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { TransactionApiRequest, TransactionType } from '../../../shared/models/transaction-api.model';
import { TopNavbarComponent } from '../../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../../shared/models/navigation.model';

const EXPENSE_CATEGORIES = [
  { value: 'Costos de Inventario', icon: 'inventory' },
  { value: 'Envíos y Logística', icon: 'local_shipping' },
  { value: 'Publicidad', icon: 'campaign' },
  { value: 'Comisiones', icon: 'percent' },
  { value: 'Herramientas', icon: 'build' },
  { value: 'Otros Gastos', icon: 'category' }
];

const INCOME_CATEGORIES = [
  { value: 'Venta de Productos', icon: 'shopping_bag' },
  { value: 'Ingreso por Publicidad', icon: 'campaign' },
  { value: 'Servicios', icon: 'handyman' },
  { value: 'Devoluciones Recibidas', icon: 'assignment_return' },
  { value: 'Otros Ingresos', icon: 'category' }
];

const CURRENCIES = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' }
];

@Component({
  selector: 'app-add-manual-transaction-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TopNavbarComponent],
  templateUrl: './add-manual-transaction-page.component.html',
  styleUrls: ['./add-manual-transaction-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddManualTransactionPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly now = new Date();

  protected readonly navItems = MAIN_NAV_ITEMS;
  protected readonly currencies = CURRENCIES;

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedType = signal<TransactionType>('INCOME');

  // Dynamic categories based on type
  protected readonly categories = computed(() => 
    this.selectedType() === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  );

  protected readonly form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    currency: ['EUR', Validators.required],
    concept: ['', [Validators.required, Validators.maxLength(255)]],
    category: ['Venta de Productos', Validators.required],
    date: [this.now.toISOString().substring(0, 10), Validators.required],
    time: [this.now.toISOString().substring(11, 16), Validators.required]
  });

  protected setType(type: TransactionType): void {
    this.selectedType.set(type);
    const firstCategory = this.categories()[0]?.value ?? '';
    this.form.get('category')?.setValue(firstCategory);
  }

  protected handleCancel(): void {
    this.router.navigate(['/transactions']);
  }

  protected handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const formValues = this.form.getRawValue();
    const transactionDate = `${formValues.date}T${formValues.time}:00`;

    const request: TransactionApiRequest = {
      type: this.selectedType(),
      amount: formValues.amount,
      currency: formValues.currency,
      concept: formValues.concept,
      category: formValues.category,
      origin: 'MANUAL',
      transactionDate: transactionDate
    };

    this.transactionService.createTransaction(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/transactions']);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 403) {
          this.errorMessage.set('Has alcanzado el límite de transacciones de tu plan. Actualiza tu suscripción para continuar.');
        } else {
          this.errorMessage.set(err.error?.message || 'Error al guardar la transacción');
        }
        console.error('Error creating transaction:', err);
      }
    });
  }
}
