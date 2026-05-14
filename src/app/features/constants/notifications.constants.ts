/**
 * Notification Constants
 * Centralized constants for notification-related functionality
 */

// ========== Notification Status ==========
export const NOTIFICATION_STATUS = {
    READ: 'READ',
    UNREAD: 'UNREAD',
} as const;

export type NotificationStatusType = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS];

// ========== Notification Types ==========
export const NOTIFICATION_TYPE = {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
} as const;

export type NotificationTypeValue = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];

// ========== Notification Priority ==========
export const NOTIFICATION_PRIORITY = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
} as const;

export type NotificationPriorityType = typeof NOTIFICATION_PRIORITY[keyof typeof NOTIFICATION_PRIORITY];

// ========== Filter Options ==========
export const FILTER_ALL = 'ALL';

export const NOTIFICATION_FILTERS = {
    TAB: {
        ALL: 'all',
        UNREAD: 'unread',
        READ: 'read',
    },
    TYPE: {
        ALL: FILTER_ALL,
        ...NOTIFICATION_TYPE,
    },
    PRIORITY: {
        ALL: FILTER_ALL,
        ...NOTIFICATION_PRIORITY,
    },
} as const;

export type FilterTab = typeof NOTIFICATION_FILTERS.TAB[keyof typeof NOTIFICATION_FILTERS.TAB];

// ========== Icons ==========
export const NOTIFICATION_ICONS = {
    [NOTIFICATION_TYPE.INFO]: 'info',
    [NOTIFICATION_TYPE.SUCCESS]: 'check_circle',
    [NOTIFICATION_TYPE.WARNING]: 'warning',
    [NOTIFICATION_TYPE.ERROR]: 'error',
    DEFAULT: 'notifications',
} as const;

// ========== UI Labels (Spanish) ==========
export const NOTIFICATION_LABELS = {
    // Page
    PAGE_TITLE: 'Notificaciones',
    PAGE_SUBTITLE: 'Gestiona y revisa todas tus notificaciones',

    // Actions
    MARK_ALL_READ: 'Marcar todas como leídas',
    VIEW_DETAILS: 'Ver detalles',
    DELETE: 'Eliminar notificación',

    // Tabs
    TAB_ALL: 'Todas',
    TAB_UNREAD: 'No leídas',
    TAB_READ: 'Leídas',

    // Filters
    FILTER_TYPE_LABEL: 'Tipo',
    FILTER_PRIORITY_LABEL: 'Prioridad',
    SEARCH_PLACEHOLDER: 'Buscar notificaciones...',

    // Type Labels
    TYPE_ALL: 'Todas',
    TYPE_INFO: 'Info',
    TYPE_SUCCESS: 'Éxito',
    TYPE_WARNING: 'Advertencia',
    TYPE_ERROR: 'Error',

    // Priority Labels
    PRIORITY_ALL: 'Todas',
    PRIORITY_LOW: 'Baja',
    PRIORITY_NORMAL: 'Normal',
    PRIORITY_HIGH: 'Alta',
    PRIORITY_URGENT: 'Urgente',

    // States
    LOADING: 'Cargando notificaciones...',
    EMPTY_TITLE: 'No hay notificaciones',
    EMPTY_MESSAGE: 'No tienes notificaciones que coincidan con los filtros seleccionados.',

    // Home Page
    SECTION_TITLE: 'Notificaciones Recientes',
    VIEW_ALL: 'Ver todas',
    NO_NOTIFICATIONS: 'No tienes notificaciones pendientes',
} as const;

// ========== Time Strings ==========
export const TIME_STRINGS = {
    NOW: 'Ahora mismo',
    MINUTE: 'minuto',
    MINUTES: 'minutos',
    HOUR: 'hora',
    HOURS: 'horas',
    DAY: 'día',
    DAYS: 'días',
    AGO: 'Hace',
} as const;

// ========== Routes ==========
export const NOTIFICATION_ROUTES = {
    LIST: '/notifications',
} as const;

// ========== CSS Classes ==========
export const NOTIFICATION_CSS_CLASSES = {
    STATUS: {
        UNREAD: 'notification-card--unread',
    },
    PRIORITY: {
        URGENT: 'notification-card--urgent',
    },
    TYPE: {
        SUCCESS: 'notification-card--success',
        WARNING: 'notification-card--warning',
        ERROR: 'notification-card--error',
        INFO: 'notification-card--info',
    },
    ICON: {
        SUCCESS: 'notification-icon--success',
        WARNING: 'notification-icon--warning',
        ERROR: 'notification-icon--error',
        INFO: 'notification-icon--info',
    },
    PRIORITY_BADGE: {
        URGENT: 'priority-badge--urgent',
        HIGH: 'priority-badge--high',
    },
} as const;

// ========== Filter Options for Select Elements ==========
export const TYPE_FILTER_OPTIONS = [
    { value: FILTER_ALL, label: NOTIFICATION_LABELS.TYPE_ALL },
    { value: NOTIFICATION_TYPE.INFO, label: NOTIFICATION_LABELS.TYPE_INFO },
    { value: NOTIFICATION_TYPE.SUCCESS, label: NOTIFICATION_LABELS.TYPE_SUCCESS },
    { value: NOTIFICATION_TYPE.WARNING, label: NOTIFICATION_LABELS.TYPE_WARNING },
    { value: NOTIFICATION_TYPE.ERROR, label: NOTIFICATION_LABELS.TYPE_ERROR },
] as const;

export const PRIORITY_FILTER_OPTIONS = [
    { value: FILTER_ALL, label: NOTIFICATION_LABELS.PRIORITY_ALL },
    { value: NOTIFICATION_PRIORITY.LOW, label: NOTIFICATION_LABELS.PRIORITY_LOW },
    { value: NOTIFICATION_PRIORITY.NORMAL, label: NOTIFICATION_LABELS.PRIORITY_NORMAL },
    { value: NOTIFICATION_PRIORITY.HIGH, label: NOTIFICATION_LABELS.PRIORITY_HIGH },
    { value: NOTIFICATION_PRIORITY.URGENT, label: NOTIFICATION_LABELS.PRIORITY_URGENT },
] as const;

// ========== Helper Functions ==========

/**
 * Get the icon for a notification type
 */
export function getNotificationIconForType(type: NotificationTypeValue | string): string {
    return NOTIFICATION_ICONS[type as NotificationTypeValue] || NOTIFICATION_ICONS.DEFAULT;
}

/**
 * Get relative time string in Spanish
 */
export function getRelativeTimeString(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return TIME_STRINGS.NOW;
    if (diffMins < 60) {
        const unit = diffMins > 1 ? TIME_STRINGS.MINUTES : TIME_STRINGS.MINUTE;
        return `${TIME_STRINGS.AGO} ${diffMins} ${unit}`;
    }
    if (diffHours < 24) {
        const unit = diffHours > 1 ? TIME_STRINGS.HOURS : TIME_STRINGS.HOUR;
        return `${TIME_STRINGS.AGO} ${diffHours} ${unit}`;
    }
    if (diffDays < 7) {
        const unit = diffDays > 1 ? TIME_STRINGS.DAYS : TIME_STRINGS.DAY;
        return `${TIME_STRINGS.AGO} ${diffDays} ${unit}`;
    }
    return date.toLocaleDateString('es-ES');
}
