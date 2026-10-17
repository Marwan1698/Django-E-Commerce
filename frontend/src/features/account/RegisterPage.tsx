import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import type { z } from 'zod'

import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { applyServerErrors } from '@/lib/forms'

import { AuthCard } from './AuthCard'
import { registerSchema } from './schemas'

type Values = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: signUp } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async ({ confirm: _confirm, ...values }) => {
    setFormError(null)
    try {
      await signUp(values)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['username', 'email', 'password', 'first_name', 'last_name']))
    }
  })

  return (
    <AuthCard
      title="Create your account"
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Alert>{formError}</Alert>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="First name" autoComplete="given-name" error={errors.first_name} {...register('first_name')} />
          <TextField label="Last name" autoComplete="family-name" error={errors.last_name} {...register('last_name')} />
        </div>
        <TextField label="Username" autoComplete="username" error={errors.username} {...register('username')} />
        <TextField label="Email" type="email" autoComplete="email" error={errors.email} {...register('email')} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, not all numbers."
          error={errors.password}
          {...register('password')}
        />
        <TextField label="Confirm password" type="password" autoComplete="new-password" error={errors.confirm} {...register('confirm')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>
    </AuthCard>
  )
}
