import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home-page.component';
import { LoginPageComponent } from './features/auth/login/login-page.component';
import { SigninPageComponent } from './features/auth/signin/signin-page.component';
import { RecoveryPasswordPageComponent } from './features/auth/recoverypassword/recovery-password-page.component';
import { MainDashboardPageComponent } from './features/main-dashboard/main-dashboard-page.component';
import { TransactionsPageComponent } from './features/transactions/transactions-page.component';
import { EditTransactionPageComponent } from './features/transactions/edit-transaction/edit-transaction-page.component';
import { TransactionDetailPageComponent } from './features/transactions/transaction-detail/transaction-detail-page.component';
import { AddManualTransactionPageComponent } from './features/transactions/add-manual-transaction/add-manual-transaction-page.component';
import { PlatformConnectionsPageComponent } from './features/platform-connections/platform-connections-page.component';
import { ReportsPageComponent } from './features/reports/reports-page.component';
import { SubscriptionsPageComponent } from './features/subscriptions/subscriptions-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Aizesk | Plataforma financiera',
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Aizesk | Inicio de sesión',
  },
  {
    path: 'signin',
    component: SigninPageComponent,
    title: 'Aizesk | Registro',
  },
  {
    path: 'recovery-password',
    component: RecoveryPasswordPageComponent,
    title: 'Aizesk | Recuperar contraseña',
  },
  {
    path: 'main-dashboard',
    component: MainDashboardPageComponent,
    title: 'Aizesk | Dashboard general',
  },
  {
    path: 'transactions',
    component: TransactionsPageComponent,
    title: 'Aizesk | Transacciones',
  },
  {
    path: 'transactions/manual/new',
    component: AddManualTransactionPageComponent,
    title: 'Aizesk | Nueva transacción manual',
  },
  {
    path: 'transactions/:transactionId',
    component: TransactionDetailPageComponent,
    title: 'Aizesk | Detalle de transacción',
  },
  {
    path: 'transactions/:transactionId/edit',
    component: EditTransactionPageComponent,
    title: 'Aizesk | Editar transacción',
  },
  {
    path: 'platform-connections',
    component: PlatformConnectionsPageComponent,
    title: 'Aizesk | Conexiones Plataformas',
  },
  {
    path: 'reports',
    component: ReportsPageComponent,
    title: 'Aizesk | Informes',
  },
  {
    path: 'subscriptions',
    component: SubscriptionsPageComponent,
    title: 'Aizesk | Suscripciones',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
