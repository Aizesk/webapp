# 🗄️ AIZESK Platform - Database

Este directorio contiene todo lo necesario para gestionar la base de datos MySQL de la plataforma.

## 📁 Estructura

```
database/
├── docker-compose.yml       # Configuración de Docker para MySQL
├── init/                    # Scripts de inicialización (se ejecutan automáticamente)
│   ├── 01-schema.sql        # Creación de tablas (13 tablas)
│   └── 02-seed-data.sql     # Datos iniciales de prueba
├── scripts/
│   ├── init-db.sh           # Script para macOS/Linux
│   └── init-db.ps1          # Script para Windows (PowerShell)
└── README.md
```

## 🚀 Inicio Rápido

### 🍎 macOS / Linux

```bash
cd database
chmod +x scripts/init-db.sh
./scripts/init-db.sh start
./scripts/init-db.sh status
./scripts/init-db.sh shell
```

### 🪟 Windows (PowerShell)

```powershell
cd database
.\scripts\init-db.ps1 start
.\scripts\init-db.ps1 status
.\scripts\init-db.ps1 shell
```

> **Nota Windows**: Si tienes problemas de ejecución, primero ejecuta:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

## 📋 Comandos Disponibles

### 🍎 macOS / Linux

| Comando | Descripción |
|---------|-------------|
| `./scripts/init-db.sh start` | Inicia el contenedor MySQL |
| `./scripts/init-db.sh stop` | Detiene el contenedor |
| `./scripts/init-db.sh reset` | ⚠️ Elimina todos los datos y reinicia |
| `./scripts/init-db.sh status` | Muestra estado e información de conexión |
| `./scripts/init-db.sh logs` | Ver logs del contenedor |
| `./scripts/init-db.sh shell` | Conectar a MySQL como usuario aizesk |
| `./scripts/init-db.sh shell-root` | Conectar a MySQL como root |
| `./scripts/init-db.sh seed` | Reinsertar datos de prueba |
| `./scripts/init-db.sh exec <file>` | Ejecutar un archivo SQL |

### 🪟 Windows (PowerShell)

| Comando | Descripción |
|---------|-------------|
| `.\scripts\init-db.ps1 start` | Inicia el contenedor MySQL |
| `.\scripts\init-db.ps1 stop` | Detiene el contenedor |
| `.\scripts\init-db.ps1 reset` | ⚠️ Elimina todos los datos y reinicia |
| `.\scripts\init-db.ps1 status` | Muestra estado e información de conexión |
| `.\scripts\init-db.ps1 logs` | Ver logs del contenedor |
| `.\scripts\init-db.ps1 shell` | Conectar a MySQL como usuario aizesk |
| `.\scripts\init-db.ps1 shell-root` | Conectar a MySQL como root |
| `.\scripts\init-db.ps1 seed` | Reinsertar datos de prueba |
| `.\scripts\init-db.ps1 exec <file>` | Ejecutar un archivo SQL |

## 🔌 Conexión desde Servicios

### URL de conexión
```
mysql://aizesk:aizesk-mysql-2024@localhost:3307/aizesk
```

### application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/aizesk?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=aizesk
spring.datasource.password=aizesk-mysql-2024
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

## 🗃️ Tablas por Servicio

### user-service (2 tablas)
| Tabla | Descripción |
|-------|-------------|
| `users` | Información de usuarios |
| `active_sessions` | Sesiones activas |

### auth-service (2 tablas)
| Tabla | Descripción |
|-------|-------------|
| `refresh_tokens` | Blacklist de tokens |
| `audit_log` | Auditoría de seguridad |

### subscription-service (3 tablas)
| Tabla | Descripción |
|-------|-------------|
| `subscriptions` | Suscripciones de usuarios |
| `invoices` | Facturas |
| `payment_methods` | Métodos de pago |

### platform-connection-service (2 tablas)
| Tabla | Descripción |
|-------|-------------|
| `platform_connections` | Conexiones a plataformas |
| `sync_logs` | Logs de sincronización |

### transaction-service (1 tabla)
| Tabla | Descripción |
|-------|-------------|
| `transactions` | Transacciones |

### notification-service (2 tablas)
| Tabla | Descripción |
|-------|-------------|
| `email_notifications` | Notificaciones por email |
| `inapp_notifications` | Notificaciones in-app |

**Total: 12 tablas**

## 👥 Usuarios de Prueba

| Email | Password | Rol | Plan | Conexiones |
|-------|----------|-----|------|------------|
| demo@aizesk.com | password123 | ROLE_USER | FREE | Wallapop (error) |
| admin@aizesk.com | password123 | ROLE_ADMIN | ENTERPRISE | Amazon, eBay |
| carlos.garcia@example.com | password123 | ROLE_USER | PRO | Shopify |
| maria.lopez@example.com | password123 | ROLE_USER | FREE | - |
| john.doe@example.com | password123 | ROLE_USER | PRO | - |

> **Nota**: Las contraseñas están hasheadas en el auth-service con BCrypt.
> El hash para "password123" es: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3BZGpD6YV5e8C5I5iYCu`

## 🔄 Migración del contenedor existente

Si ya tienes el contenedor `aizesk-mysql` corriendo con la BD anterior (`aizesk_users`):

```bash
# Opción 1: Reset completo (RECOMENDADO - perderás datos)
./scripts/init-db.sh reset

# Opción 2: Ejecutar scripts manualmente
docker exec -i aizesk-mysql mysql -u root -proot < init/01-schema.sql
docker exec -i aizesk-mysql mysql -u aizesk -p'aizesk-mysql-2024' aizesk < init/02-seed-data.sql
```

## ⚠️ Notas Importantes

1. **Base de datos**: `aizesk` (antes era `aizesk_users`)
2. **Puerto**: MySQL corre en el puerto `3307` (no el estándar 3306)
3. **Persistencia**: Los datos se persisten en un volumen Docker (`mysql_data`)
4. **Charset**: Configurado para `utf8mb4` (soporte completo de Unicode/emojis)
5. **Inicialización**: Los scripts en `init/` solo se ejecutan la PRIMERA vez que se crea el contenedor
