// API base URL points to the ALB (passed through CloudFront /api/* behavior)
const API_BASE = 'https://api.aizesk.com';

export const environment = {
  production: true,
  apiUrls: {
    auth: `${API_BASE}/api/v1/auth`,
    users: `${API_BASE}/api/v1/users`,
    transactions: `${API_BASE}/api/v1/transactions`,
    reporting: `${API_BASE}/api/v1/reports`,
    subscriptions: `${API_BASE}/api/v1/subscriptions`,
    platforms: `${API_BASE}/api/v1/platforms`,
    notifications: `${API_BASE}/api/v1/notifications`,
  },
  notificationsWs: `wss://api.aizesk.com/ws/notifications`,
};
