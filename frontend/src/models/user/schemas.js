import { z } from 'zod'

// Mirrors the backend validators so most mistakes are caught before a request.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number (7–15 digits, optional leading +).')

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .refine((v) => !/^\d+$/.test(v), 'Password can’t be entirely numeric.')

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'At least 3 characters.')
      .max(150)
      .regex(/^[\w.@+-]+$/, 'Letters, digits and @ . + - _ only.'),
    email: z.email('Enter a valid email address.'),
    first_name: z.string().trim().max(150).optional(),
    last_name: z.string().trim().max(150).optional(),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords don’t match.' })

export const profileSchema = z.object({
  first_name: z.string().trim().max(150),
  last_name: z.string().trim().max(150),
  email: z.email('Enter a valid email address.'),
  phone_number: z.union([phoneSchema, z.literal('')]),
  address: z.string().trim().max(255),
})

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    new_password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: 'Passwords don’t match.' })
