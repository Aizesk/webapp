-- =====================================================
-- AIZESK Platform - Complete Seed Data
-- Version: 2.0.0
-- Description: Initial data for all microservices
-- =====================================================

USE aizesk;

-- Set UTF-8 encoding for proper Spanish characters
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- USER-SERVICE: USUARIOS DE PRUEBA
-- =====================================================

-- Usuario Demo (credenciales: demo@aizesk.com / password123)
INSERT IGNORE INTO users (
    id, email, password_hash, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'demo@aizesk.com',
    '$2a$10$cHwHoHPNqua7o4nO5atpiuADbE4scXAgxQi.yZX6bAt4p5sMl/ZfC',
    'Demo',
    'User',
    '+34 612 345 678',
    'Calle Gran Vía 123',
    'Madrid',
    '28013',
    'España',
    'ROLE_USER',
    'FREE',
    NULL,
    1, 1, 1, 0,
    NOW() - INTERVAL 30 DAY,
    NOW() - INTERVAL 1 DAY,
    NOW()
);

-- Usuario Admin (credenciales: admin@aizesk.com / password123)
INSERT IGNORE INTO users (
    id, email, password_hash, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'admin@aizesk.com',
    '$2a$10$cHwHoHPNqua7o4nO5atpiuADbE4scXAgxQi.yZX6bAt4p5sMl/ZfC',
    'Admin',
    'User',
    '+34 698 765 432',
    'Avenida Diagonal 456',
    'Barcelona',
    '08029',
    'España',
    'ROLE_ADMIN',
    'ENTERPRISE',
    NULL,
    1, 1, 1, 1,
    NOW() - INTERVAL 60 DAY,
    NOW() - INTERVAL 2 DAY,
    NOW()
);

-- Usuario Pro
INSERT IGNORE INTO users (
    id, email, password_hash, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'carlos.garcia@example.com',
    '$2a$10$cHwHoHPNqua7o4nO5atpiuADbE4scXAgxQi.yZX6bAt4p5sMl/ZfC',
    'Carlos',
    'García',
    '+34 655 123 456',
    'Calle Serrano 78',
    'Madrid',
    '28006',
    'España',
    'ROLE_USER',
    'PRO',
    NULL,
    1, 0, 1, 0,
    NOW() - INTERVAL 15 DAY,
    NOW() - INTERVAL 3 DAY,
    NOW() - INTERVAL 1 DAY
);

-- Usuario nuevo (sin login reciente)
INSERT IGNORE INTO users (
    id, email, password_hash, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'maria.lopez@example.com',
    '$2a$10$cHwHoHPNqua7o4nO5atpiuADbE4scXAgxQi.yZX6bAt4p5sMl/ZfC',
    'María',
    'López',
    '+34 677 234 567',
    'Plaza Mayor 10',
    'Valencia',
    '46002',
    'España',
    'ROLE_USER',
    'FREE',
    NULL,
    1, 1, 1, 0,
    NOW() - INTERVAL 5 DAY,
    NULL,
    NULL
);

-- Usuario internacional
INSERT IGNORE INTO users (
    id, email, password_hash, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'john.doe@example.com',
    '$2a$10$cHwHoHPNqua7o4nO5atpiuADbE4scXAgxQi.yZX6bAt4p5sMl/ZfC',
    'John',
    'Doe',
    '+1 555 123 4567',
    '123 Main Street',
    'New York',
    '10001',
    'USA',
    'ROLE_USER',
    'PRO',
    NULL,
    1, 1, 1, 1,
    NOW() - INTERVAL 45 DAY,
    NOW() - INTERVAL 1 DAY,
    NOW() - INTERVAL 2 HOUR
);

-- =====================================================
-- USER-SERVICE: SESIONES ACTIVAS
-- =====================================================

