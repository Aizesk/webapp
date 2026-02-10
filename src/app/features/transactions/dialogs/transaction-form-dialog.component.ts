import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { DetailedTransaction } from '../../../shared/models/transactions.model';
import { TransactionApiRequest, TransactionType } from '../../../shared/models/transaction-api.model';

export interface TransactionFormDialogData {
  mode: 'create' | 'edit';
  transaction?: DetailedTransaction;
  /** If true, only concept/category can be edited (for auto-imported transactions) */
  partialEdit?: boolean;
}

export interface TransactionFormDialogResult {
  action: 'save' | 'cancel';
  data?: TransactionApiRequest;
  id?: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'Publicidad', icon: 'campaign' },
  { value: 'Envíos', icon: 'local_shipping' },
  { value: 'Inventario', icon: 'inventory_2' },
  { value: 'Comisiones', icon: 'percent' },
  { value: 'Software y Herramientas', icon: 'terminal' },
  { value: 'Servicios Profesionales', icon: 'work' },
  { value: 'Impuestos', icon: 'receipt_long' },
  { value: 'Devoluciones', icon: 'keyboard_return' },
  { value: 'Otros Gastos', icon: 'more_horiz' }
];

const INCOME_CATEGORIES = [
  { value: 'Ventas Online', icon: 'shopping_cart' },
  { value: 'Servicios', icon: 'handshake' },
  { value: 'Comisiones Recibidas', icon: 'trending_up' },
  { value: 'Reembolsos', icon: 'undo' },
  { value: 'Otros Ingresos', icon: 'more_horiz' }
];

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dólar' },
  { code: 'GBP', symbol: '£', name: 'Libra' }
];

/**
 * Redesigned dialog for creating or editing transactions.
 * Matches the Transaction model fields exactly.
 */
