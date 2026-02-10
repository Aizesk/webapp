import { InjectionToken } from '@angular/core';

/**
 * Interface describing the notification lifecycle methods needed by AuthService.
 * Using an interface + InjectionToken avoids circular dependency between
 * AuthService ↔ NotificationService.
 */
export interface NotificationLifecycle {
  reset(): void;
  initRealtimeConnection(): void;
}

export const NOTIFICATION_LIFECYCLE = new InjectionToken<NotificationLifecycle>(
  'NotificationLifecycle',
);
