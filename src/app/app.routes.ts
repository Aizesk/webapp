import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/landing-page.component';
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
import { ProfilePageComponent } from './features/profile/profile-page.component';
import { authGuard, publicOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: LandingPageComponent,
    title: 'Aizesk | Plataforma financiera',
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [publicOnlyGuard],
    title: 'Aizesk | Inicio de sesión',
  },
  {
    path: 'signin',
    component: SigninPageComponent,
    canActivate: [publicOnlyGuard],
    title: 'Aizesk | Registro',
  },
  {
    path: 'recovery-password',
    component: RecoveryPasswordPageComponent,
    title: 'Aizesk | Recuperar contraseña',
  },
  // Protected routes (require authentication)
  {
    path: 'inicio',
    component: HomePageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Inicio',
  },
  {
    path: 'main-dashboard',
    component: MainDashboardPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Dashboard general',
  },
  {
    path: 'transactions',
    component: TransactionsPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Transacciones',
  },
  {
    path: 'transactions/manual/new',
    component: AddManualTransactionPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Nueva transacción manual',
  },
  {
    path: 'transactions/:transactionId',
    component: TransactionDetailPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Detalle de transacción',
  },
  {
    path: 'transactions/:transactionId/edit',
    component: EditTransactionPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Editar transacción',
  },
  {
    path: 'platform-connections',
    component: PlatformConnectionsPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Conexiones Plataformas',
  },
  {
    path: 'reports',
    component: ReportsPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Informes',
  },
  {
    path: 'subscriptions',
    component: SubscriptionsPageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Suscripciones',
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    canActivate: [authGuard],
    title: 'Aizesk | Perfil',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
