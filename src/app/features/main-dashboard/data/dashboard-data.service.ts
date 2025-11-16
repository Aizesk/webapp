import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ConnectedAccount,
  DashboardSnapshot,
  MonthlyIncomeVsExpensePoint,
  SummaryCard,
  TransactionItem,
  WeeklyIncomePoint
} from '../../../shared/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly snapshot: DashboardSnapshot = {
    summaryCards: [
      { label: 'Ingresos Netos', value: 3100, trend: '+12.4%', trendColor: 'positive' },
      { label: 'Gastos Netos', value: 2350, trend: '-4.1%', trendColor: 'negative' },
      { label: 'Ahorro Neto', value: 750, trend: '+7.8%', trendColor: 'positive' }
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
}
