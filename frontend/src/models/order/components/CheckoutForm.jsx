import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import { useAuth } from '@/models/user/authContext'
import { phoneSchema } from '@/models/user/schemas'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { TextAreaField, TextField } from '@/shared/components/Field'
import { applyServerErrors } from '@/shared/forms'
import { formatPrice } from '@/shared/format'

const FIELDS = ['full_name', 'phone_number', 'shipping_address', 'payment_method']

const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter the recipient’s name.').max(150),
  phone_number: phoneSchema,
  shipping_address: z.string().trim().min(5, 'Enter a full delivery address.').max(255),
  payment_method: z.literal('cash_on_delivery'),
})

/** `placeOrder` is the usePlaceOrder() mutation, owned by the scene. */
export function CheckoutForm({ total, placeOrder }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      full_name: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
      phone_number: user?.phone_number ?? '',
      shipping_address: user?.address ?? '',
      payment_method: 'cash_on_delivery',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const order = await placeOrder.mutateAsync(values)
      navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } })
    } catch (err) {
      setFormError(applyServerErrors(err, setError, FIELDS))
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Alert>{formError}</Alert>
      <TextField label="Full name" autoComplete="name" error={errors.full_name} {...register('full_name')} />
      <TextField label="Phone number" type="tel" autoComplete="tel" error={errors.phone_number} {...register('phone_number')} />
      <TextAreaField label="Delivery address" rows={3} autoComplete="street-address" error={errors.shipping_address} {...register('shipping_address')} />
      <fieldset>
        <legend className="text-sm font-semibold">Payment</legend>
        <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl bg-navy-50 p-4 ring-2 ring-navy-900">
          <input type="radio" value="cash_on_delivery" className="size-4" {...register('payment_method')} />
          <span className="text-sm">
            <span className="font-bold">Cash on delivery</span>
            <span className="block text-slate-500">Pay when your order arrives.</span>
          </span>
        </label>
      </fieldset>
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        Place order · {formatPrice(total)}
      </Button>
    </form>
  )
}
