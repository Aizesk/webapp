export const environment = {
  production: false,
  apiUrls: {
    auth: 'http://localhost:8081/api/v1/auth',
    users: 'http://localhost:8082/api/v1/users',
    transactions: 'http://localhost:8083/api/v1/transactions',
    reporting: 'http://localhost:8087/api/v1/reports',
    subscriptions: 'http://localhost:8084/api/v1/subscriptions',
    platforms: 'http://localhost:8085/api/v1/platforms',
    notifications: 'http://localhost:8086/api/v1/notifications'
  },
  notificationsWs: 'ws://localhost:8086/ws/notifications',
  googleClientId: '765392548979-hg2npq98sdd30c2jossmc0nh7uoj0jmh.apps.googleusercontent.com'
};
