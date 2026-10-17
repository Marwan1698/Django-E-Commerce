import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'

import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { TextField } from '@/shared/components/Field'
import { safeRedirect } from '@/shared/redirect'

import { useAuth } from '../authContext'
import { AuthCard } from '../components/AuthCard'
import { loginSchema } from '../schemas'

export function LoginScene() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.login, values.password)
      navigate(safeRedirect(location.state?.from), { replace: true })
    } catch (err) {
      setFormError(describeError(err))
    }
  })

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your Bazario account"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-navy-700 underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
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
