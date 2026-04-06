# 📦 PLAN DEL PROYECTO — App de Gestión de Inventario

## 1. Descripción General
Sistema web de gestión de inventario para empresas y bodegas, que permite controlar entradas y salidas de productos, gestionar múltiples bodegas, emitir alertas de stock mínimo, generar reportes y estadísticas, y operar con códigos de barras y QR.

---

## 2. Objetivos del Proyecto
- Digitalizar el control de inventario de la empresa.
- Minimizar pérdidas por falta de control de stock.
- Permitir trazabilidad completa de movimientos de productos.
- Centralizar la gestión de múltiples bodegas desde un solo sistema.
- Facilitar la toma de decisiones con reportes en tiempo real.

---

## 3. Alcance

### ✅ Incluido
- Autenticación y roles de usuario (Admin, Bodeguero, Visualizador)
- CRUD de productos con categorías y unidades de medida
- CRUD de bodegas / ubicaciones
- Registro de entradas y salidas de productos
- Control de stock en tiempo real por bodega
- Alertas automáticas de stock mínimo
- Generación y lectura de códigos de barras y QR
- Dashboard con estadísticas e indicadores clave
- Reportes exportables (PDF / Excel)
- Historial de movimientos con filtros

### ❌ Excluido (v1)
- Módulo de ventas / POS
- Integración con proveedores externos
- App móvil nativa
- Facturación electrónica

---

## 4. Stack Tecnológico Recomendado

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (React) + Tailwind CSS |
| Backend | Node.js + Express o Next.js API Routes |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | NextAuth.js |
| Códigos QR/Barras | `qrcode` + `jsbarcode` + `quagga2` |
| Reportes | `pdfkit` + `exceljs` |
| Despliegue | Vercel (frontend) + Railway/Supabase (BD) |

---

## 5. Arquitectura del Sistema

```
┌─────────────────────────────────────────────┐
│               CLIENTE (Browser)              │
│         Next.js 14 + Tailwind CSS            │
└───────────────────┬─────────────────────────┘
                    │ HTTP / REST API
┌───────────────────▼─────────────────────────┐
│              API LAYER                       │
│         Next.js API Routes / Express         │
│  Auth │ Productos │ Bodegas │ Movimientos     │
│  Alertas │ Reportes │ QR/Barras              │
└───────────────────┬─────────────────────────┘
                    │ Prisma ORM
┌───────────────────▼─────────────────────────┐
│            BASE DE DATOS                     │
│               PostgreSQL                     │
│  users │ products │ warehouses │ movements   │
│  categories │ alerts │ stock_levels           │
└─────────────────────────────────────────────┘
```

---

## 6. Módulos del Sistema

### 6.1 Autenticación y Usuarios
- Login / Logout seguro
- Roles: Admin, Bodeguero, Visualizador
- Gestión de usuarios por Admin

### 6.2 Productos
- Registro con nombre, SKU, descripción, categoría, unidad
- Imagen del producto
- Stock mínimo configurable por producto
- Código de barras / QR generado automáticamente

### 6.3 Bodegas / Ubicaciones
- Registro de múltiples bodegas
- Stock independiente por bodega
- Transferencias entre bodegas

### 6.4 Movimientos
- Entrada de productos (compras, devoluciones)
- Salida de productos (ventas, consumo, merma)
- Transferencia entre bodegas
- Cada movimiento registra: usuario, fecha, cantidad, motivo

### 6.5 Alertas
- Notificación en dashboard cuando stock < mínimo
- Indicador visual por producto y bodega
- Historial de alertas

### 6.6 Reportes
- Reporte de stock actual por bodega
- Reporte de movimientos por rango de fecha
- Reporte de productos con stock crítico
- Exportación a PDF y Excel

### 6.7 Dashboard
- Total de productos registrados
- Productos con stock crítico
- Últimos movimientos
- Gráficas de entradas vs salidas
- Stock por bodega (comparativa)

---

## 7. Modelo de Datos (Simplificado)

```
User         { id, name, email, password, role }
Category     { id, name }
Product      { id, sku, name, description, category_id, unit, min_stock, barcode, image }
Warehouse    { id, name, location, description }
StockLevel   { id, product_id, warehouse_id, quantity }
Movement     { id, product_id, warehouse_id, type, quantity, reason, user_id, created_at }
Transfer     { id, product_id, from_warehouse_id, to_warehouse_id, quantity, user_id, created_at }
Alert        { id, product_id, warehouse_id, triggered_at, resolved_at }
```

---

## 8. Roles y Permisos

| Acción | Admin | Bodeguero | Visualizador |
|--------|-------|-----------|--------------|
| Ver inventario | ✅ | ✅ | ✅ |
| Registrar movimientos | ✅ | ✅ | ❌ |
| Crear/editar productos | ✅ | ✅ | ❌ |
| Gestionar bodegas | ✅ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Ver reportes | ✅ | ✅ | ✅ |
| Exportar reportes | ✅ | ✅ | ❌ |

---

## 9. Criterios de Éxito
- Sistema funcional con todos los módulos del alcance
- Tiempo de carga < 2 segundos por página
- Cobertura de pruebas > 70%
- Documentación técnica completa
- Despliegue exitoso en entorno productivo
