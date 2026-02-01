import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppNavItem } from '../../models/navigation.model';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavbarComponent {
  @Input({ required: true }) navItems: ReadonlyArray<AppNavItem> = [];
  @Input() brandName = 'Aizesk';
  @Input() brandLogoText = 'A';
  @Input() brandTagline = 'Tu control financiero';
  @Input() userInitials = 'A';
  @Input() userName?: string;

  private readonly themeService = inject(ThemeService);
  private readonly notificationService = inject(NotificationService);

  isProfileMenuOpen = false;
  isSettingsMenuOpen = false;
  isNotificationMenuOpen = false;
  languagePreference: 'es' | 'en' = 'es';

  get themePreference(): Theme {
    return this.themeService.theme();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) {
      this.isSettingsMenuOpen = false;
      this.isNotificationMenuOpen = false;
    }
  }

  toggleSettingsMenu(): void {
    this.isSettingsMenuOpen = !this.isSettingsMenuOpen;
    if (this.isSettingsMenuOpen) {
      this.isProfileMenuOpen = false;
      this.isNotificationMenuOpen = false;
    }
  }

  toggleNotificationMenu(): void {
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;
    if (this.isNotificationMenuOpen) {
      this.isProfileMenuOpen = false;
      this.isSettingsMenuOpen = false;
    }
  }

  get notifications() {
    return this.notificationService.recentNotifications();
  }

  get unreadNotificationsCount() {
    return this.notificationService.unreadCount();
  }

  markAsRead(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  setThemePreference(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  setLanguagePreference(language: 'es' | 'en'): void {
    this.languagePreference = language;
  }
}
