import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AdminRoute, UserRoute } from './components/ProtectedRoutes'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { ProfilePage } from './pages/ProfilePage'
import { StorefrontPage } from './pages/StorefrontPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />

          <Route
            path="/cart"
            element={
              <UserRoute>
                <CartPage />
              </UserRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserRoute>
                <CheckoutPage />
              </UserRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <UserRoute>
                <ProfilePage />
              </UserRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/product/new"
            element={
              <AdminRoute>
                <ProductFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/product/:id/edit"
            element={
              <AdminRoute>
                <ProductFormPage />
              </AdminRoute>
            }
          />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

