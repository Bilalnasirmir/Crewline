import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Paperclip, Mic, AudioLines, ArrowUp, Check, X, Pencil, Send, Inbox, Megaphone, Users, Receipt, BarChart3, Bot, Compass, Folder, Calendar, FileText, Presentation, Sparkles, ChevronRight, Square, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tip } from '@/components/ui/tooltip'
import { Avatar, AgentAvatar } from '@/components/ui/avatar'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { AiMark, PlatIcon, DirIcon } from '@/components/app/icons'
import { StageTag } from '@/components/app/bits'
import { useStore } from '@/store'
import { useMax } from './store'
import type { Block, MaxMessage } from './engine'

/* ----- lightweight markdown: **bold**, lists, line breaks ----- */
export function Md({ md, className }: { md: string; className?: string }) {
  const lines = md.split('\n')
  const out: React.ReactNode[] = []
  let list: React.ReactNode[] = []; let ordered = false
  const flush = () => { if (list.length) { out.push(ordered ? <ol key={out.length} className="my-1.5 list-decimal space-y-1 pl-5">{list}</ol> : <ul key={out.length} className="my-1.5 list-disc space-y-1 pl-5">{list}</ul>); list = [] } }
  const inline = (s: string) => s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => p.startsWith('**') ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong> : p.startsWith('`') ? <code key={i} className="rounded-[4px] bg-subtle px-1 text-[13px]">{p.slice(1, -1)}</code> : p)
  lines.forEach((ln, i) => {
    const m = ln.match(/^(\d+)\.\s+(.*)/); const b = ln.match(/^[-•]\s+(.*)/)
    if (m) { if (!ordered) flush(); ordered = true; list.push(<li key={i}>{inline(m[2])}</li>) }
    else if (b) { if (ordered) flush(); ordered = false; list.push(<li key={i}>{inline(b[1])}</li>) }
    else { flush(); if (ln.trim()) out.push(<p key={i}>{inline(ln)}</p>) }
  })
  flush()
  return <div className={cn('space-y-2 text-base leading-6', className)}>{out}</div>
}

const ICONS: Record<string, React.ComponentType<any>> = { send: Send, inbox: Inbox, megaphone: Megaphone, users: Users, receipt: Receipt, report: BarChart3, bot: Bot, compass: Compass, folder: Folder, calendar: Calendar, ai: Sparkles, edit: Pencil }