INSERT IGNORE INTO active_sessions (
    id, user_id, device_info, ip_address, location, 
    created_at, last_activity_at, current_session
) VALUES 
(
    'sess-0001-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Chrome 120.0 - macOS 14.2',
    '192.168.1.100',
    'Madrid, España',
    NOW() - INTERVAL 2 HOUR,
    NOW(),
    1
),
(
    'sess-0002-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Firefox 121.0 - Windows 11',
    '192.168.1.101',
    'Barcelona, España',
    NOW() - INTERVAL 1 DAY,
    NOW() - INTERVAL 1 HOUR,
    1
);

-- =====================================================
-- SUBSCRIPTION-SERVICE: SUSCRIPCIONES
-- =====================================================

-- Suscripción FREE para demo user
INSERT IGNORE INTO subscriptions (
    id, user_id, plan_type, status,
    stripe_customer_id, stripe_subscription_id,
    start_date, end_date, next_billing_date,
    auto_renew, transactions_used, platforms_connected,
    created_at
) VALUES (
    'sub-0001-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'FREE',
    'ACTIVE',
    NULL,
    NULL,
    NOW() - INTERVAL 30 DAY,
    NULL,
    NULL,
    0,
    15,
    1,
    NOW() - INTERVAL 30 DAY
);

-- Suscripción ENTERPRISE para admin
INSERT IGNORE INTO subscriptions (
    id, user_id, plan_type, status,
    stripe_customer_id, stripe_subscription_id,
    start_date, end_date, next_billing_date,
    auto_renew, transactions_used, platforms_connected,
    created_at
) VALUES (
    'sub-0002-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'ENTERPRISE',
    'ACTIVE',
    'cus_mock_admin_123',
    'sub_mock_admin_456',
    NOW() - INTERVAL 60 DAY,
    NOW() + INTERVAL 305 DAY,
    NOW() + INTERVAL 30 DAY,
    1,
    250,
    5,
    NOW() - INTERVAL 60 DAY
);

-- Suscripción PRO para Carlos
INSERT IGNORE INTO subscriptions (
    id, user_id, plan_type, status,
    stripe_customer_id, stripe_subscription_id,
    start_date, end_date, next_billing_date,
    auto_renew, transactions_used, platforms_connected,
    created_at
) VALUES (
    'sub-0003-0000-0000-000000000003',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'PRO',
    'ACTIVE',
    'cus_mock_carlos_789',
    'sub_mock_carlos_012',
    NOW() - INTERVAL 15 DAY,
    NOW() + INTERVAL 15 DAY,
    NOW() + INTERVAL 15 DAY,
    1,
    45,
    2,
    NOW() - INTERVAL 15 DAY
);

-- =====================================================
-- SUBSCRIPTION-SERVICE: FACTURAS
-- =====================================================

INSERT IGNORE INTO invoices (
    id, subscription_id, user_id, stripe_invoice_id,
    amount, currency, status, description,
    invoice_date, due_date, paid_at, pdf_url, created_at
) VALUES 
(
    'inv-0001-0000-0000-000000000001',
    'sub-0002-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'in_mock_001',
    99.00,
    'EUR',
    'PAID',
    'Aizesk Enterprise - Enero 2026',
    NOW() - INTERVAL 30 DAY,
    NOW() - INTERVAL 23 DAY,
    NOW() - INTERVAL 25 DAY,
    'https://stripe.com/invoices/mock/001.pdf',
    NOW() - INTERVAL 30 DAY
),
(
    'inv-0002-0000-0000-000000000002',
    'sub-0003-0000-0000-000000000003',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'in_mock_002',
    29.00,
    'EUR',
    'PAID',
    'Aizesk Pro - Enero 2026',
    NOW() - INTERVAL 15 DAY,
    NOW() - INTERVAL 8 DAY,
    NOW() - INTERVAL 10 DAY,
    'https://stripe.com/invoices/mock/002.pdf',
    NOW() - INTERVAL 15 DAY
);

-- =====================================================
-- SUBSCRIPTION-SERVICE: MÉTODOS DE PAGO
-- =====================================================

