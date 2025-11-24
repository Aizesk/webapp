import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppNavItem } from '../../models/navigation.model';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavbarComponent {
  @Input({ required: true }) navItems: ReadonlyArray<AppNavItem> = [];
  @Input() brandName = 'Aizesk';
  @Input() brandLogoText = 'A';
  @Input() brandTagline?: string;
  @Input() notificationCount = 0;
  @Input() userInitials = 'A';
  @Input() userName?: string;

  isProfileMenuOpen = false;
  isSettingsMenuOpen = false;
  themePreference: 'light' | 'dark' = 'light';
  languagePreference: 'es' | 'en' = 'es';

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) {
      this.isSettingsMenuOpen = false;
    }
  }

  toggleSettingsMenu(): void {
    this.isSettingsMenuOpen = !this.isSettingsMenuOpen;
    if (this.isSettingsMenuOpen) {
      this.isProfileMenuOpen = false;
    }
  }

  setThemePreference(theme: 'light' | 'dark'): void {
    this.themePreference = theme;
  }

  setLanguagePreference(language: 'es' | 'en'): void {
    this.languagePreference = language;
  }
}
