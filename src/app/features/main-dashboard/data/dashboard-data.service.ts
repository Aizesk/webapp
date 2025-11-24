import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ChannelRevenueShare,
  ConnectedAccount,
  DashboardSnapshot,
  MonthlyIncomeVsExpensePoint,
  ReconciliationStatus,
  SummaryCard,
  TransactionItem,
  WeeklyIncomePoint
} from '../../../shared/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly snapshot: DashboardSnapshot = {
    summaryCards: [
      {
        label: 'Ingresos Netos',
        value: 3100,
        trend: '+12.4%',
        trendColor: 'positive',
        sparkline: [22, 26, 24, 29, 31, 30, 33]
      },
      {
        label: 'Gastos Netos',
        value: 2350,
        trend: '-4.1%',
        trendColor: 'negative',
        sparkline: [18, 19, 22, 21, 20, 19, 18]
      },
      {
        label: 'Ahorro Neto',
        value: 750,
        trend: '+7.8%',
        trendColor: 'positive',
        sparkline: [4, 5, 6, 8, 9, 10, 11]
      }
    ],
    weeklyIncome: [
      { label: 'Ene', amount: 24 },
      { label: 'Feb', amount: 32 },
      { label: 'Mar', amount: 40 },
      { label: 'Abr', amount: 31 },
      { label: 'May', amount: 45 },
      { label: 'Jun', amount: 30 }
    ],
    monthlyIncomeVsExpense: [
      { label: 'Ene', income: 18, expense: 15 },
      { label: 'Feb', income: 20, expense: 17 },
      { label: 'Mar', income: 22, expense: 18 },
      { label: 'Abr', income: 21, expense: 20 },
      { label: 'May', income: 24, expense: 22 },
      { label: 'Jun', income: 26, expense: 24 },
      { label: 'Jul', income: 27, expense: 23 },
      { label: 'Ago', income: 30, expense: 25 }
    ],
    transactions: [
      { title: 'Roberto Robles', description: 'Venta #2001', amount: 650, positive: true, timestamp: 'Hace 2 h' },
      { title: 'Paquete 02344', description: 'Suscripción', amount: 210, positive: true, timestamp: 'Hace 4 h' },
      { title: 'Pago 09421', description: 'Servicios', amount: 120, positive: true, timestamp: 'Hace 6 h' },
      { title: 'Upgrade 78201', description: 'Licencia anual', amount: 410, positive: false, timestamp: 'Ayer' },
      { title: 'Gastón Digital', description: 'Publicidad', amount: 270, positive: false, timestamp: 'Ayer' }
    ],
    accounts: [
      { name: 'Tusfin', status: 'Activo', statusColor: 'success' },
      { name: 'Stripe', status: 'Conectado', statusColor: 'info' },
      { name: 'Banreg', status: 'En revisión', statusColor: 'warning' },
      { name: 'Shopify', status: 'Conectado', statusColor: 'info' }
    ],
    channelRevenue: [
      { channel: 'Amazon', amount: 12500, percentage: 32, color: '#0f62fe' },
      { channel: 'Shopify', amount: 9800, percentage: 25, color: '#16a34a' },
      { channel: 'YouTube', amount: 6200, percentage: 16, color: '#f97316' },
      { channel: 'Twitch', amount: 4100, percentage: 11, color: '#8b5cf6' },
      { channel: 'Ventas locales', amount: 3200, percentage: 8, color: '#0ea5e9' },
      { channel: 'Otros', amount: 2100, percentage: 8, color: '#c026d3' }
    ],
    reconciliation: [
      { account: 'BBVA MX', recorded: 18250, bank: 18110, status: 'aligned' },
      { account: 'Santander ES', recorded: 9400, bank: 9030, status: 'warning' },
      { account: 'Stripe USD', recorded: 12380, bank: 12380, status: 'aligned' }
    ]
  };

  getSummaryCards(): Observable<readonly SummaryCard[]> {
    return of(this.snapshot.summaryCards);
  }

  getWeeklyIncome(): Observable<readonly WeeklyIncomePoint[]> {
    return of(this.snapshot.weeklyIncome);
  }

  getMonthlyIncomeVsExpense(): Observable<readonly MonthlyIncomeVsExpensePoint[]> {
    return of(this.snapshot.monthlyIncomeVsExpense);
  }

  getTransactions(): Observable<readonly TransactionItem[]> {
    return of(this.snapshot.transactions);
  }

  getConnectedAccounts(): Observable<readonly ConnectedAccount[]> {
    return of(this.snapshot.accounts);
  }

  getChannelRevenue(): Observable<readonly ChannelRevenueShare[]> {
    return of(this.snapshot.channelRevenue);
  }

  getReconciliationStats(): Observable<readonly ReconciliationStatus[]> {
    return of(this.snapshot.reconciliation);
  }

}
