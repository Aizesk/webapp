import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home-page.component';
import { LoginPageComponent } from './features/auth/login/login-page.component';
import { SigninPageComponent } from './features/auth/signin/signin-page.component';
import { RecoveryPasswordPageComponent } from './features/auth/recoverypassword/recovery-password-page.component';
import { MainDashboardPageComponent } from './features/main-dashboard/main-dashboard-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Aizesk | Plataforma financiera'
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Aizesk | Inicio de sesión'
  },
  {
    path: 'signin',
    component: SigninPageComponent,
    title: 'Aizesk | Registro'
  },
  {
    path: 'recovery-password',
    component: RecoveryPasswordPageComponent,
    title: 'Aizesk | Recuperar contraseña'
  },
  {
    path: 'main-dashboard',
    component: MainDashboardPageComponent,
    title: 'Aizesk | Dashboard general'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
