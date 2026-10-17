// Shapes returned by the Django API (see /api/docs/).

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  address: string
  is_staff: boolean
}

export interface AuthResponse {
  access: string
  user: User
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  in_stock: boolean
  image: string | null
  is_active: boolean
  category: Category
  seller: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  line_total: string
}

export interface Cart {
  id: number
  items: CartItem[]
  item_count: number
  total: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: number
  product: number | null
  product_name: string
  unit_price: string
  quantity: number
  line_total: string
}

export interface Order {
  id: number
  status: OrderStatus
  payment_method: 'cash_on_delivery'
  full_name: string
  phone_number: string
  shipping_address: string
  total: string
  items: OrderItem[]
  can_cancel: boolean
  created_at: string
  updated_at: string
}
