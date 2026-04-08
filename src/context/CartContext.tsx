import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { STORAGE_KEYS } from '../lib/constants'
import { readStorage, writeStorage } from '../lib/storage'
import type { CartItem, Product } from '../types'
import {
  addCartItem,
  clearRemoteCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from '../services/cartService'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(STORAGE_KEYS.cart, []),
  )
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, items)
  }, [items])

  const { data: remoteCart } = useQuery({
    queryKey: ['cart', 'remote'],
    queryFn: getCart,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (remoteCart?.items) setItems(remoteCart.items)
  }, [remoteCart])

  const addMutation = useMutation({
    mutationFn: addCartItem,
    onError: () => showToast('Could not sync cart with server', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateCartItemQuantity(id, quantity),
    onError: () => showToast('Could not update cart item', 'error'),
  })

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onError: () => showToast('Could not remove cart item', 'error'),
  })

  const clearMutation = useMutation({
    mutationFn: clearRemoteCart,
    onError: () => showToast('Could not clear cart', 'error'),
  })

  function addItem(product: Product, quantity = 1) {
    const nextItems = [...items]
    const index = nextItems.findIndex((item) => item.productId === product.id)
    if (index >= 0) {
      nextItems[index] = {
        ...nextItems[index],
        quantity: nextItems[index].quantity + quantity,
      }
    } else {
      nextItems.push({
        productId: product.id,
        quantity,
        product,
      })
    }
    setItems(nextItems)
    if (isAuthenticated) {
      addMutation.mutate({
        productId: product.id,
        variantId: product.variantId,
        quantity,
        product,
      })
    }
    showToast('Item added to cart')
  }

  function removeItem(productId: string) {
    const current = items.find((item) => item.productId === productId)
    const nextItems = items.filter((item) => item.productId !== productId)
    setItems(nextItems)
    if (isAuthenticated && current?.id) removeMutation.mutate(current.id)
  }

  function updateItemQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return removeItem(productId)
    const nextItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    )
    setItems(nextItems)
    const current = items.find((item) => item.productId === productId)
    if (isAuthenticated && current?.id) {
      updateMutation.mutate({ id: current.id, quantity })
    }
  }

  function clearCart() {
    setItems([])
    if (isAuthenticated) clearMutation.mutate()
  }

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
        0,
      ),
    [items],
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateItemQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
