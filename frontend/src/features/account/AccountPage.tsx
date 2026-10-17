import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/Field'
import { applyServerErrors } from '@/lib/forms'

import { useChangePassword, useUpdateProfile } from './api'
import { changePasswordSchema, profileSchema } from './schemas'

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200 md:grid-cols-3">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </section>
  )
}

function ProfileForm() {
  const { user } = useAuth()
  const update = useUpdateProfile()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      phone_number: user?.phone_number ?? '',
      address: user?.address ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null)
    try {
      await update.mutateAsync(values)
      setMessage({ tone: 'success', text: 'Profile saved.' })
    } catch (err) {
      const text = applyServerErrors(err, setError, ['first_name', 'last_name', 'email', 'phone_number', 'address'])
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

function PasswordForm() {
  const change = useChangePassword()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof changePasswordSchema>>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = handleSubmit(async ({ current_password, new_password }) => {
    setMessage(null)
    try {
      await change.mutateAsync({ current_password, new_password })
      reset()
      setMessage({ tone: 'success', text: 'Password changed. Other devices have been signed out.' })
    } catch (err) {
      const text = applyServerErrors(err, setError, ['current_password', 'new_password'])
      if (text) setMessage({ tone: 'error', text })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <TextField label="Current password" type="password" autoComplete="current-password" error={errors.current_password} {...register('current_password')} />
      <TextField label="New password" type="password" autoComplete="new-password" error={errors.new_password} {...register('new_password')} />
      <TextField label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm} {...register('confirm')} />
      <Button type="submit" loading={isSubmitting}>Change password</Button>
    </form>
  )
}

export function AccountPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-slate-600">Signed in as {user?.username}</p>
      </div>
      <Section title="Profile" description="Your contact details pre-fill checkout.">
        <ProfileForm />
      </Section>
      <Section title="Password" description="Changing it signs you out on every other device.">
        <PasswordForm />
      </Section>
    </div>
  )
}
