export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Factory {
  id: string
  name: string
  location: string
  code: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  factory: string | null
  is_superuser: boolean
}

export interface TokenPair {
  access: string
  refresh: string
}

export interface DashboardData {
  total_production: number
  total_sales: number
  total_inventory: number
  total_profit_loss: string
  trends: Array<{ date: string; total_production: number }>
}

export interface ProductionRecord {
  id: string
  factory: string | null
  product: string
  quantity: number
  date: string
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  factory: string | null
  product: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface SalesOrder {
  id: string
  factory: string | null
  customer: string
  product: string
  quantity: number
  status: string
  created_at: string
  updated_at: string
}

export interface ProcurementOrder {
  id: string
  factory: string | null
  supplier: string
  product: string
  quantity: number
  cost: string
  created_at: string
  updated_at: string
}

export interface FinanceTransaction {
  id: string
  factory: string | null
  type: string
  amount: string
  date: string
  created_at: string
  updated_at: string
}

export interface ReportExport {
  id: string
  factory: string | null
  report_name: string
  file_path: string
  created_at: string
  updated_at: string
}

export interface ListQueryParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  /** Backend list filters (module-specific) */
  status?: string
  type?: string
  date?: string
  customer?: string
  product?: string
}

export interface ProductionListParams extends ListQueryParams {
  date_from?: string
  date_to?: string
  factory?: string
}
