import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  computed,
  effect
} from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest, map, shareReplay, tap, of, catchError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';
import {
  DetailedTransaction,
  PlatformDistribution,
  TransactionMetric
} from '../../shared/models/transactions.model';
import { TransactionService } from '../../core/services/transaction.service';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

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

type SortField = 'type' | 'origin' | 'date' | 'amount' | 'category';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    NgIf,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TopNavbarComponent
  ],
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.css', './transactions-page.tables.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsPageComponent implements OnInit, AfterViewInit, OnDestroy {
  // Using the new core TransactionService that calls real backend
  private readonly transactionService = inject(TransactionService);
  private readonly search$ = new BehaviorSubject<string>('');
  private readonly sort$ = new BehaviorSubject<{ field: SortField; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private resizingColumn: keyof ColumnWidths | null = null;
  private startX = 0;
  private startWidth = 0;

  protected readonly navItems = MAIN_NAV_ITEMS;
  protected readonly pageSizeOptions = [5, 10, 20];
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
  protected readonly isProcessing$ = new BehaviorSubject<boolean>(false);
  protected renderedPage: DetailedTransaction[] = [];
  private renderedSub?: Subscription;
  protected columnWidths: ColumnWidths = {
    select: 48,
    type: 120,
    origin: 120,
    date: 140,
    concept: 260,
    amount: 140,
    category: 140,
    actions: 130
  };

  // Default distribution for visualization (backend doesn't provide this yet)
  private readonly defaultDistribution: PlatformDistribution[] = [
    { platform: 'Amazon', amount: 0, color: '#f97316' },
    { platform: 'Shopify', amount: 0, color: '#22c55e' }
  ];

  // Convert signals to observables for combineLatest
  private readonly transactions$ = toObservable(this.transactionService.transactions);
  private readonly metrics$ = toObservable(this.transactionService.metrics);

  protected readonly vm$ = combineLatest([
    this.transactions$,
    this.metrics$,
    this.search$,
    this.sort$,
    this.refresh$
  ]).pipe(
    tap(([transactions]) => {
      this.dataSource.data = [...transactions];
      this.dataSource.filterPredicate = (data, filterValue) => {
        const term = filterValue.trim().toLowerCase();
        if (!term) {
          return true;
        }

        return (
          data.concept.toLowerCase().includes(term) ||
          data.platform.toLowerCase().includes(term) ||
          data.category.toLowerCase().includes(term) ||
          (data.reference ?? '').toLowerCase().includes(term) ||
          (data.customer?.name ?? '').toLowerCase().includes(term)
        );
      };

      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'type':
            return item.type;
          case 'origin':
            return item.origin;
          case 'date':
            return new Date(item.date).getTime();
          case 'amount':
            return item.amount;
          case 'category':
            return item.category;
          default:
            return (item as any)[property];
        }
      };
    }),
    map(([transactions, metrics, search, sort]) => {
      // Build distribution from actual transaction data
      const platformAmounts = new Map<string, number>();
      transactions.forEach(tx => {
        const current = platformAmounts.get(tx.platform) || 0;
        platformAmounts.set(tx.platform, current + Math.abs(tx.amount));
      });

      const colors: Record<string, string> = {
        'Amazon': '#f97316',
        'Shopify': '#22c55e',
        'default': '#94a3b8'
      };

      const distribution: PlatformDistribution[] = Array.from(platformAmounts.entries()).map(([platform, amount]) => ({
        platform,
        amount,
        color: colors[platform] || colors['default']
      }));

      const distributionTotal = distribution.reduce((acc, item) => acc + item.amount, 0);

      return {
        metrics,
        distribution: distribution.length > 0 ? distribution : this.defaultDistribution,
        distributionTotal,
        distributionGradient: this.buildGradient(distribution.length > 0 ? distribution : this.defaultDistribution),
        totalElements: this.transactionService.totalElements(),
        totalPages: this.transactionService.totalPages(),
        currentPage: this.transactionService.currentPage(),
        filters: {
          search
        },
        sort
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected trackByMetric = (_: number, metric: TransactionMetric): string => metric.label;
  protected trackByPlatform = (_: number, dist: PlatformDistribution): string => dist.platform;
  protected startResize(event: MouseEvent, column: keyof ColumnWidths): void {
    this.resizingColumn = column;
    this.startX = event.clientX;
    this.startWidth = this.columnWidths[column];
    event.preventDefault();
  }

  @HostListener('document:mouseup')
  protected stopResize(): void {
    this.resizingColumn = null;
  }

  @HostListener('document:mousemove', ['$event'])
  protected handleResize(event: MouseEvent): void {
    if (!this.resizingColumn) {
      return;
    }

    const delta = event.clientX - this.startX;
    const nextWidth = Math.max(110, this.startWidth + delta);
    this.columnWidths = { ...this.columnWidths, [this.resizingColumn]: nextWidth };
  }

  // ========== Lifecycle Hooks ==========

  ngOnInit(): void {
    this.loadTransactions(0, 20);
  }

  protected setSearch(value: string): void {
    this.isProcessing$.next(true);
    this.search$.next(value);
    const term = value.trim().toLowerCase();
    this.dataSource.filter = term;
    this.dataSource.paginator?.firstPage();
    setTimeout(() => this.isProcessing$.next(false));
  }

  protected changeSortFromColumn(field: SortField): void {
    this.isProcessing$.next(true);
    const current = this.sort$.value;
    const isSameField = current.field === field;
    const direction = isSameField ? (current.direction === 'asc' ? 'desc' : 'asc') : 'desc';

    this.sort$.next({ field, direction });
    if (this.sort) {
      this.sort.active = field;
      this.sort.direction = direction;
      this.sort.sortChange.emit({ active: field, direction });
    }
    setTimeout(() => this.isProcessing$.next(false));
  }

  protected toggleSelection(row: DetailedTransaction, checked: boolean): void {
    if (checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }
  }

  // ========== Backend Pagination ==========

  /**
   * Load transactions from backend with pagination.
   */
  protected loadTransactions(page: number, size: number): void {
    this.isProcessing$.next(true);
    this.transactionService.getTransactions({ page, size }).subscribe({
      next: () => {
        this.refresh$.next();
        this.isProcessing$.next(false);
      },
      error: (err) => {
        console.error('Failed to load transactions:', err);
        this.isProcessing$.next(false);
      }
    });
  }

  /**
   * Handle page change event from MatPaginator.
   */
  protected onPageChange(event: PageEvent): void {
    this.loadTransactions(event.pageIndex, event.pageSize);
  }

  /**
   * Refresh transactions (reload current page).
   */
  protected refreshTransactions(): void {
    this.loadTransactions(this.transactionService.currentPage(), 20);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Inicializa sort y filtro para MatTableDataSource
    this.changeSortFromColumn(this.sort$.value.field);
    const term = this.search$.value.trim().toLowerCase();
    this.dataSource.filter = term;

    this.renderedSub = this.dataSource.connect().subscribe((data) => {
      this.renderedPage = data;
    });
  }

  ngOnDestroy(): void {
    this.renderedSub?.unsubscribe();
  }

  protected isAllSelected(): boolean {
    const pageData = this.renderedPage;
    return pageData.length > 0 && pageData.every((row) => this.selection.isSelected(row));
  }

  protected toggleAll(checked: boolean): void {
    const pageData = this.renderedPage;
    if (checked) {
      pageData.forEach((row) => this.selection.select(row));
    } else {
      pageData.forEach((row) => this.selection.deselect(row));
    }
  }

  protected clearSelection(): void {
    this.selection.clear();
  }

  protected clearSearch(): void {
    this.setSearch('');
  }

  private buildGradient(distribution: readonly PlatformDistribution[]): string {
    const total = distribution.reduce((acc, item) => acc + item.amount, 0);
    if (!total) {
      return '#e2e8f0';
    }

    let current = 0;
    const segments = distribution.map((item) => {
      const start = (current / total) * 360;
      current += item.amount;
      const end = (current / total) * 360;
      return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }
}
