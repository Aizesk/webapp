import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

import { DetailedTransaction } from '../../shared/models/transactions.model';
import { TransactionService } from '../../core/services/transaction.service';
import { TransactionFilterParams, TransactionOrigin, TransactionType } from '../../shared/models/transaction-api.model';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

import {
  TransactionDetailDialogComponent,
  TransactionFormDialogComponent,
  TransactionFormDialogData,
  TransactionFormDialogResult,
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogResult
} from './dialogs';

// Date range options (simplified, no redundant filters)
const DATE_RANGES = [
  { id: 'THIS_MONTH', label: 'Este Mes', days: -1 },
  { id: 'LAST_MONTH', label: 'Mes Anterior', days: -2 },
  { id: '6M', label: '6 Meses', days: 180 },
  { id: '1Y', label: '1 Año', days: 365 },
  { id: 'CUSTOM', label: 'Personalizado', days: -3 },
  { id: 'ALL', label: 'Todo', days: 0 }
] as const;

// Origin filter options
const ORIGIN_OPTIONS: { id: TransactionOrigin | 'ALL'; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Todos', icon: 'language' },
  { id: 'AMAZON', label: 'Amazon', icon: 'shopping_cart' },
  { id: 'SHOPIFY', label: 'Shopify', icon: 'storefront' },
  { id: 'EBAY', label: 'eBay', icon: 'local_offer' },
  { id: 'MANUAL', label: 'Manual', icon: 'edit_note' },
  { id: 'STRIPE', label: 'Stripe', icon: 'credit_card' },
  { id: 'PAYPAL', label: 'PayPal', icon: 'account_balance_wallet' }
];

