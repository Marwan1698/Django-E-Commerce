import { useParams } from 'react-router'

import { ProductBrowser } from '@/models/product/components/ProductBrowser'
import { NotFoundScene } from '@/shared/scenes/NotFoundScene'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'

import { useCategories } from '../api'
import { CategoryPills } from '../components/CategoryPills'

export function CategoryScene() {
  const { slug } = useParams()
  const { data: categories, isPending } = useCategories()
  if (isPending) return <PageSpinner />
  const category = categories?.find((c) => c.slug === slug)
  if (!category) return <NotFoundScene />

  return (
    <div className="space-y-6">
      <PageHeader title={category.name} subtitle={`Everything in ${category.name.toLowerCase()}.`} />
      <CategoryPills />
      <ProductBrowser category={category.slug} />
    </div>
  )
}
