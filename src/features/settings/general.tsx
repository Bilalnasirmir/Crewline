import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, Plus, Pencil, Trash2, UserPlus, Send, CreditCard, Download, ArrowRight, Rocket, LayoutDashboard, CircleCheck, Circle } from 'lucide-react'
import { cn, money, nf, plural } from '@/lib/utils'
import { useStore, type Theme } from '@/store'
import { askConfirm } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch, Checkbox, Progress } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { LineList, OptionRow } from '@/features/shared/led'
import { InviteDialog } from '@/features/getstarted/page'
import { CustomizeDialog } from '@/features/home/page'
import { SecHead, SetCard, SwitchRow, SelectRow, HoursEditor, usePref, defaultHours, type Hours } from './ui'
import type { Business } from '@/data/types'

const TZ = ['Eastern Time (Toronto, New York)', 'Central Time (Chicago)', 'Mountain Time (Denver)', 'Pacific Time (Los Angeles)', 'Pakistan Time (Karachi)', 'Gulf Time (Dubai)', 'UK Time (London)', 'Central Europe (Paris)']

export function GetStartedSec() {
  const s = useStore(); const nav = useNavigate(); const done = s.gs.filter((g) => g.done).length
  return (
    <div className="space-y-4">
      <SecHead title="Get Started" description="The first steps to a working AI team. Come back any time." action={<Button variant="primary" onClick={() => nav('/get-started')}><Rocket />Open Get Started</Button>} />
      <Card>
        <CardBody className="space-y-2"><div className="flex items-center justify-between text-sm"><span>{done} of {s.gs.length} done</span><span className="text-muted">{Math.round((done / s.gs.length) * 100)}%</span></div><Progress value={(done / s.gs.length) * 100} /></CardBody>
        {s.gs.map((g) => (
          <button key={g.k} onClick={() => nav('/get-started')} className="flex w-full items-center gap-3 border-t border-border-2 px-4 py-2.5 text-left hover:bg-subtle-2">
            {g.done ? <CircleCheck className="size-5 shrink-0 text-success" /> : <Circle className="size-5 shrink-0 text-faint" />}
            <span className="min-w-0 flex-1"><span className={cn('block text-sm font-medium', g.done && 'text-muted line-through')}>{g.l}</span><span className="block truncate text-xs text-muted">{g.d}</span></span>
            <ArrowRight className="size-4 text-icon" />
          </button>
        ))}
      </Card>
      <SetCard><SwitchRow k="set.gsInNav" title="Show Get Started in the sidebar" description="Hide it once you’re set up." /></SetCard>
    </div>
  )
}

