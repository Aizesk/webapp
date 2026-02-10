import { Component, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DetailedTransaction } from '../../../shared/models/transactions.model';

/**
 * Dialog to display all transaction details in a clean, read-only view.
 * Shows all fields from the database model.
 */
@Component({
  selector: 'app-transaction-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    CurrencyPipe,
    DatePipe,
    NgClass
  ],
  template: `
    <div class="transaction-detail-dialog">
      <header class="dialog-header">
        <h2 class="dialog-title">Detalle de Transacción</h2>
        <span class="dialog-subtitle">ID: {{ data.id }}</span>
      </header>

      <mat-dialog-content>
        <div class="detail-grid">
          <!-- Type -->
          <div class="detail-row">
            <span class="detail-label">Tipo</span>
            <span class="detail-value">
              <span class="type-badge" [ngClass]="{
                'type-badge--income': data.type === 'INCOME',
                'type-badge--expense': data.type === 'EXPENSE',
                'type-badge--transfer': data.type === 'TRANSFER'
              }">
                {{ getTypeLabel(data.type) }}
              </span>
            </span>
          </div>

          <!-- Amount -->
          <div class="detail-row">
            <span class="detail-label">Importe</span>
            <span class="detail-value amount" [ngClass]="{
              'amount--positive': data.type === 'INCOME',
              'amount--negative': data.type === 'EXPENSE'
            }">
              {{ data.type === 'INCOME' ? '+' : data.type === 'EXPENSE' ? '-' : '' }}{{ data.amount | currency:data.currency:'symbol':'1.2-2' }}
            </span>
          </div>

          <!-- Currency -->
          <div class="detail-row">
            <span class="detail-label">Moneda</span>
            <span class="detail-value">{{ data.currency }}</span>
          </div>

          <!-- Origin -->
          <div class="detail-row">
            <span class="detail-label">Origen</span>
            <span class="detail-value">
              <span class="origin-badge" [ngClass]="'origin-badge--' + data.origin.toLowerCase()">
                {{ data.origin }}
              </span>
            </span>
          </div>

          <!-- Concept -->
          <div class="detail-row detail-row--full">
            <span class="detail-label">Concepto</span>
            <span class="detail-value">{{ data.concept || '—' }}</span>
          </div>

          <!-- Category -->
          <div class="detail-row">
            <span class="detail-label">Categoría</span>
            <span class="detail-value">{{ data.category || '—' }}</span>
          </div>

          <!-- Transaction Date -->
          <div class="detail-row">
            <span class="detail-label">Fecha de Transacción</span>
            <span class="detail-value">{{ data.date | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <!-- Created At -->
          <div class="detail-row">
            <span class="detail-label">Fecha de Registro</span>
            <span class="detail-value">{{ data.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <!-- Updated At -->
          <div class="detail-row" *ngIf="data.updatedAt">
            <span class="detail-label">Última Modificación</span>
            <span class="detail-value">{{ data.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Cerrar</button>
        <button 
          mat-flat-button 
          color="primary" 
          *ngIf="data.manual"
          (click)="edit()"
        >
          Editar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .transaction-detail-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle, #e5e7eb);
      margin-bottom: 1rem;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    .dialog-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted, #6b7280);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-row--full {
      grid-column: 1 / -1;
    }

    .detail-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted, #6b7280);
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.9375rem;
      color: var(--text-primary, #1f2937);
    }

    .amount {
      font-weight: 600;
      font-size: 1.125rem;
    }

    .amount--positive {
      color: #10b981;
    }

    .amount--negative {
      color: #ef4444;
    }

    .type-badge,
    .origin-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .type-badge--income {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .type-badge--expense {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .type-badge--transfer {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }

    .origin-badge--manual {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
    }

    .origin-badge--amazon {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
    }

    .origin-badge--shopify {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .origin-badge--stripe,
    .origin-badge--paypal,
    .origin-badge--bank_sync,
    .origin-badge--other {
      background: rgba(107, 114, 128, 0.15);
      color: #6b7280;
    }

    mat-dialog-content {
      padding: 0 1.5rem;
      max-height: 60vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-subtle, #e5e7eb);
      margin-top: 1rem;
    }
  `]
})
export class TransactionDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DetailedTransaction,
    private dialogRef: MatDialogRef<TransactionDetailDialogComponent>
  ) {}

  getTypeLabel(type: string): string {
    switch (type) {
      case 'INCOME': return 'Ingreso';
      case 'EXPENSE': return 'Gasto';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close({ action: 'edit', transaction: this.data });
  }
}
