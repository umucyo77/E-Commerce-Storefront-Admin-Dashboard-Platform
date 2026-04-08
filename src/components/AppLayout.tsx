import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, userRole, logout } = useAuth()
  const navigate = useNavigate()

  function onLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link to="/" className="brand">
          Storefront
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink onClick={() => setOpen(false)} to="/">
            Catalog
          </NavLink>
          {isAuthenticated && userRole === 'USER' && (
            <>
              <NavLink onClick={() => setOpen(false)} to="/cart">
                My Cart
              </NavLink>
              <NavLink onClick={() => setOpen(false)} to="/profile">
                Profile
              </NavLink>
            </>
          )}
          {isAuthenticated && userRole === 'ADMIN' && (
            <NavLink onClick={() => setOpen(false)} to="/admin">
              Admin Dashboard
            </NavLink>
          )}
          {!isAuthenticated ? (
            <NavLink onClick={() => setOpen(false)} to="/login">
              Login
            </NavLink>
          ) : (
            <button type="button" className="link-btn" onClick={onLogout}>
              Logout
            </button>
          )}
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
