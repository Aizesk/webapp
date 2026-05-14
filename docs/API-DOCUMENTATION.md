# Aizesk Platform - Complete REST API Documentation

Generated: February 18, 2026

This document provides complete API documentation for all 7 microservices in the Aizesk platform.

---

## Table of Contents

1. [Auth Service (Port 8081)](#1-auth-service-port-8081)
2. [User Service (Port 8082)](#2-user-service-port-8082)
3. [Transaction Service (Port 8083)](#3-transaction-service-port-8083)
4. [Subscription Service (Port 8084)](#4-subscription-service-port-8084)
5. [Platform Connection Service (Port 8085)](#5-platform-connection-service-port-8085)
6. [Notification Service (Port 8086)](#6-notification-service-port-8086)
7. [Reporting Service (Port 8087)](#7-reporting-service-port-8087)

---

## 1. Auth Service (Port 8081)

Base Path: `/api/v1/auth`

### Public Endpoints (No Authentication Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/login` | User login | `LoginRequest` | `AuthResponse` (200) |
| POST | `/register` | User registration | `SignUpRequest` | `AuthResponse` (201) |
| POST | `/refresh` | Refresh access token | `RefreshTokenRequest` | `AuthResponse` (200) |
| POST | `/validate` | Validate JWT token | Header: `Authorization: Bearer <token>` | `TokenValidationResponse` (200) |
| POST | `/recovery-password` | Request password reset email | `PasswordRecoveryRequest` | `PasswordRecoveryResponse` (200) |
| POST | `/reset-password` | Reset password with token | `ResetPasswordRequest` | `void` (200) |
| POST | `/oauth/{provider}` | OAuth login (Google, etc.) | `OAuthRequest` | `AuthResponse` (200) |

### Authenticated Endpoints (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/logout` | Logout and invalidate token | `LogoutRequest` | `LogoutResponse` (200) |
| POST | `/change-password` | Change user password | `ChangePasswordRequest` | `void` (200) |
| GET | `/sessions` | Get active sessions | - | `ActiveSessionListResponse` (200) |
| DELETE | `/sessions/{sessionId}` | Revoke specific session | - | `void` (204) |
| DELETE | `/sessions` | Revoke all other sessions | - | `{ revokedCount, message }` (200) |
| GET | `/sessions/check` | Check if session is active | - | `{ active: boolean }` (200) |

### Request/Response DTOs

```typescript
// LoginRequest
{
  email: string;
  password: string;
}

// SignUpRequest
{
  email: string;
  password: string;
  name: string;
}

// AuthResponse
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// RefreshTokenRequest
{
  refreshToken: string;
}

// PasswordRecoveryRequest
{
  email: string;
}

// ResetPasswordRequest
{
  token: string;
  newPassword: string;
}

// OAuthRequest
{
  provider: string;
  accessToken: string;
  idToken: string;
}

// ChangePasswordRequest
{
  currentPassword: string;
  newPassword: string;
}
```

---

## 2. User Service (Port 8082)

Base Path: `/api/v1/users`

### Public/Health Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/health` | Health check | `{ status: "UP", service: "user-service" }` |

### Profile Endpoints (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/profile` | Get current user profile | - | `UserProfileResponse` (200) |
| GET | `/profile/{userId}` | Get user profile by ID | - | `UserProfileResponse` (200) |
| PUT | `/profile` | Update current user profile | `UpdateProfileRequest` | `UserProfileResponse` (200) |

### Password Management (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/password/change` | Change password | `ChangePasswordRequest` | `MessageResponse` (200) |

### Preferences (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/preferences` | Get user preferences | - | `UserPreferencesResponse` (200) |
| PUT | `/preferences` | Update user preferences | `UserPreferencesRequest` | `UserPreferencesResponse` (200) |

### Avatar (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/avatar` | Upload avatar (multipart) | `MultipartFile file` | `AvatarUploadResponse` (200) |
| GET | `/{userId}/avatar` | Get user avatar | - | `byte[]` (200) or (404) |
| DELETE | `/avatar` | Delete avatar | - | `MessageResponse` (200) |

### Sessions (JWT Required)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/sessions` | Get active sessions | `List<ActiveSessionResponse>` (200) |
| DELETE | `/sessions/{sessionId}` | Terminate specific session | `MessageResponse` (200) |
| DELETE | `/sessions` | Terminate all sessions | `MessageResponse` (200) |

### Internal Endpoints (Service-to-Service)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/internal/create` | Create new user | `CreateUserRequest` | `UserProfileResponse` (200) |
| GET | `/internal/exists/{userId}` | Check user exists by ID | - | `{ exists: boolean }` |
| GET | `/internal/exists/email/{email}` | Check user exists by email | - | `{ exists: boolean }` |
| DELETE | `/internal/{userId}` | Delete user | - | `MessageResponse` (200) |

---

## 3. Transaction Service (Port 8083)

### Public Endpoints

Base Path: `/api/v1/transactions`

| Method | Path | Description | Query Parameters | Request Body | Response |
|--------|------|-------------|------------------|--------------|----------|
| GET | `/` | List transactions (paginated) | `page`, `size`, `sortBy`, `sortDir`, `type`, `category`, `origin`, `dateFrom`, `dateTo`, `search` | - | `PagedResponse<TransactionResponse>` |
| POST | `/` | Create transaction | - | `TransactionRequest` | `TransactionResponse` (201) |
| GET | `/{id}` | Get transaction by ID | - | - | `TransactionResponse` (200) |
| PUT | `/{id}` | Update transaction | - | `TransactionRequest` | `TransactionResponse` (200) |
| DELETE | `/{id}` | Delete transaction | - | - | `void` (204) |
| GET | `/kpi/summary` | Get KPI summary | `month`, `year` | - | `KpiSummaryResponse` (200) |
| GET | `/health` | Health check | - | - | `{ status: "UP", service: "transaction-service" }` |

### Query Parameters for GET `/`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number |
| size | int | 20 | Page size |
| sortBy | string | "transactionDate" | Sort field |
| sortDir | string | "desc" | Sort direction (asc/desc) |
| type | TransactionType | - | INCOME, EXPENSE |
| category | string | - | Category filter |
| origin | TransactionOrigin | - | AMAZON, SHOPIFY, MANUAL, EBAY, OTHER |
| dateFrom | ISO DateTime | - | Start date filter |
| dateTo | ISO DateTime | - | End date filter |
| search | string | - | Text search in concept/category |

### Internal Endpoints (Service-to-Service)

Base Path: `/internal/transactions`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/from-platform` | Create transaction from platform order | `CreatePlatformTransactionRequest` | `CreateTransactionResponse` |
| POST | `/batch` | Create batch of transactions | `BatchCreateRequest` | `BatchCreateResponse` |
| GET | `/export/{userId}` | Export transactions for reporting | Query: `startDate`, `endDate`, `type`, `origin`, `limit` | `List<TransactionResponse>` |
| GET | `/summary/{userId}` | Get aggregated summary | Query: `startDate`, `endDate`, `origin` | `TransactionSummaryDto` |
| GET | `/monthly/{userId}` | Get monthly stats | Query: `months`, `origin` | `List<MonthlyStatsDto>` |
| GET | `/trend/{userId}` | Get trend data (daily/monthly) | Query: `startDate`, `endDate`, `origin` | `List<TrendDataDto>` |
| GET | `/recent/{userId}` | Get recent transactions | Query: `limit` | `List<TransactionResponse>` |

### Request/Response DTOs

```typescript
// TransactionRequest
{
  type: "INCOME" | "EXPENSE";
  amount: number;
  currency: string;
  concept: string;
  category: string;
  transactionDate: string; // ISO datetime
  notes?: string;
}

// TransactionResponse
{
  id: number;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  concept: string;
  category: string;
  origin: string;
  platformOrderId?: string;
  customerName?: string;
  customerEmail?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

// CreatePlatformTransactionRequest (Internal)
{
  userId: string;
  platformOrderId: string;
  platformType: string;
  orderDate: string;
  status: string;
  items: TransactionItemDto[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddressDto;
}
```

---

## 4. Subscription Service (Port 8084)

Base Path: `/api/v1/subscriptions`

### Public/Health Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/health` | Health check | `{ status: "UP", service: "subscription-service" }` |

### Plan Endpoints (Public)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/plans` | Get all available plans | `List<PlanResponse>` (200) |
| GET | `/plans/{planType}` | Get specific plan details | `PlanResponse` (200) |

### Checkout/Payment (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/checkout` | Create Stripe checkout session | `CheckoutSessionRequest` | `CheckoutSessionResponse` (200) |
| POST | `/checkout/verify` | Verify checkout completion | Query: `sessionId` | `SubscriptionResponse` (200) |

### Subscription Management (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/current` | Get current subscription | - | `SubscriptionResponse` (200) |
| POST | `/subscribe` | Subscribe to a plan | `CreateSubscriptionRequest` | `SubscriptionResponse` (200) |
| PUT | `/change-plan` | Change subscription plan | `ChangePlanRequest` | `SubscriptionResponse` (200) |
| POST | `/cancel` | Cancel subscription | - | `MessageResponse` (200) |
| POST | `/reactivate` | Reactivate cancelled subscription | - | `MessageResponse` (200) |

### Invoices (JWT Required)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/invoices` | Get user invoices | `List<InvoiceResponse>` (200) |
| GET | `/invoices/{invoiceId}` | Get specific invoice | `InvoiceResponse` (200) |

### Payment Methods (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/payment-methods` | Get payment methods | - | `List<PaymentMethodResponse>` |
| POST | `/payment-methods` | Add payment method | `AddPaymentMethodRequest` | `PaymentMethodResponse` |
| DELETE | `/payment-methods/{paymentMethodId}` | Delete payment method | - | `MessageResponse` |
| PUT | `/payment-methods/{paymentMethodId}/default` | Set default payment method | - | `MessageResponse` |

### Stripe Webhook

Base Path: `/api/v1/subscriptions/webhook`

| Method | Path | Description | Headers | Response |
|--------|------|-------------|---------|----------|
| POST | `/stripe` | Handle Stripe webhook events | `Stripe-Signature` | `"Received"` (200) |

**Handled Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Internal Endpoints (Service-to-Service)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| POST | `/internal/create/{userId}` | Create subscription (default FREE) | Query: `planType` | `SubscriptionResponse` |
| GET | `/internal/{userId}/can-add-platform` | Check if user can add platform | `{ canAdd: boolean }` |
| GET | `/internal/{userId}/can-process-transaction` | Check transaction quota | `{ canProcess: boolean }` |
| POST | `/internal/{userId}/increment-transactions` | Increment transaction count | Query: `count` | `void` |
| POST | `/internal/{userId}/increment-platforms` | Increment platform count | `void` |
| POST | `/internal/{userId}/decrement-platforms` | Decrement platform count | `void` |

### Admin Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| POST | `/admin/process-expired` | Force process expired subscriptions | `{ message, ... }` |

---

## 5. Platform Connection Service (Port 8085)

Base Path: `/api/v1/platforms`

### Platform Discovery (JWT Required)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/available` | Get available platforms | `List<AvailablePlatformResponse>` |

### User Connections (JWT Required)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/connections` | Get user's platform connections | `List<PlatformConnectionResponse>` |
| GET | `/connections/{connectionId}` | Get specific connection | `PlatformConnectionResponse` |
| DELETE | `/connections/{connectionId}` | Disconnect platform | `MessageResponse` |

### OAuth Flow (JWT Required)

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/connect` | Initiate OAuth connection | `ConnectPlatformRequest` | `OAuthUrlResponse` |
| GET | `/callback/amazon` | Amazon OAuth callback | Query: `code`, `state`, `error` | `PlatformConnectionResponse` |
| GET | `/callback/shopify` | Shopify OAuth callback | Query: `code`, `state`, `shop`, `error` | `PlatformConnectionResponse` |
| POST | `/callback` | Generic OAuth callback | `OAuthCallbackRequest` | `PlatformConnectionResponse` |

### Connection Operations (JWT Required)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| POST | `/connections/{connectionId}/refresh-token` | Refresh connection token | `PlatformConnectionResponse` |
| POST | `/connections/{connectionId}/sync` | Trigger manual sync | `SyncLogResponse` |
| GET | `/connections/{connectionId}/sync-history` | Get sync history | `List<SyncLogResponse>` |
| GET | `/connections/{connectionId}/sync-status` | Get latest sync status | `SyncLogResponse` |

### Internal Endpoints (Service-to-Service)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/internal/users/{userId}/platform-count` | Get user's platform count | `PlatformCountResponse` |
| GET | `/internal/users/{userId}/has-platform/{platformType}` | Check platform connected | `HasPlatformResponse` |

### Request/Response DTOs

```typescript
// ConnectPlatformRequest
{
  platformType: "AMAZON" | "SHOPIFY" | "EBAY";
  shopUrl?: string; // Required for Shopify
  redirectUrl?: string;
}

// OAuthUrlResponse
{
  authorizationUrl: string;
  state: string;
}

// PlatformConnectionResponse
{
  id: string;
  userId: string;
  platformType: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING";
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
  platformData: object;
}

// SyncLogResponse
{
  id: string;
  connectionId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  itemsSynced: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}
```

---

## 6. Notification Service (Port 8086)

### In-App Notifications (Public/SDK)

Base Path: `/api/v1/notifications/in-app`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/` | Create notification | `CreateInAppNotificationRequest` | `InAppNotificationResponse` |
| GET | `/bell/{userId}` | Get bell data (unread + recent) | - | `NotificationBellResponse` |
| GET | `/user/{userId}` | Get all notifications | - | `List<InAppNotificationResponse>` |
| GET | `/user/{userId}/unread` | Get unread notifications | - | `List<InAppNotificationResponse>` |
| GET | `/user/{userId}/unread/count` | Get unread count | - | `{ unreadCount: number }` |
| PUT | `/{notificationId}/read` | Mark as read | - | `InAppNotificationResponse` |
| PUT | `/user/{userId}/read-all` | Mark all as read | - | `{ message: string }` |
| DELETE | `/{notificationId}` | Delete notification | - | `{ message: string }` |
| DELETE | `/user/{userId}` | Delete all notifications | - | `{ message: string }` |

### Convenience Notification Endpoints

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/success` | Send success notification | `SimpleNotificationRequest` | `InAppNotificationResponse` |
| POST | `/info` | Send info notification | `SimpleNotificationRequest` | `InAppNotificationResponse` |
| POST | `/warning` | Send warning notification | `SimpleNotificationRequest` | `InAppNotificationResponse` |
| POST | `/error` | Send error notification | `SimpleNotificationRequest` | `InAppNotificationResponse` |

### Email Notifications

Base Path: `/api/v1/notifications/email`

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/send` | Send generic email | `SendEmailRequest` | `EmailResponse` |
| POST | `/welcome` | Send welcome email | `{ email, name }` | `EmailResponse` |
| POST | `/password-reset` | Send password reset email | `{ email, name, resetToken }` | `EmailResponse` |
| POST | `/subscription` | Send subscription email | `{ email, name, planName }` | `EmailResponse` |

### Internal Endpoints (Service-to-Service)

Base Path: `/api/internal/v1/notifications`

#### Authentication Notifications

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/auth/welcome` | Welcome notification | `WelcomeRequest` |
| POST | `/auth/password-reset` | Password reset notification | `PasswordResetRequest` |
| POST | `/auth/new-device-login` | New device login alert | `NewDeviceLoginRequest` |

#### Subscription Notifications

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/subscription/created` | Subscription created | `SubscriptionRequest` |
| POST | `/subscription/expiring` | Subscription expiring warning | `SubscriptionExpiringRequest` |

#### Payment Notifications

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/payment/success` | Payment success | `PaymentSuccessRequest` |
| POST | `/payment/failed` | Payment failed | `PaymentFailedRequest` |

#### Integration Notifications

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/integration/connected` | Platform connected | `PlatformConnectionRequest` |
| POST | `/integration/disconnected` | Platform disconnected | `PlatformDisconnectionRequest` |
| POST | `/integration/sync-completed` | Sync completed | `SyncCompletedRequest` |
| POST | `/integration/sync-failed` | Sync failed | `SyncFailedRequest` |

#### Usage Notifications

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/usage/warning` | Usage limit warning | `UsageWarningRequest` |

#### System Notifications (Broadcast)

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/system/maintenance` | Broadcast maintenance | `MaintenanceRequest` |
| POST | `/system/feature-announcement` | Broadcast feature announcement | `FeatureAnnouncementRequest` |

#### Legacy/Email Endpoints

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/email/welcome` | Welcome email | `WelcomeEmailRequest` |
| POST | `/email/password-reset` | Password reset email | `PasswordResetEmailRequest` |
| POST | `/email/subscription` | Subscription email | `SubscriptionEmailRequest` |
| POST | `/email/send` | Generic email | `SendEmailRequest` |

#### In-App Internal Endpoints

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| POST | `/in-app` | Create in-app notification | `CreateInAppNotificationRequest` |
| POST | `/in-app/success` | Success notification | `SimpleNotificationRequest` |
| POST | `/in-app/info` | Info notification | `SimpleNotificationRequest` |
| POST | `/in-app/warning` | Warning notification | `SimpleNotificationRequest` |
| POST | `/in-app/error` | Error notification | `SimpleNotificationRequest` |

#### Health

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/health` | Health check | `{ status, service, version, timestamp }` |

### Request DTOs

```typescript
// CreateInAppNotificationRequest
{
  userId: string;
  title: string;
  message: string;
  type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
  actionUrl?: string;
}

// SimpleNotificationRequest
{
  userId: string;
  title: string;
  message: string;
}

// SendEmailRequest
{
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateName: string;
  templateVariables: object;
}
```

---

## 7. Reporting Service (Port 8087)

### Dashboard API (Frontend)

Base Path: `/api/v1/reports`

| Method | Path | Description | Query Parameters | Response |
|--------|------|-------------|------------------|----------|
| GET | `/dashboard/{userId}` | Get dashboard statistics | `range`, `origin`, `startDate`, `endDate` | `DashboardStatsResponse` |
| GET | `/monthly/{userId}` | Get monthly statistics | `months`, `origin` | `List<MonthlyStatsDto>` |
| GET | `/trend/{userId}` | Get trend data (auto granularity) | `range`, `origin`, `startDate`, `endDate` | `List<TrendDataDto>` |

#### Query Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| range | 1D, 7D, 30D, 3M, 6M, 1Y | 30D | Time range filter |
| origin | AMAZON, SHOPIFY, MANUAL, EBAY | null (ALL) | Platform filter |
| months | 1-12 | 6 | Number of months for monthly stats |
| startDate | YYYY-MM-DD | - | Custom start date (overrides range) |
| endDate | YYYY-MM-DD | - | Custom end date (overrides range) |

### Report Controller (JWT Required)

Base Path: `/api/reports`

#### Dashboard

| Method | Path | Description | Query Parameters | Response |
|--------|------|-------------|------------------|----------|
| GET | `/dashboard` | Get dashboard data | - | `DashboardDataDTO` |
| GET | `/dashboard/period` | Get dashboard for period | `startDate`, `endDate` | `DashboardDataDTO` |
| POST | `/dashboard/refresh` | Refresh dashboard cache | - | `void` (204) |

#### Report Generation

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/generate` | Request report generation | `ReportRequestDTO` | `ReportExecutionDTO` (202) |
| GET | `/{reportId}/status` | Get report status | - | `ReportExecutionDTO` |
| GET | `/history` | Get report history | Query: `limit` | `List<ReportExecutionDTO>` |
| GET | `/{reportId}/download` | Download completed report | - | `byte[]` (file) |
| DELETE | `/{reportId}` | Cancel pending report | - | `void` (204) |

#### Scheduled Reports

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/preferences/monthly` | Get monthly report preference | - | `{ enabled: boolean }` |
| PUT | `/preferences/monthly` | Set monthly report preference | `{ enabled: boolean }` | `void` (204) |

### Response DTOs

```typescript
// DashboardStatsResponse
{
  userId: string;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  incomePercentage: number;
  expensePercentage: number;
  transactionCount: number;
  expensesByCategory: { [category: string]: number };
  incomesByCategory: { [category: string]: number };
  incomesByOrigin: { [origin: string]: number };
  expensesByOrigin: { [origin: string]: number };
  countByOrigin: { [origin: string]: number };
  recentTransactions: TransactionDto[];
  generatedAt: string;
}

// MonthlyStatsDto
{
  month: string;
  year: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
}

// TrendDataDto
{
  label: string;
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
  granularity: "DAILY" | "MONTHLY";
}

// ReportRequestDTO
{
  type: "MONTHLY" | "YEARLY" | "CUSTOM";
  format: "PDF" | "EXCEL" | "CSV";
  startDate?: string;
  endDate?: string;
}

// ReportExecutionDTO
{
  id: string;
  userId: string;
  type: string;
  format: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  isDownloadable: boolean;
  requestedAt: string;
  completedAt?: string;
  errorMessage?: string;
}
```

---

## Authentication Header

All authenticated endpoints require the following header:

```
Authorization: Bearer <access_token>
```

## Error Responses

Standard error response format:

```json
{
  "timestamp": "2026-02-18T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/auth/login",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async operation) |
| 204 | No Content (success, no body) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., email already exists) |
| 500 | Internal Server Error |

---

## Enums

### TransactionType
- `INCOME`
- `EXPENSE`

### TransactionOrigin
- `AMAZON`
- `SHOPIFY`
- `EBAY`
- `MANUAL`
- `OTHER`

### PlanType
- `FREE`
- `STARTER`
- `PROFESSIONAL`
- `ENTERPRISE`

### PlatformType
- `AMAZON`
- `SHOPIFY`
- `EBAY`

### NotificationType
- `SUCCESS`
- `INFO`
- `WARNING`
- `ERROR`

### ReportFormat
- `PDF`
- `EXCEL`
- `CSV`

---

## Service Communication

### Internal API Headers

For service-to-service calls:

```
X-Internal-Service: <service-name>
```

### Service Discovery

| Service | Internal URL |
|---------|--------------|
| auth-service | http://localhost:8081 |
| user-service | http://localhost:8082 |
| transaction-service | http://localhost:8083 |
| subscription-service | http://localhost:8084 |
| platform-connection-service | http://localhost:8085 |
| notification-service | http://localhost:8086 |
| reporting-service | http://localhost:8087 |

---

## Summary Statistics

| Service | Controllers | Public Endpoints | Authenticated Endpoints | Internal Endpoints |
|---------|-------------|------------------|-------------------------|-------------------|
| Auth | 1 | 7 | 5 | 0 |
| User | 1 | 1 | 11 | 4 |
| Transaction | 2 | 7 | 0 | 8 |
| Subscription | 2 | 2 | 12 | 6 |
| Platform Connection | 1 | 0 | 12 | 2 |
| Notification | 3 | 13 | 0 | 21 |
| Reporting | 2 | 3 | 8 | 0 |
| **Total** | **12** | **33** | **48** | **41** |

**Grand Total: 122 REST endpoints across 7 microservices**
