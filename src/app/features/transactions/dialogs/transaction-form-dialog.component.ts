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

const CATEGORIES = [
  'Ventas Online',
  'Comisiones',
  'Devoluciones',
  'Publicidad',
  'Envíos',
  'Inventario',
  'Software y Herramientas',
  'Servicios Profesionales',
  'Impuestos',
  'Otros'
];

/**
 * Dialog for creating or editing transactions.
 * - Create mode: new manual transaction
 * - Edit mode: only for MANUAL origin transactions
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
    MatNativeDateModule
  ],
  template: `
    <div class="transaction-form-dialog">
      <header class="dialog-header">
        <h2 class="dialog-title">{{ isEditMode ? 'Editar Transacción' : 'Nueva Transacción Manual' }}</h2>
        <p class="dialog-subtitle" *ngIf="!isEditMode">
          Las transacciones manuales se marcan automáticamente como origen "MANUAL"
        </p>
        <p class="dialog-subtitle" *ngIf="isEditMode && !isPartialEdit">
          Edición completa disponible para transacciones manuales
        </p>
      </header>

      <!-- Warning for partial edit (auto-imported transactions) -->
      <div class="partial-edit-warning" *ngIf="isPartialEdit">
        <span class="material-symbols-rounded">info</span>
        <div class="partial-edit-warning__content">
          <strong>Transacción automática ({{ data.transaction?.origin }})</strong>
          <p>Solo puedes modificar el concepto y la categoría. El importe y la fecha están bloqueados.</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="transaction-form">
          <!-- Type -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="INCOME">
                <span class="option-badge option-badge--income">Ingreso</span>
              </mat-option>
              <mat-option value="EXPENSE">
                <span class="option-badge option-badge--expense">Gasto</span>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('type')?.hasError('required')">
              El tipo es obligatorio
            </mat-error>
          </mat-form-field>

          <!-- Amount (disabled for partial edit) -->
          <mat-form-field appearance="outline" class="form-field" [class.form-field--disabled]="isPartialEdit">
            <mat-label>Importe</mat-label>
            <input 
              matInput 
              type="number" 
              formControlName="amount"
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />
            <span matTextPrefix>€&nbsp;</span>
            <mat-hint *ngIf="isPartialEdit">Campo bloqueado</mat-hint>
            <mat-error *ngIf="form.get('amount')?.hasError('required')">
              El importe es obligatorio
            </mat-error>
            <mat-error *ngIf="form.get('amount')?.hasError('min')">
              El importe debe ser mayor a 0
            </mat-error>
          </mat-form-field>

          <!-- Transaction Date (disabled for partial edit) -->
          <mat-form-field appearance="outline" class="form-field" [class.form-field--disabled]="isPartialEdit">
            <mat-label>Fecha de Transacción</mat-label>
            <input 
              matInput 
              [matDatepicker]="picker" 
              formControlName="transactionDate"
            />
            <mat-datepicker-toggle matIconSuffix [for]="picker" [disabled]="isPartialEdit"></mat-datepicker-toggle>
            <mat-datepicker #picker [disabled]="isPartialEdit"></mat-datepicker>
            <mat-hint *ngIf="isPartialEdit">Campo bloqueado</mat-hint>
            <mat-error *ngIf="form.get('transactionDate')?.hasError('required')">
              La fecha es obligatoria
            </mat-error>
          </mat-form-field>

          <!-- Time (hidden for partial edit) -->
          <mat-form-field appearance="outline" class="form-field" *ngIf="!isPartialEdit">
            <mat-label>Hora</mat-label>
            <input 
              matInput 
              type="time" 
              formControlName="transactionTime"
            />
          </mat-form-field>

          <!-- Placeholder for grid alignment when time is hidden -->
          <div class="form-field" *ngIf="isPartialEdit"></div>

          <!-- Concept (always editable) -->
          <mat-form-field appearance="outline" class="form-field form-field--full">
            <mat-label>Concepto</mat-label>
            <input 
              matInput 
              formControlName="concept"
              placeholder="Descripción de la transacción"
              maxlength="255"
            />
            <mat-hint align="end">{{ form.get('concept')?.value?.length || 0 }}/255</mat-hint>
          </mat-form-field>

          <!-- Category (always editable) -->
          <mat-form-field appearance="outline" class="form-field form-field--full">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let cat of categories" [value]="cat">
                {{ cat }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()">Cancelar</button>
        <button 
          mat-flat-button 
          color="primary"
          [disabled]="form.invalid || isSaving"
          (click)="save()"
        >
          {{ isSaving ? 'Guardando...' : (isEditMode ? 'Guardar cambios' : 'Crear transacción') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .transaction-form-dialog {
      min-width: 450px;
      max-width: 550px;
    }

    .dialog-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle, #e5e7eb);
      margin-bottom: 0.5rem;
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
      margin: 0 1.5rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 10px;
      color: #b45309;
    }

    .partial-edit-warning .material-symbols-rounded {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .partial-edit-warning__content {
      flex: 1;
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

    .transaction-form {
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

    .form-field--disabled {
      opacity: 0.6;
    }

    .option-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .option-badge--income {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .option-badge--expense {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    mat-dialog-content {
      padding: 0.5rem 1.5rem;
      max-height: 60vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-subtle, #e5e7eb);
      margin-top: 0.5rem;
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
  categories = CATEGORIES;

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get isPartialEdit(): boolean {
    return this.data.partialEdit === true;
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
      transactionDate: [txDate, Validators.required],
      transactionTime: [
        txDate.toTimeString().substring(0, 5), // HH:MM format
        Validators.required
      ],
      concept: [tx?.concept || '', Validators.maxLength(255)],
      category: [tx?.category || '']
    });

    // Disable fields for partial edit (auto-imported transactions)
    if (this.isPartialEdit) {
      this.form.get('type')?.disable();
      this.form.get('amount')?.disable();
      this.form.get('transactionDate')?.disable();
      this.form.get('transactionTime')?.disable();
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

    // For partial edit, only update concept and category, preserve other fields
    const tx = this.data.transaction;
    const request: TransactionApiRequest = {
      type: this.isPartialEdit && tx ? tx.type as TransactionType : formValue.type as TransactionType,
      amount: this.isPartialEdit && tx ? tx.amount : formValue.amount,
      currency: tx?.currency || 'EUR',
      concept: formValue.concept || undefined,
      category: formValue.category || undefined,
      origin: tx?.origin || 'MANUAL',
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
