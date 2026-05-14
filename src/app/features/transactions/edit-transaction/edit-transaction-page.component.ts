import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, shareReplay, switchMap, tap, catchError } from 'rxjs';
import { DetailedTransaction } from '../../../shared/models/transactions.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { TopNavbarComponent } from '../../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../../shared/models/navigation.model';

interface EditTransactionViewModel {
  readonly transactionId: string | null;
  readonly transaction?: DetailedTransaction;
  readonly canEdit: boolean;
}

@Component({
  selector: 'app-edit-transaction-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, AsyncPipe, DatePipe, CurrencyPipe, TopNavbarComponent],
  templateUrl: './edit-transaction-page.component.html',
  styleUrls: ['./edit-transaction-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTransactionPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);

  protected readonly navItems = MAIN_NAV_ITEMS;
  protected readonly originOptions = ['MANUAL', 'AMAZON', 'SHOPIFY', 'EBAY', 'ETSY', 'WOOCOMMERCE', 'OTHER'];
  protected readonly platformOptions = ['Amazon', 'Shopify', 'eBay', 'Etsy', 'WooCommerce', 'Other'];
  protected readonly typeOptions: DetailedTransaction['type'][] = ['INCOME', 'EXPENSE'];
  protected readonly typeLabels: Record<string, string> = {
    'INCOME': 'Ingreso',
    'EXPENSE': 'Gasto'
  };
  protected readonly categoryOptions = [
    'Venta de Productos',
    'Ingreso por Publicidad',
    'Servicios',
    'Otros'
  ];

  protected readonly form = this.fb.nonNullable.group({
    concept: ['', [Validators.required, Validators.maxLength(120)]],
    category: [this.categoryOptions[0] ?? '', Validators.required],
    platform: [this.platformOptions[0] ?? '', Validators.required],
    type: [this.typeOptions[0] ?? 'INCOME', Validators.required],
    origin: [this.originOptions[0] ?? '', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required],
    manual: [false],
    notes: ['']
  });

  protected readonly vm$ = this.route.paramMap.pipe(
    map((params) => params.get('transactionId')),
    switchMap((transactionId) => {
      if (!transactionId) {
        return of({ transactionId: null, transaction: undefined, canEdit: false } as EditTransactionViewModel);
      }

      // Find transaction from loaded transactions in the service
      const transactions = this.transactionService.transactions();
      const transaction = transactions.find(tx => tx.id === transactionId);

      if (transaction) {
        this.form.patchValue({
          concept: transaction.concept,
          category: transaction.category,
          platform: transaction.platform,
          type: transaction.type,
          origin: transaction.origin,
          amount: transaction.amount,
          date: transaction.date,
          manual: !!transaction.manual,
          notes: ''
        });
      }

      return of({
        transactionId,
        transaction,
        canEdit: !!transaction?.manual
      } as EditTransactionViewModel);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected handleCancel(): void {
    this.router.navigate(['/transactions']);
  }

  protected handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const payload = { ...this.form.getRawValue() };
    console.table(payload);
  }

  protected navigateBack(): void {
    this.handleCancel();
  }
}
