# 🗺️ PLAN DE IMPLEMENTACIÓN — App de Gestión de Inventario

## Metodología
Implementación incremental por fases. Cada fase entrega valor funcional independiente y es prerequisito de la siguiente.

---

## FASE 1 — Fundación y Arquitectura del Proyecto
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 2-3 días  
**Objetivo:** Configurar la base del proyecto, estructura de carpetas, base de datos y autenticación.

### Tareas
- [ ] Inicializar proyecto Next.js 14 con TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar ESLint + Prettier
- [ ] Configurar PostgreSQL + Prisma ORM
- [ ] Definir esquema completo de base de datos en `schema.prisma`
- [ ] Ejecutar migraciones iniciales
- [ ] Configurar NextAuth.js con credenciales
- [ ] Implementar modelo de roles (Admin, Bodeguero, Visualizador)
- [ ] Crear estructura de carpetas del proyecto
- [ ] Configurar variables de entorno
- [ ] Setup de repositorio Git con `.gitignore`

### Entregables
- Proyecto corriendo en localhost
- Base de datos con esquema completo
- Login funcional con roles
- Estructura de carpetas definida

### Criterio de completitud
El desarrollador puede hacer login con 3 roles distintos y la BD tiene todas las tablas creadas.

---

## FASE 2 — Diseño UI/UX y Sistema de Diseño
**Rol:** Diseñador UX/UI  
**Duración estimada:** 2-3 días  
**Objetivo:** Diseñar la interfaz visual del sistema, definir componentes reutilizables y flujos de usuario.

### Tareas
- [ ] Definir paleta de colores y tipografía
- [ ] Diseñar layout principal (sidebar + header + contenido)
- [ ] Crear componentes base: Button, Input, Table, Modal, Badge, Card
- [ ] Diseñar pantalla de Login
- [ ] Diseñar Dashboard principal (wireframe funcional)
- [ ] Diseñar listados de Productos, Bodegas, Movimientos
- [ ] Diseñar formularios de creación/edición
- [ ] Diseñar componente de alertas de stock crítico
- [ ] Diseñar pantalla de Reportes
- [ ] Asegurar diseño responsive (desktop + tablet)

### Entregables
- Sistema de diseño documentado (colores, tipografía, componentes)
- Layout principal implementado
- Componentes base reutilizables
- Pantallas clave con estructura visual

### Criterio de completitud
Todas las pantallas tienen estructura visual navegable aunque sin datos reales.

---

## FASE 3 — Módulo de Productos y Categorías
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 2-3 días  
**Objetivo:** CRUD completo de productos y categorías con generación de códigos.

### Tareas
- [ ] API REST: GET/POST/PUT/DELETE `/api/products`
- [ ] API REST: GET/POST/PUT/DELETE `/api/categories`
- [ ] Listado de productos con búsqueda y filtros
- [ ] Formulario de creación de producto (con validaciones)
- [ ] Formulario de edición de producto
- [ ] Subida de imagen de producto
- [ ] Generación automática de código de barras (jsbarcode)
- [ ] Generación automática de QR (qrcode)
- [ ] Vista de detalle de producto con QR/barcode visible
- [ ] Impresión de etiqueta con código

### Entregables
- CRUD de productos funcional
- CRUD de categorías funcional
- Productos con código de barras y QR generados

### Criterio de completitud
Se puede crear, editar, eliminar y visualizar un producto con su código QR y barras.

---

## FASE 4 — Módulo de Bodegas y Stock
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 2-3 días  
**Objetivo:** Gestión de bodegas y control de stock por ubicación.

### Tareas
- [ ] API REST: GET/POST/PUT/DELETE `/api/warehouses`
- [ ] API REST: GET `/api/stock` (por bodega y producto)
- [ ] Listado de bodegas
- [ ] Formulario de creación/edición de bodega
- [ ] Vista de stock por bodega (tabla de productos + cantidades)
- [ ] Indicador visual de stock crítico por producto/bodega
- [ ] Lógica de StockLevel: actualización automática al registrar movimiento

### Entregables
- CRUD de bodegas funcional
- Vista de stock actual por bodega
- Indicadores de stock crítico activos

### Criterio de completitud
Se puede ver el stock actual de cada producto en cada bodega con alertas visuales.

---

## FASE 5 — Módulo de Movimientos y Transferencias
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 3-4 días  
**Objetivo:** Registrar entradas, salidas y transferencias entre bodegas.

### Tareas
- [ ] API REST: POST `/api/movements` (entrada/salida)
- [ ] API REST: POST `/api/transfers` (entre bodegas)
- [ ] API REST: GET `/api/movements` (con filtros)
- [ ] Formulario de entrada de productos (con escáner QR/barcode)
- [ ] Formulario de salida de productos
- [ ] Formulario de transferencia entre bodegas
- [ ] Lector de código de barras/QR via cámara (quagga2)
- [ ] Historial de movimientos con filtros (fecha, tipo, producto, bodega)
- [ ] Actualización automática de StockLevel al registrar movimiento
- [ ] Validación: no permitir salida si stock insuficiente

### Entregables
- Registro de entradas y salidas funcional
- Transferencias entre bodegas funcionales
- Lector QR/barcode operativo
- Historial de movimientos con filtros

### Criterio de completitud
Se puede registrar una entrada, una salida y una transferencia, y el stock se actualiza correctamente.

---

