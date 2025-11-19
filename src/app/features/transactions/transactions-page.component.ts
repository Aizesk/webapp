import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map, shareReplay } from 'rxjs';
import {
  PlatformDistribution,
  TransactionMetric
} from '../../shared/models/transactions.model';
import { TransactionsDataService } from './data/transactions-data.service';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.css', './transactions-page.tables.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsPageComponent {
  private readonly dataService = inject(TransactionsDataService);

  protected readonly navItems = [
    { label: 'Inicio', active: false, path: '/' },
    { label: 'Transacciones', active: true, path: '/transactions' },
    { label: 'Servicios', active: false, path: '/services' },
    { label: 'Informes', active: false, path: '/reports' }
  ];

  protected readonly vm$ = this.dataService.getSnapshot().pipe(
    map((snapshot) => ({
      metrics: snapshot.metrics,
      transactions: snapshot.transactions,
      distribution: snapshot.distribution,
      distributionTotal: snapshot.distribution.reduce((acc, item) => acc + item.amount, 0),
      distributionGradient: this.buildGradient(snapshot.distribution)
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected trackByMetric = (_: number, metric: TransactionMetric): string => metric.label;
  protected trackByPlatform = (_: number, dist: PlatformDistribution): string => dist.platform;

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
