import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { InAppNotification, NotificationType, NotificationStatus, NotificationPriority } from '../../shared/models/notifications.model';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { MAIN_NAV_ITEMS } from '../../shared/models/navigation.model';
import {
    NOTIFICATION_STATUS,
    NOTIFICATION_TYPE,
    NOTIFICATION_PRIORITY,
    NOTIFICATION_FILTERS,
    NOTIFICATION_LABELS,
    FILTER_ALL,
    TYPE_FILTER_OPTIONS,
    PRIORITY_FILTER_OPTIONS,
    getNotificationIconForType,
    getRelativeTimeString,
    FilterTab
} from '../constants/notifications.constants';

@Component({
    selector: 'app-notifications-page',
    standalone: true,
    imports: [CommonModule, FormsModule, TopNavbarComponent],
    templateUrl: './notifications-page.component.html',
    styleUrls: ['./notifications-page.component.css']
})
export class NotificationsPageComponent implements OnInit {
    private readonly notificationService = inject(NotificationService);

    // Navigation
    protected readonly navItems = MAIN_NAV_ITEMS;

    // Expose constants for template
    protected readonly STATUS = NOTIFICATION_STATUS;
    protected readonly TYPE = NOTIFICATION_TYPE;
    protected readonly PRIORITY = NOTIFICATION_PRIORITY;
    protected readonly FILTERS = NOTIFICATION_FILTERS;
    protected readonly LABELS = NOTIFICATION_LABELS;
    protected readonly FILTER_ALL = FILTER_ALL;
    protected readonly TYPE_OPTIONS = TYPE_FILTER_OPTIONS;
    protected readonly PRIORITY_OPTIONS = PRIORITY_FILTER_OPTIONS;


    readonly isLoading = signal<boolean>(false);


    readonly activeTab = signal<FilterTab>(NOTIFICATION_FILTERS.TAB.ALL);
    readonly selectedType = signal<NotificationType | typeof FILTER_ALL>(FILTER_ALL);
    readonly selectedPriority = signal<NotificationPriority | typeof FILTER_ALL>(FILTER_ALL);
    readonly searchQuery = signal<string>('');

    readonly allNotifications = this.notificationService.recentNotifications;

    readonly filteredNotifications = computed(() => {
        let notifications = this.allNotifications();

        const tab = this.activeTab();
        if (tab === NOTIFICATION_FILTERS.TAB.UNREAD) {
            notifications = notifications.filter(n => n.status === NOTIFICATION_STATUS.UNREAD);
        } else if (tab === NOTIFICATION_FILTERS.TAB.READ) {
            notifications = notifications.filter(n => n.status === NOTIFICATION_STATUS.READ);
        }

        const type = this.selectedType();
        if (type !== FILTER_ALL) {
            notifications = notifications.filter(n => n.type === type);
        }

        const priority = this.selectedPriority();
        if (priority !== FILTER_ALL) {
            notifications = notifications.filter(n => n.priority === priority);
        }

        const query = this.searchQuery().toLowerCase();
        if (query) {
            notifications = notifications.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query)
            );
        }

        return notifications;
    });

    readonly unreadCount = computed(() =>
        this.allNotifications().filter(n => n.status === NOTIFICATION_STATUS.UNREAD).length
    );

    readonly readCount = computed(() =>
        this.allNotifications().filter(n => n.status === NOTIFICATION_STATUS.READ).length
    );

    ngOnInit(): void {
    }

    setActiveTab(tab: FilterTab): void {
        this.activeTab.set(tab);
    }

    setTypeFilter(type: NotificationType | typeof FILTER_ALL): void {
        this.selectedType.set(type);
    }

    setPriorityFilter(priority: NotificationPriority | typeof FILTER_ALL): void {
        this.selectedPriority.set(priority);
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchQuery.set(input.value);
    }

    markAsRead(notification: InAppNotification): void {
        if (notification.status === NOTIFICATION_STATUS.UNREAD) {
            this.notificationService.markAsRead(notification.id).subscribe({
                error: (err) => console.error('Error marking notification as read:', err)
            });
        }
    }

    deleteNotification(notification: InAppNotification, event: Event): void {
        event.stopPropagation();

        if (confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
            this.notificationService.deleteNotification(notification.id).subscribe({
                error: (err) => console.error('Error deleting notification:', err)
            });
        }
    }

    markAllAsRead(): void {
        this.notificationService.markAllAsRead().subscribe({
            error: (err) => console.error('Error marking all notifications as read:', err)
        });
    }

    getNotificationIcon(type: NotificationType): string {
        return getNotificationIconForType(type);
    }

    getRelativeTime(dateString: string): string {
        return getRelativeTimeString(dateString);
    }

    // Helper methods for template
    isUnread(notification: InAppNotification): boolean {
        return notification.status === NOTIFICATION_STATUS.UNREAD;
    }

    isHighPriority(notification: InAppNotification): boolean {
        return notification.priority === NOTIFICATION_PRIORITY.HIGH ||
            notification.priority === NOTIFICATION_PRIORITY.URGENT;
    }

    getPriorityLabel(priority: NotificationPriority): string {
        return priority === NOTIFICATION_PRIORITY.URGENT
            ? NOTIFICATION_LABELS.PRIORITY_URGENT
            : NOTIFICATION_LABELS.PRIORITY_HIGH;
    }
}