INSERT IGNORE INTO payment_methods (
    id, user_id, stripe_payment_method_id,
    type, card_brand, card_last4, card_exp_month, card_exp_year,
    is_default, created_at
) VALUES 
(
    'pm-0001-0000-0000-000000000001',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'pm_mock_admin_001',
    'CARD',
    'VISA',
    '4242',
    12,
    2027,
    1,
    NOW() - INTERVAL 60 DAY
),
(
    'pm-0002-0000-0000-000000000002',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'pm_mock_carlos_001',
    'CARD',
    'MASTERCARD',
    '5555',
    6,
    2026,
    1,
    NOW() - INTERVAL 15 DAY
);

-- =====================================================
-- PLATFORM-CONNECTION-SERVICE: CONEXIONES
-- =====================================================

-- Conexión Amazon para Admin
INSERT IGNORE INTO platform_connections (
    id, user_id, platform_type, status,
    platform_account_id, platform_account_name,
    access_token, refresh_token, token_expires_at,
    last_sync_at, total_orders_synced, last_error,
    created_at
) VALUES (
    'conn-0001-0000-0000-000000000001',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'AMAZON',
    'CONNECTED',
    'amz_seller_001',
    'Aizesk Store Spain',
    'mock_access_token_amazon_encrypted',
    'mock_refresh_token_amazon_encrypted',
    NOW() + INTERVAL 1 HOUR,
    NOW() - INTERVAL 30 MINUTE,
    1250,
    NULL,
    NOW() - INTERVAL 45 DAY
);

-- Conexión eBay para Admin
INSERT IGNORE INTO platform_connections (
    id, user_id, platform_type, status,
    platform_account_id, platform_account_name,
    access_token, refresh_token, token_expires_at,
    last_sync_at, total_orders_synced, last_error,
    created_at
) VALUES (
    'conn-0002-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'EBAY',
    'CONNECTED',
    'ebay_seller_001',
    'Aizesk eBay Store',
    'mock_access_token_ebay_encrypted',
    'mock_refresh_token_ebay_encrypted',
    NOW() + INTERVAL 2 HOUR,
    NOW() - INTERVAL 1 HOUR,
    580,
    NULL,
    NOW() - INTERVAL 30 DAY
);

-- Conexión Shopify para Carlos
INSERT IGNORE INTO platform_connections (
    id, user_id, platform_type, status,
    platform_account_id, platform_account_name,
    access_token, refresh_token, token_expires_at,
    last_sync_at, total_orders_synced, last_error,
    created_at
) VALUES (
    'conn-0003-0000-0000-000000000003',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'SHOPIFY',
    'CONNECTED',
    'shop_carlos_001',
    'Carlos Tech Store',
    'mock_access_token_shopify_encrypted',
    'mock_refresh_token_shopify_encrypted',
    NOW() + INTERVAL 24 HOUR,
    NOW() - INTERVAL 2 HOUR,
    89,
    NULL,
    NOW() - INTERVAL 10 DAY
);

-- Conexión en error para Demo User
INSERT IGNORE INTO platform_connections (
    id, user_id, platform_type, status,
    platform_account_id, platform_account_name,
    access_token, refresh_token, token_expires_at,
    last_sync_at, total_orders_synced, last_error,
    created_at
) VALUES (
    'conn-0004-0000-0000-000000000004',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'WALLAPOP',
    'ERROR',
    'walla_demo_001',
    'Demo Wallapop',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL 3 DAY,
    12,
    'Token expired. Please reconnect your account.',
    NOW() - INTERVAL 20 DAY
);

-- =====================================================
-- PLATFORM-CONNECTION-SERVICE: LOGS DE SINCRONIZACIÓN
-- =====================================================

