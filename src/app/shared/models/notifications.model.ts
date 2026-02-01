export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type NotificationStatus = 'UNREAD' | 'READ';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface InAppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    status: NotificationStatus;
    priority: NotificationPriority;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
    read?: boolean;
    createdAt: string;
    expiresAt?: string;
}

export interface NotificationBellData {
    unreadCount: number;
    notifications: InAppNotification[];
}

export interface NotificationWebSocketMessage {
    type: 'NOTIFICATION' | 'BELL_UPDATE';
    payload: InAppNotification | NotificationBellData;
}
