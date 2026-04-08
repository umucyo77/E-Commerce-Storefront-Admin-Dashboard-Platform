import { api, unwrapApiData } from '../lib/api'
import type { Product } from '../types'

export interface ProductPayload {
  title: string
  description: string
  brand: string
  categoryId: string
  price: number
  stockQuantity: number
  images: string[]
}

interface ApiProduct {
  id?: string
  _id?: string
  name: string
  description?: string
  brand?: string
  categoryId: string
  category?: { name?: string }
  price: number
  stock: number
  variants?: { id: string }[]
  images?: { url?: string }[]
  imageUrls?: string[]
}

function mapProduct(apiProduct: ApiProduct): Product {
  const mappedImages =
    apiProduct.images?.map((image) => image.url).filter(Boolean) ??
    apiProduct.imageUrls ??
    []

  return {
    id: apiProduct.id ?? apiProduct._id ?? '',
    title: apiProduct.name,
    description: apiProduct.description ?? '',
    brand: apiProduct.brand ?? '',
    categoryId: apiProduct.categoryId,
    categoryName: apiProduct.category?.name,
    price: Number(apiProduct.price ?? 0),
    stockQuantity: Number(apiProduct.stock ?? 0),
    images: mappedImages as string[],
    variantId: apiProduct.variants?.[0]?.id,
  }
}

export async function getProducts() {
  const response = await api.get('/api/public/products')
  const payload = unwrapApiData<{
    grouped?: unknown
    total?: number
    all?: ApiProduct[]
    products?: ApiProduct[]
    items?: ApiProduct[]
  }>(response.data)
  const collection = payload.all ?? payload.products ?? payload.items ?? []
  return collection.map(mapProduct).filter((item) => !!item.id)
}

export async function getProductById(id: string) {
  const response = await api.get(`/api/public/products/${id}`)
  const payload = unwrapApiData<{ product: ApiProduct }>(response.data)
  return mapProduct(payload.product)
}

export async function createProduct(payload: ProductPayload) {
  const response = await api.post('/api/admin/products', {
    name: payload.title,
    description: payload.description,
    brand: payload.brand,
    categoryId: payload.categoryId,
    price: payload.price,
    stock: payload.stockQuantity,
  })
  const data = unwrapApiData<ApiProduct | undefined>(response.data)
  return data ? mapProduct(data) : null
}

export async function updateProduct(id: string, payload: ProductPayload) {
  const body = {
    name: payload.title,
    description: payload.description,
    brand: payload.brand,
    categoryId: payload.categoryId,
    price: payload.price,
    stock: payload.stockQuantity,
  }

  try {
    const response = await api.patch(`/api/admin/products/${id}`, body)
    const data = unwrapApiData<ApiProduct | undefined>(response.data)
    return data ? mapProduct(data) : null
  } catch {
    const response = await api.put(`/api/admin/products/${id}`, body)
    const data = unwrapApiData<ApiProduct | undefined>(response.data)
    return data ? mapProduct(data) : null
  }
}

export async function deleteProduct(id: string) {
  await api.delete(`/api/admin/products/${id}`)
}
