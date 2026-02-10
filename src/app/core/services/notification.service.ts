import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, tap, catchError, of, retry, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InAppNotification,
  NotificationBellData,
  NotificationWebSocketMessage,
} from '../../shared/models/notifications.model';
import { AuthService } from './auth.service';
import { NOTIFICATION_LIFECYCLE, NotificationLifecycle } from './notification.token';

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements NotificationLifecycle {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = environment.apiUrls.notifications;
  private readonly wsUrl = environment.notificationsWs;

  private socket$?: WebSocketSubject<NotificationWebSocketMessage>;

  // States (using Signals for modern Angular)
  private readonly _unreadCount = signal<number>(0);
  private readonly _recentNotifications = signal<InAppNotification[]>([]);
  private readonly _isConnected = signal<boolean>(false);

  // Read-only access to state
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly recentNotifications = this._recentNotifications.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();

  constructor() {
    // Automatically connect when the service is initialized if user is logged in
    this.initRealtimeConnection();
  }

  /**
   * Initializes the WebSocket connection for real-time notifications
   */
  initRealtimeConnection(): void {
    const user = this.authService.currentUser();
    if (!user || this.socket$) return;

    // Get JWT token for WebSocket authentication
    const token = this.authService.getAccessToken();
    if (!token) {
      console.warn('No JWT token available, cannot connect to notifications WebSocket');
      return;
    }

    // Include token as query parameter for authentication during handshake
    const wsUrlWithUser = `${this.wsUrl}/${user.userId}?token=${token}`;

    this.socket$ = webSocket<NotificationWebSocketMessage>({
      url: wsUrlWithUser,
      openObserver: {
        next: () => {
          this._isConnected.set(true);
          console.log('Authenticated WebSocket connection established');
        },
      },
      closeObserver: {
        next: (event) => {
          this._isConnected.set(false);
          this.socket$ = undefined;
          if (event.code === 1008) {
            // POLICY_VIOLATION
            console.error('WebSocket authentication failed:', event.reason);
          } else {
            console.log('Disconnected from notifications server');
          }
        },
      },
    });

    this.socket$
      .pipe(
        retry({ delay: 5000 }), // Automatically reconnect after 5 seconds
        catchError((err) => {
          console.error('Notification WebSocket Error:', err);
          return of(null);
        }),
      )
      .subscribe((message) => {
        if (message) {
          this.handleWsMessage(message);
        }
      });

    // Initial load of bell data
    this.fetchBellData(user.userId).subscribe();
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
    this._isConnected.set(false);
  }

  /**
   * Full reset: disconnect WebSocket + clear all cached notification state.
   * Must be called on logout to prevent stale data leaking to the next user.
   */
  reset(): void {
    this.disconnect();
    this._unreadCount.set(0);
    this._recentNotifications.set([]);
  }

  /**
   * Fetches the bell data (unread count + recent notifications) via HTTP
   */
  fetchBellData(userId: string): Observable<NotificationBellData> {
    return this.http.get<NotificationBellData>(`${this.apiUrl}/in-app/bell/${userId}`).pipe(
      tap((data) => {
        this._unreadCount.set(data.unreadCount);
        this._recentNotifications.set(data.notifications);
      }),
    );
  }

  /**
   * Marks a single notification as read
   */
  markAsRead(notificationId: string): Observable<InAppNotification> {
    return this.http
      .put<InAppNotification>(`${this.apiUrl}/in-app/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Optimistic update of unread count
          this._unreadCount.update((count) => Math.max(0, count - 1));

          // Update the notification in the local list
          this._recentNotifications.update((notifs) =>
            notifs.map((n) => (n.id === notificationId ? { ...n, status: 'READ', read: true } : n)),
          );
        }),
      );
  }

  /**
   * Marks all notifications as read for current user
   */
  markAllAsRead(): Observable<any> {
    const user = this.authService.currentUser();
    if (!user) return of(null);

    return this.http.put(`${this.apiUrl}/in-app/user/${user.userId}/read-all`, {}).pipe(
      tap(() => {
        this._unreadCount.set(0);
        this._recentNotifications.update((notifs) =>
          notifs.map((n) => ({ ...n, status: 'READ', read: true })),
        );
      }),
    );
  }

  /**
   * Deletes a notification
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/in-app/${notificationId}`).pipe(
      tap(() => {
        const deletedNotif = this._recentNotifications().find((n) => n.id === notificationId);
        if (deletedNotif && deletedNotif.status === 'UNREAD') {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
        this._recentNotifications.update((notifs) => notifs.filter((n) => n.id !== notificationId));
      }),
    );
  }

  private handleWsMessage(message: NotificationWebSocketMessage): void {
    if (message.type === 'NOTIFICATION') {
      const newNotif = message.payload as InAppNotification;
      // Add to recent list and increment unread count
      this._recentNotifications.update((notifs) => [newNotif, ...notifs.slice(0, 9)]);
      if (newNotif.status === 'UNREAD') {
        this._unreadCount.update((count) => count + 1);
      }
    } else if (message.type === 'BELL_UPDATE') {
      const bellData = message.payload as NotificationBellData;
      this._unreadCount.set(bellData.unreadCount);
      this._recentNotifications.set(bellData.notifications);
    }
  }
}
