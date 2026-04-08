import { api, unwrapApiData } from '../lib/api'
import type { Cart, CartItem, Product } from '../types'

interface ApiCartItem {
  id?: string
  productId: string
  variantId?: string
  quantity: number
  product?: {
    id: string
    name: string
    description?: string
    brand?: string
    categoryId: string
    category?: { name?: string }
    price: number
    stock: number
    images?: { url?: string }[]
    variants?: { id: string }[]
  }
}

function mapProduct(product: NonNullable<ApiCartItem['product']>): Product {
  return {
    id: product.id,
    title: product.name,
    description: product.description ?? '',
    brand: product.brand ?? '',
    categoryId: product.categoryId,
    categoryName: product.category?.name,
    price: Number(product.price ?? 0),
    stockQuantity: Number(product.stock ?? 0),
    images: (product.images ?? [])
      .map((image) => image.url)
      .filter(Boolean) as string[],
    variantId: product.variants?.[0]?.id,
  }
}

function mapCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    product: item.product ? mapProduct(item.product) : undefined,
  }
}

async function tryPost(paths: string[], body: unknown) {
  let lastError: unknown
  for (const path of paths) {
    try {
      return await api.post(path, body)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function tryGet(paths: string[]) {
  let lastError: unknown
  for (const path of paths) {
    try {
      return await api.get(path)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function tryPatch(paths: string[], body: unknown) {
  let lastError: unknown
  for (const path of paths) {
    try {
      return await api.patch(path, body)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function tryDelete(paths: string[]) {
  let lastError: unknown
  for (const path of paths) {
    try {
      return await api.delete(path)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

export async function getCart() {
  const response = await tryGet(['/api/auth/cart', '/api/cart', '/cart'])
  const payload = unwrapApiData<{ items?: ApiCartItem[] }>(response.data)
  const cart: Cart = {
    items: (payload.items ?? []).map(mapCartItem),
  }
  return cart
}

export async function addCartItem(item: CartItem) {
  const body: {
    productId: string
    variantId?: string
    quantity: number
  } = {
    productId: item.productId,
    quantity: item.quantity,
  }
  const variantId = item.variantId ?? item.product?.variantId
  if (variantId) body.variantId = variantId
  await tryPost(
    ['/api/auth/cart/items', '/api/cart/items', '/cart/items', '/api/auth/cart'],
    body,
  )
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  await tryPatch(
    [
      `/api/auth/cart/items/${itemId}`,
      `/api/cart/items/${itemId}`,
      `/cart/items/${itemId}`,
    ],
    { quantity },
  )
}

export async function removeCartItem(itemId: string) {
  await tryDelete([
    `/api/auth/cart/items/${itemId}`,
    `/api/cart/items/${itemId}`,
    `/cart/items/${itemId}`,
  ])
}

export async function clearRemoteCart() {
  await tryDelete(['/api/auth/cart', '/api/cart', '/cart'])
}
