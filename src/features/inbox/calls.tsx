import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, Voicemail, Delete, Bot, MicOff, Mic, Pause, Play, Grid3x3, Circle, PhoneForwarded, StickyNote, CalendarDays, MessageSquare, ArrowLeft, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/input'
import { Avatar, AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { Card, EmptyState } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CampaignChip } from '@/components/app/bits'
import { Recording, Transcript } from '@/features/shared/media'
import { NewBookingDialog } from '@/features/bookings/shared'
import type { Call } from '@/data/types'

const KEYS: [string, string][] = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']]
type Live = { num: string; name: string; cid: string | null; ai: string | null; camp: string | null; t0: number; lines: [string, string][]; mute: boolean; hold: boolean; rec: boolean; pad: boolean; notes: string }
const iconOf = (l: Call) => (l.status === 'missed' ? { I: PhoneMissed, c: 'text-danger', t: 'Missed' } : l.status === 'failed' ? { I: PhoneOff, c: 'text-muted', t: 'Failed' } : l.status === 'voicemail' ? { I: Voicemail, c: 'text-warning', t: 'Voicemail' } : l.dir === 'in' ? { I: PhoneIncoming, c: 'text-success', t: 'Incoming' } : { I: PhoneOutgoing, c: 'text-primary', t: 'Outgoing' })
const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

