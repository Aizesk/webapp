import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FeatureCard } from '../../shared/models/feature-card.model';
import { FeatureCardListComponent } from '../../shared/components/feature-card-list/feature-card-list.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FeatureCardListComponent, ButtonComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly router = inject(Router);

  protected readonly featureCards: FeatureCard[] = [
    {
      code: 'GI',
      title: 'Gestión Intuitiva',
      description:
        'Nuestra plataforma te permite llevar un control detallado de todos tus movimientos financieros de manera sencilla. Proyecta ingresos y gastos en segundos, clasifícalos por categorías personalizadas y obtén una vista clara de tu situación financiera en tiempo real.'
    },
    {
      code: 'RD',
      title: 'Reportes Detallados',
      description:
        'Accede a informes completos que te ayudan a tomar mejores decisiones financieras. Visualiza gráficos e indicadores, exporta a tu formato favorito y automatiza reportes en el tiempo. Nuestros algoritmos resaltan los porcentajes más relevantes sobre patrones de gasto, fuentes de riesgo y oportunidades ahorro que no habías considerado antes.'
    },
    {
      code: 'SG',
      title: 'Seguridad Garantizada',
      description:
        'Tus datos están protegidos con los más altos estándares de seguridad de la industria. Utilizamos cifrado de extremo a extremo, autenticación multifactor y copias de seguridad automatizadas para garantizar que tu información financiera se mantenga segura y disponible cuando la necesites. Tu privacidad es nuestra prioridad máxima.'
    }
  ];

  protected handleLogin(): void {
    this.router.navigate(['/login']);
  }

  protected handleSignin(): void {
    this.router.navigate(['/signin']);
  }

  protected handleApiConnections(): void {
    this.router.navigate(['/api-connections']);
  }
}
