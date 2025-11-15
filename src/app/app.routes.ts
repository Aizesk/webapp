import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home-page.component';
import { LoginPageComponent } from './features/auth/login/login-page.component';

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
    path: '**',
    redirectTo: ''
  }
];
