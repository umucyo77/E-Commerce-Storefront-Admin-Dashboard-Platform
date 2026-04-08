export const ADMIN_EMAIL = 'admin@admin.com'
export const ADMIN_PASSWORD = 'admin123'

export const STORAGE_KEYS = {
  auth: 'ecom.auth.session',
  cart: 'ecom.cart',
  users: 'ecom.local.users',
} as const

export const QUERY_KEYS = {
  products: ['products'] as const,
  categories: ['categories'] as const,
  cart: ['cart'] as const,
  myOrders: ['orders', 'me'] as const,
  allOrders: ['orders', 'all'] as const,
} as const

export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const

export const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'PAYPAL',
  'MOBILE_MONEY',
  'CASH_ON_DELIVERY',
] as const
