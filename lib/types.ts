export type Role = 'admin' | 'vendedor' | 'bodeguero' | 'conductor';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface EggType {
  id: string;
  name: string;
  code: string;
  price_per_unit: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryRow {
  id: string;
  egg_type_id: string;
  current_stock: number;
  updated_at: string;
}

export type InventoryMovementType = 'entrada' | 'salida' | 'devolucion' | 'ajuste';

export interface InventoryMovement {
  id: string;
  egg_type_id: string;
  type: InventoryMovementType;
  quantity: number;
  reference_id: string | null;
  supplier_id: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface StockView {
  egg_type_id: string;
  code: string;
  name: string;
  current_stock: number;
  min_stock: number;
  price_per_unit: number;
  is_low: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  nit: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pendiente' | 'aprobado' | 'cancelado';

export interface Order {
  id: string;
  client_id: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  egg_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  client?: Pick<Client, 'id' | 'name' | 'nit'>;
}

export type DeliveryStatus =
  | 'pendiente_asignacion'
  | 'asignada'
  | 'en_camino'
  | 'entregada'
  | 'fallida';

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: DeliveryStatus;
  incident_note: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: number;
  total: number;
  is_voided: boolean;
  void_reason: string | null;
  voided_by: string | null;
  voided_at: string | null;
  created_at: string;
}