INSERT IGNORE INTO sync_logs (
    id, connection_id, user_id, sync_type, status,
    orders_fetched, orders_created, orders_updated,
    error_message, started_at, completed_at, duration_ms
) VALUES 
(
    'sync-0001-0000-0000-000000000001',
    'conn-0001-0000-0000-000000000001',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'INCREMENTAL',
    'COMPLETED',
    25,
    20,
    5,
    NULL,
    NOW() - INTERVAL 30 MINUTE,
    NOW() - INTERVAL 29 MINUTE,
    45000
),
(
    'sync-0002-0000-0000-000000000002',
    'conn-0002-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'INCREMENTAL',
    'COMPLETED',
    10,
    8,
    2,
    NULL,
    NOW() - INTERVAL 1 HOUR,
    NOW() - INTERVAL 59 MINUTE,
    32000
),
(
    'sync-0003-0000-0000-000000000003',
    'conn-0004-0000-0000-000000000004',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'INCREMENTAL',
    'FAILED',
    0,
    0,
    0,
    'Authentication failed: Token expired',
    NOW() - INTERVAL 3 DAY,
    NOW() - INTERVAL 3 DAY,
    1500
);

-- =====================================================
-- TRANSACTION-SERVICE: TRANSACCIONES
-- (Synchronized with Transaction.java entity)
-- Campos: user_id, type, amount, currency, concept, category, origin, transaction_date
-- =====================================================

-- Transacciones de ejemplo para admin y carlos
INSERT INTO transactions (user_id, type, amount, currency, concept, category, origin, transaction_date) VALUES 
-- Ventas del admin
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INCOME', 125.50, 'EUR', 'Venta iPhone 12 Case', 'Electronics', 'AMAZON', '2026-01-30 14:30:00'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INCOME', 89.99, 'EUR', 'Venta Auriculares Bluetooth', 'Electronics', 'AMAZON', '2026-01-29 11:00:00'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INCOME', 45.00, 'EUR', 'Venta Funda Tablet', 'Electronics', 'EBAY', '2026-01-28 16:45:00'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'EXPENSE', 15.50, 'EUR', 'Comisión Amazon', 'Comisiones', 'AMAZON', '2026-01-30 14:35:00'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'EXPENSE', 25.00, 'EUR', 'Envío DHL', 'Envíos', 'MANUAL', '2026-01-29 12:00:00'),
-- Ventas de Carlos
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'INCOME', 299.99, 'EUR', 'Venta Laptop Stand', 'Office', 'SHOPIFY', '2026-01-30 10:00:00'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'INCOME', 49.99, 'EUR', 'Venta Mouse Pad XL', 'Office', 'SHOPIFY', '2026-01-27 09:30:00'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'EXPENSE', 8.99, 'EUR', 'Comisión Shopify', 'Comisiones', 'SHOPIFY', '2026-01-30 10:05:00');

-- =====================================================
-- NOTIFICATION-SERVICE: NOTIFICACIONES EMAIL
-- (Synchronized with EmailNotificationDocument.java)
-- =====================================================

INSERT IGNORE INTO email_notifications (
    id, recipient_email, recipient_name, type,
    subject, template_name, template_variables, status,
    error_message, retry_count, created_at, sent_at
) VALUES 
(
    'email-0001-0000-0000-000000000001',
    'demo@aizesk.com',
    'Demo User',
    'WELCOME',
    'Bienvenido a Aizesk!',
    'welcome',
    '{"userName": "Demo", "activationLink": "https://aizesk.com/activate/xxx"}',
    'SENT',
    NULL,
    0,
    NOW() - INTERVAL 30 DAY,
    NOW() - INTERVAL 30 DAY
),
(
    'email-0002-0000-0000-000000000002',
    'carlos.garcia@example.com',
    'Carlos García',
    'SUBSCRIPTION_CREATED',
    'Tu suscripción Pro está activa',
    'subscription_created',
    '{"planName": "PRO", "amount": 29.00, "currency": "EUR"}',
    'SENT',
    NULL,
    0,
    NOW() - INTERVAL 15 DAY,
    NOW() - INTERVAL 15 DAY
);

-- =====================================================
-- NOTIFICATION-SERVICE: NOTIFICACIONES IN-APP
-- (Synchronized with InAppNotificationDocument.java)
-- =====================================================

