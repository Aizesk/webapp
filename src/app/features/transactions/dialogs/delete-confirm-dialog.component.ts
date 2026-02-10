import { Component, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DetailedTransaction } from '../../../shared/models/transactions.model';

export interface DeleteConfirmDialogData {
  transaction: DetailedTransaction;
}

export interface DeleteConfirmDialogResult {
  confirmed: boolean;
  transactionId?: string;
}

/**
 * Confirmation dialog before deleting a transaction.
 * Shows transaction summary and requires explicit confirmation.
 */
@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    CurrencyPipe
  ],
  template: `
    <div class="delete-confirm-dialog">
      <header class="dialog-header">
        <div class="dialog-icon">
          <span class="material-symbols-rounded">warning</span>
        </div>
        <h2 class="dialog-title">Eliminar Transacción</h2>
      </header>

      <mat-dialog-content>
        <p class="dialog-message">
          ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
        </p>

        <div class="transaction-summary">
          <div class="summary-row">
            <span class="summary-label">Concepto:</span>
            <span class="summary-value">{{ data.transaction.concept || 'Sin concepto' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Importe:</span>
            <span class="summary-value" [class.amount--positive]="data.transaction.type === 'INCOME'" [class.amount--negative]="data.transaction.type === 'EXPENSE'">
              {{ data.transaction.type === 'INCOME' ? '+' : '-' }}{{ data.transaction.amount | currency:'EUR':'symbol':'1.2-2' }}
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Origen:</span>
            <span class="summary-value">{{ data.transaction.origin }}</span>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()">Cancelar</button>
        <button 
          mat-flat-button 
          color="warn"
          [disabled]="isDeleting"
          (click)="confirm()"
        >
          {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-confirm-dialog {
      min-width: 380px;
      max-width: 450px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle, #e5e7eb);
    }

    .dialog-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.1);
    }

    .dialog-icon .material-symbols-rounded {
      font-size: 1.5rem;
      color: #ef4444;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .dialog-message {
      margin: 0 0 1rem;
      font-size: 0.9375rem;
      color: var(--text-muted, #6b7280);
      line-height: 1.5;
    }

    .transaction-summary {
      background: var(--surface-active, #f9fafb);
      border-radius: 12px;
      padding: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
    }

    .summary-row:not(:last-child) {
      border-bottom: 1px solid var(--border-subtle, #e5e7eb);
    }

    .summary-label {
      font-size: 0.875rem;
      color: var(--text-muted, #6b7280);
    }

    .summary-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary, #1f2937);
    }

    .amount--positive {
      color: #10b981;
    }

    .amount--negative {
      color: #ef4444;
    }

    mat-dialog-content {
      padding: 1.25rem 1.5rem;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-subtle, #e5e7eb);
    }
  `]
})
export class DeleteConfirmDialogComponent {
  isDeleting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmDialogData,
    private dialogRef: MatDialogRef<DeleteConfirmDialogComponent>
  ) {}

  cancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  confirm(): void {
    this.isDeleting = true;
    this.dialogRef.close({ 
      confirmed: true, 
      transactionId: this.data.transaction.id 
    });
  }
}
