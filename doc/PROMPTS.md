# 🤖 PROMPTS DE EJECUCIÓN — App de Gestión de Inventario

> **Instrucciones de uso:**
> 1. Copia el prompt completo de la fase que vas a ejecutar
> 2. Pégalo en una nueva conversación de Claude (VS Code o claude.ai)
> 3. El prompt ya incluye las instrucciones para leer los documentos del proyecto
> 4. Al finalizar cada fase, Claude creará el archivo `RESUMEN_FASE_X.md`

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 1 — Fundación y Arquitectura
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior experto en Next.js, TypeScript, PostgreSQL y Prisma ORM.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Antes de hacer cualquier cosa, lee los siguientes archivos en este orden:
1. Lee el archivo PLAN.md (plan general del proyecto)
2. Lee el archivo PLAN_IMPLEMENTACION.md (plan de implementación por fases)
3. Lee el archivo ESTADO_EJECUCION.md (estado actual del proyecto)

PASO 2 — REGISTRO DE INICIO:
En el archivo ESTADO_EJECUCION.md realiza las siguientes actualizaciones:
- Cambia el estado de la Fase 1 de "🔴 Pendiente" a "🟡 En progreso"
- Registra la fecha y hora de inicio en la columna "Inicio" de la Fase 1
- En la sección "Historial de Ejecución > FASE 1" agrega: "[FECHA HORA] - INICIO: Comenzando ejecución de Fase 1 - Fundación y Arquitectura"
- Actualiza "Fase actual" en el Estado General

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 1 del PLAN_IMPLEMENTACION.md:
- Inicializar proyecto Next.js 14 con TypeScript
- Configurar Tailwind CSS
- Configurar ESLint + Prettier
- Configurar PostgreSQL + Prisma ORM
- Definir esquema completo de base de datos en schema.prisma (todas las tablas del PLAN.md)
- Ejecutar migraciones iniciales
- Configurar NextAuth.js con credenciales
- Implementar modelo de roles (Admin, Bodeguero, Visualizador)
- Crear estructura de carpetas del proyecto
- Configurar variables de entorno (.env.example)
- Setup de repositorio Git con .gitignore