INSERT IGNORE INTO in_app_notifications (
    id, user_id, title, message, type, status, priority,
    read_at, action_url, created_at, expires_at
) VALUES 
(
    'inapp-0001-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Conexión con Wallapop fallida',
    'Tu conexión con Wallapop ha expirado. Por favor, reconecta tu cuenta.',
    'WARNING',
    'UNREAD',
    'HIGH',
    NULL,
    '/settings/connections',
    NOW() - INTERVAL 3 DAY,
    NOW() + INTERVAL 7 DAY
),
(
    'inapp-0002-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Sincronización completada',
    'Se han sincronizado 25 nuevos pedidos de Amazon.',
    'SUCCESS',
    'READ',
    'NORMAL',
    NOW() - INTERVAL 25 MINUTE,
    '/transactions',
    NOW() - INTERVAL 30 MINUTE,
    NULL
),
(
    'inapp-0003-0000-0000-000000000003',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Tu período de prueba termina pronto',
    'Tu suscripción Pro caduca en 15 días. Renueva para no perder acceso.',
    'INFO',
    'UNREAD',
    'NORMAL',
    NULL,
    '/settings/subscription',
    NOW() - INTERVAL 1 DAY,
    NOW() + INTERVAL 14 DAY
);

-- =====================================================
-- AUTH-SERVICE: AUDIT LOG INICIAL
-- =====================================================

INSERT INTO audit_log (user_id, action, resource, ip_address, details, success) VALUES
(NULL, 'SYSTEM_INIT', 'DATABASE', '127.0.0.1', '{"version": "2.1.0", "environment": "development"}', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'LOGIN', 'AUTH', '192.168.1.100', '{"method": "email_password"}', 1),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'LOGIN', 'AUTH', '192.168.1.101', '{"method": "email_password"}', 1);

-- =====================================================
-- TRANSACTION-SERVICE: TRANSACCIONES DE EJEMPLO DEMO USER
-- (Synchronized with Transaction.java entity)
-- ~125 transacciones realistas (25/mes × 5 meses)
-- Período: Septiembre 2025 - Enero 2026
-- Campos: user_id, type, amount, currency, concept, category, origin, transaction_date
-- =====================================================

-- Limpiar transacciones anteriores del demo user
DELETE FROM transactions WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

INSERT INTO transactions (user_id, type, amount, currency, concept, category, origin, transaction_date) VALUES

-- =====================================================
-- SEPTIEMBRE 2025 (25 transacciones)
-- =====================================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual septiembre', 'Salario', 'MANUAL', '2025-09-01 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', 'MANUAL', '2025-09-02 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 85.5000, 'EUR', 'Factura luz Endesa', 'Suministros', 'MANUAL', '2025-09-03 12:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 42.0000, 'EUR', 'Factura agua', 'Suministros', 'MANUAL', '2025-09-03 12:45:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', 'MANUAL', '2025-09-04 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 135.0000, 'EUR', 'Compra Mercadona semanal', 'Alimentación', 'MANUAL', '2025-09-06 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 380.0000, 'EUR', 'Venta auriculares Sony WH-1000XM4', 'Ventas Online', 'AMAZON', '2025-09-08 14:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', 'MANUAL', '2025-09-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', 'MANUAL', '2025-09-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina Repsol', 'Transporte', 'MANUAL', '2025-09-11 08:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 122.0000, 'EUR', 'Compra Carrefour', 'Alimentación', 'MANUAL', '2025-09-13 17:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 250.0000, 'EUR', 'Venta tablet Samsung Galaxy Tab', 'Ventas Online', 'EBAY', '2025-09-15 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 45.0000, 'EUR', 'Cena restaurante italiano', 'Restaurantes', 'MANUAL', '2025-09-16 21:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', 'MANUAL', '2025-09-18 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 128.0000, 'EUR', 'Compra supermercado Lidl', 'Alimentación', 'MANUAL', '2025-09-20 16:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 150.0000, 'EUR', 'Venta libros universitarios', 'Ventas Online', 'OTHER', '2025-09-22 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Seguro coche (mensual)', 'Seguros', 'MANUAL', '2025-09-23 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 32.5000, 'EUR', 'Farmacia medicamentos', 'Salud', 'MANUAL', '2025-09-24 11:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 25.0000, 'EUR', 'Cine y palomitas', 'Entretenimiento', 'MANUAL', '2025-09-25 20:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 115.0000, 'EUR', 'Compra Mercadona', 'Alimentación', 'MANUAL', '2025-09-27 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 520.0000, 'EUR', 'Venta monitor LG UltraWide', 'Ventas Online', 'AMAZON', '2025-09-28 15:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 60.0000, 'EUR', 'Gasolina BP', 'Transporte', 'MANUAL', '2025-09-28 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 38.0000, 'EUR', 'Comisión Amazon ventas', 'Comisiones', 'AMAZON', '2025-09-28 15:05:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 19.9900, 'EUR', 'Amazon Prime Video', 'Entretenimiento', 'MANUAL', '2025-09-29 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 42.0000, 'EUR', 'Cena tapas con amigos', 'Restaurantes', 'MANUAL', '2025-09-30 22:00:00'),

