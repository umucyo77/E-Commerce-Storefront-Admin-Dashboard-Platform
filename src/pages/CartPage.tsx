import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function CartPage() {
  const { items, total, removeItem, updateItemQuantity } = useCart()

  return (
    <section>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p className="muted">Your cart is empty.</p>
      ) : (
        <>
          <div className="stack">
            {items.map((item) => (
              <article className="cart-item" key={item.productId}>
                <div>
                  <strong>{item.product?.title ?? item.productId}</strong>
                  <p className="muted">${item.product?.price?.toFixed(2) ?? '0.00'}</p>
                </div>
                <div className="row">
                  <input
                    type="number"
                    min={1}
                    className="input qty"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItemQuantity(item.productId, Number(event.target.value))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="row end">
            <strong>Total: ${total.toFixed(2)}</strong>
            <Link className="btn" to="/checkout">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
