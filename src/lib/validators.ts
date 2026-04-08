import { z } from 'zod'
import { ORDER_STATUSES, PAYMENT_METHODS } from './constants'

const nonEmptyTrimmed = z
  .string()
  .trim()
  .min(1, 'This field is required')

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  fullName: nonEmptyTrimmed,
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const productSchema = z.object({
  title: nonEmptyTrimmed,
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters'),
  brand: nonEmptyTrimmed,
  categoryId: nonEmptyTrimmed,
  price: z.coerce.number().positive('Price must be greater than 0'),
  stockQuantity: z
    .coerce.number()
    .int('Stock quantity must be an integer')
    .min(0, 'Stock quantity must be 0 or greater'),
  images: z.string().refine((value) => {
    const images = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (!images.length) return false
    return images.every((url) => z.string().url().safeParse(url).success)
  }, 'At least one valid image URL is required'),
})

export const checkoutSchema = z
  .object({
    fullName: nonEmptyTrimmed,
    shippingAddress: nonEmptyTrimmed,
    city: nonEmptyTrimmed,
    email: z.string().email('Enter a valid email'),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    requiresPostalCode: z.boolean(),
    postalCode: z.string().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
  })
  .refine(
    (data) => !data.requiresPostalCode || !!data.postalCode?.trim(),
    {
      path: ['postalCode'],
      message: 'Postal code is required for this shipping method',
    },
  )

export const categorySchema = z.object({
  name: nonEmptyTrimmed,
})

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ProductFormInput = z.input<typeof productSchema>
export type ProductSchema = z.output<typeof productSchema>
export type CheckoutSchema = z.infer<typeof checkoutSchema>
export type CategorySchema = z.infer<typeof categorySchema>
export type OrderStatusSchema = z.infer<typeof orderStatusSchema>
