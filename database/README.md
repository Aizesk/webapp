# 🗄️ AIZESK Platform - Database

Este directorio contiene todo lo necesario para gestionar la base de datos MySQL de la plataforma.

## 📁 Estructura

```
database/
├── docker-compose.yml       # Configuración de Docker para MySQL
├── init/                    # Scripts de inicialización (se ejecutan automáticamente)
│   ├── 01-schema.sql        # Creación de tablas
│   └── 02-seed-data.sql     # Datos iniciales de prueba
├── scripts/
│   └── init-db.sh           # Script de gestión de la base de datos
└── README.md
```

## 🚀 Inicio Rápido

### 1. Levantar la base de datos

```bash
cd database
chmod +x scripts/init-db.sh
./scripts/init-db.sh start
```

### 2. Verificar que está funcionando

```bash
./scripts/init-db.sh status
```

### 3. Conectarse a MySQL

```bash
./scripts/init-db.sh shell
```

## 📋 Comandos Disponibles

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

## 🔌 Conexión desde Servicios

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3307/aizesk_users?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=aizesk
spring.datasource.password=aizesk-mysql-2024
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

## 👥 Usuarios de Prueba

| Email | Password | Rol | Plan |
|-------|----------|-----|------|
| demo@aizesk.com | password123 | ROLE_USER | FREE |
| admin@aizesk.com | password123 | ROLE_ADMIN | ENTERPRISE |
| carlos.garcia@example.com | password123 | ROLE_USER | PRO |
| maria.lopez@example.com | password123 | ROLE_USER | FREE |
| john.doe@example.com | password123 | ROLE_USER | PRO |

> **Nota**: Las contraseñas están hasheadas en el auth-service con BCrypt.
> El hash para "password123" es: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3BZGpD6YV5e8C5I5iYCu`

## 🗃️ Tablas

### users
Información principal de usuarios (user-service).

### active_sessions
Sesiones activas de usuarios.

### refresh_tokens
Tokens de refresco para auth-service (blacklist).

### audit_log
Log de auditoría de eventos de seguridad.

## 🔄 Migración del contenedor existente

Si ya tienes el contenedor `aizesk-mysql` corriendo:

```bash
# Opción 1: Mantener datos y agregar los scripts
docker exec -i aizesk-mysql mysql -u root -proot aizesk_users < init/01-schema.sql
docker exec -i aizesk-mysql mysql -u aizesk -p'aizesk-mysql-2024' aizesk_users < init/02-seed-data.sql

# Opción 2: Reiniciar todo (PERDERÁS DATOS)
docker rm -f aizesk-mysql
./scripts/init-db.sh start
```

## ⚠️ Notas Importantes

1. **Persistencia**: Los datos se persisten en un volumen Docker (`mysql_data`).
2. **Puerto**: MySQL corre en el puerto `3307` (no el estándar 3306).
3. **Charset**: Configurado para `utf8mb4` (soporte completo de Unicode/emojis).
4. **Inicialización**: Los scripts en `init/` solo se ejecutan la PRIMERA vez que se crea el contenedor.
