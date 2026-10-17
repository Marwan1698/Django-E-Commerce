import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { z } from 'zod'

import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/Field'
import { PageSpinner } from '@/components/ui/Spinner'
import { phoneSchema } from '@/features/account/schemas'
import { useCart } from '@/features/cart/api'
import { applyServerErrors } from '@/lib/forms'
import { formatPrice } from '@/lib/format'

import { usePlaceOrder } from './api'

const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter the recipient’s name.').max(150),
  phone_number: phoneSchema,
  shipping_address: z.string().trim().min(5, 'Enter a full delivery address.').max(255),
  payment_method: z.literal('cash_on_delivery'),
})

type Values = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const { user } = useAuth()
  const { data: cart, isPending } = useCart()
  const placeOrder = usePlaceOrder()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      full_name: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
      phone_number: user?.phone_number ?? '',
      shipping_address: user?.address ?? '',
      payment_method: 'cash_on_delivery',
    },
  })

  if (isPending) return <PageSpinner />
  if (!cart || (cart.items.length === 0 && !placeOrder.isSuccess)) return <Navigate to="/cart" replace />

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const order = await placeOrder.mutateAsync(values)
      navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } })
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['full_name', 'phone_number', 'shipping_address', 'payment_method']))
    }
  })

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200" noValidate>
          <Alert>{formError}</Alert>
          <TextField label="Full name" autoComplete="name" error={errors.full_name} {...register('full_name')} />
          <TextField label="Phone number" type="tel" autoComplete="tel" error={errors.phone_number} {...register('phone_number')} />
          <TextAreaField label="Delivery address" rows={3} autoComplete="street-address" error={errors.shipping_address} {...register('shipping_address')} />
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Payment</legend>
            <label className="mt-2 flex items-center gap-3 rounded-lg p-3 ring-1 ring-brand-600">
              <input type="radio" value="cash_on_delivery" className="text-brand-600" {...register('payment_method')} />
              <span className="text-sm">
                <span className="font-medium">Cash on delivery</span>
                <span className="block text-slate-500">Pay when your order arrives.</span>
              </span>
            </label>
          </fieldset>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Place order · {formatPrice(cart.total)}
          </Button>
        </form>
      </section>
      <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your items</h2>
          <Link to="/cart" className="text-sm font-medium text-brand-600 hover:text-brand-700">Edit</Link>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="text-slate-700">{item.quantity} × {item.product.name}</span>
              <span>{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </aside>
    </div>
  )
}
