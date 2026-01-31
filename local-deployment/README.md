# Aizesk - Local Development Environment

Este directorio contiene la configuración de Docker Compose para levantar todo el entorno de microservicios localmente.

## 🚀 Quick Start

```bash
cd local-deployment
./start.sh
```

## 📋 Servicios Disponibles

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
| Admin Service | 8080 | - | 🔜 Pendiente |

## 🔧 Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f notification-service

# Reconstruir un servicio
docker-compose up --build -d notification-service

# Parar todo
docker-compose down

# Parar y limpiar volúmenes (reiniciar BD)
docker-compose down -v

# Ver estado de los contenedores
docker-compose ps
```

## 🗄️ Base de Datos

- **Host**: `localhost`
- **Port**: `3307`
- **Database**: `aizesk`
- **User**: `aizesk`
- **Password**: `aizesk-mysql-2024`

### Conexión desde terminal
```bash
mysql -h 127.0.0.1 -P 3307 -u aizesk -p aizesk
```

### Scripts de inicialización
Los scripts en `./db/` se ejecutan automáticamente al crear el contenedor:
- `01-schema.sql` - Esquema de tablas
- `02-seed-data.sql` - Datos iniciales
- `03-sample-transactions.sql` - Transacciones de ejemplo

## 📧 Email Testing (MailHog)

MailHog captura todos los emails enviados en desarrollo.

- **Web UI**: http://localhost:8025
- **SMTP**: `mailhog:1025` (desde contenedores) o `localhost:1025` (desde host)

## 🔐 Variables de Entorno

El script `start.sh` crea automáticamente un archivo `.env` con valores por defecto.

Puedes personalizarlas editando `.env`:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `MYSQL_PASSWORD` | `aizesk-mysql-2024` | Contraseña MySQL |
| `JWT_SECRET` | `aizesk-super-secret...` | Secret para JWT |
| `MAIL_DEV_MODE` | `true` | Si es true, los emails se loguean pero no se envían |
| `AWS_REGION` | `eu-west-1` | Región AWS (para producción) |

## ☁️ Preparación para AWS

Cada microservicio tiene su propio `Dockerfile` listo para:
- **AWS ECS/Fargate**: Despliegue de contenedores serverless
- **AWS ECR**: Registro de imágenes Docker

### Para desplegar en AWS:
1. Construir imagen: `docker build -t aizesk/notification-service .`
2. Subir a ECR: `docker push <ecr-url>/notification-service`
3. Crear Task Definition en ECS apuntando a la imagen
4. Crear Service en ECS con ALB

## 🏗️ Estructura de Directorios

```
local-deployment/
├── docker-compose.yml    # Orquestación de todos los servicios
├── start.sh              # Script de inicio rápido
├── .env                   # Variables de entorno (auto-generado)
├── db/                    # Scripts SQL de inicialización
│   ├── 01-schema.sql
│   ├── 02-seed-data.sql
│   └── 03-sample-transactions.sql
└── README.md              # Esta documentación
```

## 🐛 Troubleshooting

### El servicio no arranca
```bash
# Ver logs del servicio
docker-compose logs notification-service

# Verificar que MySQL esté healthy
docker-compose ps
```

### Error de conexión a BD
1. Verificar que MySQL esté corriendo: `docker-compose ps mysql`
2. Esperar a que MySQL esté healthy (puede tardar ~30s)
3. Verificar credenciales en `.env`

### Limpiar todo y empezar de cero
```bash
docker-compose down -v
rm -f .env
./start.sh
```
