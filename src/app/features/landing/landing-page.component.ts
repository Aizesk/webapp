import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FeatureCard } from '../../shared/models/feature-card.model';
import { FeatureCardListComponent } from '../../shared/components/feature-card-list/feature-card-list.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';

interface PlatformPartner {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly description: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FeatureCardListComponent, ButtonComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private carouselInterval: ReturnType<typeof setInterval> | null = null;

  protected currentCarouselIndex = 0;

  protected readonly platformPartners: readonly PlatformPartner[] = [
    {
      id: 'shopify',
      name: 'Shopify',
      icon: '🛍️',
      color: '#96BF48',
      description: 'Conecta tu tienda de merch y productos digitales',
    },
    {
      id: 'amazon',
      name: 'Amazon',
      icon: '📦',
      color: '#FF9900',
      description: 'Importa ventas de afiliados, FBA y KDP',
    },
  ];

  protected readonly securityFeatures = [
    {
      icon: 'shield',
      title: 'OAuth 2.0 Certificado',
      description: 'Conexiones verificadas con los estándares más exigentes de la industria.',
    },
    {
      icon: 'fingerprint',
      title: 'Sin acceso a contraseñas',
      description: 'Nunca almacenamos tus credenciales. Solo tokens de acceso revocables.',
    },
    {
      icon: 'sync_lock',
      title: 'Tokens renovables',
      description: 'Acceso temporal que puedes revocar en cualquier momento desde tu cuenta.',
    },
    {
      icon: 'gpp_good',
      title: 'GDPR & CCPA compliant',
      description: 'Cumplimos con las normativas de protección de datos más estrictas.',
    },
  ];

  protected readonly featureCards: FeatureCard[] = [
    {
      code: 'GI',
      title: 'Gestión Intuitiva',
      description:
        'Controla todos tus ingresos de Amazon, Shopify y más desde un solo lugar. Proyecta ganancias, categoriza por plataforma y visualiza tu crecimiento en tiempo real.',
    },
    {
      code: 'RD',
      title: 'Reportes para Vendedores',
      description:
        'Genera informes fiscales, métricas por producto y análisis de rendimiento. Exporta para tu gestor, prepara reuniones y demuestra tu valor con datos reales.',
    },
    {
      code: 'SG',
      title: 'Seguridad Enterprise',
      description:
        'Cifrado de extremo a extremo, OAuth 2.0 certificado y cumplimiento GDPR. Tus datos financieros protegidos con los estándares de la banca digital.',
    },
  ];

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  protected handleLogin(): void {
    this.router.navigate(['/login']);
  }

  protected handleSignin(): void {
    this.router.navigate(['/signin']);
  }

  protected handlePlatformConnections(): void {
    this.router.navigate(['/platform-connections']);
  }

  protected handleReports(): void {
    this.router.navigate(['/reports']);
  }

  protected setCarouselIndex(index: number): void {
    this.currentCarouselIndex = index;
    this.restartCarousel();
  }

  protected get visiblePlatforms(): readonly PlatformPartner[] {
    const itemsPerView = 4;
    const start = this.currentCarouselIndex * itemsPerView;
    return this.platformPartners.slice(start, start + itemsPerView);
  }

  protected get carouselPageCount(): number {
    return Math.ceil(this.platformPartners.length / 4);
  }

  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselPageCount;
    }, 4000);
  }

  private stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  private restartCarousel(): void {
    this.stopCarousel();
    this.startCarousel();
  }
}
