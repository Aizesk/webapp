import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { authRefreshInterceptor } from './core/interceptors/auth-refresh.interceptor';
import { encodingInterceptor } from './core/interceptors/encoding.interceptor';
import { NOTIFICATION_LIFECYCLE } from './core/services/notification.token';
import { NotificationService } from './core/services/notification.service';
import { SESSION_MONITOR } from './core/services/session-monitor.token';
import { SessionMonitorService } from './core/services/session-monitor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    // Order: encoding first (fixes responses), then JWT (adds token), then refresh (handles 401)
    provideHttpClient(
      withInterceptors([encodingInterceptor, jwtInterceptor, authRefreshInterceptor]),
    ),
    // Bridge token so AuthService can reach NotificationService without circular import
    { provide: NOTIFICATION_LIFECYCLE, useExisting: NotificationService },
    // Bridge token so AuthService can reach SessionMonitorService without circular import
    { provide: SESSION_MONITOR, useExisting: SessionMonitorService },
  ],
};
