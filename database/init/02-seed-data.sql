-- =====================================================
-- AIZESK Platform - Seed Data
-- Version: 1.0.0
-- Description: Initial data for development/testing
-- =====================================================

USE aizesk_users;

-- =====================================================
-- USUARIOS DE PRUEBA
-- Usando INSERT IGNORE para evitar errores si ya existen
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
-- SESIONES DE PRUEBA
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
-- LOG DE AUDITORÍA INICIAL
-- =====================================================

INSERT INTO audit_log (user_id, action, resource, ip_address, details, success) VALUES
(NULL, 'SYSTEM_INIT', 'DATABASE', '127.0.0.1', '{"version": "1.0.0", "environment": "development"}', 1);

-- Log de datos insertados
SELECT 'Seed data inserted successfully!' AS status;
SELECT CONCAT('Total users: ', COUNT(*)) AS info FROM users;
