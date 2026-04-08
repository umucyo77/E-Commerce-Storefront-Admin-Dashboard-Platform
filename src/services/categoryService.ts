import { api, unwrapApiData } from '../lib/api'
import type { Category } from '../types'

interface CategoryListResponse {
  data?: ApiCategory[]
  pagination?: {
    page?: number
    pages?: number
    total?: number
    limit?: number
  }
}

interface CategoryMutationResponse {
  category?: ApiCategory
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

function normalizeCategoryResponse(payload: ApiCategory[] | CategoryListResponse) {
  return Array.isArray(payload)
    ? { categories: payload, pages: 1 }
    : {
        categories: payload.data ?? [],
        pages: payload.pagination?.pages ?? 1,
      }
}

function unwrapCategory(payload: ApiCategory | CategoryMutationResponse) {
  if ('category' in payload && payload.category) {
    return payload.category
  }

  return payload as ApiCategory
}

function parseCategoryListPayload(payload: unknown): CategoryListResponse | ApiCategory[] {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as CategoryListResponse).data)
  ) {
    return payload as CategoryListResponse
  }

  return unwrapApiData<ApiCategory[] | CategoryListResponse>(
    payload as ApiCategory[] | CategoryListResponse,
  )
}

export async function getCategories() {
  const firstResponse = await api.get('/api/categories')
  const firstPayload = parseCategoryListPayload(firstResponse.data)
  const { categories: firstCategories, pages } = normalizeCategoryResponse(firstPayload)

  const remainingResponses =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, index) =>
            api.get(`/api/categories?page=${index + 2}`),
          ),
        )
      : []

  const allCategories = [
    ...firstCategories,
    ...remainingResponses.flatMap((response) => {
      const payload = parseCategoryListPayload(response.data)
      return normalizeCategoryResponse(payload).categories
    }),
  ]

  return allCategories.map(mapCategory).filter((category) => !!category.id)
}

export async function createCategory(name: string) {
  const response = await api.post('/api/categories', { name })
  const payload = unwrapApiData<ApiCategory | CategoryMutationResponse>(response.data)
  return mapCategory(unwrapCategory(payload))
}

export async function updateCategory(id: string, name: string) {
  const response = await api.put(`/api/categories/${id}`, { name })
  const payload = unwrapApiData<ApiCategory | CategoryMutationResponse>(response.data)
  return mapCategory(unwrapCategory(payload))
}

export async function deleteCategory(id: string) {
  await api.delete(`/api/categories/${id}`)
}