-- =====================================================
-- OCTUBRE 2025 (25 transacciones)
-- =====================================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual octubre', 'Salario', 'MANUAL', '2025-10-01 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', 'MANUAL', '2025-10-02 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 92.3000, 'EUR', 'Factura luz Endesa', 'Suministros', 'MANUAL', '2025-10-03 12:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 45.5000, 'EUR', 'Factura agua', 'Suministros', 'MANUAL', '2025-10-03 12:35:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 125.0000, 'EUR', 'Compra Mercadona semanal', 'Alimentación', 'MANUAL', '2025-10-05 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 450.0000, 'EUR', 'Venta cámara Canon EOS', 'Ventas Online', 'AMAZON', '2025-10-07 14:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina Repsol', 'Transporte', 'MANUAL', '2025-10-08 08:15:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', 'MANUAL', '2025-10-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', 'MANUAL', '2025-10-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 118.0000, 'EUR', 'Compra Carrefour', 'Alimentación', 'MANUAL', '2025-10-12 17:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 320.0000, 'EUR', 'Venta iPhone 12 usado', 'Ventas Online', 'EBAY', '2025-10-14 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 35.0000, 'EUR', 'Cena restaurante japonés', 'Restaurantes', 'MANUAL', '2025-10-16 21:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', 'MANUAL', '2025-10-18 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 130.0000, 'EUR', 'Compra supermercado', 'Alimentación', 'MANUAL', '2025-10-19 16:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 180.0000, 'EUR', 'Venta bicicleta montaña', 'Ventas Online', 'OTHER', '2025-10-22 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Seguro coche (mensual)', 'Seguros', 'MANUAL', '2025-10-23 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 49.9900, 'EUR', 'Amazon Prime anual (prorrateado)', 'Suscripciones', 'MANUAL', '2025-10-25 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 110.0000, 'EUR', 'Compra Lidl', 'Alimentación', 'MANUAL', '2025-10-26 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', 'MANUAL', '2025-10-27 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 290.0000, 'EUR', 'Venta teclado mecánico Corsair', 'Ventas Online', 'SHOPIFY', '2025-10-28 16:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 28.0000, 'EUR', 'Comisión eBay ventas', 'Comisiones', 'EBAY', '2025-10-28 16:05:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 58.0000, 'EUR', 'Gasolina Cepsa', 'Transporte', 'MANUAL', '2025-10-29 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 65.0000, 'EUR', 'Ropa otoño Zara', 'Ropa', 'MANUAL', '2025-10-30 12:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 22.0000, 'EUR', 'Decoración Halloween', 'Hogar', 'MANUAL', '2025-10-31 15:00:00'),

