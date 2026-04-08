import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '../components/ProductCard'
import { ErrorView, LoadingView } from '../components/StatusView'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { QUERY_KEYS } from '../lib/constants'
import { getErrorMessage } from '../lib/api'
import { getProducts } from '../services/productService'

export function StorefrontPage() {
  const { userRole } = useAuth()
  const { addItem } = useCart()
  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts,
  })

  if (productsQuery.isLoading) return <LoadingView text="Loading products..." />
  if (productsQuery.isError) {
    return <ErrorView message={getErrorMessage(productsQuery.error)} />
  }

  return (
    <section>
      <h1>Storefront Catalog</h1>
      <p className="muted">Browse products and shop from the latest catalog.</p>
      <div className="grid">
        {productsQuery.data?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={userRole === 'USER' ? addItem : undefined}
          />
        ))}
      </div>
    </section>
  )
}