## FASE 6 — Módulo de Alertas
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 1-2 días  
**Objetivo:** Sistema de alertas automáticas cuando el stock cae por debajo del mínimo.

### Tareas
- [ ] Lógica de evaluación de alertas al registrar movimiento
- [ ] API REST: GET `/api/alerts` (alertas activas)
- [ ] API REST: PUT `/api/alerts/:id/resolve`
- [ ] Componente de alerta en Dashboard (badge con conteo)
- [ ] Panel de alertas activas con detalle
- [ ] Notificación visual al registrar un movimiento que genera alerta
- [ ] Historial de alertas resueltas

### Entregables
- Alertas generadas automáticamente al bajar del stock mínimo
- Panel de alertas visible en Dashboard
- Posibilidad de marcar alerta como resuelta

### Criterio de completitud
Al registrar una salida que baja el stock por debajo del mínimo, aparece alerta en el dashboard.

---

## FASE 7 — Dashboard y Reportes
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 3-4 días  
**Objetivo:** Dashboard con KPIs en tiempo real y sistema de reportes exportables.

### Tareas
- [ ] API REST: GET `/api/dashboard` (KPIs consolidados)
- [ ] Dashboard: total productos, stock crítico, últimos movimientos
- [ ] Gráfica entradas vs salidas por mes (Chart.js o Recharts)
- [ ] Gráfica de stock por bodega
- [ ] API REST: GET `/api/reports/stock`
- [ ] API REST: GET `/api/reports/movements`
- [ ] API REST: GET `/api/reports/critical`
- [ ] Generación de PDF con pdfkit
- [ ] Generación de Excel con exceljs
- [ ] Filtros de reportes por rango de fecha, bodega, producto

### Entregables
- Dashboard con métricas en tiempo real
- Reportes generables con filtros
- Exportación a PDF y Excel funcional

### Criterio de completitud
El dashboard muestra datos reales y se puede exportar un reporte de stock a PDF y Excel.

---

## FASE 8 — Gestión de Usuarios y Seguridad
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 1-2 días  
**Objetivo:** Panel de administración de usuarios con control de roles y permisos.

### Tareas
- [ ] API REST: GET/POST/PUT/DELETE `/api/users` (solo Admin)
- [ ] Listado de usuarios con roles
- [ ] Formulario de creación/edición de usuario
- [ ] Cambio de contraseña
- [ ] Middleware de autorización por rol en todas las rutas
- [ ] Protección de rutas frontend por rol
- [ ] Sesiones seguras y expiración

### Entregables
- Panel de usuarios funcional para Admin
- Middleware de autorización en todas las APIs
- Rutas protegidas por rol en frontend

### Criterio de completitud
Un Visualizador no puede crear movimientos ni acceder a gestión de usuarios.

---

## FASE 9 — Pruebas y Calidad
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 2-3 días  
**Objetivo:** Cobertura de pruebas, corrección de bugs y optimización.

### Tareas
- [ ] Pruebas unitarias de funciones de negocio (Jest)
- [ ] Pruebas de integración de APIs principales
- [ ] Pruebas E2E de flujos críticos (Playwright o Cypress)
- [ ] Corrección de bugs encontrados
- [ ] Optimización de queries a BD
- [ ] Revisión de seguridad (inyección SQL, XSS, CSRF)
- [ ] Pruebas de responsive en móvil y tablet

### Entregables
- Suite de pruebas con cobertura > 70%
- Reporte de bugs y resolución
- App optimizada y segura

### Criterio de completitud
Pruebas pasan sin errores críticos y cobertura supera 70%.

---

## FASE 10 — Despliegue y Documentación
**Rol:** Ingeniero Fullstack  
**Duración estimada:** 1-2 días  
**Objetivo:** Despliegue en producción y documentación técnica completa.

### Tareas
- [ ] Configurar entorno de producción (Vercel + Railway/Supabase)
- [ ] Variables de entorno de producción
- [ ] Migraciones en BD de producción
- [ ] Seed de datos iniciales (usuario Admin)
- [ ] Configurar dominio personalizado (opcional)
- [ ] Documentación técnica: README.md completo
- [ ] Documentación de APIs (Swagger o Postman collection)
- [ ] Manual de usuario básico
- [ ] Verificación final de funcionalidades en producción

### Entregables
- Aplicación desplegada y accesible en producción
- README.md completo
- Documentación de APIs
- Manual de usuario

### Criterio de completitud
La aplicación está accesible en URL de producción con todos los módulos funcionales.

---

## Resumen de Fases

| Fase | Nombre | Rol | Días Est. |
|------|--------|-----|-----------|
| 1 | Fundación y Arquitectura | Fullstack | 2-3 |
| 2 | Diseño UI/UX | UX/UI | 2-3 |
| 3 | Módulo Productos | Fullstack | 2-3 |
| 4 | Módulo Bodegas y Stock | Fullstack | 2-3 |
| 5 | Módulo Movimientos | Fullstack | 3-4 |
| 6 | Módulo Alertas | Fullstack | 1-2 |
| 7 | Dashboard y Reportes | Fullstack | 3-4 |
| 8 | Usuarios y Seguridad | Fullstack | 1-2 |
| 9 | Pruebas y Calidad | Fullstack | 2-3 |
| 10 | Despliegue y Documentación | Fullstack | 1-2 |
| | **TOTAL** | | **19-29 días** |
