# PROMPTS DE IMPLEMENTACIÓN — OvoGest
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_OVODIST.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_OVODIST.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_OVODIST.md
2. Leer doc/ESTADO_EJECUCION_OVODIST.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer doc/PLAN_OVODIST.md
y crear el archivo doc/ESTADO_EJECUCION_OVODIST.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, persistencia y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de la primera experiencia visual del usuario en sistemas empresariales.

Tu mentalidad: en Vercel el filesystem es de solo lectura en runtime — cada
dato que no vaya a Supabase o a Blob se pierde cuando la instancia muere.
La arquitectura de esta fase no es negociable: dataService como único punto
de acceso, blobAudit como módulo interno, tokens lazy, cero caché en memoria,
headers no-store en toda la cadena. OvoGest tiene 4 roles distintos desde el
primer día — el JWT debe cargar el rol en su payload porque todo el sistema
de permisos depende de eso.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — especialmente las secciones 8 (stack y variables
   de entorno), 9 (reglas de oro de la arquitectura de persistencia), 10
   (estructura de data/ y del bootstrap — nota que el seed incluye tanto el
   admin como los 4 tipos de huevo), 11 (estructura interna de lib/ y
   la API pública del dataService), 13 (implementación de blobAudit con
   withFileLock y getBlobToken lazy) y 17 (identidad visual del login)
2. doc/ESTADO_EJECUCION_OVODIST.md — registra el inicio de la Fase 1

El plan tiene todo lo que necesitas: SQL de la migration 0001, la estructura
exacta de data/seed.json con los 4 tipos de huevo, las funciones de auth.ts,
el patrón de withAuth y withRole, los endpoints necesarios y la especificación
visual del login (paleta ámbar/slate, bloque decorativo derecho en desktop,
logo de cartón de huevos, sin link de Crear cuenta).

Puntos críticos que no puedes ignorar:

— El seed.json incluye tanto el usuario admin como los 4 tipos de huevo.
  El seedReader debe exponer ambos. El dataService en modo seed permite
  leer los tipos de huevo (para mostrarlos si alguien navega antes del
  bootstrap), pero bloquea cualquier escritura que no sea el login del admin.

— El JWT debe incluir el rol en su payload: { userId, role, email }.
  OvoGest tiene 4 roles con permisos muy distintos — el role en el JWT
  es la base de withRole y de la lógica del sidebar en el frontend.

