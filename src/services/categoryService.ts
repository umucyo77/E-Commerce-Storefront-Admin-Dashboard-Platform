import { api, unwrapApiData } from '../lib/api'
import type { Category } from '../types'

interface CategoryListResponse {
  data?: ApiCategory[]
}

interface ApiCategory {
  id?: string
  _id?: string
  name: string
}

function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id ?? category._id ?? '',
    name: category.name,
  }
}

export async function getCategories() {
  const response = await api.get('/api/categories')
  const payload = unwrapApiData<ApiCategory[] | CategoryListResponse>(response.data)
  const categories = Array.isArray(payload) ? payload : payload.data ?? []
  return categories.map(mapCategory).filter((category) => !!category.id)
}

export async function createCategory(name: string) {
  const response = await api.post('/api/categories', { name })
  return mapCategory(unwrapApiData<ApiCategory>(response.data))
}

export async function updateCategory(id: string, name: string) {
  const response = await api.put(`/api/categories/${id}`, { name })
  return mapCategory(unwrapApiData<ApiCategory>(response.data))
}

export async function deleteCategory(id: string) {
  await api.delete(`/api/categories/${id}`)
}
