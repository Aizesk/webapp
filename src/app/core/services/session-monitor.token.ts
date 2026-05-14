import { InjectionToken } from '@angular/core';

/**
 * Interface describing the session monitor lifecycle methods needed by AuthService.
 * Using an interface + InjectionToken avoids circular dependency between
 * AuthService ↔ SessionMonitorService.
 */
export interface SessionMonitorLifecycle {
    start(): void;
    stop(): void;
}

export const SESSION_MONITOR = new InjectionToken<SessionMonitorLifecycle>(
    'SessionMonitorLifecycle',
);
