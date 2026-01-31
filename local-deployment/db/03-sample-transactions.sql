-- =====================================================
-- AIZESK Platform - Sample Transactions Data
-- Transacciones simuladas para demo-user-001
-- Período: Octubre 2025 - Enero 2026
-- =====================================================

-- Database: aizesk (MySQL on port 3307)

-- =====================================================
-- CREATE TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(255),
    transaction_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    platform_connection_id VARCHAR(36),
    platform_order_id VARCHAR(255),
    platform_type VARCHAR(50),
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_platform_connection_id (platform_connection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpiar datos anteriores de demo-user-001 y datos de prueba
DELETE FROM transactions WHERE user_id = 'demo-user-001' OR user_id LIKE 'user-%';

-- =====================================================
-- TRANSACCIONES PARA demo-user-001
-- 68 transacciones realistas de octubre 2025 a enero 2026
-- =====================================================

INSERT INTO transactions (user_id, type, amount, currency, description, category, transaction_date, created_at, platform_connection_id, platform_order_id, platform_type) VALUES

-- =====================================================
-- OCTUBRE 2025
-- =====================================================
('demo-user-001', 'INCOME', 3200.0000, 'EUR', 'Salario mensual octubre', 'Salario', '2025-10-01 09:00:00', '2025-10-01 09:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2025-10-02 10:00:00', '2025-10-02 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 89.9900, 'EUR', 'Factura luz Endesa', 'Suministros', '2025-10-03 12:30:00', '2025-10-03 12:30:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 45.5000, 'EUR', 'Factura agua', 'Suministros', '2025-10-03 12:35:00', '2025-10-03 12:35:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 125.0000, 'EUR', 'Compra Mercadona semanal', 'Alimentación', '2025-10-05 18:00:00', '2025-10-05 18:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 450.0000, 'EUR', 'Venta Amazon - Auriculares Sony', 'Ventas Online', '2025-10-07 14:30:00', '2025-10-07 14:30:00', 'conn-amz-demo', 'AMZ-2025-10-001', 'AMAZON'),
('demo-user-001', 'EXPENSE', 55.0000, 'EUR', 'Gasolina Repsol', 'Transporte', '2025-10-08 08:15:00', '2025-10-08 08:15:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2025-10-10 00:00:00', '2025-10-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2025-10-10 00:00:00', '2025-10-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 118.0000, 'EUR', 'Compra Carrefour', 'Alimentación', '2025-10-12 17:30:00', '2025-10-12 17:30:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 320.0000, 'EUR', 'Venta eBay - iPhone usado', 'Ventas Online', '2025-10-14 11:00:00', '2025-10-14 11:00:00', 'conn-ebay-demo', 'EBAY-2025-10-001', 'EBAY'),
('demo-user-001', 'EXPENSE', 35.0000, 'EUR', 'Cena restaurante japonés', 'Restaurantes', '2025-10-16 21:00:00', '2025-10-16 21:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 130.0000, 'EUR', 'Compra supermercado', 'Alimentación', '2025-10-19 16:00:00', '2025-10-19 16:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 180.0000, 'EUR', 'Venta Wallapop - Bicicleta', 'Ventas Online', '2025-10-22 10:00:00', '2025-10-22 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 49.9900, 'EUR', 'Amazon Prime anual (prorrateado)', 'Suscripciones', '2025-10-25 00:00:00', '2025-10-25 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 110.0000, 'EUR', 'Compra Lidl', 'Alimentación', '2025-10-26 11:00:00', '2025-10-26 11:00:00', NULL, NULL, NULL),
('demo-user-001', 'TRANSFER', 400.0000, 'EUR', 'Transferencia cuenta ahorro', 'Ahorro', '2025-10-28 09:00:00', '2025-10-28 09:00:00', NULL, NULL, NULL),

-- =====================================================
-- NOVIEMBRE 2025
-- =====================================================
('demo-user-001', 'INCOME', 3200.0000, 'EUR', 'Salario mensual noviembre', 'Salario', '2025-11-01 09:00:00', '2025-11-01 09:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2025-11-02 10:00:00', '2025-11-02 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 78.5000, 'EUR', 'Factura luz Endesa', 'Suministros', '2025-11-03 12:30:00', '2025-11-03 12:30:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', '2025-11-04 10:00:00', '2025-11-04 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 145.0000, 'EUR', 'Compra Mercadona', 'Alimentación', '2025-11-06 18:30:00', '2025-11-06 18:30:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 890.0000, 'EUR', 'Venta Amazon - Tablet Samsung', 'Ventas Online', '2025-11-08 15:00:00', '2025-11-08 15:00:00', 'conn-amz-demo', 'AMZ-2025-11-001', 'AMAZON'),
('demo-user-001', 'EXPENSE', 60.0000, 'EUR', 'Gasolina BP', 'Transporte', '2025-11-09 09:00:00', '2025-11-09 09:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2025-11-10 00:00:00', '2025-11-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2025-11-10 00:00:00', '2025-11-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 125.0000, 'EUR', 'Compra Carrefour', 'Alimentación', '2025-11-13 17:00:00', '2025-11-13 17:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 89.0000, 'EUR', 'Revisión coche taller', 'Transporte', '2025-11-15 11:00:00', '2025-11-15 11:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 42.0000, 'EUR', 'Cena pizzería', 'Restaurantes', '2025-11-18 20:30:00', '2025-11-18 20:30:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 135.0000, 'EUR', 'Compra supermercado', 'Alimentación', '2025-11-20 16:30:00', '2025-11-20 16:30:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 250.0000, 'EUR', 'Venta eBay - Consola PS4', 'Ventas Online', '2025-11-22 14:00:00', '2025-11-22 14:00:00', 'conn-ebay-demo', 'EBAY-2025-11-001', 'EBAY'),
('demo-user-001', 'EXPENSE', 199.0000, 'EUR', 'Black Friday - Ropa Zara', 'Ropa', '2025-11-29 12:00:00', '2025-11-29 12:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 65.0000, 'EUR', 'Black Friday - Amazon', 'Compras Online', '2025-11-29 15:00:00', '2025-11-29 15:00:00', NULL, NULL, NULL),
('demo-user-001', 'TRANSFER', 500.0000, 'EUR', 'Transferencia cuenta ahorro', 'Ahorro', '2025-11-30 09:00:00', '2025-11-30 09:00:00', NULL, NULL, NULL),

-- =====================================================
-- DICIEMBRE 2025
-- =====================================================
('demo-user-001', 'INCOME', 3200.0000, 'EUR', 'Salario mensual diciembre', 'Salario', '2025-12-01 09:00:00', '2025-12-01 09:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 1600.0000, 'EUR', 'Paga extra Navidad', 'Salario', '2025-12-01 09:05:00', '2025-12-01 09:05:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2025-12-02 10:00:00', '2025-12-02 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 95.0000, 'EUR', 'Factura luz Endesa', 'Suministros', '2025-12-03 12:00:00', '2025-12-03 12:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 150.0000, 'EUR', 'Compra Mercadona', 'Alimentación', '2025-12-05 18:00:00', '2025-12-05 18:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 1250.0000, 'EUR', 'Venta Amazon - MacBook usado', 'Ventas Online', '2025-12-07 16:00:00', '2025-12-07 16:00:00', 'conn-amz-demo', 'AMZ-2025-12-001', 'AMAZON'),
('demo-user-001', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2025-12-10 00:00:00', '2025-12-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2025-12-10 00:00:00', '2025-12-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 280.0000, 'EUR', 'Regalos Navidad familia', 'Regalos', '2025-12-15 11:00:00', '2025-12-15 11:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 180.0000, 'EUR', 'Regalos Navidad amigos', 'Regalos', '2025-12-18 14:00:00', '2025-12-18 14:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 160.0000, 'EUR', 'Compra Navidad supermercado', 'Alimentación', '2025-12-22 17:00:00', '2025-12-22 17:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 120.0000, 'EUR', 'Cena Nochebuena restaurante', 'Restaurantes', '2025-12-24 21:00:00', '2025-12-24 21:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 100.0000, 'EUR', 'Regalo Navidad efectivo', 'Otros Ingresos', '2025-12-25 12:00:00', '2025-12-25 12:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 55.0000, 'EUR', 'Gasolina viaje Navidad', 'Transporte', '2025-12-27 10:00:00', '2025-12-27 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 85.0000, 'EUR', 'Cena Nochevieja', 'Restaurantes', '2025-12-31 22:00:00', '2025-12-31 22:00:00', NULL, NULL, NULL),
('demo-user-001', 'TRANSFER', 600.0000, 'EUR', 'Transferencia cuenta ahorro', 'Ahorro', '2025-12-30 09:00:00', '2025-12-30 09:00:00', NULL, NULL, NULL),

-- =====================================================
-- ENERO 2026 (hasta el 26)
-- =====================================================
('demo-user-001', 'INCOME', 3200.0000, 'EUR', 'Salario mensual enero', 'Salario', '2026-01-01 09:00:00', '2026-01-01 09:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 750.0000, 'EUR', 'Alquiler apartamento', 'Vivienda', '2026-01-02 10:00:00', '2026-01-02 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 82.0000, 'EUR', 'Factura luz Endesa', 'Suministros', '2026-01-03 12:00:00', '2026-01-03 12:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 42.5000, 'EUR', 'Factura agua', 'Suministros', '2026-01-03 12:30:00', '2026-01-03 12:30:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 39.9900, 'EUR', 'Factura móvil Vodafone', 'Comunicaciones', '2026-01-04 10:00:00', '2026-01-04 10:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 135.0000, 'EUR', 'Compra Mercadona', 'Alimentación', '2026-01-06 18:00:00', '2026-01-06 18:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 560.0000, 'EUR', 'Venta Amazon - Monitor LG', 'Ventas Online', '2026-01-08 15:30:00', '2026-01-08 15:30:00', 'conn-amz-demo', 'AMZ-2026-01-001', 'AMAZON'),
('demo-user-001', 'EXPENSE', 12.9900, 'EUR', 'Spotify Premium', 'Entretenimiento', '2026-01-10 00:00:00', '2026-01-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 17.9900, 'EUR', 'Netflix', 'Entretenimiento', '2026-01-10 00:00:00', '2026-01-10 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 58.0000, 'EUR', 'Gasolina Cepsa', 'Transporte', '2026-01-12 08:30:00', '2026-01-12 08:30:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 128.0000, 'EUR', 'Compra Carrefour', 'Alimentación', '2026-01-14 17:00:00', '2026-01-14 17:00:00', NULL, NULL, NULL),
('demo-user-001', 'INCOME', 380.0000, 'EUR', 'Venta eBay - Cámara Canon', 'Ventas Online', '2026-01-16 11:00:00', '2026-01-16 11:00:00', 'conn-ebay-demo', 'EBAY-2026-01-001', 'EBAY'),
('demo-user-001', 'EXPENSE', 48.0000, 'EUR', 'Cena cumpleaños amigo', 'Restaurantes', '2026-01-18 21:00:00', '2026-01-18 21:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 115.0000, 'EUR', 'Compra supermercado', 'Alimentación', '2026-01-20 16:30:00', '2026-01-20 16:30:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 29.9900, 'EUR', 'HBO Max', 'Entretenimiento', '2026-01-22 00:00:00', '2026-01-22 00:00:00', NULL, NULL, NULL),
('demo-user-001', 'EXPENSE', 75.0000, 'EUR', 'Gimnasio mensual', 'Salud', '2026-01-25 08:00:00', '2026-01-25 08:00:00', NULL, NULL, NULL),
('demo-user-001', 'TRANSFER', 450.0000, 'EUR', 'Transferencia cuenta ahorro', 'Ahorro', '2026-01-26 09:00:00', '2026-01-26 09:00:00', NULL, NULL, NULL);

-- =====================================================
-- RESUMEN
-- =====================================================
-- Total: 68 transacciones para demo-user-001
-- Período: Octubre 2025 - Enero 2026 (4 meses)
-- Tipos: INCOME, EXPENSE, TRANSFER
-- Categorías: Salario, Vivienda, Alimentación, Entretenimiento, 
--             Ventas Online, Transporte, Restaurantes, etc.
-- Plataformas: Amazon, eBay

SELECT 
    'Datos insertados para demo-user-001' AS status,
    COUNT(*) AS total_transacciones,
    SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS total_ingresos,
    SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_gastos,
    SUM(CASE WHEN type = 'TRANSFER' THEN amount ELSE 0 END) AS total_transferencias
FROM transactions 
WHERE user_id = 'demo-user-001';
