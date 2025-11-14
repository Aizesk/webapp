import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home-page.component';

export const routes: Routes = [
	{
		path: '',
		component: HomePageComponent,
		title: 'Aizesk | Plataforma financiera'
	},
	{
		path: '**',
		redirectTo: ''
	}
];
