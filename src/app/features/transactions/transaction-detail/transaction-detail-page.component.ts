import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { DetailedTransaction } from '../../../shared/models/transactions.model';
import { TransactionsDataService } from '../data/transactions-data.service';
import { TopNavbarComponent } from '../../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../../shared/models/navigation.model';

interface TransactionDetailViewModel {
  readonly transactionId: string | null;
  readonly transaction?: DetailedTransaction;
  readonly totalAmount: number;
  readonly fee: number;
  readonly netAmount: number;
}

@Component({
  selector: 'app-transaction-detail-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, NgIf, NgClass, TopNavbarComponent],
  templateUrl: './transaction-detail-page.component.html',
  styleUrls: ['./transaction-detail-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(TransactionsDataService);

  protected readonly navItems = MAIN_NAV_ITEMS;

  protected readonly vm$ = this.route.paramMap.pipe(
    map((params) => params.get('transactionId')),
    switchMap((transactionId) => {
      if (!transactionId) {
        return of({ transactionId: null, transaction: undefined, totalAmount: 0, fee: 0, netAmount: 0 });
      }

      return this.dataService.getTransactionById(transactionId).pipe(
        map((transaction) => {
          const totalAmount = transaction?.amount ?? 0;
          const fee = transaction?.fee ?? 0;
          const netAmount = Math.max(totalAmount - fee, 0);

          return {
            transactionId,
            transaction,
            totalAmount,
            fee,
            netAmount
          } satisfies TransactionDetailViewModel;
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected navigateBack(): void {
    this.router.navigate(['/transactions']);
  }

  protected getStatusClass(status?: string): string {
    return status ? status.toLowerCase() : '';
  }

  protected isManual(transaction?: DetailedTransaction): boolean {
    return !!transaction?.manual;
  }

  protected handleEdit(transaction?: DetailedTransaction): void {
    if (!transaction?.manual) {
      return;
    }

    this.router.navigate(['/transactions', transaction.id, 'edit']);
  }
}
