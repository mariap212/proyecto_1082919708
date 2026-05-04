/**
 * Database Types for OvoGest
 * Auto-generated from SQL schema
 * 
 * Todos estos tipos corresponden a las tablas en Supabase PostgreSQL
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export type UserRole = 'admin' | 'vendedor' | 'bodeguero' | 'conductor';

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

// ============================================================================
// INVENTORY & EGG TYPES
// ============================================================================

export interface EggType {
  id: string; // UUID
  name: string; // "Huevos AA Extra"
  code: string; // "AA", "A", "B", "XL"
  price_per_unit: number; // DECIMAL(10,2)
  min_stock: number; // Nivel mínimo para alerta
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface Inventory {
  id: string; // UUID
  egg_type_id: string; // FK to egg_types, UNIQUE
  current_stock: number;
  updated_at: string; // ISO 8601
}

export type InventoryMovementType = 'entrada' | 'salida' | 'devolucion' | 'ajuste';

export interface InventoryMovement {
  id: string; // UUID
  egg_type_id: string; // FK to egg_types
  type: InventoryMovementType;
  quantity: number;
  reference_id: string | null; // FK to orders or deliveries
  supplier_id: string | null; // FK to suppliers
  notes: string | null;
  recorded_by: string | null; // FK to users
  created_at: string; // ISO 8601
}

// ============================================================================
// SUPPLIERS & CLIENTS
// ============================================================================

export interface Supplier {
  id: string; // UUID
  name: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface Client {
  id: string; // UUID
  name: string;
  nit: string; // Unique identifier
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// ============================================================================
// ORDERS & ORDER ITEMS
// ============================================================================

export type OrderStatus = 'pendiente' | 'aprobado' | 'cancelado';

export interface Order {
  id: string; // UUID
  client_id: string; // FK to clients (RESTRICT)
  status: OrderStatus;
  total: number; // DECIMAL(12,2)
  notes: string | null;
  created_by: string | null; // FK to users
  approved_by: string | null; // FK to users
  approved_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface OrderItem {
  id: string; // UUID
  order_id: string; // FK to orders (CASCADE)
  egg_type_id: string; // FK to egg_types (RESTRICT)
  quantity: number; // Minimum 30
  unit_price: number; // DECIMAL(10,2) - snapshot at order creation
  subtotal: number; // DECIMAL(12,2) = quantity * unit_price
  created_at: string; // ISO 8601
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  client?: Client;
}

// ============================================================================
// DELIVERIES & INVOICES
// ============================================================================

export type DeliveryStatus =
  | 'pendiente_asignacion'
  | 'asignada'
  | 'en_camino'
  | 'entregada'
  | 'fallida';

export interface Delivery {
  id: string; // UUID
  order_id: string; // FK to orders (UNIQUE, CASCADE) - 1:1 relationship
  driver_id: string | null; // FK to users (conductor)
  status: DeliveryStatus;
  incident_note: string | null;
  assigned_by: string | null; // FK to users
  assigned_at: string | null; // ISO 8601
  delivered_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface Invoice {
  id: string; // UUID
  order_id: string; // FK to orders (UNIQUE, CASCADE) - 1:1 relationship
  invoice_number: number; // UNIQUE consecutive number
  total: number; // DECIMAL(12,2)
  is_voided: boolean;
  void_reason: string | null;
  voided_by: string | null; // FK to users
  voided_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
}

// ============================================================================
// VIEW MODELS & DTOs
// ============================================================================

/**
 * Dashboard inventory view
 */
export interface InventoryDashboard {
  egg_type: EggType;
  current_stock: number;
  stock_status: 'ok' | 'low' | 'alert';
  min_stock: number;
}

/**
 * Order summary for list
 */
export interface OrderSummary {
  id: string;
  client_name: string;
  status: OrderStatus;
  total: number;
  items_count: number;
  created_at: string;
  approved_at?: string;
}

/**
 * Delivery tracking view
 */
export interface DeliveryTracking {
  id: string;
  order_id: string;
  driver_name?: string;
  status: DeliveryStatus;
  client_name: string;
  items_count: number;
  assigned_at?: string;
}

/**
 * Complete order with all related data
 */
export interface OrderDetail {
  order: Order;
  client: Client;
  items: OrderItem[];
  delivery?: Delivery;
  invoice?: Invoice;
  created_by_user?: UserPublic;
  approved_by_user?: UserPublic;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create order request
 */
export interface CreateOrderRequest {
  client_id: string;
  items: Array<{
    egg_type_id: string;
    quantity: number;
  }>;
  notes?: string;
}

/**
 * Approve order request
 */
export interface ApproveOrderRequest {
  order_id: string;
  notes?: string;
}

/**
 * Create inventory movement
 */
export interface CreateInventoryMovementRequest {
  egg_type_id: string;
  type: InventoryMovementType;
  quantity: number;
  supplier_id?: string;
  reference_id?: string;
  notes?: string;
}

/**
 * Assign delivery
 */
export interface AssignDeliveryRequest {
  delivery_id: string;
  driver_id: string;
}

/**
 * Update delivery status
 */
export interface UpdateDeliveryStatusRequest {
  delivery_id: string;
  status: DeliveryStatus;
  incident_note?: string;
}

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 20, Max: 100
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Orders filter
 */
export interface OrderFilterParams extends PaginationParams {
  client_id?: string;
  status?: OrderStatus;
  from_date?: string; // ISO 8601
  to_date?: string; // ISO 8601
  created_by?: string;
}

/**
 * Inventory movements filter
 */
export interface InventoryMovementFilterParams extends PaginationParams {
  egg_type_id?: string;
  type?: InventoryMovementType;
  from_date?: string; // ISO 8601
  to_date?: string; // ISO 8601
  recorded_by?: string;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse extends ApiError {
  errors: ValidationError[];
}
