import { useQuery } from '@tanstack/react-query'
import { ErrorView, LoadingView } from '../components/StatusView'
import { QUERY_KEYS } from '../lib/constants'
import { getErrorMessage } from '../lib/api'
import { getMyOrders } from '../services/orderService'

export function ProfilePage() {
  const ordersQuery = useQuery({
    queryKey: QUERY_KEYS.myOrders,
    queryFn: getMyOrders,
  })

  if (ordersQuery.isLoading) return <LoadingView text="Loading order history..." />
  if (ordersQuery.isError) {
    return <ErrorView message={getErrorMessage(ordersQuery.error)} />
  }

  return (
    <section>
      <h1>My Orders</h1>
      {ordersQuery.data?.length ? (
        <div className="stack">
          {ordersQuery.data.map((order) => (
            <article className="card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p className="muted">Status: {order.status}</p>
              <p>Total: ${order.totalAmount.toFixed(2)}</p>
              <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted">No orders yet.</p>
      )}
    </section>
  )
}