/* ----- one block ----- */
function BlockView({ b, msg, last }: { b: Block; msg: MaxMessage; last: boolean }) {
  const nav = useNavigate()
  const { pickOption, submitOptions, decidePlan, send } = useMax()
  const contacts = useStore((s) => s.contacts), campaigns = useStore((s) => s.campaigns), stages = useStore((s) => s.stages), agents = useStore((s) => s.agents)
  switch (b.t) {
    case 'text': return <Md md={b.md} />
    case 'status': return <div className="flex items-center gap-2 text-sm text-muted"><span className={cn('size-1.5 rounded-full', b.done ? 'bg-success' : 'bg-ai animate-[pulse-dot_1.2s_infinite]')} />{b.text}{b.done ? ' · done' : '…'}</div>
    case 'options': {
      const answered = !last || (!b.multi && (b.picked?.length ?? 0) > 0)
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {b.options.map((o) => {
              const on = b.picked?.includes(o.v)
              const I = o.icon && o.icon !== 'agent' ? ICONS[o.icon] ?? (o.icon in ({ sms: 1, call: 1, email: 1, wa: 1, msg: 1 } as any) ? null : null) : null
              const isPlat = o.icon && ['sms', 'call', 'email', 'wa', 'msg', 'ig', 'tt', 'fb', 'chat'].includes(o.icon)
              const ag = o.icon === 'agent' ? agents.find((a) => a.name === o.l) : null
              return (
                <button key={o.v} disabled={answered && !on} onClick={() => pickOption(msg.id, b.id, o.v, b.multi, o.l)}
                  className={cn('flex items-start gap-2 rounded-control border px-3 py-1.5 text-left text-base transition-colors disabled:opacity-40', on ? 'border-primary bg-primary-soft text-text' : 'border-border-strong bg-surface hover:bg-subtle', o.d && 'min-w-[200px]')}>
                  {ag ? <AgentAvatar name={ag.name} size={18} className="mt-0.5" /> : isPlat ? <PlatIcon p={o.icon as any} size={16} tip={false} className="mt-0.5" /> : I ? <I className={cn('mt-0.5 size-4', o.icon === 'ai' ? 'text-ai' : 'text-muted')} /> : null}
                  <span className="min-w-0"><span className="block font-medium leading-5">{o.l}</span>{o.d && <span className="block text-sm text-muted">{o.d}</span>}</span>
                  {on && <Check className="ml-auto mt-0.5 size-4 shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>
          {b.multi && last && <Button variant="primary" size="sm" onClick={() => submitOptions(msg.id, b.id)} disabled={!b.picked?.length}>Continue<ChevronRight /></Button>}
        </div>
      )
    }
    case 'people': {
      const rows = b.ids.map((id) => contacts.find((c) => c.id === id)).filter(Boolean).slice(0, 8) as typeof contacts
      return (
        <div className="overflow-hidden rounded-card border border-border">
          <div className="flex h-9 items-center justify-between border-b border-border bg-subtle-2 px-3 text-sm"><span className="font-medium">{b.title}</span><span className="text-muted">showing {rows.length} of {nf(b.ids.length)}</span></div>
          <div className="overflow-x-auto"><Table>
            <thead><tr><Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>City</Th><Th>Stage</Th></tr></thead>
            <tbody>{rows.map((c) => { const cp = campaigns.find((k) => k.id === c.camp); return (
              <Tr key={c.id} clickable onClick={() => nav(`/contacts/${c.id}`)}><Td className="h-8"><span className="flex items-center gap-2"><Avatar name={c.name || '?'} size={20} />{c.name || <span className="text-warning">Name missing</span>}</span></Td><Td className="h-8 tabular">{c.phone}</Td><Td className="h-8">{c.email || <span className="text-warning">Missing</span>}</Td><Td className="h-8">{c.city}</Td><Td className="h-8">{cp ? <StageTag name={c.stage} stages={stages[cp.pipe][cp.dir]} size="sm" /> : '—'}</Td></Tr>
            ) })}</tbody>
          </Table></div>
          <div className="flex flex-wrap gap-1.5 border-t border-border p-2">
            <Button size="sm" onClick={() => { toast.success('Saved as a folder in Contacts'); send('Save them as a folder') }}><Folder />Save as folder</Button>
            <Button size="sm" variant="primary" onClick={() => send(`Build a campaign for ${b.title}`)}><Megaphone />Start a campaign with them</Button>
            <Button size="sm" variant="ghost" onClick={() => nav('/contacts')}>Open in Contacts</Button>
          </div>
        </div>
      )
    }
    case 'kpis': return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{b.items.map((k) => <div key={k.l} className="rounded-card border border-border p-3"><div className="text-xs text-muted">{k.l}</div><div className="text-xl font-semibold tabular">{k.v}</div>{k.d && <div className="text-xs text-muted">{k.d}</div>}</div>)}</div>
    )
    case 'bars': { const max = Math.max(...b.rows.map((r) => r.v)); return (
      <div className="rounded-card border border-border p-3"><div className="mb-2 text-sm font-medium">{b.title}</div>{b.rows.map((r) => <div key={r.l} className="grid grid-cols-[110px_1fr_56px] items-center gap-2 py-0.5 text-sm"><span className="truncate">{r.l}</span><div className="h-2 rounded-full bg-subtle"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.v / max) * 100}%` }} /></div><span className="text-right tabular">${nf(r.v)}</span></div>)}</div>
    ) }
    case 'plan': return (
      <div className={cn('overflow-hidden rounded-card border', b.state === 'approved' ? 'border-success/40' : b.state === 'declined' ? 'border-border opacity-60' : 'border-ai/40')}>
        <div className="flex items-center gap-2 border-b border-border bg-subtle-2 px-3 py-2 text-sm font-medium"><AiMark />{b.title}{b.state === 'approved' && <span className="ml-auto flex items-center gap-1 text-xs text-success"><Check className="size-3.5" />Applied</span>}{b.state === 'declined' && <span className="ml-auto text-xs text-muted">Declined</span>}</div>
        <ul className="space-y-1.5 px-3 py-2.5 text-base">{b.changes.map((c, i) => <li key={i} className="flex gap-2"><span className="mt-[9px] size-1 shrink-0 rounded-full bg-muted" />{c}</li>)}</ul>
        {!b.state && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
            <span className="mr-auto text-xs text-muted">Max waits for your approval before changing anything.</span>
            <Button size="sm" variant="ghost" onClick={() => send('Change the plan')}><Pencil />Edit</Button>
            <Button size="sm" onClick={() => decidePlan(msg.id, b.id, false)}><X />Not now</Button>
            <Button size="sm" variant="primary" onClick={() => decidePlan(msg.id, b.id, true)}><Check />OK, go ahead</Button>
          </div>
        )}
      </div>
    )
    case 'campaign': { const c = campaigns.find((k) => k.id === b.id); return (
      <Link to={`/campaigns/${b.id}`} className="flex items-center gap-3 rounded-card border border-border p-3 hover:bg-subtle-2 hover:no-underline">
        <span className="flex size-9 items-center justify-center rounded-control bg-primary-soft text-primary"><Megaphone className="size-4" /></span>
        <span className="min-w-0 flex-1"><span className="block truncate font-medium text-text">{b.name}</span><span className="flex items-center gap-2 text-sm text-muted">{c && <DirIcon dir={c.dir} size={12} withTip={false} />}<span className={cn('font-medium', c?.status === 'running' ? 'text-success' : 'text-warning')}>{c?.status === 'running' ? 'Live' : 'Scheduled'}</span>· {nf(c?.people ?? 0)} people</span></span>
        <ChevronRight className="size-4 text-muted" />
      </Link>
    ) }
    case 'link': { const I = ICONS[b.icon ?? ''] ?? ChevronRight; return <Link to={b.to} className="inline-flex h-8 items-center gap-2 rounded-control border border-border px-3 text-base font-medium text-text hover:bg-subtle hover:no-underline"><I className="size-4 text-muted" />{b.label}<ChevronRight className="size-3.5 text-muted" /></Link> }
    case 'doc': return (
      <div className="flex gap-3 rounded-card border border-border p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-subtle text-muted">{b.kind === 'presentation' ? <Presentation className="size-5" /> : <FileText className="size-5" />}</span>
        <div className="min-w-0 flex-1"><div className="font-medium">{b.title}</div><div className="text-sm text-muted">{b.kind === 'presentation' ? `${b.pages.length} slides` : `${b.pages.length} pages`} · {b.pages.slice(0, 3).join(' · ')}</div>
          <div className="mt-2 flex gap-1.5"><Button size="sm" onClick={() => toast('Opening the presentation (demo)')}>Open</Button><Button size="sm" variant="ghost" onClick={() => toast.success('Saved to Reports › Max reports')}>Save to Reports</Button><Button size="sm" variant="ghost" onClick={() => toast('PDF downloaded (demo)')}>Download PDF</Button></div></div>
      </div>
    )
    case 'steps': return (
      <div className="rounded-card border border-border"><div className="border-b border-border px-3 py-2 text-sm font-medium">{b.title}</div>
        <ol className="p-2">{b.steps.map((s, i) => <li key={i} className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-base hover:bg-subtle-2"><span className="flex size-5 items-center justify-center rounded-full bg-subtle text-xs font-medium text-muted">{i + 1}</span><span className="flex-1">{s.l}</span>{s.to && <Button size="sm" variant="ghost" onClick={() => nav(s.to!)}>Open</Button>}</li>)}</ol>
      </div>
    )
  }
}

/* ----- streaming text effect for the last Max message ----- */
function useStreamed(text: string, enabled: boolean) {
  const [n, setN] = React.useState(enabled ? 0 : text.length)
  React.useEffect(() => {
    if (!enabled) { setN(text.length); return }
    setN(0); let i = 0
    const id = setInterval(() => { i += 3; setN(i); if (i >= text.length) clearInterval(id) }, 12)
    return () => clearInterval(id)
  }, [text, enabled])
  return text.slice(0, n)
}

function Message({ m, last, compact }: { m: MaxMessage; last: boolean; compact?: boolean }) {
  const firstText = m.blocks[0]?.t === 'text' ? (m.blocks[0] as any).md as string : ''
  const streamed = useStreamed(firstText, m.role === 'max' && last)
  const doneStreaming = streamed.length >= firstText.length
  if (m.role === 'user') return (
    <div className="flex justify-end">
      <div className="max-w-[85%] space-y-1">
        {m.attachments?.length ? <div className="flex flex-wrap justify-end gap-1">{m.attachments.map((a) => <span key={a} className="inline-flex h-6 items-center gap-1 rounded-tag border border-border bg-bg px-2 text-xs"><Paperclip className="size-3" />{a}</span>)}</div> : null}
        <div className="rounded-[14px] rounded-br-[4px] bg-subtle px-3.5 py-2 text-base leading-6 [.bg-surface_&]:bg-subtle">{m.voice && <Mic className="mr-1.5 inline size-3.5 text-muted" />}{(m.blocks[0] as any).md}</div>
      </div>
    </div>
  )
  return (
    <div className={cn('group flex gap-3', compact && 'gap-2')}>
      <span className={cn('mt-1 flex shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai', compact ? 'size-6' : 'size-7')}><Sparkles className={compact ? 'size-3' : 'size-3.5'} /></span>
      <div className="min-w-0 flex-1 space-y-3">
        {m.blocks.map((b, i) => (i === 0 && b.t === 'text' ? <Md key={i} md={streamed} /> : (doneStreaming || i === 0) ? <div key={i} className="anim-fade"><BlockView b={b} msg={m} last={last} /></div> : null))}
        <div className="flex h-6 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Tip content="Copy"><Button variant="ghost" size="icon-xs" onClick={() => toast('Copied')}><Copy /></Button></Tip>
          <Tip content="Good answer"><Button variant="ghost" size="icon-xs"><ThumbsUp /></Button></Tip>
          <Tip content="Bad answer"><Button variant="ghost" size="icon-xs"><ThumbsDown /></Button></Tip>
          <Tip content="Try again"><Button variant="ghost" size="icon-xs"><RotateCcw /></Button></Tip>
          <span className="ml-1 text-[11px] text-faint">{m.time}</span>
        </div>
      </div>
    </div>
  )
}

/* ----- Composer: text, attach, voice note, live voice ----- */
export function Composer({ onSend, placeholder = 'Ask Max anything — type, speak, or attach a file, photo or screenshot', autoFocus, compact, hint = 'Max asks before changing anything important.' }: { onSend: (t: string, o?: { attachments?: string[]; voice?: boolean }) => void; placeholder?: string; autoFocus?: boolean; compact?: boolean; hint?: string | null }) {
  const [v, setV] = React.useState(''); const [att, setAtt] = React.useState<string[]>([]); const [rec, setRec] = React.useState(false); const [live, setLive] = React.useState(false)
  const ref = React.useRef<HTMLTextAreaElement>(null); const fileRef = React.useRef<HTMLInputElement>(null)
  const submit = () => { const t = v.trim(); if (!t && !att.length) return; onSend(t || `Sent ${att.length} file(s)`, { attachments: att }); setV(''); setAtt([]); ref.current?.focus() }
  React.useEffect(() => { const el = ref.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(160, el.scrollHeight) + 'px' }, [v])
  const startRec = () => { setRec(true); setTimeout(() => { setRec(false); onSend('Build an outbound campaign for Mississauga Leads by text and call', { voice: true }) }, 1800) }
  return (
    <div className="space-y-1.5">
      {live && (
        <div className="flex items-center gap-3 rounded-card border border-ai/40 bg-ai-soft/40 px-3 py-2 anim-pop">
          <span className="flex size-8 items-center justify-center rounded-full bg-ai text-white"><AudioLines className="size-4 animate-pulse" /></span>
          <div className="flex-1 text-sm"><div className="font-medium">Live voice conversation</div><div className="text-muted">Max is listening… say what you want to do.</div></div>
          <Button size="sm" onClick={() => { setLive(false); onSend('Find people in Brooklyn who bought internet', { voice: true }) }}><Square />End</Button>
        </div>
      )}
      <div className={cn('rounded-[14px] border border-border-strong bg-surface shadow-btn transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20', compact && 'rounded-card')}>
        {att.length > 0 && <div className="flex flex-wrap gap-1 px-3 pt-2">{att.map((a) => <span key={a} className="inline-flex h-6 items-center gap-1 rounded-tag bg-subtle px-2 text-xs"><Paperclip className="size-3" />{a}<button onClick={() => setAtt(att.filter((x) => x !== a))} className="text-muted hover:text-text"><X className="size-3" /></button></span>)}</div>}
        <textarea ref={ref} rows={1} autoFocus={autoFocus} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder={rec ? 'Listening…' : placeholder}
          className={cn('block w-full resize-none bg-transparent px-3.5 pt-3 text-base leading-6 outline-none placeholder:text-faint', compact ? 'min-h-[40px]' : 'min-h-[48px]')} />
        <div className="flex items-center gap-0.5 px-2 pb-2">
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => { const fs = Array.from(e.target.files ?? []).map((f) => f.name); if (fs.length) setAtt([...att, ...fs]); e.target.value = '' }} />
          <Tip content="Attach a file, photo or screenshot"><Button variant="ghost" size="icon-sm" onClick={() => fileRef.current?.click()} aria-label="Attach"><Paperclip /></Button></Tip>
          <Tip content={rec ? 'Recording…' : 'Send a voice message'}><Button variant={rec ? 'ai' : 'ghost'} size="icon-sm" onClick={startRec} aria-label="Voice message"><Mic className={rec ? 'animate-pulse' : ''} /></Button></Tip>
          <Tip content="Talk live with Max"><Button variant="ghost" size="icon-sm" onClick={() => setLive(true)} aria-label="Live voice"><AudioLines /></Button></Tip>
          <span className="flex-1" />
          <Button variant="primary" size="icon-sm" onClick={submit} disabled={!v.trim() && !att.length} aria-label="Send" className="rounded-full"><ArrowUp /></Button>
        </div>
      </div>
      {hint && <p className="text-center text-xs text-faint">{hint}</p>}
    </div>
  )
}

/* ----- Thread view (used by page and side panel) ----- */
export function ThreadView({ compact, empty }: { compact?: boolean; empty?: React.ReactNode }) {
  const thread = useMax((s) => s.threads.find((t) => t.id === s.activeId) ?? s.threads[0])
  const typing = useMax((s) => s.typing)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { const el = ref.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }) }, [thread.msgs.length, typing])
  React.useEffect(() => { const el = ref.current; if (!el) return; const ob = new MutationObserver(() => { if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) el.scrollTop = el.scrollHeight }); ob.observe(el, { childList: true, subtree: true, characterData: true }); return () => ob.disconnect() }, [])
  return (
    <div ref={ref} className={cn('min-h-0 flex-1 overflow-y-auto', compact ? 'px-3 py-3' : 'px-4 py-6')}>
      <div className={cn('mx-auto space-y-6', compact ? '' : 'max-w-[760px]')}>
        {thread.msgs.length === 0 && empty}
        {thread.msgs.map((m, i) => <Message key={m.id} m={m} last={i === thread.msgs.length - 1} compact={compact} />)}
        {typing && <div className="flex gap-3"><span className={cn('mt-1 flex shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai', compact ? 'size-6' : 'size-7')}><Sparkles className="size-3.5" /></span><span className="flex h-7 items-center gap-1"><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite]" /><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite_.2s]" /><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite_.4s]" /></span></div>}
      </div>
    </div>
  )
}
