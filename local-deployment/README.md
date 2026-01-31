# Aizesk - Local Development Environment

Este directorio contiene la configuración de Docker Compose y scripts de utilidad para el desarrollo local del ecosistema de microservicios Aizesk.

---

## 📂 Estructura de Repositorios Requerida

> ⚠️ **IMPORTANTE:** Los scripts asumen que todos los repositorios están organizados en el mismo directorio padre.

```
/tu-ruta/aizesk/                      ← Directorio base
├── auth-service/                     ← Microservicio de autenticación
├── notification-service/             ← Microservicio de notificaciones
├── platform-connection-service/      ← Conexiones con plataformas
├── reporting-service/                ← Reportes y analytics
├── subscription-service/             ← Gestión de suscripciones
├── transaction-service/              ← Transacciones financieras
├── user-service/                     ← Gestión de usuarios
└── webapp/                           ← Frontend Angular + scripts de deployment
    └── local-deployment/             ← ⬅️ ESTÁS AQUÍ
        ├── docker-compose.yml
        ├── start-deployment-docker.sh
        └── ...
```

---

## 🚀 Quick Start

### Opción 1: Solo infraestructura (recomendado para desarrollo)
```bash
cd webapp/local-deployment
./start-deployment-docker.sh infra
```
Esto levanta **solo** MySQL + MailHog. Luego ejecutas los servicios localmente con tu IDE.

### Opción 2: Todo en Docker
```bash
cd webapp/local-deployment
./start-deployment-docker.sh all
```
Esto levanta MySQL + MailHog + todos los microservicios en contenedores.

---

## 📋 Scripts Disponibles

### `start-deployment-docker.sh` / `.ps1`
Script principal para gestionar el entorno Docker.

| Comando | Acción |
|---------|--------|
| `./start-deployment-docker.sh infra` | Solo MySQL + MailHog (para desarrollo local) |
| `./start-deployment-docker.sh all` | Todo (infra + microservicios en Docker) |
| `./start-deployment-docker.sh stop` | Detener todos los contenedores |

### `scripts/db-utils.sh` / `.ps1`
Utilidades para gestionar la base de datos MySQL.

| Comando | Acción |
|---------|--------|
| `./scripts/db-utils.sh status` | Ver si MySQL está corriendo + info de conexión |
| `./scripts/db-utils.sh shell` | Conectarse a MySQL como usuario `aizesk` |
| `./scripts/db-utils.sh shell-root` | Conectarse como `root` |
| `./scripts/db-utils.sh logs` | Ver logs de MySQL en tiempo real |
| `./scripts/db-utils.sh reset` | ⚠️ Borrar TODOS los datos y reiniciar |
| `./scripts/db-utils.sh seed` | Re-ejecutar datos de prueba |
| `./scripts/db-utils.sh exec <file.sql>` | Ejecutar un archivo SQL |

> **Nota:** Este script requiere que MySQL esté corriendo. Ejecuta primero `./start-deployment-docker.sh infra`.

### `scripts/git-sync-repos.sh` / `.ps1`
Sincroniza todos los repositorios con `git pull`.

| Comando | Acción |
|---------|--------|
| `./scripts/git-sync-repos.sh` | Sync main + develop en todos los repos |
| `./scripts/git-sync-repos.sh --main-only` | Solo rama main |
| `./scripts/git-sync-repos.sh --develop-only` | Solo rama develop |

---

## 🐳 Servicios Docker

| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| **MySQL** | 3307 | `localhost:3307` | ✅ Activo |
| **MailHog** | 8025 | http://localhost:8025 | ✅ Activo |
| **Notification Service** | 8086 | http://localhost:8086/swagger-ui.html | ✅ Activo |
| Auth Service | 8081 | - | 🔜 Pendiente |
| User Service | 8082 | - | 🔜 Pendiente |
| Subscription Service | 8083 | - | 🔜 Pendiente |
| Transaction Service | 8084 | - | 🔜 Pendiente |
| Platform Connection Service | 8085 | - | 🔜 Pendiente |
| Reporting Service | 8087 | - | 🔜 Pendiente |

---

## 🔄 Flujo de Desarrollo

### Desarrollo local (recomendado)
```bash
# 1. Levantar infraestructura
./start-deployment-docker.sh infra

# 2. Ejecutar servicio localmente (en otra terminal)
cd ../../notification-service
mvn spring-boot:run

# 3. Probar
open http://localhost:8086/swagger-ui.html
open http://localhost:8025  # MailHog

# 4. Cuando termines
./start-deployment-docker.sh stop
```

