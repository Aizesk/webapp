-- =====================================================
-- AIZESK Platform - Complete Database Schema
-- Version: 2.1.0
-- Description: Schema for all microservices (synchronized with JPA entities)
-- =====================================================

-- Use the database
USE aizesk;

-- =====================================================
-- USER-SERVICE TABLES
-- =====================================================

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del usuario',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email único del usuario',
    password_hash VARCHAR(255) COMMENT 'Hash de la contraseña (BCrypt)',
    full_name VARCHAR(255) COMMENT 'Nombre del usuario',
    last_name VARCHAR(255) COMMENT 'Apellido del usuario',
    phone VARCHAR(50) COMMENT 'Teléfono de contacto',
    
    -- Address (embedded)
    street VARCHAR(255) COMMENT 'Dirección - Calle',
    city VARCHAR(100) COMMENT 'Dirección - Ciudad',
    postal_code VARCHAR(20) COMMENT 'Dirección - Código postal',
    country VARCHAR(100) COMMENT 'Dirección - País',
    
    -- User info
    role VARCHAR(50) DEFAULT 'ROLE_USER' COMMENT 'Rol del usuario (ROLE_USER, ROLE_ADMIN)',
    plan VARCHAR(50) DEFAULT 'FREE' COMMENT 'Plan de suscripción (FREE, PRO, ENTERPRISE)',
    avatar_url VARCHAR(500) COMMENT 'URL del avatar',
    
    -- Preferences (embedded)
    pref_billing_alerts TINYINT(1) DEFAULT 1 COMMENT 'Alertas de facturación',
    pref_weekly_digest TINYINT(1) DEFAULT 1 COMMENT 'Resumen semanal',
    pref_security_events TINYINT(1) DEFAULT 1 COMMENT 'Eventos de seguridad',
    pref_product_research TINYINT(1) DEFAULT 0 COMMENT 'Investigación de producto',
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    last_login_at DATETIME COMMENT 'Fecha del último login',
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_plan (plan),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: active_sessions
CREATE TABLE IF NOT EXISTS active_sessions (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la sesión',
    user_id VARCHAR(36) NOT NULL COMMENT 'ID del usuario',
    device_info VARCHAR(255) COMMENT 'Información del dispositivo',
    ip_address VARCHAR(45) COMMENT 'Dirección IP (IPv4/IPv6)',
    location VARCHAR(255) COMMENT 'Ubicación aproximada',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME,
    current_session TINYINT(1) DEFAULT 0,
    
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_last_activity (last_activity_at),
    
    CONSTRAINT fk_sessions_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AUTH-SERVICE TABLES
-- =====================================================

-- TABLE: refresh_tokens (para blacklist de tokens)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE COMMENT 'Hash del token (no guardamos el token real)',
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    revoked TINYINT(1) DEFAULT 0 COMMENT 'Token revocado (logout)',
    revoked_at DATETIME,
    
    INDEX idx_tokens_user_id (user_id),
    INDEX idx_tokens_expires (expires_at),
    INDEX idx_tokens_revoked (revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: audit_log (auditoría de seguridad)
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) COMMENT 'Usuario que realizó la acción (puede ser NULL para anónimos)',
    action VARCHAR(100) NOT NULL COMMENT 'Tipo de acción (LOGIN, LOGOUT, FAILED_LOGIN, etc.)',
    resource VARCHAR(255) COMMENT 'Recurso afectado',
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details JSON COMMENT 'Detalles adicionales en formato JSON',
    success TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SUBSCRIPTION-SERVICE TABLES
-- =====================================================

-- TABLE: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Un usuario solo tiene una suscripción',
    plan_type VARCHAR(50) NOT NULL COMMENT 'FREE, PRO, ENTERPRISE',
    status VARCHAR(50) NOT NULL COMMENT 'ACTIVE, TRIALING, CANCELLED, PAST_DUE, EXPIRED',
    stripe_customer_id VARCHAR(255) COMMENT 'ID del cliente en Stripe',
    stripe_subscription_id VARCHAR(255) COMMENT 'ID de la suscripción en Stripe',
    start_date DATETIME,
    end_date DATETIME,
    next_billing_date DATETIME,
    auto_renew TINYINT(1) DEFAULT 1,
    transactions_used INT DEFAULT 0 COMMENT 'Transacciones usadas este período',
    platforms_connected INT DEFAULT 0 COMMENT 'Plataformas conectadas',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_subscriptions_user_id (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_plan_type (plan_type),
    INDEX idx_subscriptions_stripe_customer (stripe_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    subscription_id VARCHAR(36) COMMENT 'ID de la suscripción asociada',
    user_id VARCHAR(36) NOT NULL,
    stripe_invoice_id VARCHAR(255) COMMENT 'ID de la factura en Stripe',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) COMMENT 'DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE',
    description VARCHAR(500),
    invoice_date DATETIME,
    due_date DATETIME,
    paid_at DATETIME,
    pdf_url VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_invoices_user_id (user_id),
    INDEX idx_invoices_subscription_id (subscription_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    stripe_payment_method_id VARCHAR(255),
    type VARCHAR(50) COMMENT 'CARD, SEPA, PAYPAL',
    card_brand VARCHAR(50) COMMENT 'VISA, MASTERCARD, AMEX, etc.',
    card_last4 VARCHAR(4),
    card_exp_month INT,
    card_exp_year INT,
    is_default TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_methods_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PLATFORM-CONNECTION-SERVICE TABLES
-- =====================================================

-- TABLE: platform_connections
CREATE TABLE IF NOT EXISTS platform_connections (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    platform_type VARCHAR(50) NOT NULL COMMENT 'AMAZON, EBAY, SHOPIFY, WALLAPOP, etc.',
    status VARCHAR(50) COMMENT 'CONNECTED, DISCONNECTED, ERROR, PENDING',
    platform_account_id VARCHAR(255) COMMENT 'ID de la cuenta en la plataforma',
    platform_account_name VARCHAR(255) COMMENT 'Nombre de la cuenta/tienda',
    access_token VARCHAR(1000) COMMENT 'Token de acceso (encriptado)',
    refresh_token VARCHAR(1000) COMMENT 'Token de refresco (encriptado)',
    token_expires_at DATETIME,
    last_sync_at DATETIME,
    total_orders_synced INT DEFAULT 0,
    last_error VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_platform (user_id, platform_type),
    INDEX idx_connections_user_id (user_id),
    INDEX idx_connections_platform_type (platform_type),
    INDEX idx_connections_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: sync_logs (logs de sincronización)
CREATE TABLE IF NOT EXISTS sync_logs (
    id VARCHAR(36) PRIMARY KEY,
    connection_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    sync_type VARCHAR(50) COMMENT 'FULL, INCREMENTAL, MANUAL',
    status VARCHAR(50) COMMENT 'STARTED, COMPLETED, FAILED',
    orders_fetched INT DEFAULT 0,
    orders_created INT DEFAULT 0,
    orders_updated INT DEFAULT 0,
    error_message VARCHAR(1000),
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    duration_ms BIGINT COMMENT 'Duración en milisegundos',
    
    INDEX idx_sync_logs_connection_id (connection_id),
    INDEX idx_sync_logs_user_id (user_id),
    INDEX idx_sync_logs_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRANSACTION-SERVICE TABLES
-- =====================================================

-- TABLE: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'INCOME, EXPENSE',
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    description VARCHAR(500),
    category VARCHAR(100),
    transaction_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    -- Campos de conexión con plataformas
    platform_connection_id VARCHAR(36) COMMENT 'ID de la conexión de plataforma',
    platform_order_id VARCHAR(255) COMMENT 'ID del pedido en la plataforma',
    platform_type VARCHAR(50) COMMENT 'AMAZON, EBAY, SHOPIFY, etc.',
    
    INDEX idx_transactions_user_id (user_id),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_category (category),
    INDEX idx_transactions_date (transaction_date),
    INDEX idx_transactions_platform (platform_connection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NOTIFICATION-SERVICE TABLES (Synchronized with JPA entities)
-- =====================================================

-- TABLE: email_notifications (matches EmailNotificationDocument.java)
CREATE TABLE IF NOT EXISTS email_notifications (
    id VARCHAR(36) PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    type VARCHAR(50) COMMENT 'Notification type: WELCOME, PASSWORD_RESET, etc.',
    subject VARCHAR(255),
    template_name VARCHAR(100),
    template_variables TEXT COMMENT 'JSON with template variables',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, SENT, FAILED, RETRYING',
    error_message VARCHAR(2000),
    retry_count INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    
    INDEX idx_email_recipient (recipient_email),
    INDEX idx_email_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: in_app_notifications (matches InAppNotificationDocument.java)
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) COMMENT 'Notification type: INFO, WARNING, ERROR, SUCCESS, etc.',
    status VARCHAR(20) COMMENT 'UNREAD, READ, ARCHIVED',
    priority VARCHAR(20) COMMENT 'LOW, NORMAL, HIGH, URGENT',
    title VARCHAR(255),
    message VARCHAR(2000),
    action_url VARCHAR(500),
    created_at DATETIME,
    read_at DATETIME,
    expires_at DATETIME,
    
    INDEX idx_inapp_user_id (user_id),
    INDEX idx_inapp_created_at (created_at),
    INDEX idx_inapp_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: in_app_notification_metadata (for @ElementCollection in JPA)
CREATE TABLE IF NOT EXISTS in_app_notification_metadata (
    notification_id VARCHAR(36) NOT NULL,
    meta_key VARCHAR(100) NOT NULL,
    meta_value VARCHAR(500),
    
    PRIMARY KEY (notification_id, meta_key),
    CONSTRAINT fk_notification_metadata 
        FOREIGN KEY (notification_id) 
        REFERENCES in_app_notifications(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Schema created successfully!' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'aizesk';
