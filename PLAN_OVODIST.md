# OvoGest — Plan Maestro del Sistema
> Sistema de Gestión para Distribuidora Mayorista de Huevos | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: María Lascarro | Doc: 1082919708

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Estrategia de seguridad](#19-estrategia-de-seguridad)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

**OvoGest** es una plataforma web de gestión para distribuidoras mayoristas de huevos. Cubre el ciclo completo del negocio: registro de proveedores (granjas), control de inventario en tiempo real, procesamiento de pedidos de clientes mayoristas, asignación y seguimiento de entregas, generación automática de facturas y reportes de ventas.

El nombre **OvoGest** proviene de *ovo* (huevo en terminología avícola) y *gest* (gestión). Es el nombre del software — el negocio puede seguir llamándose como el propietario decida.

El sistema opera completamente desde el navegador con Next.js App Router en Vercel. Persiste todos los datos estructurados en Supabase Postgres y registra la auditoría de operaciones críticas en Vercel Blob para no saturar la base de datos con logs de alta frecuencia.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve OvoGest |
|---|---|
| Control de inventario manual, con riesgo de errores y desabastecimiento. | Stock en tiempo real con alertas automáticas cuando baja del mínimo configurado. |
| Pedidos registrados en papel o cuadernos, sin trazabilidad. | Módulo de pedidos con estados rastreables desde la creación hasta la entrega. |
| Cálculo manual de facturas propenso a errores. | Factura generada automáticamente al aprobar el pedido, con número consecutivo. |
| Sin visibilidad de las entregas una vez que el camión sale. | El conductor actualiza el estado de su entrega desde cualquier dispositivo. |
| Reportes elaborados a mano, lentos e imprecisos. | Reportes automáticos exportables en PDF y Excel. |
| Sin control de quién hizo qué en el sistema. | Auditoría de operaciones críticas en Vercel Blob. |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Administrador** | Interno | Acceso total. Configura el sistema, gestiona usuarios, precios, stock mínimo y reportes. |
| **Vendedor** | Interno | Registra y gestiona pedidos. Puede crear y editar clientes. Consulta stock e historial. |
| **Bodeguero** | Interno | Registra entradas de mercancía de proveedores. Actualiza el inventario con cada recepción. |
| **Conductor** | Interno | Consulta sus entregas asignadas y actualiza su estado durante la ruta. |

> **Alcance de la v1:** Los actores externos (Cliente Mayorista y Proveedor) no tienen acceso directo al sistema. El vendedor gestiona pedidos en nombre del cliente y el bodeguero registra entradas en nombre del proveedor. Sus módulos de auto-gestión son trabajo futuro.

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Admin | Vendedor | Bodeguero | Conductor |
|---|:-:|:-:|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ✅ | ❌ | ❌ | ❌ |
| Ver stock actual y alertas | ✅ | ✅ | ✅ | ❌ |
| Registrar entrada de proveedor | ✅ | ❌ | ✅ | ❌ |
| Ajustar stock manualmente | ✅ | ❌ | ❌ | ❌ |
| Configurar precios y stock mínimo | ✅ | ❌ | ❌ | ❌ |
| Ver proveedores | ✅ | ✅ | ✅ | ❌ |
| Crear / editar / desactivar proveedor | ✅ | ❌ | ❌ | ❌ |
| Ver clientes | ✅ | ✅ | ❌ | ❌ |
| Crear / editar / desactivar cliente | ✅ | ✅ | ❌ | ❌ |
| Crear pedido | ✅ | ✅ | ❌ | ❌ |
| Editar / cancelar pedido pendiente | ✅ | ✅ | ❌ | ❌ |
| Aprobar pedido | ✅ | ❌ | ❌ | ❌ |
| Ver todos los pedidos | ✅ | ✅ | ❌ | ❌ |
| Asignar conductor a entrega | ✅ | ❌ | ❌ | ❌ |
| Ver todas las entregas | ✅ | ✅ | ❌ | ❌ |
| Ver propias entregas | ✅ | ✅ | ❌ | ✅ |
| Actualizar estado de entrega propia | ✅ | ❌ | ❌ | ✅ |
| Ver / descargar facturas | ✅ | ✅ | ❌ | ❌ |
| Anular factura | ✅ | ❌ | ❌ | ❌ |
| Ver y exportar reportes | ✅ | ❌ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ |
| Ver bitácora de auditoría | ✅ | ❌ | ❌ | ❌ |

### Comportamiento por rol

**Administrador**: acceso total. El único que aprueba pedidos (disparando la cadena: stock → factura → entrega), configura precios, gestiona usuarios y ve los reportes financieros.

**Vendedor**: crea pedidos en nombre del cliente, gestiona clientes, consulta stock para saber qué puede ofrecer y descarga facturas para los clientes.

**Bodeguero**: registra cada entrada de mercancía desde los proveedores, actualizando el stock. Puede consultar el historial de movimientos.

**Conductor**: ve solo sus entregas asignadas y las actualiza durante la ruta. Su vista está optimizada para celular.

---

## 5. Casos de uso

### Módulo de Inventario

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Registrar entrada de huevos | Bodeguero / Admin | Registra la recepción de un lote de un proveedor. Actualiza el stock. |
| CU-02 | Consultar stock actual | Admin / Vendedor / Bodeguero | Ve el inventario por tipo con indicador de alertas de stock mínimo. |
| CU-03 | Recibir alerta de stock mínimo | Sistema | El dashboard muestra alerta cuando el stock baja del mínimo configurado. |
| CU-04 | Configurar precios y stock mínimo | Admin | Actualiza precio unitario y stock mínimo por tipo de huevo. |
| CU-05 | Ver historial de movimientos | Admin / Bodeguero | Consulta entradas y salidas del inventario con fechas y motivos. |

### Módulo de Proveedores

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Registrar proveedor | Admin | Crea proveedor con nombre, contacto, teléfono y dirección. |
| CU-07 | Ver historial por proveedor | Admin / Bodeguero | Consulta todos los lotes recibidos de un proveedor. |

### Módulo de Clientes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-08 | Registrar cliente mayorista | Admin / Vendedor | Crea cliente con nombre, NIT, teléfono y dirección. |
| CU-09 | Ver historial de pedidos por cliente | Admin / Vendedor | Consulta los pedidos de un cliente con su estado. |

### Módulo de Pedidos

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-10 | Crear pedido | Vendedor / Admin | Selecciona cliente, agrega ítems (tipo de huevo + cantidad). El sistema calcula el total al precio vigente. |
| CU-11 | Editar pedido pendiente | Vendedor / Admin | Modifica ítems de un pedido no aprobado aún. |
| CU-12 | Cancelar pedido | Vendedor / Admin | Cancela un pedido en estado pendiente. |
| CU-13 | Aprobar pedido | Admin | Verifica stock, descuenta inventario, genera factura y crea la entrega en una sola operación. |
| CU-14 | Consultar historial de pedidos | Admin / Vendedor | Filtra por cliente, fecha y estado. |

### Módulo de Entregas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-15 | Asignar conductor | Admin | Asigna un conductor a una entrega pendiente de asignación. |
| CU-16 | Ver mis entregas | Conductor | Ve sus entregas asignadas con estado actual y dirección del cliente. |
| CU-17 | Actualizar estado de entrega | Conductor | Marca la entrega como en_camino, entregada o fallida. |
| CU-18 | Registrar incidencia | Conductor | Agrega una nota descriptiva a una entrega fallida. |
| CU-19 | Devolver stock por entrega fallida | Sistema | Al marcar como fallida, el stock regresa automáticamente al inventario. |

### Módulo de Facturación y Reportes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-20 | Generar factura automática | Sistema | Al aprobar un pedido, se genera una factura con número consecutivo. |
| CU-21 | Descargar factura PDF | Admin / Vendedor | Descarga la factura de un pedido aprobado. |
| CU-22 | Anular factura | Admin | Anula la factura con nota. No se elimina del sistema. |
| CU-23 | Generar reporte de ventas | Admin | Ventas del período con totales por cliente y tipo de huevo. |
| CU-24 | Generar reporte de inventario | Admin | Movimientos del período (entradas y salidas). |

---

## 6. Requerimientos funcionales

### Bootstrap del sistema

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe arrancar sin Supabase configurado, sirviendo el seed de `data/` para login inicial. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, aplicación de migrations y carga del seed. |
| RF-B3 | Las migrations deben estar versionadas en `supabase/migrations/` y aplicarse en orden numérico. |

### Inventario

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema debe registrar entradas de huevos con tipo, cantidad, proveedor y fecha. |
| RF-02 | El sistema debe mostrar el stock actual por tipo con alerta visual si está bajo el mínimo. |
| RF-03 | El admin debe poder configurar el stock mínimo y el precio por tipo de huevo. |
| RF-04 | El sistema debe registrar cada movimiento (entrada, salida, devolución) con usuario, fecha y referencia. |

### Pedidos

| ID | Requerimiento |
|---|---|
| RF-05 | El sistema debe calcular el total del pedido automáticamente con el precio vigente al momento de crear. |
| RF-06 | El sistema debe impedir aprobar un pedido si el stock no cubre todos los ítems. |
| RF-07 | Solo se pueden cancelar pedidos en estado pendiente. |
| RF-08 | El pedido mínimo es de 30 unidades por ítem (1 cartón). |

### Entregas y Facturación

| ID | Requerimiento |
|---|---|
| RF-09 | Al aprobar un pedido, el sistema debe crear automáticamente la entrega y la factura. |
| RF-10 | Si una entrega se marca como fallida, el stock regresa al inventario automáticamente. |
| RF-11 | La factura tiene número consecutivo y no puede eliminarse, solo anularse. |
| RF-12 | El sistema debe generar facturas en PDF desde el servidor. |
| RF-13 | El sistema debe generar reportes de ventas e inventario en PDF y Excel. |

### Auditoría

| ID | Requerimiento |
|---|---|
| RF-A1 | Toda operación de escritura crítica debe registrarse en auditoría. |
| RF-A2 | La auditoría se persiste en Vercel Blob particionada por mes (`audit/<YYYYMM>.json`). |
| RF-A3 | El admin puede consultar la auditoría desde `/admin/audit` filtrada por mes. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | No se puede aprobar un pedido sin stock suficiente. | Verificar en `dataService.approveOrder()` antes de proceder. Retornar 409 con detalle de qué tipos faltan stock y cuánto. |
| RN-02 | El stock mínimo por tipo es configurable. Por defecto: 100 unidades. | Columna `min_stock` en `egg_types`. Alerta calculada en la query de inventario (`current_stock < min_stock`). |
| RN-03 | Solo se puede cancelar un pedido en estado `pendiente`. | Verificar estado en `dataService.cancelOrder()`. Retornar 409 si el estado es distinto. |
| RN-04 | Pedido mínimo: 30 unidades por ítem (1 cartón). | Validación Zod `quantity >= 30` en el schema de ítem de pedido. |
| RN-05 | El precio del ítem es un snapshot del precio al momento de crear el pedido. | `order_items.unit_price` se copia de `egg_types.price_per_unit` al insertar. Cambios futuros de precio no afectan pedidos pasados. |
| RN-06 | Una entrega marcada como fallida devuelve el stock al inventario. | `updateDeliveryStatus` llama a `inventoryService.returnStockFromFailedDelivery(orderId)` cuando el nuevo estado es `fallida`. |
| RN-07 | La factura se genera al aprobar el pedido. No se puede eliminar, solo anular. | `is_voided` + `void_reason` en `invoices`. Endpoint específico `POST /api/invoices/[id]/void`. |
| RN-08 | Solo el Admin puede gestionar usuarios. | `withRole(['admin'])` en todas las rutas `/api/users`. |
| RN-09 | Proveedores y clientes no se eliminan físicamente si tienen registros. | Soft delete: `is_active = false`. |
| RN-10 | El número de factura es consecutivo y generado por el sistema. | `SELECT MAX(invoice_number) FROM invoices` + 1, ejecutado dentro de la misma operación de aprobación. |
| RN-11 | `approveOrder` es una operación compuesta e indivisible: verifica stock + descuenta + genera factura + crea entrega. | Si cualquier paso falla, se lanza error sin haber persistido ningún cambio. Verificación completa antes de cualquier escritura. |
| RN-12 | El sistema arranca en modo seed hasta que el admin ejecute el bootstrap. | Flag `getSystemMode()` en `dataService`. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes serverless |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Todos los datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde la API de bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs append-only de operaciones críticas |
| Export PDF | jsPDF + jspdf-autotable | 2.x | Facturas y reportes PDF en el servidor |
| Export Excel | xlsx (SheetJS) | 0.20.x | Reportes en .xlsx |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, tipos de huevo, proveedores, inventario, movimientos, clientes, pedidos, ítems, entregas, facturas. | Todo el dominio requiere SQL: joins, agregaciones, totales por período, stock en tiempo real. |
| **Vercel Blob** | Auditoría de operaciones críticas, particionada por mes (`audit/<YYYYMM>.json`). | Append-only, alta frecuencia en una distribuidora activa. No satura Postgres. |
| **`data/` en el repo** | Seed inicial: admin + 4 tipos de huevo con precios y stock mínimo por defecto. | Read-only en producción. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.** Nadie importa `supabase.ts` ni `blobAudit.ts` directamente.
2. **CERO caché en memoria** para datos transaccionales. Cada lectura va directo a Postgres.
3. **CERO CDN cache** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
4. **`get()` del SDK de Blob, nunca `fetch(url)`** — los blobs privados fallan silenciosamente con `fetch`.
5. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.
6. **Read-modify-write sobre archivos de auditoría** serializado con `withFileLock()`.
7. **`approveOrder` es transaccional**: verifica stock completo → descuenta → factura → entrega. Si falla cualquier paso, se aborta todo sin persistir.
8. **Snapshot de precio**: `order_items.unit_price` se copia al insertar. Cambios futuros de precios no alteran pedidos pasados.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json       ← { "version": "1.0", "system_name": "OvoGest" }
  seed.json         ← {
                        "users": [{ email, password_hash, role: "admin", name: "Administrador" }],
                        "egg_types": [
                          { name: "Huevo AA", code: "AA", price_per_unit: 650,  min_stock: 100 },
                          { name: "Huevo A",  code: "A",  price_per_unit: 550,  min_stock: 100 },
                          { name: "Huevo B",  code: "B",  price_per_unit: 450,  min_stock: 100 },
                          { name: "Huevo Extra Grande", code: "XL", price_per_unit: 750, min_stock: 100 }
                        ]
                      }
  README.md
```

> Precios en pesos colombianos (COP) por unidad. El admin los actualiza desde el sistema. El `password_hash` se genera manualmente con bcrypt 10 rounds antes de commitear.

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql                 ← Fase 1: tabla users + _migrations
  0002_init_inventory.sql             ← Fase 3: egg_types, inventory, inventory_movements
  0003_init_suppliers.sql             ← Fase 4: suppliers
  0004_init_clients.sql               ← Fase 5: clients
  0005_init_orders.sql                ← Fase 6: orders, order_items
  0006_init_deliveries_invoices.sql   ← Fase 7: deliveries, invoices
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### 10.4 API Route de bootstrap

`POST /api/system/bootstrap` — sesión admin + header `x-bootstrap-secret`. Aplica migrations pendientes y carga el seed (admin + 4 tipos de huevo + crea las filas de inventario con stock 0 para cada tipo).

### 10.5 Página `/admin/db-setup`

Tab **Diagnóstico**: estado de Supabase, Blob, migrations aplicadas vs pendientes, conteos por tabla.
Tab **Bootstrap**: lista migrations pendientes + botón ejecutar con confirmación.

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` (read-only) | Bloqueadas — solo login admin para ir a bootstrap. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts        ← ÚNICO punto de acceso. API pública tipada.
  supabase.ts           ← Cliente Supabase server. Solo lo importa dataService.
  blobAudit.ts          ← Cliente Blob auditoría. Solo lo importa dataService.
  pgMigrate.ts          ← Cliente pg para migrations. Solo lo importa /api/system/bootstrap.
  seedReader.ts         ← Lector de data/*.json. Solo lo importa dataService en modo seed.
  inventoryService.ts   ← deductStockForOrder, returnStockFromFailedDelivery, recordMovement.
  orderService.ts       ← processOrderApproval (operación compuesta), calculateOrderTotal.
  invoiceService.ts     ← getNextInvoiceNumber, generateInvoicePDF.
  reportService.ts      ← generateSalesReport, generateInventoryReport (PDF y Excel).
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>
export async function listConductors(): Promise<SafeUser[]>

// Tipos de huevo e inventario
export async function getInventoryWithAlerts(): Promise<InventoryWithAlert[]>
export async function updateEggType(id: string, userId: string, data: UpdateEggTypeRequest): Promise<EggType>
export async function registerStockEntry(userId: string, data: StockEntryRequest): Promise<InventoryMovement>
export async function getInventoryMovements(filters?: MovementFilters): Promise<InventoryMovement[]>

// Proveedores
export async function getSuppliers(): Promise<Supplier[]>
export async function createSupplier(userId: string, data: CreateSupplierRequest): Promise<Supplier>
export async function updateSupplier(id: string, userId: string, data: UpdateSupplierRequest): Promise<Supplier>

// Clientes
export async function getClients(): Promise<Client[]>
export async function createClient(userId: string, data: CreateClientRequest): Promise<Client>
export async function updateClient(id: string, userId: string, data: UpdateClientRequest): Promise<Client>

// Pedidos
export async function getOrders(filters?: OrderFilters): Promise<OrderWithClient[]>
export async function getOrderById(id: string): Promise<OrderWithDetails | null>
export async function createOrder(userId: string, data: CreateOrderRequest): Promise<Order>
export async function updateOrder(id: string, userId: string, data: UpdateOrderRequest): Promise<Order>
export async function cancelOrder(id: string, userId: string): Promise<Order>
export async function approveOrder(id: string, userId: string): Promise<ApproveOrderResult>

// Entregas
export async function getDeliveries(filters?: DeliveryFilters): Promise<DeliveryWithOrder[]>
export async function getDeliveriesByDriver(driverId: string): Promise<DeliveryWithOrder[]>
export async function assignDriver(deliveryId: string, driverId: string, userId: string): Promise<Delivery>
export async function updateDeliveryStatus(id: string, userId: string, data: UpdateDeliveryStatusRequest): Promise<Delivery>

// Facturas
export async function getInvoices(filters?: InvoiceFilters): Promise<InvoiceWithOrder[]>
export async function getInvoiceById(id: string): Promise<InvoiceWithDetails | null>
export async function voidInvoice(id: string, userId: string, reason: string): Promise<Invoice>

// Reportes
export async function getSalesReport(from: string, to: string): Promise<SalesReportData>
export async function getInventoryReport(from: string, to: string): Promise<InventoryReportData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica en servicios de dominio

**`lib/inventoryService.ts`**

```typescript
// Verifica suficiencia de TODOS los ítems antes de tocar el stock.
// Si algún tipo no tiene stock suficiente, lanza error con detalle exacto.
export async function deductStockForOrder(items: OrderItem[]): Promise<void>

// Recupera los ítems del pedido y suma de vuelta al inventario (RN-06).
// Registra movimientos de tipo 'devolucion' en inventory_movements.
export async function returnStockFromFailedDelivery(orderId: string): Promise<void>

// Inserta un registro en inventory_movements.
export async function recordMovement(data: MovementData): Promise<void>
```

**`lib/orderService.ts`**

```typescript
// Operación compuesta atómica (RN-11):
// 1. Verificar que order.status === 'pendiente'
// 2. Obtener todos los ítems del pedido
// 3. Verificar stock suficiente para CADA tipo — si alguno falla, retornar 409 sin tocar nada
// 4. deductStockForOrder (descuenta stock + registra movimientos de salida)
// 5. invoiceService.getNextInvoiceNumber + insertar en invoices
// 6. Insertar en deliveries con status 'pendiente_asignacion'
// 7. Actualizar orders.status = 'aprobado'
// Si cualquier paso falla después del 3, lanzar error — los pasos anteriores no se revierten
// (el punto de no retorno es el paso 4 — antes de ese punto, verificar todo)
export async function processOrderApproval(orderId: string, userId: string): Promise<ApproveOrderResult>

// Suma quantity * unit_price de cada ítem para calcular el total del pedido.
export function calculateOrderTotal(items: CreateOrderItemRequest[], eggTypes: EggType[]): number
```

**`lib/invoiceService.ts`**

```typescript
// Obtiene el siguiente número consecutivo de factura (RN-10).
// SELECT MAX(invoice_number) FROM invoices, retorna 1 si no hay facturas aún.
export async function getNextInvoiceNumber(): Promise<number>

// Genera el PDF de la factura con jsPDF y lo retorna como Buffer.
export async function generateInvoicePDF(invoice: InvoiceWithDetails): Promise<Buffer>
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users ──────────────────────── inventory_movements (recorded_by)
users ──────────────────────── orders (created_by, approved_by)
users ──────────────────────── deliveries (driver_id, assigned_by)
users ──────────────────────── invoices (voided_by)

egg_types ──1:1── inventory
egg_types ──────< inventory_movements
egg_types ──────< order_items

suppliers ──────< inventory_movements (supplier_id)
clients ────────< orders
orders ─────────< order_items
orders ─────1:1── deliveries
orders ─────1:1── invoices
```

> No existe tabla de auditoría en Postgres. La auditoría vive en Vercel Blob.

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL
                       CHECK (role IN ('admin','vendedor','bodeguero','conductor')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_inventory.sql`

```sql
CREATE TABLE IF NOT EXISTS egg_types (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name           VARCHAR(80)   NOT NULL,
  code           VARCHAR(5)    UNIQUE NOT NULL,  -- AA, A, B, XL
  price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit > 0),
  min_stock      INTEGER       NOT NULL DEFAULT 100 CHECK (min_stock >= 0),
  is_active      BOOLEAN       DEFAULT true,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- Una fila por tipo de huevo. El stock actual vive aquí.
CREATE TABLE IF NOT EXISTS inventory (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  egg_type_id   UUID    UNIQUE NOT NULL REFERENCES egg_types(id),
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Registro histórico de todos los movimientos de inventario.
CREATE TABLE IF NOT EXISTS inventory_movements (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  egg_type_id  UUID         NOT NULL REFERENCES egg_types(id),
  type         VARCHAR(12)  NOT NULL CHECK (type IN ('entrada','salida','devolucion','ajuste')),
  quantity     INTEGER      NOT NULL CHECK (quantity > 0),
  reference_id UUID,        -- pedido o entrega relacionada (nullable)
  supplier_id  UUID,        -- solo para entradas (nullable)
  notes        TEXT,
  recorded_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_egg_type ON inventory_movements(egg_type_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_date     ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_mov_type     ON inventory_movements(type);
```

### Migration `0003_init_suppliers.sql`

```sql
CREATE TABLE IF NOT EXISTS suppliers (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  contact    VARCHAR(100),
  phone      VARCHAR(20),
  address    TEXT,
  notes      TEXT,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0004_init_clients.sql`

```sql
CREATE TABLE IF NOT EXISTS clients (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  nit        VARCHAR(20)  UNIQUE NOT NULL,
  phone      VARCHAR(20),
  address    TEXT,
  notes      TEXT,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_nit ON clients(nit);
```

### Migration `0005_init_orders.sql`

```sql
CREATE TABLE IF NOT EXISTS orders (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID          NOT NULL REFERENCES clients(id),
  status      VARCHAR(12)   NOT NULL DEFAULT 'pendiente'
              CHECK (status IN ('pendiente','aprobado','cancelado')),
  total       DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes       TEXT,
  created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID          REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Nota: unit_price es snapshot del precio vigente al momento de crear el pedido (RN-05).
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  egg_type_id UUID          NOT NULL REFERENCES egg_types(id),
  quantity    INTEGER       NOT NULL CHECK (quantity >= 30),  -- RN-04: mínimo 30 (1 cartón)
  unit_price  DECIMAL(10,2) NOT NULL,                         -- snapshot del precio
  subtotal    DECIMAL(12,2) NOT NULL,                         -- quantity * unit_price
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items   ON order_items(order_id);
```

### Migration `0006_init_deliveries_invoices.sql`

```sql
-- Relación 1:1 con orders. Se crea automáticamente al aprobar un pedido.
CREATE TABLE IF NOT EXISTS deliveries (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID        UNIQUE NOT NULL REFERENCES orders(id),
  driver_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  status         VARCHAR(25) NOT NULL DEFAULT 'pendiente_asignacion'
                 CHECK (status IN ('pendiente_asignacion','asignada','en_camino','entregada','fallida')),
  incident_note  TEXT,
  assigned_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  assigned_at    TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Relación 1:1 con orders. Se crea automáticamente al aprobar un pedido (RN-07).
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID          UNIQUE NOT NULL REFERENCES orders(id),
  invoice_number INTEGER       UNIQUE NOT NULL,  -- número consecutivo (RN-10)
  total          DECIMAL(12,2) NOT NULL,
  is_voided      BOOLEAN       DEFAULT false,
  void_reason    TEXT,
  voided_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  voided_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number   ON invoices(invoice_number DESC);
```

---

## 13. Auditoría en Vercel Blob

### 13.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;            // ISO 8601
  user_id: string;
  user_email: string;
  user_role: 'admin' | 'vendedor' | 'bodeguero' | 'conductor';
  action:
    | 'login' | 'logout'
    | 'create_order' | 'cancel_order' | 'approve_order'
    | 'stock_entry' | 'stock_return' | 'stock_adjust'
    | 'update_delivery' | 'void_invoice'
    | 'update_prices' | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'order' | 'inventory' | 'delivery' | 'invoice' | 'user' | 'system';
  entity_id?: string;
  summary: string;              // "Pedido #42 aprobado. Factura #015 generada."
  metadata?: Record<string, unknown>;
};
```

### 13.2 Implementación de `lib/blobAudit.ts`

Idéntica al patrón de los demás proyectos del curso:
- `getBlobToken()` lazy — nunca constante de módulo (falla en build time).
- `get()` del SDK de Blob — nunca `fetch(url)` para blobs privados (401 silencioso).
- `withFileLock()` para serializar read-modify-write al mismo archivo mensual.
- `appendAudit(entry)` y `readAuditMonth(yyyymm)` como funciones exportadas.

### 13.3 Estimación de uso

Una distribuidora activa con ~50 pedidos diarios genera ~200 entradas de auditoría al día (~80 KB/día). En 1 año: ~30 MB. Plan gratuito de Vercel Blob: 1 GB.

---

## 14. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx
  login/page.tsx
  dashboard/page.tsx
  inventory/
    page.tsx              ← Stock actual con alertas (admin/vendedor/bodeguero)
    movements/page.tsx    ← Historial de movimientos
    entry/page.tsx        ← Registrar entrada (bodeguero/admin)
    prices/page.tsx       ← Configurar precios y mínimos (admin)
  suppliers/
    page.tsx
    new/page.tsx
    [id]/page.tsx
  clients/
    page.tsx
    new/page.tsx
    [id]/page.tsx
  orders/
    page.tsx              ← Lista de pedidos
    new/page.tsx          ← Crear pedido
    [id]/page.tsx         ← Detalle con ítems, estado, factura
    [id]/approve/page.tsx ← Panel de aprobación (admin)
  deliveries/
    page.tsx              ← Todas las entregas (admin/vendedor)
    my/page.tsx           ← Mis entregas (conductor)
    [id]/page.tsx         ← Detalle y actualización de estado
  invoices/
    page.tsx
    [id]/page.tsx
  reports/
    page.tsx
    sales/page.tsx
    inventory/page.tsx
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    inventory/
      route.ts            ← GET stock con alertas
      entry/route.ts      ← POST entrada de proveedor
      movements/route.ts  ← GET historial
      [id]/route.ts       ← PATCH precio y stock mínimo (admin)
    suppliers/ route.ts | [id]/route.ts
    clients/   route.ts | [id]/route.ts
    orders/
      route.ts            ← GET lista | POST crear
      [id]/route.ts       ← GET | PUT (editar) | DELETE (cancelar)
      [id]/approve/route.ts ← POST aprobar (dispara la operación compuesta)
    deliveries/
      route.ts            ← GET todas
      my/route.ts         ← GET del conductor autenticado
      [id]/route.ts       ← GET | PATCH asignar conductor
      [id]/status/route.ts ← PATCH actualizar estado (conductor/admin)
    invoices/
      route.ts | [id]/route.ts
      [id]/pdf/route.ts   ← GET genera y descarga PDF
      [id]/void/route.ts  ← POST anular (admin)
    reports/sales/route.ts | inventory/route.ts
    users/ route.ts | [id]/route.ts
    audit/route.ts
    dashboard/route.ts

components/
  ui/
  layout/                ← AppLayout, Sidebar (filtrado por rol), SeedModeBanner
  inventory/             ← StockCard, StockAlert, MovementTable, EntryForm
  orders/                ← OrderForm, OrderItemRow, OrderStatusBadge, ApprovalPanel
  deliveries/            ← DeliveryCard, DeliveryStatusBadge, DriverView
  invoices/              ← InvoiceDetail, InvoicePDFButton
  reports/               ← ReportFilters, SalesTable, InventoryMovementsTable
  admin/                 ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  inventoryService.ts | orderService.ts | invoiceService.ts | reportService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts

supabase/migrations/
data/
doc/
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El panel de inventario debe cargar en menos de 2 segundos con alertas actualizadas. |
| RNF-02 | La aprobación de un pedido (stock + factura + entrega) debe completarse en menos de 3 segundos. |
| RNF-03 | La generación de PDF de factura debe completarse en menos de 5 segundos. |
| RNF-04 | El conductor debe poder actualizar su entrega desde un celular sin ningún problema. |
| RNF-05 | Las contraseñas deben hashearse con bcrypt antes de guardarse. |
| RNF-06 | Las sesiones deben gestionarse con JWT en cookie HttpOnly, nunca localStorage. |
| RNF-07 | Toda escritura crítica debe quedar registrada en auditoría de Blob. |
| RNF-08 | El sistema debe ser completamente funcional en celulares, especialmente la vista del conductor. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

Igual que los demás proyectos: login con admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live activo.

### Flujo completo de un pedido

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Vendedor | Crea el pedido: selecciona cliente, agrega ítems. El sistema calcula el total al precio vigente. |
| 2 | Vendedor | Confirma. Estado: `pendiente`. |
| 3 | Admin | Ve el pedido pendiente en el dashboard. |
| 4 | Admin | Aprueba el pedido: el sistema verifica stock → descuenta → genera factura → crea entrega en `pendiente_asignacion`. |
| 5 | Admin | Asigna un conductor a la entrega. Estado: `asignada`. |
| 6 | Conductor | Ve la entrega. Sale a entregar. Marca como `en_camino`. |
| 7 | Conductor | Entrega el pedido. Marca como `entregada`. |

### Flujo de entrega fallida (RN-06)

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Conductor | No puede entregar. Marca `fallida` y agrega nota de incidencia. |
| 2 | Sistema | Detecta el estado `fallida`. Llama a `inventoryService.returnStockFromFailedDelivery(orderId)`. |
| 3 | Sistema | Recupera ítems del pedido, suma cantidades al inventario, registra movimientos tipo `devolucion`. |
| 4 | Admin | Ve alerta en el dashboard: entrega fallida + stock devuelto. |

---

## 17. Diseño de interfaz

### Identidad visual del Login

OvoGest es un sistema de distribución comercial. El login transmite profesionalismo y eficiencia operativa.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado vertical y horizontalmente. |
| **Fondo** | Blanco frío (`#F8FAFC`) con textura de puntos muy sutil. En desktop, bloque decorativo ámbar oscuro (`#92400E`) cubriendo el 40% derecho de la pantalla. |
| **Tarjeta del formulario** | Sobre el lado blanco. Fondo blanco, `border-radius: 10px`, sombra suave, borde superior de 4px en ámbar (`#D97706`), max-w-sm. |
| **Logo** | SVG inline de un cartón de huevos estilizado (vista superior, líneas geométricas simples) en ámbar oscuro (`#92400E`), 52×52px. |
| **Nombre** | "OvoGest" en Inter Bold 28px, slate oscuro (`#1E293B`). |
| **Tagline** | "Gestión de distribución mayorista." Inter Regular 13px, slate medio (`#64748B`). |
| **Campos** | Borde gris frío (`#CBD5E1`), focus en ámbar (`#D97706`). |
| **Botón principal** | "Ingresar" — ámbar `#D97706`, texto blanco, `border-radius: 8px`, hover `#B45309`. |
| **Pie** | Texto pequeño: "Distribuidora Mayorista de Huevos". Sin link de "Crear cuenta". |
| **Animación** | Framer Motion: tarjeta con `opacity: 0→1` y `x: -16→0`, duración 0.4s, ease `easeOut`. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Fondo principal | `#F8FAFC` (slate 50) |
| Fondo de tarjetas | `#FFFFFF` |
| Fondo alterno | `#F1F5F9` (slate 100) |
| Primario (ámbar) | `#D97706` |
| Primario oscuro | `#B45309` |
| Primario muy oscuro | `#92400E` |
| Texto principal | `#1E293B` (slate 800) |
| Texto secundario | `#64748B` (slate 500) |
| Stock OK | `#15803D` + fondo `#F0FDF4` |
| Stock bajo / alerta | `#D97706` + fondo `#FFFBEB` |
| Pedido pendiente | `#64748B` |
| Pedido aprobado | `#15803D` |
| Pedido cancelado | `#B91C1C` |
| Entrega fallida | `#B91C1C` |
| Entrega entregada | `#15803D` |
| Error | `#DC2626` |
| Bordes | `#E2E8F0` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Tipografía

Inter para todo el sistema. Títulos: 24px Bold. Secciones: 18px SemiBold. Cuerpo: 14px Regular. Precios y totales: 16px Medium. Número de factura: 14px Bold.

### Componentes clave

| Componente | Descripción |
|---|---|
| `StockCard` | Tarjeta por tipo de huevo: nombre, código, stock actual, precio unitario. Fondo verde (OK) o naranja (alerta) según si `current_stock < min_stock`. |
| `StockAlert` | Banner naranja persistente en el dashboard con la lista de tipos en alerta y su stock actual. |
| `OrderStatusBadge` | Badge de color por estado: `pendiente` (gris), `aprobado` (verde), `cancelado` (rojo). |
| `OrderItemRow` | Fila editable en el formulario de pedido: selector de tipo de huevo, input de cantidad (mínimo 30), precio unitario y subtotal calculado en tiempo real. |
| `ApprovalPanel` | Panel del admin para revisar un pedido antes de aprobar: tabla de ítems con verificación de stock disponible por tipo, total del pedido, botón "Aprobar pedido". |
| `DeliveryCard` | Card optimizada para el conductor: dirección y nombre del cliente, lista de ítems, estado actual, botones grandes de actualización. |
| `InvoicePDFButton` | Botón con spinner que llama a `/api/invoices/[id]/pdf` y descarga el archivo. |
| `SeedModeBanner` | Banner amarillo cuando el sistema está en modo seed. Solo visible para admin. |
| `AuditViewer` | Tabla con selector de mes, muestra timestamp, usuario, acción y summary. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo. Dashboard con grilla de 3–4 columnas. Tablas densas. |
| Tablet (768–1023px) | Sidebar colapsable. Tablas con scroll horizontal. |
| Celular (<768px) | Bottom navigation. Vista del conductor con botones de estado grandes y sin scroll lateral. |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad
> Reemplaza el "Hola Mundo". Establece la arquitectura completa de persistencia.

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado en Vercel. Configurar todas las variables de entorno en `.env.local` y en Vercel. |
| 1.3 | Crear `data/seed.json` con admin inicial (password `admin123` hasheado con bcrypt 10 rounds) y los 4 tipos de huevo con precios y stock mínimo. `data/config.json` y `data/README.md`. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql` con tabla `users` (incluyendo `must_change_password`) y `_migrations`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (con `getBlobToken` lazy, `withFileLock`, `get()` del SDK, nunca `fetch(url)`), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. En modo `seed` enruta a `seedReader`; en `live` a Supabase. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts` (agrega `Cache-Control: no-store` a cada respuesta), `lib/withRole.ts`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | Crear `lib/types.ts` y `lib/schemas.ts` con tipos y schemas Zod de auth. |
| 1.10 | Crear API Routes: `POST /api/system/bootstrap`, `GET /api/system/diagnose`, `GET /api/system/mode`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`. |
| 1.11 | Crear `app/login/page.tsx` con la identidad visual de OvoGest: logo SVG de cartón de huevos, paleta ámbar/slate, bloque decorativo derecho en desktop, animación Framer Motion. Sin link de "Crear cuenta". |
| 1.12 | Actualizar `app/page.tsx`: redirige a `/dashboard` o `/login` según sesión. |
| 1.13 | `npm run typecheck` sin errores. Probar: login admin del seed → `/api/system/mode` retorna `seed` → cookie HttpOnly verificada en DevTools. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base en `components/ui/`: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta en `globals.css`. Configurar Inter con `next/font`. |
| 2.3 | Crear `components/layout/AppLayout.tsx`: sidebar (desktop), bottom nav (mobile). El sidebar filtra ítems según rol: conductor solo ve sus entregas, bodeguero solo ve inventario y proveedores, vendedor ve pedidos y clientes, admin ve todo. |
| 2.4 | Crear `app/admin/db-setup/page.tsx`: tab Diagnóstico (estado Supabase, Blob, migrations, conteos por tabla) y tab Bootstrap (botón ejecutar con confirmación). |
| 2.5 | Crear `components/layout/SeedModeBanner.tsx`: banner amarillo hasta completar el bootstrap. Solo admin. |
| 2.6 | Crear `GET /api/dashboard`: datos según rol. Admin: stock en alerta, pedidos pendientes de aprobación, entregas sin asignar. Vendedor: pedidos del día. Bodeguero: últimas entradas al inventario. Conductor: entregas asignadas hoy. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx` con tarjetas por rol y banner de modo seed. |
| 2.8 | Crear `middleware.ts`: protege rutas privadas, verifica rol para `/admin/*`. |
| 2.9 | Probar el flujo completo: login admin → banner → `/admin/db-setup` → ejecutar bootstrap (4 tipos de huevo + admin insertados) → verificar modo live activo. |

---

### Fase 3 — Tipos de Huevo e Inventario
> Rol: Ingeniero Fullstack Senior

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_inventory.sql`. Aplicar desde `/admin/db-setup` (re-ejecutar bootstrap). |
| 3.2 | Al aplicar la migration, el bootstrap también crea las filas de `inventory` para cada tipo de huevo del seed con `current_stock = 0`. |
| 3.3 | Crear `lib/inventoryService.ts`: `deductStockForOrder`, `returnStockFromFailedDelivery`, `recordMovement`. |
| 3.4 | Extender `dataService`: `getInventoryWithAlerts` (JOIN `egg_types` + `inventory`, campo `isAlert = current_stock < min_stock`), `updateEggType` (admin — precios y stock mínimo), `registerStockEntry` (valida proveedor, suma al `inventory.current_stock`, inserta en `inventory_movements` tipo `entrada`), `getInventoryMovements` (con filtros por tipo, tipo de movimiento y fechas). |
| 3.5 | API Routes: `GET /api/inventory` (admin/vendedor/bodeguero), `POST /api/inventory/entry` (admin/bodeguero), `GET /api/inventory/movements`, `PATCH /api/inventory/[id]` (admin). |
| 3.6 | Crear `app/inventory/page.tsx`: grilla de `StockCard` por tipo. `StockAlert` si hay tipos en alerta. |
| 3.7 | Crear `app/inventory/entry/page.tsx`: formulario con selector de tipo, cantidad, proveedor y fecha. |
| 3.8 | Crear `app/inventory/movements/page.tsx`: historial filtrable. |
| 3.9 | Crear `app/inventory/prices/page.tsx` (solo admin): inputs de precio y stock mínimo editables por tipo. |
| 3.10 | Integrar `StockAlert` en el dashboard con datos reales. |

---

### Fase 4 — Proveedores
> Rol: Ingeniero Backend Senior

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_suppliers.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Extender `dataService`: `getSuppliers`, `createSupplier`, `updateSupplier`. Soft delete (`is_active=false`) si tiene movimientos de inventario. |
| 4.3 | API Routes: `GET/POST /api/suppliers` (admin para escritura), `GET/PUT /api/suppliers/[id]` (admin). |
| 4.4 | Crear `app/suppliers/page.tsx`, `app/suppliers/new/page.tsx`, `app/suppliers/[id]/page.tsx` con historial de entradas del proveedor. |

---

### Fase 5 — Clientes
> Rol: Ingeniero Backend Senior + Diseñador Frontend

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0004_init_clients.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Extender `dataService`: `getClients`, `createClient`, `updateClient`. NIT UNIQUE en Postgres — verificar duplicados antes de insertar. Soft delete si tiene pedidos. |
| 5.3 | API Routes: `GET/POST /api/clients` (admin/vendedor), `GET/PUT /api/clients/[id]` (admin/vendedor). |
| 5.4 | Crear `app/clients/page.tsx`, `app/clients/new/page.tsx`, `app/clients/[id]/page.tsx` con historial de pedidos del cliente. |

---

### Fase 6 — Pedidos y Aprobación
> Rol: Ingeniero Fullstack Senior — Lógica compuesta más crítica del sistema

| # | Tarea |
|---|---|
| 6.1 | Crear `supabase/migrations/0005_init_orders.sql`. Aplicar desde `/admin/db-setup`. |
| 6.2 | Crear `lib/orderService.ts` con `processOrderApproval` (descrito en sección 11.4) y `calculateOrderTotal`. |
| 6.3 | Agregar tipo `Order`, `OrderWithDetails`, `OrderWithClient`, `CreateOrderRequest`, `CreateOrderItemRequest` (con validación `quantity >= 30`) y schemas Zod a `lib/types.ts` y `lib/schemas.ts`. |
| 6.4 | Extender `dataService`: `createOrder` (captura snapshot de precio en cada ítem — RN-05), `updateOrder`, `cancelOrder` (valida RN-03), `approveOrder` (delega a `orderService.processOrderApproval`). Cada escritura llama `recordAudit`. |
| 6.5 | API Routes: `GET/POST /api/orders`, `GET/PUT /api/orders/[id]`, `POST /api/orders/[id]/approve` (admin), `POST /api/orders/[id]/cancel` (admin/vendedor). |
| 6.6 | Crear `app/orders/page.tsx`: tabla con filtros por estado, cliente y fecha. Badges de estado. |
| 6.7 | Crear `app/orders/new/page.tsx`: selector de cliente, `OrderItemRow` con cálculo en tiempo real de subtotal y total. Botón "Crear pedido". |
| 6.8 | Crear `app/orders/[id]/page.tsx`: detalle con ítems, estado, factura asociada y entrega. |
| 6.9 | Crear `app/orders/[id]/approve/page.tsx` (solo admin): `ApprovalPanel` con verificación de stock por tipo antes de confirmar. |

---

### Fase 7 — Entregas e Inventario Devuelto (RN-06)
> Rol: Ingeniero Fullstack — Seguimiento de campo

| # | Tarea |
|---|---|
| 7.1 | Crear `supabase/migrations/0006_init_deliveries_invoices.sql`. Aplicar desde `/admin/db-setup`. |
| 7.2 | La tabla `invoices` ya se creó en esta migration — el `orderService` ya la usa desde la Fase 6. |
| 7.3 | Extender `dataService`: `getDeliveries` (con JOIN a `orders`, `clients`), `getDeliveriesByDriver` (filtra por `driver_id` del JWT), `assignDriver` (admin — cambia a `asignada`), `updateDeliveryStatus`. |
| 7.4 | En `updateDeliveryStatus`: si el nuevo estado es `fallida`, llamar `inventoryService.returnStockFromFailedDelivery(orderId)`. Si es `entregada`, registrar `delivered_at = NOW()`. Siempre llama `recordAudit`. |
| 7.5 | API Routes: `GET /api/deliveries` (admin/vendedor), `GET /api/deliveries/my` (conductor — filtra por su `driver_id`), `PATCH /api/deliveries/[id]` (asignar conductor — admin), `PATCH /api/deliveries/[id]/status` (conductor y admin). |
| 7.6 | Crear `app/deliveries/page.tsx`: lista con filtros (admin/vendedor). |
| 7.7 | Crear `app/deliveries/my/page.tsx` (conductor): lista de sus entregas del día, vista optimizada para celular con botones grandes de actualización de estado. |
| 7.8 | Crear `app/deliveries/[id]/page.tsx`: detalle con datos del cliente, ítems del pedido, estado actual, nota de incidencia. |

---

### Fase 8 — Facturas y Reportes
> Rol: Ingeniero Backend Senior — Documentos y exportación

| # | Tarea |
|---|---|
| 8.1 | Instalar: `jspdf jspdf-autotable xlsx` |
| 8.2 | Crear `lib/invoiceService.ts`: `getNextInvoiceNumber` y `generateInvoicePDF`. |
| 8.3 | Crear `lib/reportService.ts`: `generateSalesReportPDF`, `generateSalesReportExcel`, `generateInventoryReportPDF`, `generateInventoryReportExcel`. |
| 8.4 | Extender `dataService`: `getInvoices`, `getInvoiceById`, `voidInvoice` (solo cambia `is_voided=true` y guarda razón). |
| 8.5 | API Routes: `GET/POST /api/invoices`, `GET /api/invoices/[id]`, `GET /api/invoices/[id]/pdf` (genera PDF en servidor, headers de descarga), `POST /api/invoices/[id]/void` (admin). |
| 8.6 | API Routes: `GET /api/reports/sales?from=&to=&format=json|pdf|xlsx` (admin), `GET /api/reports/inventory?from=&to=&format=json|pdf|xlsx` (admin). |
| 8.7 | Crear `app/invoices/page.tsx` y `app/invoices/[id]/page.tsx` con `InvoicePDFButton` y botón de anular para admin. |
| 8.8 | Crear `app/reports/page.tsx`: centro de reportes. Sub-páginas `sales/` e `inventory/` con selector de fechas y botones PDF/Excel. Sin datos en el período → 404 con toast de error. |

---

### Fase 9 — Administración de Usuarios
> Rol: Ingeniero Fullstack Senior

| # | Tarea |
|---|---|
| 9.1 | API Routes con `withRole(['admin'])`: `GET/POST /api/users`, `GET/PUT/DELETE /api/users/[id]`. |
| 9.2 | El POST genera contraseña temporal con `crypto.randomBytes` (12 caracteres alfanuméricos), la hashea con bcrypt, marca `must_change_password=true`, retorna EN CLARO una sola vez. Modal con "Copiar" y advertencia clara. |
| 9.3 | En el login: si `must_change_password=true`, redirigir a `/change-password`. Después del cambio, marcar `must_change_password=false`. |
| 9.4 | Crear `app/admin/users/page.tsx`: tabla con nombre, email, rol, estado, último acceso. Acciones: activar/suspender, eliminar. |
| 9.5 | El admin no puede eliminar ni suspender su propia cuenta. Verificación explícita en la API. |
| 9.6 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con selector de mes. Lee de `dataService.readAuditMonth()`. |
| 9.7 | API Route `GET /api/audit?month=YYYYMM` con `withRole(['admin'])`. |

---

### Fase 10 — Pulido final y Deploy
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 10.1 | Auditoría de empty states en todos los módulos. Mensajes contextuales con CTA según el rol. |
| 10.2 | Manejo de errores global: red, 401 (sesión expirada), 403 (sin permisos), 409 (stock insuficiente — mensaje específico con qué tipos faltan), 500. Toasts apropiados. |
| 10.3 | Vista del conductor en celular (375px): flujo completo desde ver entrega hasta marcarla entregada. Botones de estado de al menos 44px de alto. Sin necesidad de zoom ni scroll lateral. |
| 10.4 | Verificar que cada rol solo accede a lo que le corresponde, probando las URLs directamente en el navegador y las API Routes con las credenciales de cada rol. |
| 10.5 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores y cero warnings. |
| 10.6 | Verificar que ningún componente cliente importa variables privadas de entorno ni módulos de `lib/` directamente. |
| 10.7 | Deploy en Vercel con todas las variables de entorno configuradas. |
| 10.8 | Probar en producción con los 4 roles: admin hace bootstrap → crea un usuario por cada rol → vendedor crea pedido → admin aprueba → conductor actualiza entrega → verificar que el stock vuelve si se marca fallida. |

---

## 19. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod (loginSchema)
2. dataService.getUserByEmail(email)  ← enruta a seed o Postgres
3. Verificar is_active y password con bcrypt.compare()
4. Si must_change_password: JWT con flag → redirect /change-password
5. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
6. dataService.recordAudit({ action: 'login', ... })
7. Retornar SafeUser (sin password_hash)
```

### Protección por rol

```typescript
// Inventario: withRole(['admin', 'vendedor', 'bodeguero']) para lectura
//             withRole(['admin', 'bodeguero']) para registro de entradas
//             withRole(['admin']) para ajuste de precios y stock mínimo

// Pedidos: withRole(['admin', 'vendedor']) para crear/editar
//          withRole(['admin']) para aprobar

// Entregas: withRole(['admin']) para asignar conductor
//           withRole(['conductor']) + verificar driver_id === userId para actualizar estado

// Facturas: withRole(['admin', 'vendedor']) para ver/descargar
//           withRole(['admin']) para anular

// Reportes: withRole(['admin']) en todos
// Usuarios: withRole(['admin']) en todos
```

### La operación `approveOrder` — punto más crítico del sistema

Antes de persistir cualquier cambio:
1. Obtener todos los ítems del pedido.
2. Verificar stock para TODOS los ítems. Si alguno falla → retornar 409 con detalle exacto SIN tocar ninguna tabla.
3. Solo entonces ejecutar: descuento de stock → número de factura → insertar factura → insertar entrega → actualizar pedido.

### Headers de caché — triple defensa

```typescript
// next.config.ts: no-store para /api/:path*
// withAuth: no-store en cada respuesta
// Rutas públicas sin auth: headers explícitos en el route handler
```

---

## 20. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin procesamiento de pagos | El sistema calcula totales y genera facturas, pero no procesa pagos en línea. |
| RS-02 | Sin portal de clientes | En v1 el vendedor gestiona pedidos en nombre del cliente. Sin login externo. |
| RS-03 | Sin portal de proveedores | En v1 el bodeguero registra entradas. Sin confirmación automática desde la granja. |
| RS-04 | Bootstrap obligatorio | Hasta no aplicar migrations + seed, el sistema solo permite login admin. |
| RS-05 | Auditoría no editable | Append-only en Blob. |
| RS-06 | Una entrega por pedido | La relación `deliveries → orders` es 1:1 (UNIQUE en `order_id`). |
| RS-07 | Tipos de huevo del seed | El seed carga 4 tipos (AA, A, B, XL). El admin puede agregar más desde el sistema. |
| RS-08 | Requiere conexión a internet | No hay modo offline. |

---

## 21. Glosario

| Término | Definición |
|---|---|
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed para activar Supabase. |
| **Modo seed** | Estado antes del bootstrap. Solo permite login admin. |
| **Modo live** | Estado normal. Persiste en Supabase. |
| **Migration** | Archivo SQL versionado en `supabase/migrations/` que crea o modifica el esquema. |
| **Seed** | Datos iniciales en `data/seed.json`. Admin + 4 tipos de huevo. |
| **dataService** | Único punto de acceso a datos. Encapsula Supabase, Blob y el seed reader. |
| **Snapshot de precio** | El precio del ítem se copia al crear el pedido. Cambios futuros no afectan pedidos pasados. |
| **Aprobación compuesta** | `approveOrder` como operación atómica: stock + factura + entrega. |
| **Tipo de huevo** | Clasificación: AA (primera calidad), A, B, Extra Grande (XL). |
| **Cartón** | Unidad mínima de pedido: 30 unidades (RN-04). |
| **Lote** | Conjunto de huevos recibidos de un proveedor en una entrada al inventario. |
| **Stock mínimo** | Umbral configurable por el admin. Disparador de alertas automáticas. |
| **Nota de crédito** | Anulación de una factura sin eliminarla del sistema. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> María Lascarro — Doc: 1082919708
> Curso: Lógica y Programación — SIST0200
