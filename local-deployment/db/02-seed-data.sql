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
    id, email, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'demo@aizesk.com',
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
    id, email, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'admin@aizesk.com',
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
    id, email, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'carlos.garcia@example.com',
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
    id, email, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'maria.lopez@example.com',
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
    id, email, full_name, last_name, phone, 
    street, city, postal_code, country, 
    role, plan, avatar_url,
    pref_billing_alerts, pref_weekly_digest, pref_security_events, pref_product_research,
    created_at, updated_at, last_login_at
) VALUES (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'john.doe@example.com',
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
-- =====================================================

-- Transacciones de ejemplo
INSERT INTO transactions (
    user_id, type, amount, currency, description, category,
    transaction_date, platform_connection_id, platform_order_id, platform_type
) VALUES 
-- Ventas del admin
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INCOME', 125.50, 'EUR', 'Venta iPhone 12 Case', 'Electronics', NOW() - INTERVAL 1 DAY, 'conn-0001-0000-0000-000000000001', 'AMZ-001-2026', 'AMAZON'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INCOME', 89.99, 'EUR', 'Venta Auriculares Bluetooth', 'Electronics', NOW() - INTERVAL 2 DAY, 'conn-0001-0000-0000-000000000001', 'AMZ-002-2026', 'AMAZON'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INCOME', 45.00, 'EUR', 'Venta Funda Tablet', 'Electronics', NOW() - INTERVAL 3 DAY, 'conn-0002-0000-0000-000000000002', 'EBAY-001-2026', 'EBAY'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'EXPENSE', 15.50, 'EUR', 'Comisión Amazon', 'Fees', NOW() - INTERVAL 1 DAY, NULL, NULL, NULL),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'EXPENSE', 25.00, 'EUR', 'Envío DHL', 'Shipping', NOW() - INTERVAL 2 DAY, NULL, NULL, NULL),
-- Ventas de Carlos
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'INCOME', 299.99, 'EUR', 'Venta Laptop Stand', 'Office', NOW() - INTERVAL 1 DAY, 'conn-0003-0000-0000-000000000003', 'SHOP-001-2026', 'SHOPIFY'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'INCOME', 49.99, 'EUR', 'Venta Mouse Pad XL', 'Office', NOW() - INTERVAL 4 DAY, 'conn-0003-0000-0000-000000000003', 'SHOP-002-2026', 'SHOPIFY'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'EXPENSE', 8.99, 'EUR', 'Comisión Shopify', 'Fees', NOW() - INTERVAL 1 DAY, NULL, NULL, NULL);

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
-- TRANSACTION-SERVICE: TRANSACCIONES DE EJEMPLO
-- 68 transacciones realistas para demo user
-- Período: Octubre 2025 - Enero 2026
-- =====================================================

-- Limpiar transacciones anteriores del demo user
DELETE FROM transactions WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

INSERT INTO transactions (user_id, type, amount, currency, description, category, transaction_date, created_at, platform_connection_id, platform_order_id, platform_type) VALUES

