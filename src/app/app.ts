import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { SessionMonitorService } from './core/services/session-monitor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly sessionMonitor = inject(SessionMonitorService);

  ngOnInit(): void {
    // If user is already authenticated (e.g., page refresh), start the session monitor
    if (this.authService.isAuthenticated()) {
      this.sessionMonitor.start();
    }
  }
}
