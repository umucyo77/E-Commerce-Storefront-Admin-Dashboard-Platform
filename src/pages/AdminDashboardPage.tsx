import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ConfirmModal } from '../components/ConfirmModal'
import { ErrorView, LoadingView } from '../components/StatusView'
import { useToast } from '../context/ToastContext'
import { ORDER_STATUSES, QUERY_KEYS } from '../lib/constants'
import { getErrorMessage } from '../lib/api'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'
import { getAllOrders, updateOrderStatus } from '../services/orderService'
import { deleteProduct, getProducts } from '../services/productService'
import type { OrderStatus } from '../types'

export function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts,
  })
  const ordersQuery = useQuery({
    queryKey: QUERY_KEYS.allOrders,
    queryFn: getAllOrders,
  })
  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      showToast('Product deleted')
      setDeleteId(null)
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrders })
      showToast('Order status updated')
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  })

  const categoryMutation = useMutation({
    mutationFn: (input: { id?: string; name: string }) =>
      input.id ? updateCategory(input.id, input.name) : createCategory(input.name),
    onSuccess: () => {
      setCategoryName('')
      setEditCategoryId(null)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
      showToast('Category saved')
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
      showToast('Category deleted')
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  })

  if (productsQuery.isLoading || ordersQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingView text="Loading admin dashboard..." />
  }

  if (productsQuery.isError) return <ErrorView message={getErrorMessage(productsQuery.error)} />
  if (ordersQuery.isError) return <ErrorView message={getErrorMessage(ordersQuery.error)} />
  if (categoriesQuery.isError) {
    return <ErrorView message={getErrorMessage(categoriesQuery.error)} />
  }

  const productNameById = new Map(
    (productsQuery.data ?? []).map((product) => [product.id, product.title]),
  )

  const getCustomerDisplayName = (fullName?: string, email?: string) => {
    const trimmedEmail = email?.trim()
    if (trimmedEmail) return trimmedEmail

    const trimmedFullName = fullName?.trim()
    if (trimmedFullName) return trimmedFullName

    return 'N/A'
  }

  return (
    <section>
      <div className="row between">
        <h1>Admin Dashboard</h1>
        <Link className="btn" to="/admin/product/new">
          Add Product
        </Link>
      </div>

      <h2>Inventory</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsQuery.data?.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stockQuantity}</td>
                <td>
                  <div className="row">
                    <Link className="btn btn-secondary" to={`/admin/product/${product.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      type="button"
                      disabled={!product.id}
                      onClick={() => setDeleteId(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Orders</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Client Email</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {ordersQuery.data?.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {getCustomerDisplayName(
                    order.shippingInfo?.fullName,
                    order.shippingInfo?.email,
                  )}
                </td>
                <td>
                  {order.items.length ? (
                    <div className="order-products">
                      {order.items.map((item, index) => {
                        const productName =
                          item.product?.title ??
                          productNameById.get(item.productId) ??
                          `Unknown (${item.productId.slice(0, 8)}...)`
                        return (
                          <div key={`${item.productId}-${index}`}>
                            {productName} x{item.quantity}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <select
                    className="input"
                    defaultValue={order.status}
                    onChange={(event) =>
                      updateStatusMutation.mutate({
                        id: order.id,
                        status: event.target.value as OrderStatus,
                      })
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Categories</h2>
      <form
        className="row"
        onSubmit={(event) => {
          event.preventDefault()
          if (!categoryName.trim()) return
          categoryMutation.mutate({ id: editCategoryId ?? undefined, name: categoryName })
        }}
      >
        <input
          className="input"
          value={categoryName}
          placeholder="Category name"
          onChange={(event) => setCategoryName(event.target.value)}
        />
        <button className="btn" type="submit">
          {editCategoryId ? 'Update Category' : 'Add Category'}
        </button>
      </form>
      <div className="stack">
        {categoriesQuery.data?.map((category) => (
          <article key={category.id} className="card">
            <div className="row between">
              <strong>{category.name}</strong>
              <div className="row">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setEditCategoryId(category.id)
                    setCategoryName(category.name)
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to remove this product?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId)
        }}
      />
    </section>
  )
}