### Todo en Docker
```bash
# 1. Levantar todo
./start-deployment-docker.sh all

# 2. Ver logs
docker-compose logs -f notification-service

# 3. Cuando termines
./start-deployment-docker.sh stop
```

---

## 🗄️ Base de Datos

### Conexión
| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Port** | `3307` |
| **Database** | `aizesk` |
| **User** | `aizesk` |
| **Password** | `aizesk-mysql-2024` |

### Conectarse desde terminal
```bash
./scripts/db-utils.sh shell
# o directamente:
docker exec -it aizesk-mysql mysql -u aizesk -paizesk-mysql-2024 aizesk
```

### Scripts de inicialización
Los scripts en `./db/` se ejecutan automáticamente al crear el contenedor:
- `01-schema.sql` - Esquema de tablas (sincronizado con JPA)
- `02-seed-data.sql` - Datos iniciales + transacciones de ejemplo


---

## 📧 Email Testing (MailHog)

MailHog captura todos los emails enviados en desarrollo.

- **Web UI**: http://localhost:8025
- **SMTP**: `mailhog:1025` (desde contenedores) o `localhost:1025` (desde host)

---

## ⚙️ Variables de Entorno

El script crea automáticamente un archivo `.env` con valores por defecto.

| Variable | Default | Descripción |
|----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | `root-password-2024` | Contraseña root MySQL |
| `MYSQL_PASSWORD` | `aizesk-mysql-2024` | Contraseña usuario aizesk |
| `JWT_SECRET` | `aizesk-super-secret...` | Secret para JWT |
| `MAIL_DEV_MODE` | `true` | Emails se loguean pero no se envían |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200,...` | Orígenes permitidos |
| `AWS_REGION` | `eu-west-1` | Región AWS (para producción) |

---

## 🏗️ Estructura de Directorios

```
local-deployment/
├── docker-compose.yml              # Orquestación de todos los servicios
├── start-deployment-docker.sh      # 🍎 Script principal (Mac/Linux)
├── start-deployment-docker.ps1     # 🪟 Script principal (Windows)
├── .env                            # Variables de entorno (auto-generado)
├── README.md                       # Esta documentación
├── db/                             # Scripts SQL de inicialización
│   ├── 01-schema.sql               #   Esquema de tablas
│   └── 02-seed-data.sql            #   Datos de prueba + transacciones
└── scripts/                        # Scripts de utilidad
    ├── db-utils.sh / .ps1          #   Utilidades de MySQL
    └── git-sync-repos.sh / .ps1    #   Sincronizar repos
```

---

## 🐛 Troubleshooting

### MySQL no arranca
```bash
# Ver logs
docker-compose logs mysql

# Verificar estado
docker-compose ps
```

### Error de conexión a BD
1. Verificar que MySQL esté corriendo: `./scripts/db-utils.sh status`
2. Esperar a que MySQL esté healthy (puede tardar ~30s)
3. Verificar credenciales en `.env`

### Servicio Java no conecta a MySQL
1. Si corres localmente, asegúrate de usar perfil `default` (no `docker`)
2. El puerto local es `3307`, no `3306`
3. Verifica `application.properties` tenga `localhost:3307`

### Limpiar todo y empezar de cero
```bash
./start-deployment-docker.sh stop
docker-compose down -v
rm -f .env
./start-deployment-docker.sh infra
```

---

## ☁️ Preparación para AWS

Cada microservicio tiene su propio `Dockerfile` listo para despliegue en:
- **AWS ECS/Fargate**: Contenedores serverless
- **AWS ECR**: Registro de imágenes Docker

### Para desplegar en AWS:
1. Construir imagen: `docker build -t aizesk/notification-service .`
2. Subir a ECR: `docker push <ecr-url>/notification-service`
3. Crear Task Definition en ECS con las variables de entorno de producción
4. Crear Service en ECS con ALB

---

## 📝 Comandos Docker Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f notification-service

# Reconstruir un servicio
docker-compose up --build -d notification-service

# Ver estado de los contenedores
docker-compose ps

# Entrar al contenedor de MySQL
docker exec -it aizesk-mysql bash

# Ejecutar comando SQL
docker exec -i aizesk-mysql mysql -u aizesk -paizesk-mysql-2024 aizesk < script.sql
```