-- =====================================================
-- NOVIEMBRE 2025 (25 transacciones)
-- =====================================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual noviembre', 'Salario', 'MANUAL', '2025-11-01 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', 'MANUAL', '2025-11-02 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 78.5000, 'EUR', 'Factura luz Endesa', 'Suministros', 'MANUAL', '2025-11-03 12:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', 'MANUAL', '2025-11-04 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 145.0000, 'EUR', 'Compra Mercadona', 'Alimentación', 'MANUAL', '2025-11-06 18:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 890.0000, 'EUR', 'Venta MacBook Pro 2019', 'Ventas Online', 'AMAZON', '2025-11-08 15:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 60.0000, 'EUR', 'Gasolina BP', 'Transporte', 'MANUAL', '2025-11-09 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', 'MANUAL', '2025-11-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', 'MANUAL', '2025-11-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 125.0000, 'EUR', 'Compra Carrefour', 'Alimentación', 'MANUAL', '2025-11-13 17:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Revisión coche taller', 'Transporte', 'MANUAL', '2025-11-15 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', 'MANUAL', '2025-11-16 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 42.0000, 'EUR', 'Cena pizzería', 'Restaurantes', 'MANUAL', '2025-11-18 20:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 135.0000, 'EUR', 'Compra supermercado', 'Alimentación', 'MANUAL', '2025-11-20 16:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 250.0000, 'EUR', 'Venta consola PS4', 'Ventas Online', 'EBAY', '2025-11-22 14:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Seguro coche (mensual)', 'Seguros', 'MANUAL', '2025-11-23 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 28.0000, 'EUR', 'Libros Amazon', 'Educación', 'AMAZON', '2025-11-24 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina Shell', 'Transporte', 'MANUAL', '2025-11-26 08:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 420.0000, 'EUR', 'Venta cámara GoPro Hero', 'Ventas Online', 'SHOPIFY', '2025-11-27 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 199.0000, 'EUR', 'Black Friday - Ropa Zara', 'Ropa', 'MANUAL', '2025-11-29 12:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 65.0000, 'EUR', 'Black Friday - Amazon electronics', 'Compras Online', 'AMAZON', '2025-11-29 15:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Black Friday - MediaMarkt', 'Electrónica', 'MANUAL', '2025-11-29 17:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 45.0000, 'EUR', 'Comisión Amazon ventas', 'Comisiones', 'AMAZON', '2025-11-29 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 120.0000, 'EUR', 'Compra fin de mes', 'Alimentación', 'MANUAL', '2025-11-30 16:00:00'),

-- =====================================================
-- DICIEMBRE 2025 (25 transacciones)
-- =====================================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual diciembre', 'Salario', 'MANUAL', '2025-12-01 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 1600.0000, 'EUR', 'Paga extra Navidad', 'Salario', 'MANUAL', '2025-12-01 09:05:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', 'MANUAL', '2025-12-02 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 95.0000, 'EUR', 'Factura luz Endesa', 'Suministros', 'MANUAL', '2025-12-03 12:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', 'MANUAL', '2025-12-04 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 150.0000, 'EUR', 'Compra Mercadona', 'Alimentación', 'MANUAL', '2025-12-05 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 1250.0000, 'EUR', 'Venta MacBook Air M1', 'Ventas Online', 'AMAZON', '2025-12-07 16:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 62.5000, 'EUR', 'Comisión Amazon ventas', 'Comisiones', 'AMAZON', '2025-12-07 16:05:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', 'MANUAL', '2025-12-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', 'MANUAL', '2025-12-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 280.0000, 'EUR', 'Regalos Navidad familia', 'Regalos', 'MANUAL', '2025-12-15 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', 'MANUAL', '2025-12-16 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 180.0000, 'EUR', 'Regalos Navidad amigos', 'Regalos', 'MANUAL', '2025-12-18 14:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 350.0000, 'EUR', 'Venta videoconsola Nintendo Switch', 'Ventas Online', 'EBAY', '2025-12-19 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 160.0000, 'EUR', 'Compra Navidad supermercado', 'Alimentación', 'MANUAL', '2025-12-22 17:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Seguro coche (mensual)', 'Seguros', 'MANUAL', '2025-12-23 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 120.0000, 'EUR', 'Cena Nochebuena restaurante', 'Restaurantes', 'MANUAL', '2025-12-24 21:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 100.0000, 'EUR', 'Regalo Navidad efectivo abuelos', 'Otros Ingresos', 'MANUAL', '2025-12-25 12:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina viaje Navidad', 'Transporte', 'MANUAL', '2025-12-27 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 220.0000, 'EUR', 'Venta ropa vintage', 'Ventas Online', 'OTHER', '2025-12-28 15:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 45.0000, 'EUR', 'Película y cena post-navidad', 'Entretenimiento', 'MANUAL', '2025-12-29 20:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 130.0000, 'EUR', 'Compra supermercado fin año', 'Alimentación', 'MANUAL', '2025-12-30 17:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 85.0000, 'EUR', 'Cena Nochevieja', 'Restaurantes', 'MANUAL', '2025-12-31 22:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 25.0000, 'EUR', 'Cotillón y champán Nochevieja', 'Entretenimiento', 'MANUAL', '2025-12-31 23:00:00'),

