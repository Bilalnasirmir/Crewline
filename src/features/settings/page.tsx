import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Settings, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/app/page'
import { Select } from '@/components/ui/select'
import { GetStartedSec, BusinessSec, AppearanceSec, TeamSec, NotificationsSec, BillingSec, PlansSec, HomeSec, InboxSec, Unknown } from './general'
import { ChannelsSec, AppsSec, VoicesSec, SourcesSec, FieldsSec, HygieneSec, DncSec, DataSec } from './channels'
import { CampDefSec, StageDefSec, ProductsSec, BookDefSec, AgentDefSec, MaxSec, RepDefSec, ComplianceSec, IntegrationsSec } from './defaults'

/** Every settings page: id, name, extra words people might search for, and the screen. */
const GROUPS: { g: string; items: [string, string, string, React.ComponentType][] }[] = [
  { g: '', items: [['getstarted', 'Get Started', 'setup steps checklist', GetStartedSec]] },
  { g: 'Your business', items: [['business', 'Business', 'name industry hours time zone workspace', BusinessSec], ['team', 'Team and roles', 'invite users permissions manager', TeamSec], ['notifications', 'Notifications', 'alerts email push quiet', NotificationsSec], ['appearance', 'Appearance', 'theme dark light navy blue sidebar', AppearanceSec]] },
  { g: 'Channels', items: [['channels', 'Phone, texting and email', 'numbers sms registration dns whatsapp messenger instagram tiktok web chat', ChannelsSec], ['apps', 'Connected apps', 'google calendar sheets outlook stripe zapier slack', AppsSec], ['voices', 'Voices', 'elevenlabs clone voice', VoicesSec]] },
  { g: 'Contacts and data', items: [['sources', 'Lead sources', 'origin ads referral', SourcesSec], ['fields', 'Custom fields', 'columns contact details', FieldsSec], ['hygiene', 'Database hygiene', 'dead numbers duplicates merge', HygieneSec], ['dncset', 'Do not contact', 'dnc opt out stop unsubscribe', DncSec], ['data', 'Data', 'providers lookups export import delete', DataSec]] },
  { g: 'Defaults', items: [['campdef', 'Campaigns', 'hours days limits channels follow ups', CampDefSec], ['stagedef', 'Stages', 'pipeline inbound outbound review', StageDefSec], ['products', 'Products and currency', 'prices revenue pkr dollar', ProductsSec], ['bookdef', 'Bookings', 'appointments receptionist reminders services', BookDefSec], ['agentdef', 'AI agents', 'discount disclose record language', AgentDefSec]] },
  { g: 'Workspace', items: [['home', 'Home', 'dashboard panels', HomeSec], ['inbox', 'Inbox', 'signature saved replies assign', InboxSec], ['max', 'Max', 'assistant memory permissions', MaxSec], ['repdef', 'Reports', 'folders pdf share', RepDefSec]] },
  { g: 'Account', items: [['billing', 'Billing and usage', 'plan invoices payment card limit', BillingSec], ['plans', 'Plans and pricing', 'upgrade packages', PlansSec], ['compliance', 'Compliance and privacy', 'consent recordings gdpr audit log', ComplianceSec], ['integrations', 'Integrations and API', 'api keys webhooks developers', IntegrationsSec]] },
]
const ALL = GROUPS.flatMap((g) => g.items)

/** Settings: grouped, searchable, one plain-language page per topic. Routes are /settings/<section>. */
export function SettingsPage() {
  const { section = 'business' } = useParams(); const nav = useNavigate()
  const [q, setQ] = React.useState('')
  const cur = ALL.find(([id]) => id === section)
  const Sec = cur?.[3]
  const match = (it: (typeof ALL)[number]) => !q || `${it[1]} ${it[2]}`.toLowerCase().includes(q.toLowerCase())
  const scroller = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [section])
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Settings" icon={<Settings />} sub="Everything you can set up, in plain words" />
      <div className="flex min-h-0 flex-1 gap-6 px-4">
        <nav aria-label="Settings sections" className="hidden w-[240px] shrink-0 overflow-y-auto pb-6 md:block">
          <label className="mb-2 flex h-8 items-center gap-2 rounded-control bg-surface px-2.5 shadow-[inset_0_0_0_1px_var(--border)] focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
            <Search className="size-4 text-icon" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search settings" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:outline-none" />
            {q && <button onClick={() => setQ('')} aria-label="Clear search" className="text-icon hover:text-text"><X className="size-4" /></button>}
          </label>
          {GROUPS.map((g) => { const items = g.items.filter(match); if (!items.length) return null; return (
            <div key={g.g || 'top'} className="mb-2">
              {g.g && <div className="px-2 pb-1 pt-2 text-xs font-semibold text-text">{g.g}</div>}
              {items.map(([id, l]) => <button key={id} onClick={() => nav(`/settings/${id}`)} aria-current={id === section} className={cn('flex h-7 w-full items-center rounded-control px-2 text-left text-sm transition-colors', id === section ? 'bg-surface font-semibold shadow-card' : 'hover:bg-fill-hover')}>{l}</button>)}
            </div>
          ) })}
          {!ALL.some(match) && <p className="px-2 text-sm text-muted">Nothing matches “{q}”.</p>}
        </nav>
        <div ref={scroller} className="-mx-1 min-h-0 min-w-0 flex-1 overflow-y-auto px-1 pb-16">
          <div className="mb-3 md:hidden"><Select value={section} onValueChange={(v) => nav(`/settings/${v}`)} options={GROUPS.flatMap((g) => g.items.map(([id, l]) => ({ value: id, label: l, group: g.g || 'Start' })))} /></div>
          <div className="mx-auto max-w-[760px]">{Sec ? <Sec /> : <Unknown onBack={() => nav('/settings/business')} />}</div>
        </div>
      </div>
    </div>
  )
}
