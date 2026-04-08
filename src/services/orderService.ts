import axios from 'axios'
import { api, unwrapApiData } from '../lib/api'
import type { CartItem, Order, OrderStatus, PaymentMethod, ShippingInfo } from '../types'

interface CreateOrderPayload {
  items: CartItem[]
  paymentMethod: PaymentMethod
  shippingInfo: ShippingInfo
}

interface ApiOrder {
  id: string
  status: OrderStatus
  total?: number
  totalAmount?: number
  paymentMethod?: PaymentMethod
  shippingInfo?: ShippingInfo
  items?: CartItem[]
  createdAt: string
}

function mapOrder(order: ApiOrder): Order {
  return {
    id: order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount ?? order.total ?? 0),
    paymentMethod: order.paymentMethod ?? 'CASH_ON_DELIVERY',
    shippingInfo:
      order.shippingInfo ??
      ({
        fullName: '',
        email: '',
        phoneNumber: '',
        shippingAddress: '',
        city: '',
        requiresPostalCode: false,
      } as ShippingInfo),
    items: order.items ?? [],
    createdAt: order.createdAt,
  }
}

export async function createOrder(payload: CreateOrderPayload) {
  const normalizedItems = payload.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId ?? item.product?.variantId,
    quantity: item.quantity,
  }))

  try {
    const response = await api.post('/api/auth/orders', {})
    return mapOrder(unwrapApiData<ApiOrder>(response.data))
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 400) {
      throw error
    }

    // Fallback when server-side cart checkout fails: place per-item "buy now" orders.
    const createdOrders: Order[] = []
    for (const item of normalizedItems) {
      const body: { productId: string; quantity: number; variantId?: string } = {
        productId: item.productId,
        quantity: item.quantity,
      }
      if (item.variantId) body.variantId = item.variantId

      const response = await api.post('/api/auth/orders/buy', body)
      createdOrders.push(mapOrder(unwrapApiData<ApiOrder>(response.data)))
    }

    if (!createdOrders.length) throw error
    return createdOrders[createdOrders.length - 1]
  }
}

export async function getMyOrders() {
  const response = await api.get('/api/auth/orders')
  const payload = unwrapApiData<{ data?: ApiOrder[] } | ApiOrder[]>(response.data)
  const orders = Array.isArray(payload) ? payload : payload.data ?? []
  return orders.map(mapOrder)
}

export async function getAllOrders() {
  const response = await api.get('/api/auth/orders/admin/all')
  const payload = unwrapApiData<{ data?: ApiOrder[] } | ApiOrder[]>(response.data)
  const orders = Array.isArray(payload) ? payload : payload.data ?? []
  return orders.map(mapOrder)
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const response = await api.patch(`/api/auth/orders/${id}/status`, { status })
  return mapOrder(unwrapApiData<ApiOrder>(response.data))
}