-- OCTUBRE 2025
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual octubre', 'Salario', '2025-10-01 09:00:00', '2025-10-01 09:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2025-10-02 10:00:00', '2025-10-02 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.9900, 'EUR', 'Factura luz Endesa', 'Suministros', '2025-10-03 12:30:00', '2025-10-03 12:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 45.5000, 'EUR', 'Factura agua', 'Suministros', '2025-10-03 12:35:00', '2025-10-03 12:35:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 125.0000, 'EUR', 'Compra Mercadona semanal', 'Alimentación', '2025-10-05 18:00:00', '2025-10-05 18:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 450.0000, 'EUR', 'Venta Amazon - Auriculares Sony', 'Ventas Online', '2025-10-07 14:30:00', '2025-10-07 14:30:00', 'conn-0004-0000-0000-000000000004', 'AMZ-2025-10-001', 'AMAZON'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina Repsol', 'Transporte', '2025-10-08 08:15:00', '2025-10-08 08:15:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2025-10-10 00:00:00', '2025-10-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2025-10-10 00:00:00', '2025-10-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 118.0000, 'EUR', 'Compra Carrefour', 'Alimentación', '2025-10-12 17:30:00', '2025-10-12 17:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 320.0000, 'EUR', 'Venta eBay - iPhone usado', 'Ventas Online', '2025-10-14 11:00:00', '2025-10-14 11:00:00', NULL, 'EBAY-2025-10-001', 'EBAY'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 35.0000, 'EUR', 'Cena restaurante japonés', 'Restaurantes', '2025-10-16 21:00:00', '2025-10-16 21:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 130.0000, 'EUR', 'Compra supermercado', 'Alimentación', '2025-10-19 16:00:00', '2025-10-19 16:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 180.0000, 'EUR', 'Venta Wallapop - Bicicleta', 'Ventas Online', '2025-10-22 10:00:00', '2025-10-22 10:00:00', NULL, NULL, 'WALLAPOP'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 49.9900, 'EUR', 'Amazon Prime anual (prorrateado)', 'Suscripciones', '2025-10-25 00:00:00', '2025-10-25 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 110.0000, 'EUR', 'Compra Lidl', 'Alimentación', '2025-10-26 11:00:00', '2025-10-26 11:00:00', NULL, NULL, NULL),

-- NOVIEMBRE 2025
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual noviembre', 'Salario', '2025-11-01 09:00:00', '2025-11-01 09:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2025-11-02 10:00:00', '2025-11-02 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 78.5000, 'EUR', 'Factura luz Endesa', 'Suministros', '2025-11-03 12:30:00', '2025-11-03 12:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', '2025-11-04 10:00:00', '2025-11-04 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 145.0000, 'EUR', 'Compra Mercadona', 'Alimentación', '2025-11-06 18:30:00', '2025-11-06 18:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 890.0000, 'EUR', 'Venta Amazon - Tablet Samsung', 'Ventas Online', '2025-11-08 15:00:00', '2025-11-08 15:00:00', 'conn-0004-0000-0000-000000000004', 'AMZ-2025-11-001', 'AMAZON'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 60.0000, 'EUR', 'Gasolina BP', 'Transporte', '2025-11-09 09:00:00', '2025-11-09 09:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2025-11-10 00:00:00', '2025-11-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2025-11-10 00:00:00', '2025-11-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 125.0000, 'EUR', 'Compra Carrefour', 'Alimentación', '2025-11-13 17:00:00', '2025-11-13 17:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 89.0000, 'EUR', 'Revisión coche taller', 'Transporte', '2025-11-15 11:00:00', '2025-11-15 11:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 42.0000, 'EUR', 'Cena pizzería', 'Restaurantes', '2025-11-18 20:30:00', '2025-11-18 20:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 135.0000, 'EUR', 'Compra supermercado', 'Alimentación', '2025-11-20 16:30:00', '2025-11-20 16:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 250.0000, 'EUR', 'Venta eBay - Consola PS4', 'Ventas Online', '2025-11-22 14:00:00', '2025-11-22 14:00:00', NULL, 'EBAY-2025-11-001', 'EBAY'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 199.0000, 'EUR', 'Black Friday - Ropa Zara', 'Ropa', '2025-11-29 12:00:00', '2025-11-29 12:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 65.0000, 'EUR', 'Black Friday - Amazon', 'Compras Online', '2025-11-29 15:00:00', '2025-11-29 15:00:00', NULL, NULL, NULL),

