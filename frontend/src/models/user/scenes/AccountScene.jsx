import { Card } from '@/shared/components/Card'
import { PageHeader } from '@/shared/components/PageHeader'

import { useAuth } from '../authContext'
import { PasswordForm } from '../components/PasswordForm'
import { ProfileForm } from '../components/ProfileForm'

function Section({ title, description, children }) {
  return (
    <Card as="section" className="grid gap-6 p-6 sm:p-8 md:grid-cols-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </Card>
  )
}

export function AccountScene() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <PageHeader title="Account" subtitle={`Signed in as ${user?.username}`} />
      <Section title="Profile" description="Your contact details pre-fill checkout.">
        <ProfileForm />
      </Section>
      <Section title="Password" description="Changing it signs you out on every other device.">
        <PasswordForm />
      </Section>
    </div>
  )
}
