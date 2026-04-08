import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorView, LoadingView } from '../components/StatusView'
import { useToast } from '../context/ToastContext'
import { QUERY_KEYS } from '../lib/constants'
import { getErrorMessage } from '../lib/api'
import { type ProductFormInput, productSchema } from '../lib/validators'
import { getCategories } from '../services/categoryService'
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../services/productService'

export function ProductFormPage() {
  const params = useParams()
  const isEdit = !!params.id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      brand: '',
      categoryId: '',
      price: 0,
      stockQuantity: 0,
      images: '',
    },
  })

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories,
  })

  const productQuery = useQuery({
    queryKey: ['products', params.id],
    queryFn: () => getProductById(params.id ?? ''),
    enabled: isEdit,
  })

  useEffect(() => {
    if (productQuery.data) {
      form.reset({
        title: productQuery.data.title,
        description: productQuery.data.description,
        brand: productQuery.data.brand,
        categoryId: productQuery.data.categoryId,
        price: productQuery.data.price,
        stockQuantity: productQuery.data.stockQuantity,
        images: productQuery.data.images.join(', '),
      })
    }
  }, [form, productQuery.data])

  const mutation = useMutation({
    mutationFn: async (values: ProductFormInput) => {
      const parsed = productSchema.parse(values)
      const payload = {
        ...parsed,
        images: parsed.images
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }
      if (isEdit && params.id) {
        return updateProduct(params.id, payload)
      }
      return createProduct(payload)
    },
    onSuccess: () => {
      showToast(isEdit ? 'Product updated' : 'Product created')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      navigate('/admin')
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  })

  if (categoriesQuery.isLoading || (isEdit && productQuery.isLoading)) {
    return <LoadingView text="Loading product form..." />
  }

  if (categoriesQuery.isError) return <ErrorView message={getErrorMessage(categoriesQuery.error)} />
  if (productQuery.isError) return <ErrorView message={getErrorMessage(productQuery.error)} />

  return (
    <section>
      <h1>{isEdit ? 'Edit Product' : 'Create Product'}</h1>
      <form className="form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <label className="field">
          <span>Title</span>
          <input className="input" {...form.register('title')} />
          {form.formState.errors.title && (
            <small className="error-text">{form.formState.errors.title.message}</small>
          )}
        </label>
        <label className="field">
          <span>Description</span>
          <textarea className="input" rows={5} {...form.register('description')} />
          {form.formState.errors.description && (
            <small className="error-text">{form.formState.errors.description.message}</small>
          )}
        </label>
        <label className="field">
          <span>Brand</span>
          <input className="input" {...form.register('brand')} />
          {form.formState.errors.brand && (
            <small className="error-text">{form.formState.errors.brand.message}</small>
          )}
        </label>
        <label className="field">
          <span>Category</span>
          <select className="input" {...form.register('categoryId')}>
            <option value="">Select category</option>
            {categoriesQuery.data?.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId && (
            <small className="error-text">{form.formState.errors.categoryId.message}</small>
          )}
        </label>
        <label className="field">
          <span>Price</span>
          <input className="input" type="number" step="0.01" {...form.register('price')} />
          {form.formState.errors.price && (
            <small className="error-text">{form.formState.errors.price.message}</small>
          )}
        </label>
        <label className="field">
          <span>Stock Quantity</span>
          <input className="input" type="number" {...form.register('stockQuantity')} />
          {form.formState.errors.stockQuantity && (
            <small className="error-text">{form.formState.errors.stockQuantity.message}</small>
          )}
        </label>
        <label className="field">
          <span>Image URLs (comma-separated)</span>
          <input className="input" {...form.register('images')} />
          {form.formState.errors.images && (
            <small className="error-text">{form.formState.errors.images.message as string}</small>
          )}
        </label>
        <button className="btn" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </section>
  )
}
