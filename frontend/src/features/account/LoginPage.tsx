import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import type { z } from 'zod'

import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { describeError } from '@/lib/api'
import { safeRedirect } from '@/lib/redirect'

import { AuthCard } from './AuthCard'
import { loginSchema } from './schemas'

type Values = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.login, values.password)
      navigate(safeRedirect((location.state as { from?: string } | null)?.from), { replace: true })
    } catch (err) {
      setFormError(describeError(err))
    }
  })

  return (
    <AuthCard
      title="Log in"
      footer={<>New here? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Alert>{formError}</Alert>
        <TextField label="Username or email" autoComplete="username" error={errors.login} {...register('login')} />
        <TextField label="Password" type="password" autoComplete="current-password" error={errors.password} {...register('password')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>
    </AuthCard>
  )
}
