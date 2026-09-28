import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Tag, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageBody, PageHeader } from '@/components/app/page'
import { askConfirm } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, Banner } from '@/components/ui/card'
import { Segmented } from '@/components/ui/tabs'

type Plan = { id: string; name: string; for: string; month: number | null; features: string[]; top?: boolean }
const PLANS: Plan[] = [
  { id: 'starter', name: 'Starter', for: 'One business getting started', month: 99, features: ['1 business', '3 AI agents', '1,000 contacts', 'Text, email and web chat', 'Bookings calendar', 'Email support'] },
  { id: 'growth', name: 'Growth', for: 'Growing teams running campaigns every week', month: 299, top: true, features: ['3 businesses', 'All 18 AI agents', '50,000 contacts', 'Calls, WhatsApp and social apps', 'Max, your AI assistant', 'Reports and expenses', '10 team seats'] },
  { id: 'pro', name: 'Pro', for: 'Busy teams with many campaigns', month: 799, features: ['10 businesses', 'Unlimited agents and versions', '250,000 contacts', 'Voice cloning', 'API and webhooks', 'Priority support', '25 team seats'] },
  { id: 'enterprise', name: 'Enterprise', for: 'Large companies and agencies', month: null, features: ['Unlimited businesses', 'Custom AI agents', 'Single sign-on', 'Your own data region', 'A named success manager', 'Custom contract'] },
]
const FAQ: [string, string][] = [
  ['What costs extra?', 'Usage — call minutes, texts, WhatsApp, voices and data lookups — is billed at the provider’s price. Crewline adds nothing on top. You can see every cost in Expenses.'],
  ['Can I change plans any time?', 'Yes. Upgrades start right away. Downgrades start at your next billing date.'],
  ['Is there a contract?', 'No. Pay monthly or yearly and cancel any time. Yearly plans get two months free.'],
  ['What happens to my data if I leave?', 'You can export everything from Settings → Data before you go. We delete it 30 days after you cancel.'],
]

/** Plans and pricing (placeholder packages; the final ones come at the end of development). */
export function PricingPage() {
  const nav = useNavigate()
  const [yearly, setYearly] = React.useState<'m' | 'y'>('m'); const [cur, setCur] = React.useState('growth')
  const price = (p: Plan) => (p.month === null ? null : yearly === 'y' ? Math.round((p.month * 10) / 12) : p.month)
  const choose = async (p: Plan) => {
    if (p.month === null) { toast.success('Thanks! Our team will email you within one working day.'); return }
    if (await askConfirm({ title: `Switch to ${p.name}?`, description: `${yearly === 'y' ? `$${p.month * 10} a year` : `$${p.month} a month`}, plus usage at cost. ${PLANS.findIndex((x) => x.id === p.id) > PLANS.findIndex((x) => x.id === cur) ? 'It starts right away.' : 'It starts on your next billing date (Oct 1).'}`, ok: `Switch to ${p.name}` })) { setCur(p.id); toast.success(`You’re on ${p.name}`) }
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Plans and pricing" icon={<Tag />} actions={<Button variant="header" onClick={() => nav('/settings/billing')}>Billing and usage</Button>} />
      <PageBody wide>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <h2 className="text-xl font-semibold">An AI team for every business size</h2>
            <p className="max-w-[52ch] text-sm text-muted">Every plan includes AI agents that call, text and email, a shared inbox, stages, bookings and reports.</p>
            <Segmented value={yearly} onChange={setYearly} options={[{ value: 'm', label: 'Monthly' }, { value: 'y', label: <>Yearly<Badge tone="green" className="ml-1 h-4 px-1.5">2 months free</Badge></> }]} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => { const pr = price(p); const mine = p.id === cur; return (
              <Card key={p.id} className={cn('flex flex-col', p.top && 'ring-2 ring-btn')}>
                <CardBody className="flex flex-1 flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2"><h3 className="text-lg">{p.name}</h3>{p.top && <Badge tone="blue">Most popular</Badge>}{mine && <Badge tone="green">Your plan</Badge>}</div>
                    <p className="mt-0.5 min-h-10 text-sm text-muted">{p.for}</p>
                  </div>
                  <div className="flex items-baseline gap-1">{pr === null ? <span className="text-[28px] font-semibold leading-8">Let’s talk</span> : <><span className="text-[28px] font-semibold leading-8 tabular">${pr}</span><span className="text-sm text-muted">/ month{yearly === 'y' ? ', billed yearly' : ''}</span></>}</div>
                  <Button variant={p.top && !mine ? 'primary' : 'secondary'} disabled={mine} onClick={() => choose(p)} className="w-full">{mine ? 'Current plan' : p.month === null ? 'Talk to us' : `Choose ${p.name}`}</Button>
                  <ul className="space-y-2 border-t border-border-2 pt-4">{p.features.map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>)}</ul>
                </CardBody>
              </Card>
            ) })}
          </div>
          <Banner tone="info">These plans and prices are placeholders. The final packages will be set at the end of development.</Banner>
          <Card>
            <CardBody className="space-y-1"><h3 className="mb-1">Questions</h3>
              {FAQ.map(([q, a]) => (
                <details key={q} className="group border-t border-border-2 first-of-type:border-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">{q}<ChevronDown className="size-4 shrink-0 text-icon transition-transform group-open:rotate-180" /></summary>
                  <p className="pb-3 text-sm text-muted">{a}</p>
                </details>
              ))}
            </CardBody>
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