function BusinessDialog({ b, onClose }: { b: Business | 'new' | null; onClose: () => void }) {
  const patch = useStore((s) => s.patch)
  const [v, setV] = React.useState({ name: '', industry: '', site: '', phone: '', address: '', tz: TZ[0] })
  React.useEffect(() => { if (b) setV(b === 'new' ? { name: '', industry: '', site: '', phone: '', address: '', tz: TZ[0] } : { name: b.name, industry: b.industry, site: `${b.name.toLowerCase().replace(/[^a-z]+/g, '')}.example`, phone: '(905) 555-0100', address: 'Mississauga, ON', tz: TZ[0] }) }, [b])
  const save = () => {
    if (b === 'new') patch('biz', (L) => [...L, { id: `b${Date.now()}`, name: v.name, industry: v.industry || 'Other' }])
    else if (b) patch('biz', (L) => L.map((x) => (x.id === b.id ? { ...x, name: v.name, industry: v.industry } : x)))
    onClose(); toast.success(b === 'new' ? `${v.name} added` : 'Business saved')
  }
  return (
    <Dialog open={!!b} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="md" title={b === 'new' ? 'Add a business' : 'Business details'} description="Agents use these details in every conversation" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!v.name.trim()} onClick={save}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoFocus /></Field>
          <Field label="Industry"><Select value={v.industry || undefined} onValueChange={(industry) => setV({ ...v, industry })} placeholder="Pick one" options={['Telecom', 'Real estate', 'Dental clinic', 'Restaurant', 'Salon & spa', 'Home services', 'Insurance', 'Solar', 'Other'].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Website"><Input value={v.site} onChange={(e) => setV({ ...v, site: e.target.value })} /></Field>
          <Field label="Main phone"><Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} /></Field>
          <Field label="Time zone" className="sm:col-span-2"><Select value={v.tz} onValueChange={(tz) => setV({ ...v, tz })} options={TZ.map((x) => ({ value: x, label: x }))} /></Field>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function BusinessSec() {
  const s = useStore(); const [edit, setEdit] = React.useState<Business | 'new' | null>(null)
  const [name, setName] = usePref('set.workspace', 'Bilal’s Group'); const [hours, setHours] = usePref<Hours>('set.hours', defaultHours())
  return (
    <div className="space-y-4">
      <SecHead title="Business" description="Your businesses, workspace and opening hours." />
      <SetCard title="Your businesses" description="Each business keeps its own campaigns, stages and products." action={<Button onClick={() => setEdit('new')}><Plus />Add a business</Button>} flush>
        {s.biz.map((b) => (
          <div key={b.id} className="flex items-center gap-3 border-t border-border-2 px-4 py-2.5">
            <Avatar name={b.name} size={32} square />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{b.name}</span><span className="block text-xs text-muted">{b.industry} · {plural(s.campaigns.filter((c) => c.biz === b.name).length, 'campaign')}</span></span>
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${b.name}`} onClick={() => setEdit(b)}><Pencil /></Button>
          </div>
        ))}
      </SetCard>
      <SetCard title="Workspace">
        <OptionRow title="Workspace name" description="Shown at the top right."><Input className="w-56" value={name} onChange={(e) => setName(e.target.value)} /></OptionRow>
        <SelectRow k="set.tz" title="Time zone" d={TZ[0]} options={TZ} />
        <SelectRow k="set.lang" title="Language" description="For Crewline itself. Agents talk in any language." d="English" options={['English', 'Urdu', 'Spanish', 'French', 'Arabic']} />
        <SelectRow k="set.datefmt" title="Date format" d="Sep 27, 2026" options={['Sep 27, 2026', '27 Sep 2026', '2026-09-27']} />
        <SelectRow k="set.week" title="Week starts on" d="Monday" options={['Monday', 'Sunday', 'Saturday']} />
      </SetCard>
      <SetCard title="Opening hours" description="Agents take messages and book call-backs outside these hours." action={<Button onClick={() => toast.success('Opening hours saved')}><Check />Save hours</Button>}>
        <HoursEditor value={hours} onChange={setHours} />
      </SetCard>
      <BusinessDialog b={edit} onClose={() => setEdit(null)} />
    </div>
  )
}

const THEMES: { v: Theme; l: string; d: string; side: string; bg: string; card: string; bar: string }[] = [
  { v: 'light', l: 'Light', d: 'Bright and clear', side: '#EBEBEB', bg: '#F1F1F1', card: '#FFFFFF', bar: '#0A0A0A' },
  { v: 'dark', l: 'Dark', d: 'Easy on the eyes at night', side: '#161719', bg: '#111214', card: '#1C1D21', bar: '#0B0C0E' },
  { v: 'navy', l: 'Dark blue', d: 'Dark with a deep blue tint', side: '#0E1A2E', bg: '#0B1526', card: '#12213A', bar: '#08101E' },
  { v: 'mixed', l: 'Mixed', d: 'Dark sidebar, light pages', side: '#161719', bg: '#F1F1F1', card: '#FFFFFF', bar: '#0A0A0A' },
]
export function AppearanceSec() {
  const s = useStore()
  return (
    <div className="space-y-4">
      <SecHead title="Appearance" description="How Crewline looks on this device." />
      <Card>
        <CardBody className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {THEMES.map((t) => (
            <button key={t.v} onClick={() => { s.setTheme(t.v); toast.success(`${t.l} theme on`) }} aria-pressed={s.theme === t.v} className={cn('overflow-hidden rounded-card border text-left transition-colors', s.theme === t.v ? 'border-btn shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border hover:border-border-strong')}>
              <span className="flex h-20 flex-col" style={{ background: t.bg }}>
                <span className="h-3" style={{ background: t.bar }} />
                <span className="flex flex-1 gap-1.5 p-1.5"><span className="w-6 rounded-sm" style={{ background: t.side }} /><span className="flex flex-1 flex-col gap-1"><span className="h-3 rounded-sm" style={{ background: t.card }} /><span className="flex-1 rounded-sm" style={{ background: t.card }} /></span></span>
              </span>
              <span className="flex items-center justify-between gap-2 px-2.5 py-2"><span><span className="block text-sm font-medium">{t.l}</span><span className="block text-xs text-muted">{t.d}</span></span>{s.theme === t.v && <Check className="size-4 shrink-0" />}</span>
            </button>
          ))}
        </CardBody>
      </Card>
      <SetCard title="Layout">
        <OptionRow title="Collapse the sidebar" description="More room for tables and the calendar."><Switch checked={s.sidebarCollapsed} onCheckedChange={() => s.toggleSidebar()} /></OptionRow>
        <SwitchRow k="set.compact" title="Compact tables" description="Fit more rows on the screen." d={false} />
        <SwitchRow k="set.motion" title="Reduce motion" description="Fewer animations." d={false} />
        <OptionRow title="Show live activity" description="Watch agents work in real time on Home and Stages."><Switch checked={s.live} onCheckedChange={(v) => { s.setLive(v); toast(v ? 'Live updates on' : 'Live updates paused') }} /></OptionRow>
      </SetCard>
    </div>
  )
}

const PERMS = ['See every business', 'Change campaigns', 'Edit AI agents', 'Import and export contacts', 'See expenses and billing', 'Invite teammates', 'Take over conversations']
export function TeamSec() {
  const s = useStore(); const [invite, setInvite] = React.useState(false)
  const [perm, setPerm] = usePref<Record<string, boolean>>('set.perms', {})
  const allowed = (role: string, p: string, i: number) => perm[`${role}:${p}`] ?? (role === 'Owner' || (role === 'Manager' && i < 6) || (role === 'Team member' && i === 6))
  return (
    <div className="space-y-4">
      <SecHead title="Team and roles" description="Who can do what. Teammates get hand-overs and can step into any conversation." action={<Button variant="primary" onClick={() => setInvite(true)}><UserPlus />Invite</Button>} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto"><Table>
          <thead><tr><Th>Name</Th><Th>Role</Th><Th>Can see</Th><Th className="w-10" /></tr></thead>
          <tbody>{s.team.map((t) => (
            <Tr key={t.email}>
              <Td><span className="flex items-center gap-2"><Avatar name={t.name} size={24} /><span><span className="block font-medium">{t.name}</span><span className="block text-xs text-muted">{t.email}</span></span></span></Td>
              <Td>{t.role === 'Owner' ? <Badge>Owner</Badge> : <Select size="sm" className="w-[140px]" value={t.role} onValueChange={(role) => { s.patch('team', (L) => L.map((x) => (x.email === t.email ? { ...x, role } : x))); toast.success(`${t.name} is now a ${role.toLowerCase()}`) }} options={['Manager', 'Team member'].map((x) => ({ value: x, label: x }))} />}</Td>
              <Td className="text-muted">{t.scope}</Td>
              <Td className="py-0">{t.role !== 'Owner' && <Button variant="ghost" size="icon-sm" aria-label={`Remove ${t.name}`} onClick={async () => { if (await askConfirm({ title: `Remove ${t.name}?`, description: 'Their open hand-overs go back to you.', ok: 'Remove', danger: true })) { s.patch('team', (L) => L.filter((x) => x.email !== t.email)); toast.success(`${t.name} removed`) } }}><Trash2 /></Button>}</Td>
            </Tr>
          ))}</tbody>
        </Table></div>
      </Card>
      <SetCard title="What each role can do" flush>
        <div className="overflow-x-auto"><Table>
          <thead><tr><Th>Permission</Th>{['Owner', 'Manager', 'Team member'].map((r) => <Th key={r} className="text-center">{r}</Th>)}</tr></thead>
          <tbody>{PERMS.map((p, i) => <Tr key={p}><Td>{p}</Td>{['Owner', 'Manager', 'Team member'].map((r) => <Td key={r} className="text-center"><span className="inline-flex"><Checkbox disabled={r === 'Owner'} checked={allowed(r, p, i)} onCheckedChange={(v) => setPerm({ ...perm, [`${r}:${p}`]: !!v })} aria-label={`${r}: ${p}`} /></span></Td>)}</Tr>)}</tbody>
        </Table></div>
      </SetCard>
      <InviteDialog open={invite} onOpenChange={setInvite} />
    </div>
  )
}

const EVENTS = ['Someone asks for a person', 'Booking request', 'Choose a stage', 'Upset customer', 'New lead', 'Sale recorded', 'Campaign finished', 'Budget 80% used', 'Daily summary', 'Weekly report']
const CHANNELS = ['In app', 'Email', 'Text', 'Phone push']
export function NotificationsSec() {
  const [m, setM] = usePref<Record<string, boolean>>('set.notif', {})
  const on = (e: string, c: string, i: number) => m[`${e}|${c}`] ?? (c === 'In app' || (c === 'Email' && i >= 7) || (c === 'Phone push' && i < 4))
  return (
    <div className="space-y-4">
      <SecHead title="Notifications" description="Choose how you hear about each thing." action={<Button onClick={() => toast('Test notification sent to all your channels')}><Send />Send a test</Button>} />
      <Card className="overflow-hidden"><div className="overflow-x-auto"><Table>
        <thead><tr><Th>When</Th>{CHANNELS.map((c) => <Th key={c} className="text-center">{c}</Th>)}</tr></thead>
        <tbody>{EVENTS.map((e, i) => <Tr key={e}><Td>{e}</Td>{CHANNELS.map((c) => <Td key={c} className="text-center"><span className="inline-flex"><Switch size="sm" checked={on(e, c, i)} onCheckedChange={(v) => setM({ ...m, [`${e}|${c}`]: v })} aria-label={`${e} by ${c}`} /></span></Td>)}</Tr>)}</tbody>
      </Table></div></Card>
      <SetCard title="Quiet hours">
        <SwitchRow k="set.quiet" title="Don’t send texts or push notifications at night" description="From 9 PM to 8 AM. Urgent hand-overs still come through." />
        <SelectRow k="set.digest" title="Summary email" d="Every morning at 8 AM" options={['Every morning at 8 AM', 'Every Monday', 'Never']} />
      </SetCard>
    </div>
  )
}

export function BillingSec() {
  const nav = useNavigate(); const exp = useStore((s) => s.expenses)
  const month = exp.reduce((a, e) => a + e.cost, 0)
  const [cap, setCap] = usePref('set.cap', '2500')
  const meters: [string, number, number, string][] = [['AI call minutes', 6120, 10000, 'min'], ['Texts', 41880, 50000, ''], ['Contacts', 20340, 50000, ''], ['Team seats', 5, 10, '']]
  return (
    <div className="space-y-4">
      <SecHead title="Billing and usage" description="Your plan, what’s included and your invoices." action={<Button onClick={() => nav('/expenses')}>See every cost<ArrowRight /></Button>} />
      <Card><CardBody className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1"><div className="text-sm text-muted">Current plan</div><div className="text-xl font-semibold">Growth · $299 / month</div><div className="text-sm text-muted">Renews Oct 1 · usage billed at cost, nothing added</div></div>
        <Button onClick={() => nav('/pricing')}>Compare plans</Button><Button variant="primary" onClick={() => nav('/pricing')}>Change plan</Button>
      </CardBody></Card>
      <SetCard title="Included this month" description={`Spent so far: ${money(month)}`}>
        {meters.map(([l, u, max, unit]) => <div key={l} className="space-y-1.5 py-3"><div className="flex justify-between text-sm"><span>{l}</span><span className="text-muted tabular">{nf(u)} of {nf(max)}{unit && ` ${unit}`}</span></div><Progress value={(u / max) * 100} color={u / max > 0.8 ? 'var(--warning-fill)' : undefined} /></div>)}
      </SetCard>
      <SetCard title="Payment">
        <OptionRow title={<span className="flex items-center gap-2"><CreditCard className="size-4 text-icon" />Visa ending in 4242</span>} description="Expires 08/28"><Button onClick={() => toast('Opens the secure payment page — connected when billing goes live')}>Update</Button></OptionRow>
        <OptionRow title="Spending limit" description="Pause all agents if a month’s spend goes over this."><span className="flex items-center gap-1.5 text-sm">$<Input className="w-24" inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value.replace(/[^\d]/g, ''))} /></span></OptionRow>
        <SwitchRow k="set.autoTopup" title="Warn me at 80% of the limit" />
      </SetCard>
      <SetCard title="Invoices" flush>
        <Table><thead><tr><Th>Date</Th><Th>Amount</Th><Th>Status</Th><Th className="w-10" /></tr></thead>
          <tbody>{[['Sep 1, 2026', 1487.2], ['Aug 1, 2026', 1302.55], ['Jul 1, 2026', 1150.1], ['Jun 1, 2026', 612.4]].map(([d, a]) => <Tr key={d as string}><Td>{d}</Td><Td className="tabular">${(a as number).toFixed(2)}</Td><Td><Badge tone="green">Paid</Badge></Td><Td className="py-0"><Button variant="ghost" size="icon-sm" aria-label={`Download invoice ${d}`} onClick={() => toast('Invoice PDF downloaded (demo)')}><Download /></Button></Td></Tr>)}</tbody>
        </Table>
      </SetCard>
    </div>
  )
}

export function PlansSec() {
  const nav = useNavigate()
  return (
    <div className="space-y-4">
      <SecHead title="Plans and pricing" description="Compare plans and switch any time." />
      <Card><CardBody className="flex flex-wrap items-center gap-4"><div className="min-w-0 flex-1"><div className="text-sm text-muted">You’re on</div><div className="text-xl font-semibold">Growth</div></div><Button variant="primary" onClick={() => nav('/pricing')}>See all plans<ArrowRight /></Button></CardBody></Card>
    </div>
  )
}

export function HomeSec() {
  const s = useStore(); const [open, setOpen] = React.useState(false)
  return (
    <div className="space-y-4">
      <SecHead title="Home" description="What you see first when you open Crewline." action={<Button variant="primary" onClick={() => setOpen(true)}><LayoutDashboard />Customize Home</Button>} />
      <SetCard title="Showing now">
        <OptionRow title="Panels" description={`${s.homePanels.length} panels on Home`}><Button onClick={() => setOpen(true)}>Change</Button></OptionRow>
        <OptionRow title="Key numbers" description={`${s.homeKpis.length} numbers at the top`}><Button onClick={() => setOpen(true)}>Change</Button></OptionRow>
        <SelectRow k="set.homeRange" title="Default date range" d="Today" options={['Today', 'Last 7 days', 'Last 30 days']} />
        <SwitchRow k="set.greeting" title="Show a greeting with today’s summary" />
      </SetCard>
      <CustomizeDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

export function InboxSec() {
  const [sig, setSig] = usePref('set.sig', 'Bilal Nasir\nBilal’s Group · (905) 555-0142')
  const [canned, setCanned] = usePref<string[]>('set.canned', ['Thanks! Someone from our team will call you shortly.', 'Here’s the link to book a time that suits you.', 'Sorry for the wait — I’m looking into it now.'])
  return (
    <div className="space-y-4">
      <SecHead title="Inbox" description="How conversations reach you and your team." />
      <SetCard title="Conversations">
        <SelectRow k="set.assignTo" title="When a customer needs a person, send it to" d="Whoever is free" options={['Whoever is free', 'Bilal Nasir', 'Ali Raza', 'The business’s manager']} />
        <SwitchRow k="set.readTicks" title="Show read ticks to customers" description="Where the app supports it (WhatsApp, Messenger)." />
        <SwitchRow k="set.markRead" title="Mark as read when I open a conversation" />
        <SwitchRow k="set.handBack" title="Hand back to the agent after 30 minutes of silence" d={false} />
      </SetCard>
      <SetCard title="Email signature"><div className="py-3"><Textarea value={sig} onChange={(e) => setSig(e.target.value)} className="min-h-20" /></div></SetCard>
      <SetCard title="Saved replies" description="Insert them with / in any conversation."><div className="py-3"><LineList items={canned} onChange={setCanned} placeholder="Type a reply and press Enter" /></div></SetCard>
    </div>
  )
}

export function Unknown({ onBack }: { onBack: () => void }) {
  return <Card><CardBody className="space-y-2 text-sm"><p>This settings page doesn’t exist.</p><Button onClick={onBack}>Go to Business settings</Button></CardBody></Card>
}

