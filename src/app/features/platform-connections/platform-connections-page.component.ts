import { ChangeDetectionStrategy, Component, OnInit, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import {
  PlatformConnectionService,
  PlatformCardView,
} from '../../core/services/platform-connection.service';

@Component({
  selector: 'app-platform-connections-page',
  standalone: true,
  imports: [NgClass, ButtonComponent, TopNavbarComponent],
  templateUrl: './platform-connections-page.component.html',
  styleUrls: ['./platform-connections-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformConnectionsPageComponent implements OnInit {
  protected readonly navItems = MAIN_NAV_ITEMS;

  // Signals from service
  protected readonly platforms;
  protected readonly loading;
  protected readonly error;

  // Shopify domain dialog
  protected readonly showShopifyDialog = signal(false);
  protected readonly shopDomain = signal('');

  // Action feedback
  protected readonly actionLoading = signal<string | null>(null);
  protected readonly actionMessage = signal<string | null>(null);
  protected readonly syncResult = signal<{ type: string; message: string } | null>(null);

  // Syncing state from service
  protected readonly syncingPlatform;

  // Computed values for sidebar (Angular templates don't support arrow fn)
  protected readonly connectedCount = computed(
    () => this.platforms().filter((p) => p.connected).length,
  );
  protected readonly totalOrders = computed(() =>
    this.platforms().reduce((sum, p) => sum + p.totalOrdersSynced, 0),
  );

  constructor(
    private readonly platformService: PlatformConnectionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.platforms = this.platformService.platforms;
    this.loading = this.platformService.loading;
    this.error = this.platformService.error;
    this.syncingPlatform = this.platformService.syncingPlatform;
  }

  ngOnInit(): void {
    this.handleOAuthReturn();
    this.platformService.loadPlatforms();
  }

  /**
   * Check if we're returning from an OAuth flow (eBay, etc.).
   * eBay redirects here with ?code=...&state=... query params.
   * We capture them, send to backend, and clean the URL.
   */
  private handleOAuthReturn(): void {
    const params = this.route.snapshot.queryParams;

    // Handle successful OAuth return with code + state
    if (params['code'] && params['state']) {
      this.actionLoading.set('OAUTH');
      this.platformService.handleOAuthCallback(params['code'], params['state']).subscribe({
        next: () => {
          this.actionLoading.set(null);
          this.showFeedback('¡Plataforma conectada correctamente!');
          this.platformService.loadPlatforms();
          // Clean query params from URL
          this.router.navigate([], { relativeTo: this.route, queryParams: {} });
        },
        error: (err) => {
          this.actionLoading.set(null);
          this.showFeedback('Error al conectar: ' + (err.error?.message || err.message));
          this.router.navigate([], { relativeTo: this.route, queryParams: {} });
        },
      });
      return;
    }

    // Handle connected=platform (from backend GET callback redirect)
    if (params['connected']) {
      this.showFeedback(`¡${params['connected']} conectado correctamente!`);
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
      return;
    }

    // Handle error param
    if (params['error']) {
      this.showFeedback('Error OAuth: ' + params['error']);
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    }
  }

  // ==================== Actions ====================

  protected handleConnect(platform: PlatformCardView): void {
    if (platform.type === 'SHOPIFY') {
      this.shopDomain.set('');
      this.showShopifyDialog.set(true);
      return;
    }

    this.startOAuth(platform.type);
  }

  protected confirmShopifyDomain(): void {
    const domain = this.shopDomain().trim();
    if (!domain) return;

    this.showShopifyDialog.set(false);
    this.startOAuth('SHOPIFY', domain);
  }

  protected cancelShopifyDialog(): void {
    this.showShopifyDialog.set(false);
    this.shopDomain.set('');
  }

  protected handleDisconnect(platform: PlatformCardView): void {
    if (!platform.connectionId) return;

    this.actionLoading.set(platform.type);
    this.platformService.disconnect(platform.connectionId).subscribe({
      next: () => {
        this.actionLoading.set(null);
        this.showFeedback('Plataforma desconectada');
      },
      error: (err) => {
        this.actionLoading.set(null);
        this.showFeedback('Error al desconectar: ' + err.message);
      },
    });
  }

  protected handleSync(platform: PlatformCardView): void {
    if (!platform.connectionId) return;

    this.syncResult.set(null);
    this.platformService.sync(platform.connectionId).subscribe({
      next: (result) => {
        this.syncResult.set({
          type: platform.type,
          message: `✅ ${result.ordersFound} pedidos encontrados, ${result.ordersCreated} nuevos`,
        });
        setTimeout(() => this.syncResult.set(null), 5000);
      },
      error: (err) => {
        this.syncResult.set({
          type: platform.type,
          message: '❌ Error al sincronizar',
        });
        setTimeout(() => this.syncResult.set(null), 5000);
      },
    });
  }

  protected updateShopDomain(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.shopDomain.set(input.value);
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'CONNECTED':
        return 'conectado';
      case 'PENDING':
        return 'pendiente';
      case 'DISCONNECTED':
        return 'no-conectado';
      case 'ERROR':
      case 'EXPIRED':
        return 'error';
      default:
        return 'no-conectado';
    }
  }

  protected getStatusLabel(status: string): string {
    switch (status) {
      case 'CONNECTED':
        return 'Conectado';
      case 'PENDING':
        return 'Conectando…';
      case 'DISCONNECTED':
        return 'No conectado';
      case 'ERROR':
        return 'Error';
      case 'EXPIRED':
        return 'Token expirado';
      default:
        return 'No conectado';
    }
  }

  protected formatLastSync(dateStr: string | null): string {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Hace unos segundos';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ==================== Private ====================

  private startOAuth(platformType: string, shopDomain?: string): void {
    this.actionLoading.set(platformType);

    this.platformService.connect(platformType).subscribe({
      next: (response) => {
        this.actionLoading.set(null);
        let url = response.authorizationUrl;

        // For Shopify, replace {shop} placeholder with actual domain
        if (platformType === 'SHOPIFY' && shopDomain) {
          const normalizedDomain = shopDomain.replace(/\.myshopify\.com$/, '');
          url = url.replace('{shop}', normalizedDomain);
        }

        // Redirect to OAuth provider
        window.location.href = url;
      },
      error: (err) => {
        this.actionLoading.set(null);
        this.showFeedback('Error al conectar: ' + err.message);
      },
    });
  }

  private showFeedback(message: string): void {
    this.actionMessage.set(message);
    setTimeout(() => this.actionMessage.set(null), 4000);
  }
}
