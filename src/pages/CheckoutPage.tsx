import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { QUERY_KEYS } from '../lib/constants'
import { getErrorMessage } from '../lib/api'
import { checkoutSchema, type CheckoutSchema } from '../lib/validators'
import { createOrder } from '../services/orderService'

const steps = ['Shipping Info', 'Payment Details', 'Order Review']

export function CheckoutPage() {
  const [step, setStep] = useState(0)
  const { items, total, clearCart } = useCart()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: {
      fullName: '',
      shippingAddress: '',
      city: '',
      email: '',
      phoneNumber: '',
      requiresPostalCode: false,
      postalCode: '',
      paymentMethod: 'CREDIT_CARD',
    },
  })
  const checkoutMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      showToast('Order submitted successfully')
      clearCart()
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrders })
      navigate('/profile')
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  })

  function nextStep() {
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0))
  }

  function onSubmit(values: CheckoutSchema) {
    checkoutMutation.mutate({
      items,
      paymentMethod: values.paymentMethod,
      shippingInfo: {
        fullName: values.fullName,
        shippingAddress: values.shippingAddress,
        city: values.city,
        email: values.email,
        phoneNumber: values.phoneNumber,
        postalCode: values.postalCode,
        requiresPostalCode: values.requiresPostalCode,
      },
    })
  }

  if (items.length === 0) {
    return <p className="muted">Your cart is empty. Add products before checkout.</p>
  }

  return (
    <section>
      <h1>Checkout</h1>
      <p className="muted">
        Step {step + 1} of {steps.length}: {steps[step]}
      </p>

      <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
        {step === 0 && (
          <>
            <label className="field">
              <span>Full Name</span>
              <input className="input" {...form.register('fullName')} />
              {form.formState.errors.fullName && (
                <small className="error-text">{form.formState.errors.fullName.message}</small>
              )}
            </label>
            <label className="field">
              <span>Shipping Address</span>
              <input className="input" {...form.register('shippingAddress')} />
              {form.formState.errors.shippingAddress && (
                <small className="error-text">
                  {form.formState.errors.shippingAddress.message}
                </small>
              )}
            </label>
            <label className="field">
              <span>City</span>
              <input className="input" {...form.register('city')} />
              {form.formState.errors.city && (
                <small className="error-text">{form.formState.errors.city.message}</small>
              )}
            </label>
            <label className="field">
              <span>Email</span>
              <input className="input" {...form.register('email')} />
              {form.formState.errors.email && (
                <small className="error-text">{form.formState.errors.email.message}</small>
              )}
            </label>
            <label className="field">
              <span>Phone Number</span>
              <input className="input" {...form.register('phoneNumber')} />
              {form.formState.errors.phoneNumber && (
                <small className="error-text">{form.formState.errors.phoneNumber.message}</small>
              )}
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <label className="field">
              <span>Payment Method</span>
              <select className="input" {...form.register('paymentMethod')}>
                <option value="CREDIT_CARD">CREDIT_CARD</option>
                <option value="PAYPAL">PAYPAL</option>
                <option value="MOBILE_MONEY">MOBILE_MONEY</option>
                <option value="CASH_ON_DELIVERY">CASH_ON_DELIVERY</option>
              </select>
            </label>
            <label className="check">
              <input type="checkbox" {...form.register('requiresPostalCode')} />
              Shipping method requires postal code
            </label>
            <label className="field">
              <span>Postal Code</span>
              <input className="input" {...form.register('postalCode')} />
              {form.formState.errors.postalCode && (
                <small className="error-text">{form.formState.errors.postalCode.message}</small>
              )}
            </label>
          </>
        )}

        {step === 2 && (
          <article className="summary">
            <h3>Order Review</h3>
            <p>
              <strong>Items:</strong> {items.length}
            </p>
            <p>
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            <p>
              <strong>Payment:</strong> {form.watch('paymentMethod')}
            </p>
          </article>
        )}

        <div className="row">
          {step > 0 && (
            <button type="button" className="btn btn-secondary" onClick={previousStep}>
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" className="btn" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn" disabled={checkoutMutation.isPending}>
              {checkoutMutation.isPending ? 'Submitting...' : 'Place Order'}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
