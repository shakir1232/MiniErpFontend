import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { FormField, FormGrid } from '@/components/common/form-field'
import { DetailList } from '@/components/common/detail-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProjectStore } from '../store'

export function OrganizationPage() {
  const organization = useProjectStore((s) => s.organization)
  const updateOrganization = useProjectStore((s) => s.updateOrganization)
  const [draft, setDraft] = useState(organization)

  const save = () => {
    updateOrganization(draft)
    toast.success('Organization profile updated.')
  }

  return (
    <PageContainer>
      <PageHeader
        title="Project organization"
        description="Letterhead and report header details used across printed outputs"
        actions={
          <Button size="sm" onClick={save}>
            <Save className="size-4" /> Save changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Organization details" className="lg:col-span-2">
          <FormGrid>
            <FormField id="org-name" label="Organization name" required className="sm:col-span-2">
              <Input id="org-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </FormField>
            <FormField id="org-short" label="Short name" required>
              <Input id="org-short" value={draft.shortName} onChange={(e) => setDraft({ ...draft, shortName: e.target.value })} />
            </FormField>
            <FormField id="org-logo" label="Logo text" hint="Two characters shown in the app mark">
              <Input id="org-logo" maxLength={4} value={draft.logoText} onChange={(e) => setDraft({ ...draft, logoText: e.target.value })} />
            </FormField>
            <FormField id="org-ministry" label="Ministry / Division" className="sm:col-span-2">
              <Input id="org-ministry" value={draft.ministry} onChange={(e) => setDraft({ ...draft, ministry: e.target.value })} />
            </FormField>
            <FormField id="org-address" label="Address" className="sm:col-span-2">
              <Textarea id="org-address" rows={2} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            </FormField>
            <FormField id="org-phone" label="Phone">
              <Input id="org-phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </FormField>
            <FormField id="org-email" label="Email">
              <Input id="org-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </FormField>
            <FormField id="org-web" label="Website" className="sm:col-span-2">
              <Input id="org-web" value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} />
            </FormField>
          </FormGrid>
        </SectionCard>

        <SectionCard title="Letterhead preview" description="How the header prints on reports">
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-sm font-semibold">Government of the People's Republic of Bangladesh</p>
            <p className="text-xs text-muted-foreground">{draft.ministry}</p>
            <p className="mt-2 text-base font-bold">{draft.name}</p>
            <p className="text-xs text-muted-foreground">{draft.address}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {draft.phone} · {draft.email} · {draft.website}
            </p>
          </div>
          <div className="mt-4">
            <DetailList
              items={[
                { label: 'Short name', value: draft.shortName },
                { label: 'App mark', value: draft.logoText },
              ]}
            />
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