export function CallsView({ kindTabs }: { kindTabs: React.ReactNode }) {
  const nav = useNavigate(); const [sp, setSp] = useSearchParams(); const s = useStore()
  const [f, setF] = React.useState<'all' | 'in' | 'out' | 'missed'>('all'); const [q, setQ] = React.useState('')
  const [num, setNum] = React.useState(sp.get('dial') ?? ''); const [live, setLive] = React.useState<Live | null>(null); const [, tick] = React.useReducer((x: number) => x + 1, 0)
  const [book, setBook] = React.useState<{ cid?: string; who?: string } | null>(null)
  const [from, setFrom] = React.useState(s.numbers[0].n); const [aiAgent, setAiAgent] = React.useState('s1'); const [aiCamp, setAiCamp] = React.useState('k1')
  const nameOf = (l: Call) => s.contacts.find((c) => c.id === l.cid)?.name || l.num || 'Unknown'
  const list = s.calls.filter((l) => (f === 'all' || (f === 'missed' ? l.status === 'missed' : l.dir === f)) && `${nameOf(l)} ${l.summary} ${l.num ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  const id = sp.get('id'); const cur = s.calls.find((l) => l.id === id)
  const match = s.contacts.find((c) => num.replace(/\D/g, '').length >= 7 && c.phone.replace(/\D/g, '').endsWith(num.replace(/\D/g, '').slice(-7)))
  const dial = sp.get('dial')
  React.useEffect(() => { if (dial) { setNum(dial); setLive(null); sp.delete('dial'); sp.delete('id'); setSp(sp, { replace: true }) } }, [dial])
  React.useEffect(() => { if (!live) return; const t = setInterval(tick, 1000); return () => clearInterval(t) }, [live])
  // An AI call streams its transcript line by line.
  React.useEffect(() => {
    if (!live?.ai) return
    const a = s.agents.find((x) => x.id === live.ai)!; const first = live.name.split(' ')[0]
    const script: [string, string][] = [[a.name, `Hi, is this ${first}? It’s ${a.name}, an AI assistant from ${s.campaigns.find((k) => k.id === live.camp)?.biz ?? 'Metro Mobile'}.`], [first, 'Yes, speaking.'], [a.name, 'I’m calling about Internet 1 Gig — $50 a month with free installation this month. Do you have home internet right now?'], [first, 'I do, but I’m paying too much.'], [a.name, 'I can probably save you about $30 a month. Would Saturday morning work for the installation?'], [first, 'Saturday works.'], [a.name, 'Great, you’re booked for Saturday between 9 and 11. I’ll text you the details.']]
    let i = live.lines.length
    const t = setInterval(() => { if (i >= script.length) { clearInterval(t); return } const line = script[i++]; setLive((l) => (l ? { ...l, lines: [...l.lines, line] } : l)) }, 1700)
    return () => clearInterval(t)
  }, [live?.ai, live?.t0])
  const start = (n: string, ai: string | null) => {
    if (!n.trim()) { toast('Type a number first'); return }
    const c = s.contacts.find((x) => x.phone.replace(/\D/g, '').endsWith(n.replace(/\D/g, '').slice(-7)))
    setLive({ num: n, name: c?.name || n, cid: c?.id ?? null, ai, camp: ai ? aiCamp : c?.camp ?? null, t0: Date.now(), lines: [], mute: false, hold: false, rec: true, pad: false, notes: '' })
    sp.delete('id'); setSp(sp, { replace: true })
    if (ai) toast(`${s.agents.find((a) => a.id === ai)?.name} is calling ${c?.name || n} — the stage updates when the call ends`)
  }
  const end = () => {
    if (!live) return
    const sec = Math.floor((Date.now() - live.t0) / 1000); const a = s.agents.find((x) => x.id === live.ai)
    const call: Call = { id: 'l' + Date.now(), cid: live.cid, num: live.cid ? undefined : live.num, dir: 'out', status: 'answered', by: live.ai ?? 'you', camp: live.camp, dur: `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, time: 'Today just now', summary: live.ai ? (live.lines.length > 5 ? 'Interested — installation booked for Saturday 9–11 AM.' : 'Short call — asked to call back later.') : live.notes || 'Call by you.' }
    s.patch('calls', (cs) => [call, ...cs])
    if (live.cid) { const c = s.contacts.find((x) => x.id === live.cid)!; s.updateContact(c.id, { lastDays: 0, attempts: c.attempts + 1 }); if (live.ai && live.lines.length > 5) s.moveLead(c.id, c.stage === 'New' ? 'Interested' : c.stage, live.ai) }
    s.addActivity({ icon: 'phone', text: `<b>${a?.name ?? 'You'}</b> finished a call with <b>${live.name}</b> (${call.dur})`, time: 'just now', k: 'call' })
    setLive(null); sp.set('id', call.id); setSp(sp, { replace: true }); toast.success('Call saved · summary and recording are in the log')
  }
  const sec = live ? Math.floor((Date.now() - live.t0) / 1000) : 0
  const agentOpts = s.agents.filter((a) => ['sales', 'reception', 'support', 'marketing'].includes(a.type)).map((a) => ({ value: a.id, label: a.name, icon: <AgentAvatar name={a.name} size={16} /> }))
  const aiPop = (n: string, trigger: React.ReactNode) => (
    <Popover><PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="center" className="w-72 space-y-3">
        <div className="text-sm font-medium">Let an AI agent call {n || 'this number'}</div>
        <Field label="Agent"><Select value={aiAgent} onValueChange={setAiAgent} options={agentOpts} /></Field>
        <Field label="Following the instructions of"><Select value={aiCamp} onValueChange={setAiCamp} options={s.campaigns.map((k) => ({ value: k.id, label: k.name }))} /></Field>
        <Button variant="primary" className="w-full" onClick={() => start(n, aiAgent)}><Bot />Start the AI call</Button>
      </PopoverContent></Popover>
  )
  return (
    <>
      <div className={cn('flex w-full shrink-0 flex-col border-r border-border md:w-[340px]', (cur || live) ? 'max-md:hidden' : 'flex')}>
        <div className="space-y-2 border-b border-border-2 p-3">
          {kindTabs}
          <div className="flex items-center gap-2"><Segmented value={f} onChange={setF} options={[{ value: 'all', label: 'All' }, { value: 'in', label: 'Inbound' }, { value: 'out', label: 'Outbound' }, { value: 'missed', label: 'Missed' }]} /></div>
          <label className="flex h-8 items-center gap-2 rounded-control bg-subtle-2 px-2.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary"><Search className="size-4 text-icon" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search calls" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>
        <button onClick={() => { sp.delete('id'); setSp(sp, { replace: true }) }} className={cn('flex items-center gap-2 border-b border-border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-subtle-2', !cur && !live && 'bg-fill-selected')}><Grid3x3 className="size-4 text-icon" />Dial pad</button>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.map((l) => { const ic = iconOf(l); const agent = s.agents.find((a) => a.id === l.by); return (
            <button key={l.id} onClick={() => { setLive(null); sp.set('id', l.id); setSp(sp, { replace: true }) }} className={cn('flex w-full items-start gap-3 border-b border-border-2 px-3 py-2.5 text-left transition-colors', l.id === id ? 'bg-fill-selected' : 'hover:bg-subtle-2')}>
              <Tip content={ic.t}><span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-subtle', ic.c)}><ic.I className="size-4" /></span></Tip>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5"><span className={cn('truncate text-sm font-medium', l.status === 'missed' && 'text-danger')}>{nameOf(l)}</span><span className="ml-auto shrink-0 text-xs text-muted">{l.time.replace('Today ', '')}</span></span>
                <span className="block truncate text-sm text-muted">{l.summary}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">{agent ? <><AgentAvatar name={agent.name} size={14} />{agent.name}</> : l.by === 'you' ? <><User className="size-3" />You</> : 'Nobody answered'}{l.dur !== '—' && <span>· {l.dur}</span>}</span>
              </span>
            </button>
          ) })}
          {!list.length && <EmptyState compact icon={<Phone />} title="No calls" />}
        </div>
      </div>

      <div className={cn('min-w-0 flex-1 overflow-y-auto', !(cur || live) && 'max-md:hidden')}>
        {live ? (
          <div className="mx-auto flex max-w-[480px] flex-col items-center px-4 py-8 text-center">
            <Avatar name={live.name} size={72} />
            <h2 className="mt-3 text-xl">{live.name}</h2>
            <div className="text-sm text-muted tabular">{live.num}</div>
            <div className="mt-2 flex items-center gap-2 text-sm">{live.hold ? <Badge tone="amber">On hold</Badge> : <span className="flex items-center gap-1.5 font-medium text-success"><span className="size-1.5 rounded-full bg-success animate-[pulse-dot_2s_infinite]" />{sec < 3 ? 'Calling…' : 'On call'}</span>}<span className="tabular text-muted">{fmt(sec)}</span>{live.ai && <span className="flex items-center gap-1 text-muted">· <AgentAvatar name={s.agents.find((a) => a.id === live.ai)?.name ?? '?'} size={16} />{s.agents.find((a) => a.id === live.ai)?.name} is talking</span>}{live.rec && <Badge tone="red"><Circle className="fill-current" />Recording</Badge>}</div>
            {live.ai && <Card className="mt-4 max-h-[220px] w-full overflow-y-auto p-3 text-left">{live.lines.length ? live.lines.map(([w, t], i) => <p key={i} className="text-sm anim-fade"><span className="font-semibold">{w}:</span> {t}</p>) : <p className="text-sm text-muted">Waiting for them to pick up…</p>}</Card>}
            {live.pad && <div className="mt-4 grid w-[240px] grid-cols-3 gap-2">{KEYS.map(([k]) => <Button key={k} size="lg" onClick={() => toast(`Sent tone ${k}`)}>{k}</Button>)}</div>}
            <div className="mt-6 grid w-full grid-cols-4 gap-2">
              {([['mute', live.mute ? MicOff : Mic, live.mute ? 'Unmute' : 'Mute'], ['hold', live.hold ? Play : Pause, live.hold ? 'Resume' : 'Hold'], ['pad', Grid3x3, 'Keypad'], ['rec', Circle, live.rec ? 'Stop rec' : 'Record']] as const).map(([k, I, l]) => (
                <button key={k} onClick={() => setLive({ ...live, [k]: !live[k] })} className={cn('flex flex-col items-center gap-1 rounded-card border border-border px-2 py-3 text-xs font-medium transition-colors hover:bg-subtle-2', live[k] && 'border-btn bg-subtle-2')}><I className="size-5 text-icon" />{l}</button>
              ))}
              <button onClick={async () => { const to = await askText({ title: 'Transfer the call', label: 'To a person or number', placeholder: 'e.g. Ali Raza or (905) 555-0100', ok: 'Transfer' }); if (to) { toast.success(`Transferring to ${to}…`); setTimeout(end, 800) } }} className="flex flex-col items-center gap-1 rounded-card border border-border px-2 py-3 text-xs font-medium hover:bg-subtle-2"><PhoneForwarded className="size-5 text-icon" />Transfer</button>
              <button onClick={() => { if (!live.ai) { setLive({ ...live, ai: aiAgent, camp: aiCamp }); toast(`${s.agents.find((a) => a.id === aiAgent)?.name} took over the call`) } }} disabled={!!live.ai} className="flex flex-col items-center gap-1 rounded-card border border-border px-2 py-3 text-xs font-medium hover:bg-subtle-2 disabled:opacity-50"><Bot className="size-5 text-icon" />Hand to AI</button>
              <button onClick={async () => { const n = await askText({ title: 'Call notes', label: 'Saved to the contact’s history', value: live.notes, multiline: true }); if (n) setLive({ ...live, notes: n }) }} className="flex flex-col items-center gap-1 rounded-card border border-border px-2 py-3 text-xs font-medium hover:bg-subtle-2"><StickyNote className="size-5 text-icon" />Notes</button>
              <button onClick={() => setBook({ cid: live.cid ?? undefined, who: live.name })} className="flex flex-col items-center gap-1 rounded-card border border-border px-2 py-3 text-xs font-medium hover:bg-subtle-2"><CalendarDays className="size-5 text-icon" />Book</button>
            </div>
            <Button variant="destructive-solid" size="lg" className="mt-6 w-full" onClick={end}><PhoneOff />End call</Button>
          </div>
        ) : cur ? (
          <div className="mx-auto max-w-[680px] px-4 py-5">
            <Button variant="ghost" className="mb-2 md:hidden" onClick={() => { sp.delete('id'); setSp(sp, { replace: true }) }}><ArrowLeft />Calls</Button>
            <div className="flex flex-wrap items-start gap-3">
              <Avatar name={nameOf(cur)} size={44} />
              <div className="min-w-0 flex-1"><h2 className="text-xl">{nameOf(cur)}</h2><div className="flex flex-wrap items-center gap-1.5 text-sm text-muted">{(() => { const ic = iconOf(cur); return <span className={cn('flex items-center gap-1', ic.c)}><ic.I className="size-4" />{ic.t}</span> })()}<span>· {cur.time}</span>{cur.dur !== '—' && <span>· {cur.dur}</span>}{cur.camp && <><span>·</span><CampaignChip id={cur.camp} /></>}</div></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => start(s.contacts.find((c) => c.id === cur.cid)?.phone ?? cur.num ?? '', null)}><Phone />Call back</Button>
              {aiPop(nameOf(cur), <Button><Bot />Let AI call back</Button>)}
              {cur.cid && <Button onClick={() => nav(`/inbox?kind=chat&to=${cur.cid}`)}><MessageSquare />Text</Button>}
              <Button onClick={() => setBook({ cid: cur.cid ?? undefined, who: nameOf(cur) })}><CalendarDays />Book</Button>
              {cur.cid && <Button variant="ghost" onClick={() => nav(`/contacts/${cur.cid}`)}><User />Open contact</Button>}
            </div>
            <Card className="mt-4 space-y-3 p-4">
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-icon" /><h3>AI summary</h3>{cur.by && cur.by !== 'you' && <span className="ml-auto flex items-center gap-1.5 text-sm text-muted"><AgentAvatar name={s.agents.find((a) => a.id === cur.by)?.name ?? '?'} size={18} />{s.agents.find((a) => a.id === cur.by)?.name}</span>}</div>
              <p className="text-sm">{cur.summary}</p>
              {(cur.status === 'answered' || cur.status === 'voicemail') && <Recording dur={cur.dur} />}
              {cur.status === 'answered' && <Transcript lines={[[cur.by === 'you' ? 'You' : s.agents.find((a) => a.id === cur.by)?.name ?? 'Agent', `Hi ${nameOf(cur).split(' ')[0]}, thanks for taking the call.`], [nameOf(cur).split(' ')[0], 'Sure, go ahead.'], [cur.by === 'you' ? 'You' : s.agents.find((a) => a.id === cur.by)?.name ?? 'Agent', cur.summary]]} />}
              {cur.status === 'missed' && <p className="rounded-control bg-subtle-2 px-3 py-2 text-sm">Rhea texted them back automatically: “Sorry we missed your call — reply here or pick a time and we’ll call you.”</p>}
            </Card>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[340px] flex-col items-center px-4 py-6">
            <div className="flex w-full items-center gap-2 text-sm text-muted"><Phone className="size-4" />Calling from<Select variant="button" value={from} onValueChange={setFrom} options={s.numbers.map((n) => ({ value: n.n, label: `${n.n} · ${n.l}` }))} /></div>
            <div className="mt-4 flex w-full items-center gap-1">
              <input value={num} onChange={(e) => setNum(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && start(num, null)} placeholder="Enter a number" className="h-12 min-w-0 flex-1 bg-transparent text-center text-2xl font-semibold tabular outline-none placeholder:text-lg placeholder:font-normal placeholder:text-muted" aria-label="Phone number" />
              {num && <Button variant="ghost" size="icon" onClick={() => setNum(num.slice(0, -1))} aria-label="Delete digit"><Delete /></Button>}
            </div>
            <div className="h-5 text-sm text-muted">{match ? <button className="hover:text-primary" onClick={() => nav(`/contacts/${match.id}`)}>{match.name} · {s.campaigns.find((k) => k.id === match.camp)?.name ?? 'No campaign'}</button> : num ? 'New number' : ''}</div>
            <div className="mt-3 grid w-full grid-cols-3 gap-2">{KEYS.map(([k, l]) => <button key={k} onClick={() => setNum(num + k)} className="flex h-14 flex-col items-center justify-center rounded-card border border-border bg-surface transition-colors hover:bg-subtle-2 active:bg-fill-selected"><span className="text-xl font-medium">{k}</span><span className="h-3 text-2xs font-semibold tracking-wider text-muted">{l}</span></button>)}</div>
            <div className="mt-4 grid w-full gap-2">
              <Button variant="primary" size="lg" onClick={() => start(num, null)}><Phone />Call</Button>
              {aiPop(num, <Button size="lg"><Bot />Let an AI agent call</Button>)}
            </div>
            <p className="mt-3 text-center text-xs text-muted">Calls are recorded and summarised automatically. Do-Not-Contact numbers are blocked.</p>
          </div>
        )}
      </div>
      <NewBookingDialog open={!!book} onOpenChange={(o) => !o && setBook(null)} preset={book ?? undefined} />
    </>
  )
}
