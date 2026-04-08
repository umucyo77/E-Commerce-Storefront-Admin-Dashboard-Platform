import { Link } from 'react-router-dom'
import type { Product } from '../types'

export function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd?: (product: Product) => void
}) {
  return (
    <article className="card">
      <img
        src={product.images[0]}
        alt={product.title}
        className="product-image"
        loading="lazy"
      />
      <h3>{product.title}</h3>
      <p className="muted">{product.brand}</p>
      <p>{product.description.slice(0, 90)}...</p>
      <div className="row">
        <span className="price">${product.price.toFixed(2)}</span>
        <span className="muted">Stock: {product.stockQuantity}</span>
      </div>
      <div className="row">
        <Link className="btn btn-secondary" to={`/products/${product.id}`}>
          View
        </Link>
        {onAdd && (
          <button
            type="button"
            className="btn"
            onClick={() => onAdd(product)}
            disabled={product.stockQuantity < 1}
          >
            Add to Cart
          </button>
        )}
      </div>
    </article>
  )
}

