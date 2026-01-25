-- =====================================================
-- AIZESK Platform - Database Schema
-- Version: 1.0.0
-- Description: Schema initialization for all services
-- =====================================================

-- Use the database
USE aizesk_users;

-- =====================================================
-- TABLE: users (user-service)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del usuario',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email único del usuario',
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

-- =====================================================
-- TABLE: active_sessions (user-service - opcional)
-- =====================================================
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
-- TABLE: refresh_tokens (auth-service - para blacklist)
-- =====================================================
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

-- =====================================================
-- TABLE: audit_log (para auditoría de seguridad)
-- =====================================================
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

-- Log de creación exitosa
SELECT 'Schema created successfully!' AS status;
