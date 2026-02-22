# Aizesk — Web Application

Frontend de la plataforma **Aizesk**, construido con **Angular**. Permite a los usuarios gestionar sus suscripciones, conectar plataformas de e-commerce y visualizar sus métricas de ventas en un dashboard unificado.

## 🚀 Tecnologías

- **Angular 19** + TypeScript
- **Angular Material** para los componentes UI
- **RxJS** para manejo de estado reactivo
- **Hosted en AWS S3** como sitio web estático

## 📦 Funcionalidades principales

- **Autenticación**: Login, registro y recuperación de contraseña.
- **Dashboard**: Métricas de ventas, tendencias y resumen financiero.
- **Plataformas**: Conectar y gestionar integraciones con Shopify, Amazon, Etsy, eBay y WooCommerce.
- **Suscripciones**: Visualización del plan actual y upgrade/downgrade vía Stripe Checkout.
- **Notificaciones**: Bell icon con notificaciones en tiempo real.

## 🖥️ Ejecutar localmente

```bash
npm install
ng serve
```
La app estará disponible en `http://localhost:4200`.

## 🏗️ Estructura del proyecto

```
src/
├── app/
│   ├── core/            # Guards, interceptors, servicios globales
│   ├── features/        # Módulos de funcionalidad (auth, dashboard, platforms...)
│   ├── shared/          # Componentes y pipes compartidos
│   └── environments/    # Configuración por entorno
└── assets/              # Recursos estáticos
```

## ⚙️ Entornos

| Entorno | Archivo | API Base |
| :--- | :--- | :--- |
| Local | `environment.ts` | `http://localhost:8081` (por servicio) |
| Producción | `environment.prod.ts` | Auto-generado por `deploy.sh frontend` |

> ⚠️ **No edites `environment.prod.ts` manualmente.** Es generado automáticamente por el script de despliegue con la URL del ALB de producción.

## 🚢 Despliegue en producción

El despliegue compila Angular y sube los artefactos a S3:

```bash
cd webapp/deployment
./deploy.sh frontend
```

## 🔗 Integraciones externas

- **Shopify OAuth**: Las redirecciones OAuth usan el **API Gateway Proxy (HTTPS)** para cumplir con el requisito de HTTPS de Shopify.
- **Stripe Checkout**: El flujo de pago redirige a Stripe y vuelve a la webapp tras la confirmación.

## 🌐 URLs de producción

Obtén las URLs actuales con:
```bash
./deploy.sh status
```
