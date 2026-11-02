import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { TextField } from '@/shared/components/Field'
import { applyServerErrors } from '@/shared/forms'

import { useAuth } from '../authContext'
import { AuthCard } from '../components/AuthCard'
import { registerSchema } from '../schemas'

export function RegisterScene() {
  const { register: signUp } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

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
      title="Join eStore"
      subtitle="Buy and sell in minutes"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy-700 underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
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
