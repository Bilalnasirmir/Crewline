import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, Image, Send, Sparkles, Eye, Check } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Switch, ChoiceRow } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { AgentAvatar } from '@/components/ui/avatar'
import { PlatIcon, PLATFORMS } from '@/components/app/icons'
import { ToggleChip } from '@/components/app/bits'
import { dISO } from '@/data/seed'
import type { Contact, Platform } from '@/data/types'

const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
type Line = { p: string; qty: number; price: number; disc: number }

/** Full quotation: line items, discounts, tax, pictures, sent by email, text and/or WhatsApp. Lands in the chat and the history. */
export function QuoteDialog({ open, onOpenChange, contact, convo }: { open: boolean; onOpenChange: (o: boolean) => void; contact?: Contact; convo?: string }) {
  const s = useStore()
  const prods = s.products[contact?.camp ?? 'k1'] ?? s.products.k1
  const items = prods.cats.flatMap((c) => c.items)
  const [lines, setLines] = React.useState<Line[]>([]); const [tax, setTax] = React.useState(13); const [notes, setNotes] = React.useState(''); const [pics, setPics] = React.useState<string[]>([]); const [via, setVia] = React.useState<string[]>(['email'])
  const [valid, setValid] = React.useState('14')
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { if (open) { setLines([{ p: items[0]?.name ?? 'Service', qty: 1, price: items[0]?.value ?? 0, disc: 0 }]); setNotes(''); setPics([]); setVia(contact?.email ? ['email'] : ['sms']) } }, [open])
  const cur = prods.cur === '$' ? '$' : prods.cur + ' '
  const sub = lines.reduce((n, l) => n + l.qty * l.price * (1 - l.disc / 100), 0); const total = sub * (1 + tax / 100)
  const up = (i: number, p: Partial<Line>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...p } : l)))
  const send = () => {
    const no = 'Q-' + (2300 + Math.floor(Math.random() * 90))
    const q = { t: 'quote' as const, no, lines: [...lines.map((l) => [`${l.qty} × ${l.p}${l.disc ? ` (−${l.disc}%)` : ''}`, l.qty * l.price * (1 - l.disc / 100)] as [string, number]), [`Tax ${tax}%`, sub * tax / 100] as [string, number]], total, cur, time: now(), via }
    if (convo) s.pushConvoItem(convo, q)
    s.addActivity({ icon: 'megaphone', text: `<b>You</b> sent quotation ${no} (${money(total, cur)}) to <b>${contact?.name ?? 'a customer'}</b>`, time: 'just now', k: 'sys' })
    onOpenChange(false); toast.success(`Quotation ${no} sent by ${via.map((v) => PLATFORMS[v as Platform].label).join(' and ')} · saved to history`)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" title="Send a quotation" description={contact ? `For ${contact.name || contact.phone}${contact.email ? ` · ${contact.email}` : ''}` : undefined}
        footer={<><span className="mr-auto text-lg font-semibold tabular">Total {money(total, cur)}</span><Button onClick={() => toast('Opening the quotation preview (PDF)')}><Eye />Preview</Button><Button onClick={() => { onOpenChange(false); toast('Saved as a draft quotation') }}>Save draft</Button><Button variant="primary" disabled={!lines.length || !via.length} onClick={send}><Send />Send quotation</Button></>}>
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-card border border-border">
            <Table>
              <thead><tr><Th>Product or service</Th><Th className="w-20">Qty</Th><Th className="w-28">Price</Th><Th className="w-24">Discount</Th><Th align="right">Total</Th><Th className="w-8" /></tr></thead>
              <tbody>{lines.map((l, i) => (
                <Tr key={i}>
                  <Td className="min-w-[220px]"><Combobox size="sm" value={l.p} creatable onChange={(p: string) => { const it = items.find((x) => x.name === p); up(i, { p, price: it?.value ?? l.price }) }} options={items.map((it) => ({ value: it.name, label: it.name, hint: money(it.value, cur) }))} /></Td>
                  <Td><Input className="h-7 w-16 md:h-7" inputMode="numeric" value={l.qty} onChange={(e) => up(i, { qty: +e.target.value || 0 })} /></Td>
                  <Td><Input className="h-7 w-24 md:h-7" inputMode="decimal" value={l.price} onChange={(e) => up(i, { price: +e.target.value || 0 })} /></Td>
                  <Td><Input className="h-7 w-16 md:h-7" inputMode="numeric" value={l.disc} onChange={(e) => up(i, { disc: Math.min(100, +e.target.value || 0) })} /></Td>
                  <Td align="right" className="font-medium">{money(l.qty * l.price * (1 - l.disc / 100), cur)}</Td>
                  <Td><Button variant="ghost" size="icon-xs" onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label="Remove line"><Trash2 /></Button></Td>
                </Tr>
              ))}</tbody>
            </Table>
            <div className="flex flex-wrap items-center gap-3 border-t border-border-2 px-3 py-2">
              <Button onClick={() => setLines([...lines, { p: '', qty: 1, price: 0, disc: 0 }])}><Plus />Add a line</Button>
              <span className="ml-auto flex items-center gap-2 text-sm">Tax<Input className="h-7 w-16 md:h-7" inputMode="decimal" value={tax} onChange={(e) => setTax(+e.target.value || 0)} />%</span>
              <span className="text-sm text-muted tabular">Subtotal {money(sub, cur)} · Tax {money(sub * tax / 100, cur)}</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Note to the customer"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Free installation this month. Prices include your 10% loyalty discount." className="min-h-20" /></Field>
            <div className="space-y-3">
              <Field label="Valid for"><Select value={valid} onValueChange={setValid} options={['7', '14', '30'].map((d) => ({ value: d, label: `${d} days` }))} /></Field>
              <Field label="Pictures">
                <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => { setPics([...pics, ...Array.from(e.target.files ?? []).map((f) => f.name)]); e.target.value = '' }} />
                <div className="flex flex-wrap items-center gap-1.5">{pics.map((p, i) => <Badge key={i} tone="outline"><Image />{p}</Badge>)}<Button onClick={() => ref.current?.click()}><Image />Add pictures</Button><Button variant="ghost" onClick={() => setPics([...pics, 'router.jpg'])}>Use a sample</Button></div>
              </Field>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-sm">Send it by</div>
            <div className="flex flex-wrap gap-1.5">{(['email', 'sms', 'wa'] as Platform[]).map((p) => <ToggleChip key={p} on={via.includes(p)} onClick={() => setVia(via.includes(p) ? via.filter((x) => x !== p) : [...via, p])}>{via.includes(p) && <Check />}<PlatIcon p={p} size={12} tip={false} className={cn(via.includes(p) && 'text-btn-fg')} />{PLATFORMS[p].label}</ToggleChip>)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Record a sale or purchase. It shows in the history, dashboards and revenue. */
export function RecordSaleDialog({ open, onOpenChange, contact, convo }: { open: boolean; onOpenChange: (o: boolean) => void; contact?: Contact; convo?: string }) {
  const s = useStore()
  const camp = s.campaigns.find((k) => k.id === contact?.camp); const prods = s.products[contact?.camp ?? 'k1'] ?? s.products.k1
  const items = prods.cats.flatMap((c) => c.items); const rev = stagesFor(camp, s.stages).find((st) => st.rev)
  const [p, setP] = React.useState(''); const [amt, setAmt] = React.useState(0); const [date, setDate] = React.useState(dISO(0)); const [move, setMove] = React.useState(true)
  React.useEffect(() => { if (open) { setP(items[0]?.name ?? ''); setAmt(items[0]?.value ?? 0); setDate(dISO(0)); setMove(!!rev) } }, [open])
  if (!contact) return null
  const save = () => {
    s.updateContact(contact.id, { purchase: { product: p, amount: amt, date }, sold: date })
    if (move && rev) s.moveLead(contact.id, rev.name, 'you', 'sale recorded')
    if (convo) s.pushConvoItem(convo, { t: 'ev', k: 'sys', text: `Sale recorded: ${p} · ${money(amt)}`, time: now() })
    s.addActivity({ icon: 'megaphone', text: `<b>You</b> recorded a sale for <b>${contact.name}</b> — ${p}, ${money(amt)}`, time: 'just now', k: 'sale' })
    onOpenChange(false); toast.success('Sale recorded · shows in history, dashboards and revenue')
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" title="Record a sale" description={contact.name || contact.phone} footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!p} onClick={save}>Record sale</Button></>}>
        <div className="space-y-3">
          <Field label="Product"><Combobox value={p} creatable onChange={(v: string) => { setP(v); const it = items.find((x) => x.name === v); if (it) setAmt(it.value) }} options={items.map((it) => ({ value: it.name, label: it.name, hint: money(it.value) }))} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Amount"><Input inputMode="decimal" value={amt} onChange={(e) => setAmt(+e.target.value || 0)} /></Field><Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
          {rev && <label className="flex items-center justify-between gap-3 rounded-card border border-border p-3 text-sm"><span>Move to <b className="font-semibold">{rev.name}</b> (counts revenue)</span><Switch checked={move} onCheckedChange={setMove} /></label>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Start a conversation yourself, or hand it to an AI agent that follows a campaign's instructions. */
export function NewMessageDialog({ open, onOpenChange, preset, onStarted }: { open: boolean; onOpenChange: (o: boolean) => void; preset?: { cid?: string; plat?: Platform }; onStarted?: (vid: string) => void }) {
  const s = useStore(); const nav = useNavigate()
  const [cid, setCid] = React.useState(''); const [plat, setPlat] = React.useState<Platform>('sms'); const [mode, setMode] = React.useState<'me' | 'ai'>('me')
  const [text, setText] = React.useState(''); const [agent, setAgent] = React.useState('s1'); const [camp, setCamp] = React.useState('k1')
  React.useEffect(() => { if (open) { setCid(preset?.cid ?? ''); setPlat(preset?.plat ?? 'sms'); setMode('me'); setText(''); const c = s.contacts.find((x) => x.id === preset?.cid); setAgent(c?.agent ?? 's1'); setCamp(c?.camp ?? 'k1') } }, [open])
  const c = s.contacts.find((x) => x.id === cid)
  const go = () => {
    const vid = s.startConvo(cid, plat, mode === 'me' ? { text, human: true } : { agent, camp, human: false, text: text || `Hi ${c?.first || 'there'}, it’s ${s.agents.find((a) => a.id === agent)?.name} from ${s.campaigns.find((k) => k.id === camp)?.biz}. ${s.setupOf(camp)?.opening.sms?.split('👋')[1]?.trim() ?? 'Do you have a minute?'}` })
    onOpenChange(false); onStarted?.(vid); nav(`/inbox?kind=chat&id=${vid}`)
    toast.success(mode === 'me' ? 'Sent' : `${s.agents.find((a) => a.id === agent)?.name} is handling it with the ${s.campaigns.find((k) => k.id === camp)?.name} instructions`)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" title="New message" description="Send it yourself, or let an AI agent handle it" footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!cid || (mode === 'me' && !text.trim())} onClick={go}><Send />{mode === 'me' ? 'Send' : 'Hand to agent'}</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <Field label="To"><Combobox value={cid} onChange={setCid} placeholder="Search people" options={s.contacts.filter((x) => x.name).map((x) => ({ value: x.id, label: x.name, hint: x.phone }))} /></Field>
            <Field label="Channel"><Select value={plat} onValueChange={(v) => setPlat(v as Platform)} options={(['sms', 'wa', 'msg', 'ig', 'tt', 'chat'] as Platform[]).map((p) => ({ value: p, label: PLATFORMS[p].label, icon: <PlatIcon p={p} size={14} tip={false} /> }))} /></Field>
          </div>
          {c && !c.consent[plat === 'wa' ? 'wa' : 'sms'] && <p className="rounded-control bg-warning-soft px-3 py-2 text-sm text-warning">{c.name} hasn’t agreed to {PLATFORMS[plat].label}. Only send if they asked you to.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <ChoiceRow checked={mode === 'me'} onClick={() => setMode('me')} title="Send it myself" description="You handle the conversation." />
            <ChoiceRow checked={mode === 'ai'} onClick={() => setMode('ai')} title={<span className="flex items-center gap-1.5"><Sparkles className="size-4" />Let an AI agent handle it</span>} description="It follows a campaign’s instructions." />
          </div>
          {mode === 'ai' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Agent"><Select value={agent} onValueChange={setAgent} options={s.agents.filter((a) => ['sales', 'marketing', 'reception', 'support'].includes(a.type)).map((a) => ({ value: a.id, label: a.name, icon: <AgentAvatar name={a.name} size={16} /> }))} /></Field>
              <Field label="Using the instructions of"><Select value={camp} onValueChange={setCamp} options={s.campaigns.map((k) => ({ value: k.id, label: k.name }))} /></Field>
            </div>
          )}
          <Field label={mode === 'me' ? 'Message' : 'First message (optional — the agent writes one if empty)'}><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-24" placeholder={`Hi ${c?.first || 'there'}…`} /></Field>
        </div>
      </DialogContent>
    </Dialog>
  )
}
