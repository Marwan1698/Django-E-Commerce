import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import { useCategories } from '@/models/category/api'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { SelectField, TextAreaField, TextField } from '@/shared/components/Field'
import { applyServerErrors } from '@/shared/forms'

import { useSaveProduct } from '../api'
import { ProductImage } from './ProductImage'

const MAX_IMAGE_MB = 5
const FIELDS = ['name', 'category_id', 'price', 'stock', 'description', 'image', 'is_active']

const productSchema = z.object({
  name: z.string().trim().min(2, 'Give your product a name.').max(120),
  category_id: z.string().min(1, 'Choose a category.'),
  price: z.string().trim().regex(/^\d{1,8}(\.\d{1,2})?$/, 'Enter a price like 19.99.'),
  stock: z.coerce.number().int('Whole numbers only.').min(0, 'Can’t be negative.').max(1_000_000),
  description: z.string().trim().max(5000),
  is_active: z.boolean(),
  image: z
    .any()
    .refine((files) => !files?.[0] || files[0].type.startsWith('image/'), 'Choose an image file.')
    .refine((files) => !files?.[0] || files[0].size <= MAX_IMAGE_MB * 1024 * 1024, `Images must be ${MAX_IMAGE_MB} MB or smaller.`),
})

function toFormValues(product) {
  if (!product) return { name: '', category_id: '', price: '', stock: '1', description: '', is_active: true }
  return {
    name: product.name,
    category_id: String(product.category.id),
    price: product.price,
    stock: String(product.stock),
    description: product.description,
    is_active: product.is_active,
  }
}

/** Create a product, or edit `product` when given. */
export function ProductForm({ product }) {
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const save = useSaveProduct(product?.id)
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: toFormValues(product) })

  const onSubmit = handleSubmit(async ({ image, ...values }) => {
    setFormError(null)
    const data = new FormData()
    for (const [key, value] of Object.entries(values)) data.append(key, String(value))
    if (image?.[0]) data.append('image', image[0])
    try {
      const saved = await save.mutateAsync(data)
      navigate(`/products/${saved.id}`)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, FIELDS))
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
        {product && <ProductImage product={product} className="size-20 shrink-0 rounded-2xl ring-1 ring-slate-200" />}
        <div className="flex-1">
          <TextField
            label={product?.image ? 'Replace image' : 'Image'}
            type="file"
            accept="image/*"
            hint={`JPG, PNG or WebP, up to ${MAX_IMAGE_MB} MB.`}
            error={errors.image}
            {...register('image')}
          />
        </div>
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full bg-slate-50 px-4 py-2.5 text-sm font-medium ring-1 ring-slate-200">
        <input type="checkbox" className="size-4" {...register('is_active')} />
        Visible in the shop
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>{product ? 'Save changes' : 'Publish'}</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </form>
  )
}
