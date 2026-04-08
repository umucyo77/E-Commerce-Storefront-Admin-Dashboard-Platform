import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ErrorView, LoadingView } from '../components/StatusView'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getErrorMessage } from '../lib/api'
import { getProductById } from '../services/productService'

export function ProductDetailsPage() {
  const params = useParams()
  const { userRole } = useAuth()
  const { addItem } = useCart()

  const productQuery = useQuery({
    queryKey: ['products', params.id],
    queryFn: () => getProductById(params.id ?? ''),
    enabled: !!params.id,
  })

  if (productQuery.isLoading) return <LoadingView text="Loading product..." />
  if (productQuery.isError) {
    return <ErrorView message={getErrorMessage(productQuery.error)} />
  }

  const product = productQuery.data
  if (!product) return <ErrorView message="Product not found" />

  return (
    <section className="product-detail">
      <img src={product.images[0]} alt={product.title} className="detail-image" />
      <div>
        <h1>{product.title}</h1>
        <p className="muted">{product.brand}</p>
        <p>{product.description}</p>
        <p className="price">${product.price.toFixed(2)}</p>
        <p className="muted">Stock available: {product.stockQuantity}</p>
        {userRole === 'USER' && (
          <button className="btn" type="button" onClick={() => addItem(product)}>
            Add to Cart
          </button>
        )}
      </div>
    </section>
  )
}