type ColumnWidths = {
  select: number;
  type: number;
  origin: number;
  date: number;
  concept: number;
  amount: number;
  category: number;
  actions: number;
};

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgClass,
    NgIf,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    TopNavbarComponent
  ],
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.css', './transactions-page.tables.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsPageComponent implements OnInit, OnDestroy {
  private readonly transactionService = inject(TransactionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Navigation
  protected readonly navItems = MAIN_NAV_ITEMS;

  // Filter options
  protected readonly dateRanges = DATE_RANGES;
  protected readonly originOptions = ORIGIN_OPTIONS;

  // Reactive filter state
  protected readonly selectedDateRange = signal<string>('ALL');
  protected readonly selectedOrigin = signal<TransactionOrigin | 'ALL'>('ALL');
  protected readonly searchText = signal<string>('');

  // Custom date range state
  protected readonly customDateFrom = signal<Date | null>(null);
  protected readonly customDateTo = signal<Date | null>(null);
  protected readonly showDatePicker = signal<boolean>(false);

  // Get current date range label for display
  protected readonly currentDateRangeLabel = computed(() => {
    const rangeId = this.selectedDateRange();
    if (rangeId === 'CUSTOM') {
      const from = this.customDateFrom();
      const to = this.customDateTo();
      if (from && to) {
        return `${from.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${to.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
      }
      return 'Seleccionar fechas';
    }
    return DATE_RANGES.find(r => r.id === rangeId)?.label || 'Todo';
  });

  // Pagination state
  protected readonly pageSize = signal<number>(20);
  protected readonly currentPage = signal<number>(0);
  protected readonly pageSizeOptions = [10, 20, 50, 100];

  // Sort state
  protected readonly sortBy = signal<string>('transactionDate');
  protected readonly sortDir = signal<'asc' | 'desc'>('desc');

  // UI state
  protected readonly isLoading = signal<boolean>(false);

  // Computed filter params
  protected readonly filterParams = computed<TransactionFilterParams>(() => {
    const dateRange = this.selectedDateRange();
    const dateConfig = DATE_RANGES.find(r => r.id === dateRange);
    
    let dateFrom: string | undefined;
    let dateTo: string | undefined;
    const now = new Date();
    
    // Handle special date ranges
    if (dateRange === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      dateFrom = firstDay.toISOString();
      dateTo = lastDay.toISOString();
    } else if (dateRange === 'LAST_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      dateFrom = firstDay.toISOString();
      dateTo = lastDay.toISOString();
    } else if (dateRange === 'CUSTOM') {
      const from = this.customDateFrom();
      const to = this.customDateTo();
      if (from && to) {
        dateFrom = from.toISOString();
        // Set to end of day for dateTo
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        dateTo = endOfDay.toISOString();
      }
    } else if (dateConfig && dateConfig.days > 0) {
      const from = new Date(now);
      from.setDate(from.getDate() - dateConfig.days);
      dateFrom = from.toISOString();
      dateTo = now.toISOString();
    }

    const origin = this.selectedOrigin();

    return {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
      origin: origin === 'ALL' ? undefined : origin,
      dateFrom,
      dateTo,
      search: this.searchText() || undefined
    };
  });

  // Table config
  protected readonly displayedColumns: (keyof ColumnWidths | 'actions')[] = [
    'select',
    'type',
    'origin',
    'date',
    'concept',
    'amount',
    'category',
    'actions'
  ];
  protected readonly dataSource = new MatTableDataSource<DetailedTransaction>([]);
  protected readonly selection = new SelectionModel<DetailedTransaction>(true, []);

  protected columnWidths: ColumnWidths = {
    select: 48,
    type: 100,
    origin: 100,
    date: 130,
    concept: 280,
    amount: 130,
    category: 130,
    actions: 140
  };

  // Expose service signals
  protected readonly transactions = this.transactionService.transactions;
  protected readonly totalElements = this.transactionService.totalElements;
  protected readonly totalPages = this.transactionService.totalPages;

  constructor() {
    // Effect to reload data when filters change
    effect(() => {
      const params = this.filterParams();
      this.loadTransactions(params);
    });
  }

  ngOnInit(): void {
    // Setup debounced search
    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchText.set(value);
      this.currentPage.set(0); // Reset to first page on search
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== Filter Actions ==========

  selectDateRange(rangeId: string): void {
    if (rangeId === 'CUSTOM') {
      this.showDatePicker.set(true);
      this.selectedDateRange.set(rangeId);
      // Don't reset page yet - wait for dates to be selected
      return;
    }
    this.showDatePicker.set(false);
    this.customDateFrom.set(null);
    this.customDateTo.set(null);
    this.selectedDateRange.set(rangeId);
    this.currentPage.set(0);
  }

  onCustomDateRangeChange(): void {
    const from = this.customDateFrom();
    const to = this.customDateTo();
    if (from && to) {
      // Only close picker and reset page when both dates are selected
      this.showDatePicker.set(false);
      this.currentPage.set(0);
    }
  }

  setCustomDateFrom(date: Date | null): void {
    this.customDateFrom.set(date);
    this.onCustomDateRangeChange();
  }

  setCustomDateTo(date: Date | null): void {
    this.customDateTo.set(date);
    this.onCustomDateRangeChange();
  }

  cancelCustomDateRange(): void {
    this.showDatePicker.set(false);
    // Don't change the current selection
  }

  clearCustomDates(): void {
    this.customDateFrom.set(null);
    this.customDateTo.set(null);
    this.selectedDateRange.set('ALL');
    this.showDatePicker.set(false);
    this.currentPage.set(0);
  }

  selectOrigin(originId: TransactionOrigin | 'ALL'): void {
    this.selectedOrigin.set(originId);
    this.currentPage.set(0);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.searchText.set('');
    this.searchInput$.next('');
  }

  // ========== Pagination & Sort ==========

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    if (sort.active && sort.direction) {
      this.sortBy.set(sort.active);
      this.sortDir.set(sort.direction);
      this.currentPage.set(0);
    }
  }

  // ========== Data Loading ==========

  private loadTransactions(filters: TransactionFilterParams): void {
    this.isLoading.set(true);
    this.transactionService.getTransactions(filters).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load transactions:', err);
        this.snackBar.open('Error al cargar transacciones', 'Cerrar', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }

  // ========== Selection ==========

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numRows > 0 && numSelected === numRows;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  // ========== CRUD Dialogs ==========

  openDetailDialog(transaction: DetailedTransaction): void {
    const dialogRef = this.dialog.open(TransactionDetailDialogComponent, {
      data: transaction,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.openEditDialog(result.transaction);
      }
    });
  }

  openCreateDialog(): void {
    this.router.navigate(['/transactions/manual/new']);
  }

  openEditDialog(transaction: DetailedTransaction): void {
    // Determine if this is a partial edit (auto-imported transaction)
    const isManual = transaction.manual || transaction.origin === 'MANUAL';
    const isPartialEdit = !isManual;

    const data: TransactionFormDialogData = { 
      mode: 'edit', 
      transaction,
      partialEdit: isPartialEdit
    };
    const dialogRef = this.dialog.open(TransactionFormDialogComponent, {
      data,
      width: '550px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: TransactionFormDialogResult) => {
      if (result?.action === 'save' && result.data && result.id) {
        this.transactionService.updateTransaction(result.id, result.data).subscribe({
          next: () => {
            this.snackBar.open('Transacción actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.loadTransactions(this.filterParams());
          },
          error: (err) => {
            console.error('Failed to update transaction:', err);
            this.snackBar.open('Error al actualizar la transacción', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  openDeleteDialog(transaction: DetailedTransaction): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { transaction },
      width: '450px'
    });

    dialogRef.afterClosed().subscribe((result: DeleteConfirmDialogResult) => {
      if (result?.confirmed && result.transactionId) {
        this.transactionService.deleteTransaction(result.transactionId).subscribe({
          next: () => {
            this.snackBar.open('Transacción eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.selection.deselect(transaction);
            this.loadTransactions(this.filterParams());
          },
          error: (err) => {
            console.error('Failed to delete transaction:', err);
            this.snackBar.open('Error al eliminar la transacción', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  // ========== Helpers ==========

  /** Returns true if full edit is allowed (MANUAL transactions) */
  canFullEdit(transaction: DetailedTransaction): boolean {
    return transaction.manual || transaction.origin === 'MANUAL';
  }

  /** All transactions can be edited (full for MANUAL, partial for others) */
  canEdit(transaction: DetailedTransaction): boolean {
    return true; // All transactions can now be edited
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'INCOME': return 'Ingreso';
      case 'EXPENSE': return 'Gasto';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  }
}