-- =====================================================
-- ENERO 2026 (25 transacciones)
-- =====================================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual enero', 'Salario', 'MANUAL', '2026-01-01 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', 'MANUAL', '2026-01-02 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 82.0000, 'EUR', 'Factura luz Endesa', 'Suministros', 'MANUAL', '2026-01-03 12:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 42.5000, 'EUR', 'Factura agua', 'Suministros', 'MANUAL', '2026-01-03 12:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', 'MANUAL', '2026-01-04 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 135.0000, 'EUR', 'Compra Mercadona', 'Alimentación', 'MANUAL', '2026-01-06 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 560.0000, 'EUR', 'Venta monitor gaming ASUS', 'Ventas Online', 'AMAZON', '2026-01-08 15:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 28.0000, 'EUR', 'Comisión Amazon ventas', 'Comisiones', 'AMAZON', '2026-01-08 15:35:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', 'MANUAL', '2026-01-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', 'MANUAL', '2026-01-10 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 58.0000, 'EUR', 'Gasolina Cepsa', 'Transporte', 'MANUAL', '2026-01-12 08:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 128.0000, 'EUR', 'Compra Carrefour', 'Alimentación', 'MANUAL', '2026-01-14 17:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 380.0000, 'EUR', 'Venta cámara Canon mirrorless', 'Ventas Online', 'EBAY', '2026-01-16 11:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', 'MANUAL', '2026-01-17 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 48.0000, 'EUR', 'Cena cumpleaños amigo', 'Restaurantes', 'MANUAL', '2026-01-18 21:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 115.0000, 'EUR', 'Compra supermercado', 'Alimentación', 'MANUAL', '2026-01-20 16:30:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 29.9900, 'EUR', 'HBO Max', 'Entretenimiento', 'MANUAL', '2026-01-22 00:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Seguro coche (mensual)', 'Seguros', 'MANUAL', '2026-01-23 09:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 195.0000, 'EUR', 'Venta router gaming', 'Ventas Online', 'SHOPIFY', '2026-01-24 14:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina Repsol', 'Transporte', 'MANUAL', '2026-01-25 08:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 65.0000, 'EUR', 'Ropa rebajas enero', 'Ropa', 'MANUAL', '2026-01-26 12:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 125.0000, 'EUR', 'Compra Mercadona', 'Alimentación', 'MANUAL', '2026-01-27 18:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 480.0000, 'EUR', 'Venta iPad Pro 2020', 'Ventas Online', 'AMAZON', '2026-01-29 15:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 24.0000, 'EUR', 'Comisión Amazon ventas', 'Comisiones', 'AMAZON', '2026-01-29 15:05:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 38.0000, 'EUR', 'Cena asiática fin de mes', 'Restaurantes', 'MANUAL', '2026-01-31 21:00:00');

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Seed data inserted successfully!' AS status;
SELECT 
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM subscriptions) AS subscriptions,
    (SELECT COUNT(*) FROM platform_connections) AS connections,
    (SELECT COUNT(*) FROM transactions) AS transactions,
    (SELECT COUNT(*) FROM email_notifications) AS emails,
    (SELECT COUNT(*) FROM in_app_notifications) AS notifications;
