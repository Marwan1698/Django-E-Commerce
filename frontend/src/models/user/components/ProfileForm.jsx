import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { TextAreaField, TextField } from '@/shared/components/Field'
import { applyServerErrors } from '@/shared/forms'

import { useUpdateProfile } from '../api'
import { useAuth } from '../authContext'
import { profileSchema } from '../schemas'

const FIELDS = ['first_name', 'last_name', 'email', 'phone_number', 'address']

export function ProfileForm() {
  const { user } = useAuth()
  const update = useUpdateProfile()
  const [message, setMessage] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: Object.fromEntries(FIELDS.map((f) => [f, user?.[f] ?? ''])),
  })

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null)
    try {
      await update.mutateAsync(values)
      setMessage({ tone: 'success', text: 'Profile saved.' })
    } catch (err) {
      const text = applyServerErrors(err, setError, FIELDS)
      if (text) setMessage({ tone: 'error', text })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" autoComplete="given-name" error={errors.first_name} {...register('first_name')} />
        <TextField label="Last name" autoComplete="family-name" error={errors.last_name} {...register('last_name')} />
      </div>
      <TextField label="Email" type="email" autoComplete="email" error={errors.email} {...register('email')} />
      <TextField label="Phone number" type="tel" autoComplete="tel" error={errors.phone_number} {...register('phone_number')} />
      <TextAreaField label="Address" rows={2} autoComplete="street-address" error={errors.address} {...register('address')} />
      <Button type="submit" loading={isSubmitting}>Save profile</Button>
    </form>
  )
}
