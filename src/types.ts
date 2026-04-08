export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: string
  email: string
  fullName?: string
  role: UserRole
}

export interface AuthSession {
  token: string
  user: User
}

export interface Product {
  id: string
  title: string
  description: string
  brand: string
  categoryId: string
  categoryName?: string
  price: number
  stockQuantity: number
  images: string[]
  variantId?: string
}

export interface Category {
  id: string
  name: string
}

export interface CartItem {
  id?: string
  productId: string
  variantId?: string
  quantity: number
  product?: Product
}

export interface Cart {
  items: CartItem[]
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'MOBILE_MONEY'
  | 'CASH_ON_DELIVERY'

export interface ShippingInfo {
  fullName: string
  email: string
  phoneNumber: string
  shippingAddress: string
  city: string
  postalCode?: string
  requiresPostalCode: boolean
}

export interface Order {
  id: string
  items: CartItem[]
  status: OrderStatus
  totalAmount: number
  paymentMethod: PaymentMethod
  shippingInfo: ShippingInfo
  createdAt: string
}

export interface ApiListResponse<T> {
  data: T[]
}