@Component({
  selector: 'app-transaction-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  template: `
    <div class="transaction-form-dialog">
      <header class="dialog-header">
        <h2 class="dialog-title">{{ isEditMode ? 'Editar Transacción' : 'Nueva Transacción' }}</h2>
        <p class="dialog-subtitle">
          {{ isEditMode ? 'Modifica los datos de tu transacción' : 'Registra una nueva transacción manual' }}
        </p>
      </header>

      <!-- Warning for partial edit (auto-imported transactions) -->
      <div class="partial-edit-warning" *ngIf="isPartialEdit">
        <span class="material-symbols-rounded">info</span>
        <div class="partial-edit-warning__content">
          <strong>Transacción automática ({{ data.transaction?.origin }})</strong>
          <p>Solo puedes modificar el concepto y la categoría.</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="transaction-form">
          
          <!-- Type Selector - Visual Toggle -->
          <div class="form-section form-section--full">
            <label class="form-label">Tipo de transacción</label>
            <div class="type-toggle" [class.type-toggle--disabled]="isPartialEdit">
              <button 
                type="button"
                class="type-toggle__btn type-toggle__btn--income"
                [class.type-toggle__btn--active]="form.get('type')?.value === 'INCOME'"
                (click)="setType('INCOME')"
                [disabled]="isPartialEdit"
              >
                <span class="material-symbols-rounded">trending_up</span>
                <span>Ingreso</span>
              </button>
              <button 
                type="button"
                class="type-toggle__btn type-toggle__btn--expense"
                [class.type-toggle__btn--active]="form.get('type')?.value === 'EXPENSE'"
                (click)="setType('EXPENSE')"
                [disabled]="isPartialEdit"
              >
                <span class="material-symbols-rounded">trending_down</span>
                <span>Gasto</span>
              </button>
            </div>
          </div>

          <!-- Amount & Currency Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field form-field--amount" [class.form-field--disabled]="isPartialEdit">
              <mat-label>Importe</mat-label>
              <input 
                matInput 
                type="number" 
                formControlName="amount"
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
              <mat-error *ngIf="form.get('amount')?.hasError('required')">
                Obligatorio
              </mat-error>
              <mat-error *ngIf="form.get('amount')?.hasError('min')">
                Debe ser mayor a 0
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field form-field--currency" [class.form-field--disabled]="isPartialEdit">
              <mat-label>Moneda</mat-label>
              <mat-select formControlName="currency">
                <mat-option *ngFor="let c of currencies" [value]="c.code">
                  {{ c.symbol }} {{ c.code }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Date & Time Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field" [class.form-field--disabled]="isPartialEdit">
              <mat-label>Fecha</mat-label>
              <input 
                matInput 
                [matDatepicker]="picker" 
                formControlName="transactionDate"
              />
              <mat-datepicker-toggle matIconSuffix [for]="picker" [disabled]="isPartialEdit"></mat-datepicker-toggle>
              <mat-datepicker #picker [disabled]="isPartialEdit"></mat-datepicker>
              <mat-error *ngIf="form.get('transactionDate')?.hasError('required')">
                Obligatoria
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field" *ngIf="!isPartialEdit">
              <mat-label>Hora</mat-label>
              <input 
                matInput 
                type="time" 
                formControlName="transactionTime"
              />
            </mat-form-field>
          </div>

          <!-- Concept (Description) -->
          <mat-form-field appearance="outline" class="form-field form-field--full">
            <mat-label>Concepto / Descripción</mat-label>
            <input 
              matInput 
              formControlName="concept"
              placeholder="Ej: Venta producto X, Envío cliente Y..."
              maxlength="255"
            />
            <mat-hint align="end">{{ form.get('concept')?.value?.length || 0 }}/255</mat-hint>
            <mat-error *ngIf="form.get('concept')?.hasError('required')">
              El concepto es obligatorio
            </mat-error>
          </mat-form-field>

          <!-- Category -->
          <mat-form-field appearance="outline" class="form-field form-field--full">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="category">
              <mat-option value="">Sin categoría</mat-option>
              <mat-option *ngFor="let cat of currentCategories" [value]="cat.value">
                <div class="category-option">
                  <span class="material-symbols-rounded category-option__icon">{{ cat.icon }}</span>
                  <span>{{ cat.value }}</span>
                </div>
              </mat-option>
            </mat-select>
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()" class="btn-cancel">Cancelar</button>
        <button 
          mat-flat-button 
          class="btn-save"
          [class.btn-save--income]="form.get('type')?.value === 'INCOME'"
          [class.btn-save--expense]="form.get('type')?.value === 'EXPENSE'"
          [disabled]="form.invalid || isSaving"
          (click)="save()"
        >
          <span class="material-symbols-rounded btn-save__icon" *ngIf="!isSaving">
            {{ isEditMode ? 'save' : 'add' }}
          </span>
          {{ isSaving ? 'Guardando...' : (isEditMode ? 'Guardar' : 'Crear') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .transaction-form-dialog {
      min-width: 480px;
      max-width: 560px;
    }

    .dialog-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle, #e5e7eb);
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .dialog-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--text-muted, #6b7280);
    }

    .partial-edit-warning {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      margin: 1rem 1.5rem 0;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 10px;
      color: #b45309;
    }

    .partial-edit-warning .material-symbols-rounded {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .partial-edit-warning__content strong {
      display: block;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .partial-edit-warning__content p {
      margin: 0;
      font-size: 0.8125rem;
      opacity: 0.9;
    }

    mat-dialog-content {
      padding: 1rem 1.5rem 0.5rem;
      max-height: 65vh;
      overflow-y: auto;
    }

    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-section--full {
      width: 100%;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary, #4b5563);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      width: 100%;
    }

    .form-field--full {
      grid-column: 1 / -1;
    }

    .form-field--amount {
      flex: 2;
    }

    .form-field--currency {
      flex: 1;
    }

    .form-field--disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    /* Type Toggle */
    .type-toggle {
      display: flex;
      gap: 0.75rem;
    }

    .type-toggle--disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .type-toggle__btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-subtle, #e5e7eb);
      border-radius: 12px;
      background: var(--bg-primary, #fff);
      cursor: pointer;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary, #6b7280);
      transition: all 0.2s ease;
    }

    .type-toggle__btn:hover:not(:disabled) {
      border-color: var(--border-medium, #d1d5db);
      background: var(--bg-secondary, #f9fafb);
    }

    .type-toggle__btn .material-symbols-rounded {
      font-size: 1.25rem;
    }

    .type-toggle__btn--income.type-toggle__btn--active {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .type-toggle__btn--expense.type-toggle__btn--active {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Category Option */
    .category-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-option__icon {
      font-size: 1.125rem;
      color: var(--text-muted, #6b7280);
    }

    /* Dialog Actions */
    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-subtle, #e5e7eb);
      gap: 0.75rem;
    }

    .btn-cancel {
      color: var(--text-secondary, #6b7280);
    }

    .btn-save {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      min-width: 100px;
      background: var(--primary-600, #2563eb) !important;
      color: white !important;
    }

    .btn-save--income {
      background: #10b981 !important;
    }

    .btn-save--expense {
      background: #ef4444 !important;
    }

    .btn-save__icon {
      font-size: 1.125rem;
    }

    .btn-save:disabled {
      opacity: 0.5;
    }

    /* Override Material form field styling */
    ::ng-deep .mat-mdc-form-field {
      font-size: 0.875rem;
    }
  `]
})
export class TransactionFormDialogComponent implements OnInit {
  form!: FormGroup;
  isSaving = false;
  currencies = CURRENCIES;
  
  expenseCategories = EXPENSE_CATEGORIES;
  incomeCategories = INCOME_CATEGORIES;

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get isPartialEdit(): boolean {
    return this.data.partialEdit === true;
  }

  get currentCategories() {
    return this.form?.get('type')?.value === 'INCOME' 
      ? this.incomeCategories 
      : this.expenseCategories;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TransactionFormDialogData,
    private dialogRef: MatDialogRef<TransactionFormDialogComponent>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const tx = this.data.transaction;
    const txDate = tx ? new Date(tx.date) : new Date();

    this.form = this.fb.group({
      type: [tx?.type || 'EXPENSE', Validators.required],
      amount: [tx?.amount || null, [Validators.required, Validators.min(0.01)]],
      currency: [tx?.currency || 'EUR', Validators.required],
      transactionDate: [txDate, Validators.required],
      transactionTime: [
        txDate.toTimeString().substring(0, 5), // HH:MM format
        Validators.required
      ],
      concept: [tx?.concept || '', [Validators.required, Validators.maxLength(255)]],
      category: [tx?.category || '']
    });

    // Disable fields for partial edit (auto-imported transactions)
    if (this.isPartialEdit) {
      this.form.get('type')?.disable();
      this.form.get('amount')?.disable();
      this.form.get('currency')?.disable();
      this.form.get('transactionDate')?.disable();
      this.form.get('transactionTime')?.disable();
    }
  }

  setType(type: 'INCOME' | 'EXPENSE'): void {
    if (!this.isPartialEdit) {
      this.form.get('type')?.setValue(type);
      // Reset category when type changes (categories differ by type)
      this.form.get('category')?.setValue('');
    }
  }

  cancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  save(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    // getRawValue() includes disabled fields
    const formValue = this.form.getRawValue();

    // Combine date and time
    const date = new Date(formValue.transactionDate);
    if (formValue.transactionTime) {
      const [hours, minutes] = formValue.transactionTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }

    // For partial edit, preserve original values for locked fields
    const tx = this.data.transaction;
    const request: TransactionApiRequest = {
      type: this.isPartialEdit && tx ? tx.type as TransactionType : formValue.type as TransactionType,
      amount: this.isPartialEdit && tx ? tx.amount : formValue.amount,
      currency: this.isPartialEdit && tx ? tx.currency : formValue.currency,
      concept: formValue.concept,
      category: formValue.category || undefined,
      origin: 'MANUAL', // Manual transactions are always MANUAL origin
      transactionDate: this.isPartialEdit && tx ? tx.date : date.toISOString()
    };

    const result: TransactionFormDialogResult = {
      action: 'save',
      data: request,
      id: this.data.transaction?.id
    };

    this.dialogRef.close(result);
  }
}
