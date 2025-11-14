import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FeatureCard } from '../../shared/models/feature-card.model';
import { FeatureCardListComponent } from '../../shared/components/feature-card-list/feature-card-list.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FeatureCardListComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
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
}
