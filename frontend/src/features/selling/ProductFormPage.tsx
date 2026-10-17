import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'

import { useAuth } from '@/auth/AuthContext'
import { ProductImage } from '@/components/ProductImage'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { PageSpinner } from '@/components/ui/Spinner'
import { useCategories, useProduct } from '@/features/catalog/api'
import { describeError } from '@/lib/api'
import { applyServerErrors } from '@/lib/forms'

import { useSaveProduct } from './api'

const MAX_IMAGE_MB = 5

const productSchema = z.object({
  name: z.string().trim().min(2, 'Give your product a name.').max(120),
  category_id: z.string().min(1, 'Choose a category.'),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, 'Enter a price like 19.99.'),
  stock: z.coerce.number<string>().int('Whole numbers only.').min(0, 'Can’t be negative.').max(1_000_000),
  description: z.string().trim().max(5000),
  is_active: z.boolean(),
  image: z
    .instanceof(FileList)
    .optional()
    .refine((files) => !files?.[0] || files[0].type.startsWith('image/'), 'Choose an image file.')
    .refine((files) => !files?.[0] || files[0].size <= MAX_IMAGE_MB * 1024 * 1024, `Images must be ${MAX_IMAGE_MB} MB or smaller.`),
})

type Input = z.input<typeof productSchema>
type Values = z.output<typeof productSchema>

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const existing = useProduct(id)
  const save = useSaveProduct(isEdit ? Number(id) : undefined)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Values>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', category_id: '', price: '', stock: '1', description: '', is_active: true },
  })

  const product = existing.data
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category_id: String(product.category.id),
        price: product.price,
        stock: String(product.stock),
        description: product.description,
        is_active: product.is_active,
      })
    }
  }, [product, reset])

  if (isEdit && existing.isPending) return <PageSpinner />
  if (isEdit && existing.error) return <Alert>{describeError(existing.error)}</Alert>
  if (isEdit && product && product.seller !== user?.username && !user?.is_staff) {
    return <Alert>You can only edit your own listings.</Alert>
  }

  const onSubmit = handleSubmit(async ({ image, ...values }) => {
    setFormError(null)
    const data = new FormData()
    for (const [key, value] of Object.entries(values)) data.append(key, String(value))
    if (image?.[0]) data.append('image', image[0])
    try {
      const saved = await save.mutateAsync(data)
      navigate(`/products/${saved.id}`)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['name', 'category_id', 'price', 'stock', 'description', 'image', 'is_active']))
    }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/selling" className="text-sm font-medium text-brand-600 hover:text-brand-700">← Your listings</Link>
      <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit listing' : 'List a product'}</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200" noValidate>
        <Alert>{formError}</Alert>
        <TextField label="Name" error={errors.name} {...register('name')} />
        <SelectField label="Category" error={errors.category_id} {...register('category_id')}>
          <option value="">Choose…</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Price (USD)" inputMode="decimal" placeholder="19.99" error={errors.price} {...register('price')} />
          <TextField label="Stock" type="number" min={0} error={errors.stock} {...register('stock')} />
        </div>
        <TextAreaField label="Description" rows={5} error={errors.description} {...register('description')} />
        <div className="flex items-start gap-4">
          {product && <ProductImage product={product} className="size-20 shrink-0 rounded-lg ring-1 ring-slate-200" />}
          <div className="flex-1">
            <TextField
              label={product?.image ? 'Replace image' : 'Image'}
              type="file"
              accept="image/*"
              hint={`JPG, PNG or WebP, up to ${MAX_IMAGE_MB} MB.`}
              error={errors.image as never}
              {...register('image')}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="size-4 rounded border-slate-300 text-brand-600" {...register('is_active')} />
          Visible in the shop
        </label>
        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save changes' : 'Publish'}</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