— withRole necesita estar listo en esta fase aunque los módulos de dominio
  aún no existan. La Fase 2 ya lo usará para proteger /admin/*.

— El token de Blob se accede siempre con getBlobToken() como función lazy,
  nunca como constante de módulo. Si lo defines como const TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN en el cuerpo del módulo, fallará
  en build time porque las variables de entorno no existen en ese momento.

— La auditoría usa get() del SDK de @vercel/blob, nunca fetch(url). Los
  blobs privados devuelven 401 silencioso con fetch — el error nunca aparece,
  simplemente no hay datos y nadie sabe por qué.

— withFileLock serializa las escrituras al mismo archivo de auditoría dentro
  de la misma instancia. Sin él, dos requests concurrentes pueden leer el
  mismo array, ambos hacen push, y el segundo sobrescribe al primero.

— dataService.ts es el ÚNICO archivo que importa supabase.ts y blobAudit.ts.
  Las API Routes importan solo de dataService. Ningún componente del cliente
  importa ningún archivo de lib/ directamente.

— El error de login es siempre genérico: "Correo o contraseña incorrectos".
  Nunca especificar si el correo no existe o la contraseña está mal.

— Cookie de sesión: HttpOnly, Secure, SameSite=Strict. Nunca localStorage.

— La identidad visual del login no es opcional: logo SVG de cartón de huevos
  estilizado (vista superior, líneas geométricas simples), paleta ámbar y
  slate, bloque decorativo ámbar oscuro a la derecha en desktop, animación
  Framer Motion. El plan describe todo esto en la sección 17 — úsalo.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → /api/system/mode retorna 'seed' → cookie
  HttpOnly verificada en DevTools → logout → /dashboard sin sesión redirige a /login
- Registra el cierre en ESTADO_EJECUCION_OVODIST.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. OvoGest tiene 4 roles con necesidades completamente
distintas. El layout no es un componente único — es un componente que sabe
quién lo está usando y muestra solo lo relevante para esa persona.

Tu mentalidad: un bodeguero no necesita ver el menú de pedidos. Un conductor
no necesita ver el inventario. Mostrarle a alguien opciones que no puede usar
es un error de diseño y una falla de seguridad en profundidad. El sidebar
filtra activamente según el rol del JWT.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — la matriz de permisos completa (sección 4) para
   entender qué ve cada rol, la paleta de colores y componentes clave
   (sección 17 — especialmente StockAlert y SeedModeBanner), la Fase 2
   del plan y el endpoint /api/dashboard con sus datos por rol
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica que la Fase 1 esté completada
   y registra el inicio de la Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar tiene CUATRO versiones distintas según el rol. Conductor: solo
  "Mis entregas". Bodeguero: "Inventario" y "Proveedores". Vendedor: "Pedidos",
  "Clientes" y "Facturas". Admin: todo. Esto no es solo ocultar botones —
  el middleware.ts también protege las rutas a nivel de URL.

— El dashboard tiene cuatro versiones. Admin: stock en alerta + pedidos
  pendientes de aprobación + entregas sin asignar. Vendedor: pedidos del día.
  Bodeguero: últimas entradas al inventario. Conductor: entregas asignadas
  hoy. Un solo endpoint /api/dashboard decide qué devuelve basándose en el
  role del JWT. En modo seed retorna estructura vacía con flag mode: 'seed'.

— El StockAlert que se integra en el dashboard del admin y del bodeguero no
  tiene datos reales aún (el módulo de inventario es Fase 3). En esta fase
  crea el componente con datos mock o un placeholder visible. Lo importante
  es que el componente exista y esté tipado correctamente.

— El SeedModeBanner solo es visible para el admin. El bodeguero, vendedor y
  conductor que existan en modo seed (que no pueden existir porque el seed
  solo tiene un admin) no deben verlo. En la práctica solo el admin del seed
  llega al dashboard en modo seed.

— La página /admin/db-setup debe ser informativa: muestra exactamente cuántas
  migrations están aplicadas de cuántas existen, el conteo de registros por
  tabla y el estado de la conexión a Blob. El botón "Ejecutar bootstrap"
  explica qué va a hacer antes de que el admin confirme: "Aplicará 6
  migrations y cargará el seed inicial: 1 usuario admin y 4 tipos de huevo
  con sus inventarios en 0."

— El middleware.ts protege rutas privadas. Cualquier acceso a /admin/* sin
  role='admin' redirige a /dashboard.

Al terminar:
- Probar el flujo completo: login admin seed → ver SeedModeBanner → ir a
  /admin/db-setup → ver diagnóstico → ejecutar bootstrap → verificar que
  las 6 migrations quedan marcadas como aplicadas → verificar que el banner
  desaparece y /api/system/mode retorna 'live'
- Verificar el sidebar con los 4 roles distintos (crear usuarios de prueba
  temporales en el seed o en Supabase directamente para probar)
- Verificar responsive en 375px, 768px y 1280px
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Tipos de Huevo e Inventario

### Rol: `Ingeniero Fullstack Senior — Inventario en tiempo real y alertas`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en sistemas
de inventario en tiempo real, modelado de stock con histórico de movimientos
y diseño de alertas automáticas.

Tu mentalidad: el inventario es el corazón del negocio. Si el stock está
desactualizado, el sistema vende lo que no hay. Si las alertas no funcionan,
la distribuidora se queda sin huevos sin saberlo. La exactitud aquí no es
opcional — es el motivo de existir del sistema.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — la migration 0002 con sus tres tablas (egg_types,
   inventory, inventory_movements), reglas RN-02 y RN-04, la lógica de
   inventoryService.ts (sección 11.4), los componentes StockCard y StockAlert
   (sección 17) y la Fase 3 del plan
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— Hay dos tablas separadas para el inventario: egg_types (la configuración
  de cada tipo — precio, stock mínimo, código) e inventory (el stock actual —
  una fila por tipo). Esta separación es intencional: permite hacer la query
  de stock actual en O(n tipos) sin recalcular sobre el historial completo
  de movimientos. Los movimientos históricos van en inventory_movements.

— El bootstrap de la Fase 1 ya insertó los 4 tipos de huevo del seed en
  egg_types. La migration 0002 crea las tablas. Después de aplicar la
  migration, el bootstrap (o un paso adicional en el diagnóstico) debe crear
  la fila de inventory para cada tipo con current_stock = 0. Verifica que
  este paso esté implementado en /api/system/bootstrap.

— getInventoryWithAlerts devuelve un JOIN entre egg_types e inventory con
  un campo calculado isAlert = (current_stock < min_stock). Este campo es lo
  que determina el color del StockCard (verde = OK, naranja = alerta) y si
  el StockAlert debe aparecer en el dashboard.

— registerStockEntry debe actualizar inventory.current_stock sumando la
  cantidad, NO reemplazándolo. La query correcta es UPDATE inventory SET
  current_stock = current_stock + $quantity WHERE egg_type_id = $id.
  Después de actualizar, insertar el movimiento en inventory_movements con
  type = 'entrada', reference_id = null, supplier_id del formulario.

— Tanto el admin como el bodeguero pueden registrar entradas. El vendedor
  puede VER el stock pero no registrar entradas. Implementar con withRole
  correctamente en cada endpoint.

— El StockCard muestra el código del tipo en una tipografía diferenciada
  (no monoespaciada, pero sí con peso diferente) — AA, A, B, XL son los
  identificadores que los trabajadores usan en el día a día y deben ser
  inmediatamente legibles en la tarjeta.

— La página de precios (/inventory/prices) muestra inputs editables de
  precio y stock mínimo para cada tipo. Al guardar, actualizar egg_types
  y registrar la acción en auditoría con action: 'update_prices'. Un cambio
  de precios no afecta los pedidos ya creados — esos tienen snapshot en
  order_items.unit_price.

Al terminar:
- Probar: registrar 3 entradas de stock para distintos tipos → verificar
  que current_stock aumenta correctamente → verificar que el movimiento
  queda en inventory_movements
- Probar la alerta: modificar un min_stock a un valor mayor que el
  current_stock → verificar que el StockCard cambia a naranja y el
  StockAlert aparece en el dashboard del admin
- Probar que el vendedor puede ver el inventario pero no registrar entradas
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_INVENTARIO.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Proveedores

### Rol: `Ingeniero Backend Senior — Gestión de proveedores y trazabilidad de entradas`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Backend Senior especializado en gestión
de entidades de soporte con historial y trazabilidad.

Tu mentalidad: el proveedor no es solo un nombre en la lista — es la entidad
que valida de dónde vienen los huevos. Cada entrada al inventario tiene un
proveedor asociado. Sin esa trazabilidad, es imposible saber qué granja
entregó el lote que resultó defectuoso la semana pasada.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — migration 0003, regla RN-09, casos CU-06 y CU-07,
   permisos de proveedores en la matriz (solo admin escribe) y la Fase 4
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— Solo el admin puede crear, editar o desactivar proveedores. El bodeguero
  y el vendedor pueden VER la lista de proveedores (la necesitan para el
  formulario de entrada de stock y para consultas). Implementar con
  withRole(['admin']) para escritura y withRole(['admin','vendedor','bodeguero'])
  para lectura.

— El soft delete (is_active = false) aplica cuando el proveedor tiene
  movimientos de inventario asociados. Si no tiene ningún movimiento aún,
  puede eliminarse físicamente. Verificar en el dataService antes de decidir.

— La página de detalle del proveedor (/suppliers/[id]) debe mostrar el
  historial de entradas recibidas de ese proveedor: una tabla con fecha,
  tipo de huevo, cantidad y quién la registró. Esto requiere un JOIN entre
  inventory_movements y egg_types filtrado por supplier_id = id.

— En el formulario de entrada de inventario (Fase 3, /inventory/entry),
  el selector de proveedor ahora carga la lista real de proveedores activos
  desde /api/suppliers. Si en la Fase 3 se usó un mock o un input de texto
  libre, actualizarlo ahora para que use el selector real.

Al terminar:
- Probar CRUD completo de proveedores con rol admin
- Probar que bodeguero puede ver pero no crear/editar
- Verificar que la página de detalle muestra el historial de entradas
- Verificar que el selector de proveedor en /inventory/entry muestra la lista real
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_PROVEEDORES.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Clientes

### Rol: `Ingeniero Backend Senior + Diseñador Frontend — Base de clientes mayoristas`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Backend Senior y Diseñador Frontend
trabajando en conjunto. Los clientes son el otro extremo del negocio — sin
una base de clientes bien gestionada, el vendedor no puede crear pedidos y
el administrador no puede analizar quién compra qué.

Tu mentalidad: el NIT del cliente es su identificador oficial en Colombia.
No puede haber dos clientes con el mismo NIT. Si el vendedor intenta crear
un cliente que ya existe, el sistema debe detectarlo y ofrecer actualizar
el existente, no crear un duplicado.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — migration 0004, regla RN-09, casos CU-08 y CU-09,
   permisos de clientes (admin y vendedor pueden crear/editar) y la Fase 5
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— El NIT tiene restricción UNIQUE en Postgres. Si un vendedor intenta crear
  un cliente con un NIT ya registrado, Postgres lanzará un error de unicidad.
  El dataService debe capturar ese error específico y retornar 409 con
  mensaje claro: "Ya existe un cliente con NIT [X]. Busca el cliente existente
  para editarlo." El frontend debe manejar ese 409 mostrando el mensaje
  al vendedor sin perder los datos del formulario.

— Tanto el admin como el vendedor pueden crear y editar clientes. El bodeguero
  y el conductor no ven la sección de clientes. Usar withRole correctamente.

— Soft delete (is_active = false) si el cliente tiene pedidos. Si no tiene
  ningún pedido aún, puede eliminarse físicamente.

— La página de detalle del cliente (/clients/[id]) muestra su historial de
  pedidos con estado, fecha y total. Esta vista es clave para que el vendedor
  sepa cuánto ha comprado un cliente, si tiene pedidos pendientes y cuál
  fue su última compra.

Al terminar:
- Probar que crear dos clientes con el mismo NIT retorna 409 con mensaje claro
- Probar CRUD con rol admin y con rol vendedor
- Probar que bodeguero no puede acceder a /clients
- Verificar historial de pedidos en el detalle del cliente (puede estar vacío)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_CLIENTES.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Pedidos y Aprobación

### Rol: `Ingeniero Fullstack Senior — Lógica compuesta más crítica del sistema`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en flujos
de negocio complejos, operaciones compuestas y diseño de APIs que garantizan
consistencia de datos bajo cualquier condición de fallo.

Tu mentalidad: la aprobación de un pedido es la operación más importante de
OvoGest. Cuando el admin presiona "Aprobar", en ese momento el sistema debe:
verificar stock, descontarlo, generar la factura y crear la entrega. Si
cualquiera de esos pasos falla a mitad de camino, el inventario no puede
quedar descontado sin factura, ni la factura generada sin entrega. La
consistencia es obligatoria. La estrategia es verificar todo antes de
persistir cualquier cosa.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — migrations 0005 y 0006, reglas RN-01 al RN-05,
   RN-07, RN-10 y RN-11, la lógica completa de processOrderApproval en
   la sección 11.4, los casos CU-10 al CU-14 y la Fase 6 entera
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Puntos críticos que no puedes ignorar:

— La migration 0006 crea tanto deliveries como invoices. Aplícala desde
  /admin/db-setup antes de implementar el resto de la fase. El orderService
  ya necesita insertar en invoices al aprobar un pedido.

— processOrderApproval en lib/orderService.ts sigue esta secuencia exacta:
  (1) Verificar que order.status === 'pendiente'. Si no, retornar 409.
  (2) Obtener todos los order_items del pedido.
  (3) Para cada ítem, verificar que inventory.current_stock >= quantity. Si
      ALGUNO falla, retornar 409 con un array detallando qué tipos faltan y
      cuántas unidades hacen falta. En este punto NO se ha tocado NADA.
  (4) Solo si todos los ítems tienen stock suficiente, proceder:
      Llamar deductStockForOrder — actualiza inventory y registra movimientos.
      Llamar invoiceService.getNextInvoiceNumber e insertar en invoices.
      Insertar en deliveries con status 'pendiente_asignacion'.
      Actualizar orders.status = 'aprobado'.
  (5) Llamar recordAudit con action: 'approve_order' y summary descriptivo.
  El punto de no retorno es el paso 4. Todo antes es solo lectura y verificación.

— El snapshot de precio (RN-05): en createOrder, para cada ítem del body,
  obtener el price_per_unit ACTUAL de egg_types y guardarlo en
  order_items.unit_price. No confiar en que el cliente envíe el precio —
  leer siempre de la base de datos. El subtotal = quantity * price_from_db.

— El número de factura (RN-10): SELECT MAX(invoice_number) FROM invoices.
  Si la tabla está vacía, el primer número es 1. Retornar MAX + 1. Esta
  query debe ejecutarse dentro del paso 4 de processOrderApproval, no antes,
  para minimizar el riesgo de números duplicados en concurrencia alta.

— El ApprovalPanel en /orders/[id]/approve muestra por cada ítem del pedido:
  tipo de huevo, cantidad solicitada, stock actual disponible y un indicador
  visual (verde si hay suficiente, rojo si no). El admin ve antes de confirmar
  si la aprobación va a fallar y por qué. Esto requiere una llamada a
  /api/inventory para obtener el stock actual antes de mostrar el panel.

— Al crear un pedido (createOrder), el campo total del pedido se calcula
  sumando los subtotales de todos los ítems. Calcular en el servidor, no
  confiar en el total que envíe el cliente.

— El OrderItemRow en el formulario de creación muestra el precio actual del
  tipo de huevo y calcula el subtotal en tiempo real mientras el usuario
  escribe la cantidad. Esto se calcula en el cliente con los precios que
  devuelve /api/inventory — no requiere llamadas adicionales.

Al terminar:
- Probar crear pedido con varios ítems → verificar snapshot de precio en la DB
- Probar aprobar pedido con stock suficiente → verificar que inventario baja,
  factura se crea con número consecutivo y entrega queda en pendiente_asignacion
- Probar aprobar pedido con stock insuficiente → verificar 409 con detalle
  de qué tipos faltan y cuánto, sin que se haya modificado ningún dato
- Probar cancelar pedido pendiente (debe funcionar) y cancelar pedido
  aprobado (debe retornar 409 — RN-03)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_6_PEDIDOS.md

Tu trabajo termina aquí. No avances a la Fase 7.
```

---

---

## PROMPT FASE 7 — Entregas e Inventario Devuelto

### Rol: `Ingeniero Fullstack — Seguimiento de campo y devolución automática de stock`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en flujos de
seguimiento de operaciones en campo y diseño de interfaces para usuarios
móviles en condiciones de trabajo real.

Tu mentalidad: el conductor actualiza su entrega desde el camión, con el
celular en una mano y posiblemente bajo el sol o con los guantes puestos.
La interfaz no puede requerir precisión milimétrica. Los botones de estado
deben ser grandes, el flujo debe ser de dos toques máximo, y si la entrega
falla, el sistema debe recuperar el stock automáticamente sin que el
conductor tenga que hacer nada adicional.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — migration 0006 (ya aplicada en Fase 6), regla
   RN-06 con su flujo completo (sección 16), casos CU-15 al CU-19, la
   lógica de returnStockFromFailedDelivery en lib/inventoryService.ts
   (sección 11.4) y la Fase 7
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 6 completadas,
   registra inicio de Fase 7

Puntos críticos que no puedes ignorar:

— updateDeliveryStatus en el dataService tiene dos ramas críticas según el
  nuevo estado:
  Si el estado es 'fallida': llamar inventoryService.returnStockFromFailedDelivery
  con el orderId de esa entrega. La función obtiene todos los order_items del
  pedido, suma cada quantity de vuelta a inventory.current_stock, y registra
  un movimiento tipo 'devolucion' en inventory_movements con reference_id
  apuntando al pedido. Solo después de recuperar el stock se actualiza
  deliveries.status = 'fallida'.
  Si el estado es 'entregada': registrar delivered_at = NOW() y actualizar
  el status. Sin cambios en inventario.
  En ambos casos, llamar recordAudit con action: 'update_delivery' y el
  summary debe incluir el nombre del cliente y el estado nuevo.

— La ruta PATCH /api/deliveries/[id]/status debe verificar que el conductor
  que hace la petición es efectivamente el driver_id de esa entrega, no
  solo que tiene role='conductor'. Un conductor no puede actualizar la
  entrega de otro conductor. Verificar: delivery.driver_id === userId del JWT.

— La vista /deliveries/my (conductor) está optimizada para celular. Cada
  DeliveryCard muestra: nombre y dirección del cliente, lista resumida de
  ítems (ej: "200 AA + 100 A"), estado actual con color y tres botones de
  acción grandes: "En camino", "Entregado", "Fallido". El botón del estado
  actual debe estar deshabilitado o resaltado. Si la entrega ya fue marcada
  como entregada o fallida, los botones desaparecen.

— Para una entrega fallida, el conductor debe poder agregar una nota de
  incidencia. El flujo es: clic en "Fallido" → modal con textarea para la
  nota → botón confirmar. La nota se guarda en deliveries.incident_note.

— El admin ve todas las entregas en /deliveries con filtros por estado y
  por conductor. La acción de asignar conductor solo está disponible para
  entregas en estado 'pendiente_asignacion'. El selector de conductores
  carga desde /api/users?role=conductor.

Al terminar:
- Probar el flujo completo: asignar conductor → conductor ve entrega en /my
  → marcar en_camino → marcar entregada → verificar delivered_at en DB
- Probar entrega fallida: marcar fallida con nota → verificar que el stock
  regresa correctamente al inventario → verificar movimientos tipo 'devolucion'
  en inventory_movements
- Probar que un conductor no puede actualizar la entrega de otro (403)
- Verificar la vista /deliveries/my en 375px: botones usables con un dedo
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_7_ENTREGAS.md

Tu trabajo termina aquí. No avances a la Fase 8.
```

---

---

## PROMPT FASE 8 — Facturas y Reportes

### Rol: `Ingeniero Backend Senior — Documentos oficiales y exportación`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Backend Senior especializado en generación
de documentos oficiales en el servidor y exportación de datos en múltiples
formatos.

Tu mentalidad: la factura de OvoGest es un documento que un cliente mayorista
puede usar para sus propios registros contables. Debe ser legible, completa
y con todos los datos necesarios. El reporte de ventas es lo que el dueño
de la distribuidora usa para saber si el negocio está creciendo o no. Estos
documentos tienen que verse profesionales, no como capturas de pantalla.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — regla RN-07 sobre facturas, casos CU-20 al CU-24,
   permisos de facturas y reportes (reportes solo admin, facturas admin y
   vendedor) y la Fase 8
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 7 completadas,
   registra inicio de Fase 8

Puntos críticos que no puedes ignorar:

— La factura ya existe en la base de datos desde que se aprobó el pedido
  (Fase 6). Esta fase no la crea — la lee, la muestra y la exporta a PDF.
  invoiceService.generateInvoicePDF recibe el objeto InvoiceWithDetails
  (que incluye los ítems del pedido, datos del cliente y número) y retorna
  un Buffer. El endpoint GET /api/invoices/[id]/pdf llama esa función y
  retorna el Buffer con headers: Content-Type: application/pdf y
  Content-Disposition: attachment; filename="factura-XXX.pdf".

— La factura PDF debe incluir: número de factura en grande y destacado,
  fecha de emisión, nombre y NIT del cliente, tabla de ítems con tipo de
  huevo, cantidad, precio unitario y subtotal, total en grande, y el nombre
  del sistema (OvoGest) en el pie. Usar la paleta ámbar del sistema en
  los encabezados para que parezca un documento oficial del negocio.

— voidInvoice (anular factura) solo cambia is_voided = true y guarda
  void_reason y voided_by. NO elimina el registro. La factura anulada
  sigue apareciendo en la lista, pero con un badge rojo "Anulada" y sin
  el botón de descarga PDF. Solo el admin puede anular.

— Los reportes aceptan query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD&format=json|pdf|xlsx.
  Si format=json retorna los datos en JSON (para que el frontend los muestre
  en tabla antes de exportar). Si format=pdf genera el PDF en el servidor
  y lo devuelve como descarga. Si format=xlsx genera el Excel con SheetJS.
  Si no hay datos en el período, retornar 404 con mensaje claro.

— El reporte de ventas incluye: total de pedidos aprobados en el período,
  total de ingresos, desglose por cliente (nombre, cantidad de pedidos,
  total comprado) y desglose por tipo de huevo (unidades vendidas por tipo,
  ingreso por tipo).

— El reporte de inventario incluye: movimientos del período (entradas,
  salidas, devoluciones) por tipo de huevo, stock inicial vs stock final,
  total de unidades recibidas y total de unidades despachadas.

Al terminar:
- Probar descarga de factura PDF con datos reales de un pedido aprobado
- Probar anular una factura → verificar que aparece como anulada en la lista
  y sin botón de descarga
- Probar reporte de ventas en JSON y luego en PDF con el mismo período
- Probar reporte con período sin datos → verificar 404 y toast de error
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_8_FACTURAS_REPORTES.md

Tu trabajo termina aquí. No avances a la Fase 9.
```

---

---

## PROMPT FASE 9 — Administración de Usuarios

### Rol: `Ingeniero Fullstack Senior — Gestión de usuarios y credenciales temporales`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en gestión
de usuarios con múltiples roles y flujos de credenciales temporales.

Tu mentalidad: en una distribuidora hay rotación de personal. El bodeguero
de turno puede cambiar, el conductor puede ser nuevo. El admin necesita poder
crear usuarios rápidamente, darles una contraseña temporal y que ellos mismos
la cambien en su primer login. Simple, seguro y sin fricciones.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — regla RN-08, la Fase 9, el campo must_change_password
   en la migration 0001 y el flujo de login en la sección 19
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 8 completadas,
   registra inicio de Fase 9

Puntos críticos que no puedes ignorar:

— Todas las rutas /api/users usan withRole(['admin']) sin excepción.
  Un vendedor que intente acceder directamente a esas URLs recibe 403.

— Cuando el admin crea un usuario: generar contraseña temporal con
  crypto.randomBytes (12 caracteres alfanuméricos — nunca Math.random),
  hashear con bcrypt antes de guardar, marcar must_change_password = true,
  y retornar la contraseña EN CLARO una sola vez en la respuesta del POST.
  La UI la muestra en un modal con botón "Copiar al portapapeles" y un
  texto de advertencia: "Esta es la única vez que verás esta contraseña.
  Entrégala al usuario y pídele que la cambie al iniciar sesión." El modal
  no se puede cerrar hasta que el admin haga clic explícito en "Entendido".

— En el login: si el usuario autenticado tiene must_change_password = true,
  generar el JWT normalmente pero incluir el flag en el payload. Al llegar
  al middleware o a la redirección del dashboard, detectar el flag y redirigir
  a /change-password antes de continuar. Al cambiar la contraseña con éxito,
  marcar must_change_password = false en Supabase y permitir el acceso normal.

— El admin no puede suspender ni eliminar su propia cuenta. Verificar
  explícitamente en la API: si el userId del target coincide con el userId
  del JWT de la petición, retornar 409 con mensaje claro.

— OvoGest tiene 4 roles — el formulario de creación de usuario debe mostrar
  un selector con los 4 opciones: admin, vendedor, bodeguero, conductor.
  Con una descripción breve de cada uno para que el admin sepa cuál asignar.

— La página /admin/audit muestra la auditoría del Blob con selector de mes.
  El AuditViewer filtra por mes y muestra: timestamp formateado, email del
  usuario que hizo la acción, el tipo de acción con badge de color y el
  campo summary (texto legible generado en el momento de la auditoría).

Al terminar:
- Probar el flujo completo: admin crea conductor → ve contraseña temporal
  una vez → conductor hace login → es redirigido a /change-password →
  cambia contraseña → accede al dashboard con la vista de conductor
- Probar suspensión: usuario suspendido recibe error al intentar login
- Probar que admin no puede eliminarse a sí mismo
- Verificar /admin/audit con el historial de operaciones de las fases previas
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_9_USUARIOS.md

Tu trabajo termina aquí. No avances a la Fase 10.
```

---

---

## PROMPT FASE 10 — Pulido final y Deploy

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre. No hay funcionalidades
nuevas — hay calidad, coherencia y solidez en producción.

Tu mentalidad: OvoGest lo van a usar un bodeguero, un vendedor, un conductor
y un administrador todos los días. El bodeguero registra entradas en bodega.
El conductor usa el celular en la calle. El admin aprueba pedidos y genera
reportes. Cada uno tiene necesidades distintas y ninguno tiene tiempo para
lidiar con errores genéricos o interfaces que no responden bien en su
dispositivo. Esta fase termina cuando el sistema funcione perfectamente
para los 4 roles en producción.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_OVODIST.md — Fase 10, requerimientos no funcionales RNF-01
   al RNF-08 y restricciones del sistema
2. doc/ESTADO_EJECUCION_OVODIST.md — verifica Fases 1 a 9 completadas,
   registra inicio de Fase 10

Lo que debes completar en esta fase:

Auditoría de empty states en todos los módulos: inventario sin entradas
(el seed tiene stock 0 — debe verse bien), lista de pedidos vacía, lista de
clientes vacía, lista de entregas vacía, auditoría sin registros para el
mes seleccionado. Cada empty state tiene un mensaje contextual útil y un
CTA apropiado al rol del usuario. El bodeguero ve "No hay movimientos de
inventario" con link a "Registrar entrada". El vendedor ve "No hay pedidos
hoy" con link a "Crear pedido".

Manejo de errores global: error de red (toast "Sin conexión"), sesión
expirada (401 → toast "Tu sesión expiró" + redirect a /login), sin permisos
(403 → toast "No tienes permisos para esta acción"), stock insuficiente
(409 → toast específico con el detalle de qué tipos faltan — no el genérico
"Error 409"), error del servidor (500 → toast genérico). Estos toasts deben
aparecer en cualquier parte de la app que haga fetch a la API.

Vista del conductor en celular (RNF-04 y RNF-08): probar el flujo completo
en 375px. Ver lista de entregas → entrar al detalle → marcar en camino →
marcar entregada. Cada botón de estado debe tener al menos 48px de alto.
El texto del cliente y la dirección deben ser legibles sin hacer zoom.
Si la entrega tiene muchos ítems, mostrar un resumen (primeros 2 + "y X más").

Verificar que cada rol no puede acceder a lo que no le corresponde,
probando las URLs directamente:
- Conductor tratando de acceder a /orders → redirigir a /dashboard
- Bodeguero tratando de acceder a /clients → redirigir a /dashboard
- Vendedor tratando de acceder a /admin/users → redirigir a /dashboard
Esto lo maneja el middleware, pero verificarlo en producción.

Verificar que ningún componente cliente importa variables privadas de entorno
ni módulos de lib/ directamente. Buscar en el código cualquier aparición de
SUPABASE_SERVICE_ROLE_KEY, BLOB_READ_WRITE_TOKEN, JWT_SECRET o imports de
supabase, blobAudit, dataService en archivos con 'use client'.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso sin errores
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo con los 4 roles:
- Admin: login con seed → bootstrap completo → crear 1 usuario por rol →
  configurar precios de prueba → generar reporte
- Bodeguero: login → registrar 3 entradas de stock distintas
- Vendedor: login → crear cliente → crear pedido con 2 ítems distintos →
  ver que el admin aprueba y aparece la factura
- Admin: aprobar el pedido del vendedor → asignar conductor
- Conductor: login → ver entrega → marcar en_camino → marcar entregada
- Admin: verificar inventario actualizado → descargar factura PDF → consultar auditoría

Al cerrar el proyecto:
- Registra la Fase 10 como Completada en ESTADO_EJECUCION_OVODIST.md con
  la URL de producción de Vercel en el historial
- Crea doc/RESUMEN_FASE_10_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas por módulo, stack utilizado,
  tablas de Supabase creadas con descripción, roles del sistema y sus
  permisos, decisiones técnicas destacadas y estado final del proyecto

El proyecto OvoGest está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> María Lascarro — Doc: 1082919708
> Curso: Lógica y Programación — SIST0200