PASO 4 — REGISTRO DE COMPLETITUD:
Al terminar todas las tareas, actualiza ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 1 a "🟢 Completado"
- Registra la fecha y hora de fin
- En el historial de Fase 1 documenta: qué se hizo, qué decisiones se tomaron, qué problemas se encontraron y cómo se resolvieron
- Actualiza el % Completado general (Fase 1 = 10%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_1.md con la siguiente estructura:
# Resumen Fase 1 — Fundación y Arquitectura
## Fecha de ejecución
## Qué se construyó
## Stack configurado
## Estructura de carpetas creada
## Esquema de base de datos definido
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 2 — Diseño UI/UX
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Diseñador UX/UI Senior especializado en aplicaciones web de gestión empresarial, con dominio en Tailwind CSS, diseño de sistemas y experiencia de usuario para flujos de inventario.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Antes de hacer cualquier cosa, lee los siguientes archivos en este orden:
1. Lee el archivo PLAN.md (plan general del proyecto)
2. Lee el archivo PLAN_IMPLEMENTACION.md (plan de implementación por fases)
3. Lee el archivo ESTADO_EJECUCION.md (estado actual del proyecto)
4. Lee el archivo RESUMEN_FASE_1.md (para conocer la estructura creada en la fase anterior)

PASO 2 — REGISTRO DE INICIO:
En el archivo ESTADO_EJECUCION.md realiza las siguientes actualizaciones:
- Cambia el estado de la Fase 2 de "🔴 Pendiente" a "🟡 En progreso"
- Registra la fecha y hora de inicio
- En la sección "Historial de Ejecución > FASE 2" agrega el registro de inicio
- Actualiza "Fase actual"

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 2 del PLAN_IMPLEMENTACION.md:
- Definir paleta de colores y tipografía (documenta los valores exactos)
- Diseñar layout principal (sidebar + header + área de contenido)
- Crear componentes base: Button, Input, Table, Modal, Badge, Card, Alert
- Diseñar e implementar pantalla de Login
- Diseñar e implementar Dashboard principal con estructura de widgets
- Diseñar listados de Productos, Bodegas y Movimientos
- Diseñar formularios de creación/edición con validaciones visuales
- Diseñar componente de alerta de stock crítico
- Diseñar pantalla de Reportes con filtros
- Asegurar responsive en desktop y tablet

PASO 4 — REGISTRO DE COMPLETITUD:
Al terminar, actualiza ESTADO_EJECUCION.md:
- Cambia estado de Fase 2 a "🟢 Completado"
- Documenta en el historial: decisiones de diseño, paleta elegida, componentes creados
- Actualiza % Completado (Fase 2 = 20%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_2.md con la siguiente estructura:
# Resumen Fase 2 — Diseño UI/UX
## Fecha de ejecución
## Sistema de diseño definido (colores, tipografía, espaciado)
## Componentes base creados
## Pantallas implementadas
## Decisiones de diseño tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 3 — Módulo de Productos y Categorías
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior experto en Next.js API Routes, Prisma ORM, manejo de archivos y generación de códigos de barras y QR.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Antes de hacer cualquier cosa, lee los siguientes archivos en este orden:
1. Lee el archivo PLAN.md
2. Lee el archivo PLAN_IMPLEMENTACION.md
3. Lee el archivo ESTADO_EJECUCION.md
4. Lee el archivo RESUMEN_FASE_1.md
5. Lee el archivo RESUMEN_FASE_2.md

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 3 a "🟡 En progreso"
- Registra inicio en historial de Fase 3
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 3:
- API REST completa: GET/POST/PUT/DELETE /api/products
- API REST completa: GET/POST/PUT/DELETE /api/categories
- Listado de productos con búsqueda por nombre/SKU y filtro por categoría
- Formulario de creación de producto con validaciones (SKU único, stock mínimo > 0)
- Formulario de edición de producto
- Subida y almacenamiento de imagen del producto
- Generación automática de código de barras con jsbarcode al crear producto
- Generación automática de QR con librería qrcode al crear producto
- Vista de detalle de producto mostrando QR y barcode
- Funcionalidad de impresión de etiqueta

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 3 a "🟢 Completado"
- Documenta en historial: APIs creadas, librerías usadas, decisiones sobre SKU y códigos
- Actualiza % Completado (Fase 3 = 30%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_3.md con la siguiente estructura:
# Resumen Fase 3 — Módulo Productos y Categorías
## Fecha de ejecución
## APIs implementadas (endpoints y métodos)
## Funcionalidades de UI implementadas
## Librerías de QR/barcode utilizadas y configuración
## Validaciones implementadas
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 4 — Módulo de Bodegas y Stock
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior con experiencia en sistemas de inventario multi-ubicación, gestión de stock en tiempo real y diseño de lógica de negocio para bodegas.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. RESUMEN_FASE_1.md
5. RESUMEN_FASE_3.md

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 4 a "🟡 En progreso"
- Registra inicio en historial de Fase 4
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 4:
- API REST: GET/POST/PUT/DELETE /api/warehouses
- API REST: GET /api/stock (acepta filtros por warehouse_id y product_id)
- Listado de bodegas con cantidad de productos y estado
- Formulario de creación y edición de bodega
- Vista de stock por bodega: tabla con producto, cantidad actual, stock mínimo, estado
- Indicadores visuales: 🟢 Normal | 🟡 Bajo | 🔴 Crítico
- Lógica de StockLevel: crear registro inicial al asignar producto a bodega
- Función reutilizable updateStock(productId, warehouseId, delta) para uso en movimientos

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 4 a "🟢 Completado"
- Documenta en historial la función updateStock y cómo funciona
- Actualiza % Completado (Fase 4 = 40%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_4.md con la siguiente estructura:
# Resumen Fase 4 — Módulo Bodegas y Stock
## Fecha de ejecución
## APIs implementadas
## Lógica de StockLevel explicada
## Función updateStock: firma y comportamiento
## Indicadores visuales implementados
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 5 — Módulo de Movimientos y Transferencias
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior con experiencia en sistemas de trazabilidad, flujos de movimiento de inventario, integración de lectores QR/barcode y transacciones de base de datos.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. RESUMEN_FASE_1.md
5. RESUMEN_FASE_4.md (especialmente la función updateStock)

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 5 a "🟡 En progreso"
- Registra inicio en historial de Fase 5
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 5:
- API REST: POST /api/movements (tipo: ENTRADA | SALIDA)
- API REST: POST /api/transfers (entre bodegas)
- API REST: GET /api/movements (con filtros: fecha, tipo, producto, bodega, usuario)
- Formulario de entrada: producto (con escáner), bodega destino, cantidad, motivo
- Formulario de salida: producto (con escáner), bodega origen, cantidad, motivo
- Formulario de transferencia: producto, bodega origen, bodega destino, cantidad
- Integración de lector QR/barcode via cámara con quagga2
- Historial de movimientos con tabla paginada y filtros
- Transacción atómica: movimiento + actualización de stock en una sola operación
- Validación: bloquear salida si stock insuficiente (mostrar error claro al usuario)
- Actualización automática de StockLevel usando la función updateStock de Fase 4

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 5 a "🟢 Completado"
- Documenta el flujo transaccional implementado
- Actualiza % Completado (Fase 5 = 50%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_5.md con la siguiente estructura:
# Resumen Fase 5 — Módulo Movimientos y Transferencias
## Fecha de ejecución
## APIs implementadas
## Flujo transaccional explicado
## Integración QR/barcode: librería y configuración
## Validaciones de negocio implementadas
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 6 — Módulo de Alertas
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior especializado en sistemas de notificaciones, lógica de alertas en tiempo real y patrones de eventos en aplicaciones web.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. RESUMEN_FASE_5.md (el sistema de alertas se dispara desde los movimientos)

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 6 a "🟡 En progreso"
- Registra inicio en historial de Fase 6
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 6:
- Función evaluateAlerts(productId, warehouseId) que se llama después de cada movimiento
- Lógica: si stock actual < min_stock → crear alerta (si no existe una activa ya)
- API REST: GET /api/alerts (alertas activas, ordenadas por fecha)
- API REST: PUT /api/alerts/:id/resolve (marcar como resuelta)
- Componente Badge en header/sidebar con conteo de alertas activas
- Panel de alertas: listado con producto, bodega, stock actual, stock mínimo, fecha
- Notificación toast al usuario cuando un movimiento genera una nueva alerta
- Historial de alertas resueltas con fecha de resolución

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 6 a "🟢 Completado"
- Documenta la lógica de evaluateAlerts
- Actualiza % Completado (Fase 6 = 60%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_6.md con la siguiente estructura:
# Resumen Fase 6 — Módulo Alertas
## Fecha de ejecución
## Lógica de evaluateAlerts explicada
## APIs implementadas
## Componentes de UI de alertas
## Flujo completo: movimiento → evaluación → alerta → notificación
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 7 — Dashboard y Reportes
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior con experiencia en data visualization, generación de reportes en PDF y Excel, y construcción de dashboards analíticos para aplicaciones empresariales.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. RESUMEN_FASE_1.md (estructura del proyecto)
5. RESUMEN_FASE_5.md (datos de movimientos disponibles)
6. RESUMEN_FASE_6.md (datos de alertas disponibles)

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 7 a "🟡 En progreso"
- Registra inicio en historial de Fase 7
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 7:
- API REST: GET /api/dashboard → retorna KPIs: total_products, total_warehouses, critical_stock_count, recent_movements (últimos 5), alerts_count
- Dashboard UI: cards de KPIs con íconos
- Gráfica de barras: entradas vs salidas por mes (últimos 6 meses) con Recharts
- Gráfica de stock por bodega (barras o dona)
- Tabla de últimos movimientos en dashboard
- API REST: GET /api/reports/stock?warehouse_id=&category_id=
- API REST: GET /api/reports/movements?from=&to=&type=&warehouse_id=
- API REST: GET /api/reports/critical (productos bajo stock mínimo)
- UI de reportes: formulario de filtros + tabla de resultados + botones exportar
- Generación de PDF con pdfkit (logo, título, filtros aplicados, tabla, pie de página)
- Generación de Excel con exceljs (hoja formateada con encabezados y datos)

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 7 a "🟢 Completado"
- Documenta librerías de reportes y configuración
- Actualiza % Completado (Fase 7 = 70%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_7.md con la siguiente estructura:
# Resumen Fase 7 — Dashboard y Reportes
## Fecha de ejecución
## KPIs del dashboard implementados
## Gráficas implementadas (tipo y librería)
## APIs de reportes implementadas
## Formato PDF: estructura y librerías
## Formato Excel: estructura y librerías
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 8 — Gestión de Usuarios y Seguridad
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior especializado en seguridad web, autenticación, autorización basada en roles (RBAC) y protección de APIs en aplicaciones Next.js.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md (especialmente la tabla de roles y permisos)
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. RESUMEN_FASE_1.md (configuración de NextAuth y roles iniciales)

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 8 a "🟡 En progreso"
- Registra inicio en historial de Fase 8
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 8:
- API REST: GET /api/users (solo Admin)
- API REST: POST /api/users (crear usuario, solo Admin)
- API REST: PUT /api/users/:id (editar, solo Admin)
- API REST: DELETE /api/users/:id (solo Admin)
- API REST: PUT /api/users/:id/password (cambio de contraseña)
- Middleware withAuth(role) aplicado a todas las rutas API
- Panel de usuarios: listado con rol, estado activo/inactivo
- Formulario de creación/edición de usuario con asignación de rol
- Protección de rutas frontend: redirigir a /403 si rol insuficiente
- Auditar que CADA endpoint existente tenga su middleware de autorización correcto
- Hash de contraseñas con bcrypt

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 8 a "🟢 Completado"
- Documenta el middleware implementado y mapa de permisos
- Actualiza % Completado (Fase 8 = 80%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_8.md con la siguiente estructura:
# Resumen Fase 8 — Usuarios y Seguridad
## Fecha de ejecución
## APIs de usuarios implementadas
## Middleware de autorización: cómo funciona
## Mapa de rutas y roles permitidos
## Protección frontend implementada
## Seguridad adicional implementada
## Decisiones técnicas tomadas
## Problemas encontrados y soluciones
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 9 — Pruebas y Calidad
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior y QA Engineer con experiencia en testing de aplicaciones Next.js usando Jest, Playwright y pruebas de seguridad web.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. Todos los RESUMEN_FASE_X.md disponibles (para entender qué se construyó)

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 9 a "🟡 En progreso"
- Registra inicio en historial de Fase 9
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 9:
- Configurar Jest + Testing Library para pruebas unitarias
- Pruebas unitarias: updateStock(), evaluateAlerts(), validaciones de formularios
- Pruebas de integración: APIs de productos, movimientos, alertas
- Configurar Playwright para pruebas E2E
- Prueba E2E: flujo completo login → crear producto → registrar entrada → ver stock
- Prueba E2E: flujo salida que genera alerta de stock crítico
- Prueba E2E: generación de reporte PDF
- Corrección de todos los bugs encontrados durante las pruebas
- Optimización de queries lentas identificadas
- Revisión de seguridad: SQL injection, XSS, CSRF, validación de inputs
- Pruebas responsive en Chrome/Firefox en 1440px, 1024px, 768px

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 9 a "🟢 Completado"
- Documenta cobertura de pruebas alcanzada y bugs encontrados/resueltos
- Actualiza % Completado (Fase 9 = 90%)

PASO 5 — CREAR RESUMEN DE FASE:
Crea el archivo RESUMEN_FASE_9.md con la siguiente estructura:
# Resumen Fase 9 — Pruebas y Calidad
## Fecha de ejecución
## Cobertura de pruebas alcanzada (%)
## Pruebas unitarias: lista de funciones testeadas
## Pruebas de integración: APIs testeadas
## Pruebas E2E: flujos testeados
## Bugs encontrados y cómo se resolvieron
## Optimizaciones de performance realizadas
## Resultado de revisión de seguridad
## Decisiones técnicas tomadas
## Criterio de completitud alcanzado
## Siguiente fase recomendada
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PROMPT FASE 10 — Despliegue y Documentación
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
Actúa como un Ingeniero Fullstack Senior con experiencia en DevOps, despliegue de aplicaciones Next.js en Vercel, gestión de bases de datos PostgreSQL en producción y documentación técnica profesional.

PASO 1 — LECTURA OBLIGATORIA DE CONTEXTO:
Lee en orden:
1. PLAN.md
2. PLAN_IMPLEMENTACION.md
3. ESTADO_EJECUCION.md
4. RESUMEN_FASE_1.md (stack y configuración base)
5. RESUMEN_FASE_9.md (estado final de calidad)

PASO 2 — REGISTRO DE INICIO:
Actualiza ESTADO_EJECUCION.md:
- Fase 10 a "🟡 En progreso"
- Registra inicio en historial de Fase 10
- Actualiza fase actual

PASO 3 — EJECUCIÓN:
Ejecuta todas las tareas de la Fase 10:
- Configurar proyecto en Vercel (vercel.json si necesario)
- Configurar base de datos PostgreSQL en Railway o Supabase
- Variables de entorno de producción configuradas y documentadas
- Ejecutar migraciones en BD de producción
- Seed de datos iniciales: usuario Admin por defecto
- Verificar build de producción sin errores (npm run build)
- Desplegar en Vercel y verificar URL de producción
- Verificar todos los módulos en producción
- README.md completo: descripción, instalación, configuración, uso, deployment
- Colección Postman o archivo OpenAPI con todos los endpoints documentados
- Manual de usuario: cómo usar cada módulo (con capturas si es posible)
- Verificación final del criterio de éxito del PLAN.md

PASO 4 — REGISTRO DE COMPLETITUD:
Actualiza ESTADO_EJECUCION.md:
- Fase 10 a "🟢 Completado"
- Estado general del proyecto a "🟢 COMPLETADO"
- Documenta URL de producción, credenciales de demo, notas finales
- Actualiza % Completado (100%)

PASO 5 — CREAR RESUMEN DE FASE Y RESUMEN FINAL:
Crea el archivo RESUMEN_FASE_10.md con la siguiente estructura:
# Resumen Fase 10 — Despliegue y Documentación
## Fecha de ejecución
## URL de producción
## Infraestructura configurada
## Variables de entorno de producción (sin valores sensibles)
## Credenciales de demo (usuario/contraseña de prueba)
## Documentación generada
## Verificación de criterios de éxito del proyecto
## Notas finales y recomendaciones de mantenimiento

Además, crea el archivo RESUMEN_PROYECTO_COMPLETO.md con:
# Resumen Completo del Proyecto — App de Gestión de Inventario
## Descripción del proyecto
## Stack tecnológico final
## Módulos implementados
## URL de producción
## Cronograma real de ejecución (fechas por fase)
## Lecciones aprendidas
## Posibles mejoras futuras (v2)
```

---

## 📌 Notas Importantes

- **Orden de ejecución:** Los prompts deben ejecutarse en orden numérico (Fase 1 → 10)
- **Prerequisitos:** Cada prompt menciona qué resúmenes de fases anteriores debe leer
- **Estado:** El archivo `ESTADO_EJECUCION.md` es el registro maestro — nunca borrar entradas
- **Resúmenes:** Los archivos `RESUMEN_FASE_X.md` son independientes del estado de ejecución
- **Bloqueos:** Si una fase se bloquea, documentarlo en `ESTADO_EJECUCION.md` con estado ⚠️