-- DICIEMBRE 2025
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual diciembre', 'Salario', '2025-12-01 09:00:00', '2025-12-01 09:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 1600.0000, 'EUR', 'Paga extra Navidad', 'Salario', '2025-12-01 09:05:00', '2025-12-01 09:05:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2025-12-02 10:00:00', '2025-12-02 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 95.0000, 'EUR', 'Factura luz Endesa', 'Suministros', '2025-12-03 12:00:00', '2025-12-03 12:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 150.0000, 'EUR', 'Compra Mercadona', 'Alimentación', '2025-12-05 18:00:00', '2025-12-05 18:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 1250.0000, 'EUR', 'Venta Amazon - MacBook usado', 'Ventas Online', '2025-12-07 16:00:00', '2025-12-07 16:00:00', 'conn-0004-0000-0000-000000000004', 'AMZ-2025-12-001', 'AMAZON'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2025-12-10 00:00:00', '2025-12-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2025-12-10 00:00:00', '2025-12-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 280.0000, 'EUR', 'Regalos Navidad familia', 'Regalos', '2025-12-15 11:00:00', '2025-12-15 11:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 180.0000, 'EUR', 'Regalos Navidad amigos', 'Regalos', '2025-12-18 14:00:00', '2025-12-18 14:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 160.0000, 'EUR', 'Compra Navidad supermercado', 'Alimentación', '2025-12-22 17:00:00', '2025-12-22 17:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 120.0000, 'EUR', 'Cena Nochebuena restaurante', 'Restaurantes', '2025-12-24 21:00:00', '2025-12-24 21:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 100.0000, 'EUR', 'Regalo Navidad efectivo', 'Otros Ingresos', '2025-12-25 12:00:00', '2025-12-25 12:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 55.0000, 'EUR', 'Gasolina viaje Navidad', 'Transporte', '2025-12-27 10:00:00', '2025-12-27 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 85.0000, 'EUR', 'Cena Nochevieja', 'Restaurantes', '2025-12-31 22:00:00', '2025-12-31 22:00:00', NULL, NULL, NULL),

-- ENERO 2026
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 3200.0000, 'EUR', 'Salario mensual enero', 'Salario', '2026-01-01 09:00:00', '2026-01-01 09:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2026-01-02 10:00:00', '2026-01-02 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 82.0000, 'EUR', 'Factura luz Endesa', 'Suministros', '2026-01-03 12:00:00', '2026-01-03 12:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 42.5000, 'EUR', 'Factura agua', 'Suministros', '2026-01-03 12:30:00', '2026-01-03 12:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', '2026-01-04 10:00:00', '2026-01-04 10:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 135.0000, 'EUR', 'Compra Mercadona', 'Alimentación', '2026-01-06 18:00:00', '2026-01-06 18:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 560.0000, 'EUR', 'Venta Amazon - Monitor LG', 'Ventas Online', '2026-01-08 15:30:00', '2026-01-08 15:30:00', 'conn-0004-0000-0000-000000000004', 'AMZ-2026-01-001', 'AMAZON'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2026-01-10 00:00:00', '2026-01-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2026-01-10 00:00:00', '2026-01-10 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 58.0000, 'EUR', 'Gasolina Cepsa', 'Transporte', '2026-01-12 08:30:00', '2026-01-12 08:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 128.0000, 'EUR', 'Compra Carrefour', 'Alimentación', '2026-01-14 17:00:00', '2026-01-14 17:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INCOME', 380.0000, 'EUR', 'Venta eBay - Cámara Canon', 'Ventas Online', '2026-01-16 11:00:00', '2026-01-16 11:00:00', NULL, 'EBAY-2026-01-001', 'EBAY'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 48.0000, 'EUR', 'Cena cumpleaños amigo', 'Restaurantes', '2026-01-18 21:00:00', '2026-01-18 21:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 115.0000, 'EUR', 'Compra supermercado', 'Alimentación', '2026-01-20 16:30:00', '2026-01-20 16:30:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 29.9900, 'EUR', 'HBO Max', 'Entretenimiento', '2026-01-22 00:00:00', '2026-01-22 00:00:00', NULL, NULL, NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', '2026-01-25 08:00:00', '2026-01-25 08:00:00', NULL, NULL, NULL);

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
