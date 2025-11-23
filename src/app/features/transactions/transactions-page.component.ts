import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest, map, shareReplay, tap } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';
import {
  DetailedTransaction,
  PlatformDistribution,
  TransactionMetric,
  TransactionsSnapshot
} from '../../shared/models/transactions.model';
import { TransactionsDataService } from './data/transactions-data.service';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';

type ColumnWidths = {
  select: number;
  origin: number;
  date: number;
  description: number;
  platform: number;
  amount: number;
  status: number;
  category: number;
  actions: number;
};

type SortField = 'origin' | 'date' | 'amount' | 'platform' | 'status';

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
export class TransactionsPageComponent implements AfterViewInit, OnDestroy {
  private readonly dataService = inject(TransactionsDataService);
  private readonly search$ = new BehaviorSubject<string>('');
  private readonly sort$ = new BehaviorSubject<{ field: SortField; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private resizingColumn: keyof ColumnWidths | null = null;
  private startX = 0;
  private startWidth = 0;

  protected readonly navItems = MAIN_NAV_ITEMS;
  protected readonly pageSizeOptions = [5, 10, 20];
  protected readonly displayedColumns: (keyof ColumnWidths | 'actions')[] = [
    'select',
    'origin',
    'date',
    'description',
    'platform',
    'amount',
    'status',
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
    origin: 140,
    date: 140,
    description: 240,
    platform: 140,
    amount: 140,
    status: 140,
    category: 140,
    actions: 130
  };

  protected readonly vm$ = combineLatest([
    this.dataService.getSnapshot(),
    this.search$,
    this.sort$
  ]).pipe(
    tap(([snapshot]) => {
      this.dataSource.data = [...snapshot.transactions];
      this.dataSource.filterPredicate = (data, filterValue) => {
        const term = filterValue.trim().toLowerCase();
        if (!term) {
          return true;
        }

        return (
          data.description.toLowerCase().includes(term) ||
          data.platform.toLowerCase().includes(term) ||
          data.category.toLowerCase().includes(term) ||
          (data.reference ?? '').toLowerCase().includes(term) ||
          (data.customer?.name ?? '').toLowerCase().includes(term)
        );
      };

      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'origin':
            return item.origin;
          case 'date':
            return new Date(item.date).getTime();
          case 'amount':
            return item.amount;
          case 'platform':
            return item.platform;
          case 'status':
            return item.status;
          case 'category':
            return item.category;
          default:
            return (item as any)[property];
        }
      };
    }),
    map(([snapshot, search, sort]) => ({
      metrics: snapshot.metrics,
      distribution: snapshot.distribution,
      distributionTotal: snapshot.distribution.reduce((acc, item) => acc + item.amount, 0),
      distributionGradient: this.buildGradient(snapshot.distribution),
      filters: {
        search
      },
      sort
    })),
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
