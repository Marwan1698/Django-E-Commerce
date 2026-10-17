import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { TextField } from '@/shared/components/Field'
import { applyServerErrors } from '@/shared/forms'

import { useChangePassword } from '../api'
import { changePasswordSchema } from '../schemas'

export function PasswordForm() {
  const change = useChangePassword()
  const [message, setMessage] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

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
