import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

// ============================================================================
// INTERFACES (match backend DTOs)
// ============================================================================

export interface AvailablePlatform {
    readonly type: string;
    readonly displayName: string;
    readonly description: string;
    readonly iconUrl: string;
    readonly isConnected: boolean;
}

export interface PlatformConnection {
    readonly id: string;
    readonly platformType: string;
    readonly platformDisplayName: string;
    readonly platformIcon: string;
    readonly status: string;
    readonly accountId: string;
    readonly accountName: string;
    readonly lastSyncAt: string | null;
    readonly totalOrdersSynced: number;
    readonly canSync: boolean;
    readonly connectedAt: string;
    readonly lastSyncError: string | null;
}

export interface OAuthUrlResponse {
    readonly authorizationUrl: string;
    readonly state: string;
    readonly platformType: string;
}

export interface SyncLogResponse {
    readonly id: string;
    readonly connectionId: string;
    readonly status: string;
    readonly ordersFound: number;
    readonly ordersCreated: number;
    readonly ordersUpdated: number;
    readonly ordersFailed: number;
    readonly durationSeconds: number;
    readonly errorMessage: string | null;
    readonly startedAt: string;
    readonly completedAt: string | null;
}

/**
 * Merged view used by the template — combines available platform info
 * with the user's connection data (if any).
 */
export interface PlatformCardView {
    readonly type: string;
    readonly displayName: string;
    readonly description: string;
    readonly icon: string;
    readonly accent: string;
    readonly connected: boolean;
    readonly connectionId: string | null;
    readonly accountName: string | null;
    readonly lastSyncAt: string | null;
    readonly totalOrdersSynced: number;
    readonly canSync: boolean;
    readonly status: string;
    readonly lastSyncError: string | null;
}

// Platform brand config
const PLATFORM_ACCENTS: Record<string, { icon: string; accent: string }> = {
    AMAZON: { icon: '🛒', accent: '#f97316' },
    SHOPIFY: { icon: '🛍️', accent: '#96bf48' },
    EBAY: { icon: '🏷️', accent: '#0064d2' },
    ETSY: { icon: '🎨', accent: '#f56400' },
    WOOCOMMERCE: { icon: '🛒', accent: '#96588a' },
};

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({ providedIn: 'root' })
export class PlatformConnectionService {
    private readonly apiUrl = environment.apiUrls.platforms;

    // Reactive state
    private readonly _platforms = signal<PlatformCardView[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    readonly platforms = this._platforms.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    constructor(private readonly http: HttpClient) { }

    // ==================== Public API ====================

    /**
     * Load all platforms + user connections and merge into card views.
     */
    loadPlatforms(): void {
        this._loading.set(true);
        this._error.set(null);

        // Fetch available platforms (public endpoint)
        this.http.get<AvailablePlatform[]>(`${this.apiUrl}/available`).pipe(
            catchError(err => {
                console.warn('Failed to fetch available platforms:', err);
                return of([] as AvailablePlatform[]);
            })
        ).subscribe(available => {
            // Then fetch user connections (authenticated)
            this.http.get<PlatformConnection[]>(`${this.apiUrl}/connections`).pipe(
                catchError(err => {
                    console.warn('Failed to fetch user connections:', err);
                    return of([] as PlatformConnection[]);
                })
            ).subscribe(connections => {
                const cards = this.mergeData(available, connections);
                this._platforms.set(cards);
                this._loading.set(false);
            });
        });
    }

    /**
     * Initiate OAuth connection for a platform.
     * Returns the authorization URL to redirect the user.
     */
    connect(platformType: string): Observable<OAuthUrlResponse> {
        return this.http.post<OAuthUrlResponse>(`${this.apiUrl}/connect`, { platformType });
    }

    /**
     * Disconnect a platform connection.
     */
    disconnect(connectionId: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/connections/${connectionId}`).pipe(
            tap(() => this.loadPlatforms())
        );
    }

    /**
     * Trigger manual sync.
     */
    sync(connectionId: string): Observable<SyncLogResponse> {
        return this.http.post<SyncLogResponse>(`${this.apiUrl}/connections/${connectionId}/sync`, {}).pipe(
            tap(() => {
                // Refresh data after sync completes
                setTimeout(() => this.loadPlatforms(), 1000);
            })
        );
    }

    // ==================== Private Helpers ====================

    private mergeData(available: AvailablePlatform[], connections: PlatformConnection[]): PlatformCardView[] {
        const connectionMap = new Map<string, PlatformConnection>();
        connections.forEach(c => connectionMap.set(c.platformType, c));

        return available.map(p => {
            const conn = connectionMap.get(p.type);
            const brand = PLATFORM_ACCENTS[p.type] ?? { icon: '📦', accent: '#6b7280' };

            return {
                type: p.type,
                displayName: p.displayName,
                description: p.description,
                icon: brand.icon,
                accent: brand.accent,
                connected: !!conn,
                connectionId: conn?.id ?? null,
                accountName: conn?.accountName ?? null,
                lastSyncAt: conn?.lastSyncAt ?? null,
                totalOrdersSynced: conn?.totalOrdersSynced ?? 0,
                canSync: conn?.canSync ?? false,
                status: conn?.status ?? 'DISCONNECTED',
                lastSyncError: conn?.lastSyncError ?? null,
            };
        });
    }
}
