import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section>
      <h1>Page Not Found</h1>
      <p className="muted">The page you requested does not exist.</p>
      <Link className="btn" to="/">
        Back to Home
      </Link>
    </section>
  )
}

