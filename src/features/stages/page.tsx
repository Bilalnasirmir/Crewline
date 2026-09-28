import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { Kanban, Plus, Copy, MoreHorizontal, Pencil, Trash2, Sparkles, Activity, Rows3, ListChecks, Repeat, Check, ExternalLink, X } from 'lucide-react'
import { cn, nf, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { PageHeader } from '@/components/app/page'
import { SearchRow, PillRow, FilterPill, CheckList } from '@/components/app/index-table'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge, Count } from '@/components/ui/badge'
import { Card, CardHeader, Banner, EmptyState } from '@/components/ui/card'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Avatar, AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DirIcon, PlatIcon, PLATFORMS } from '@/components/app/icons'
import { StageTag, AgentChip, CampaignChip } from '@/components/app/bits'
import { FollowUpEditor, defaultFollow, type FollowConfig } from '@/features/shared/followups'
import { Recording, Transcript } from '@/features/shared/media'
import { StageDialog, STAGE_ICONS } from './stage-dialog'
import { agoTxt } from '@/data/seed'
import type { Contact, Pipe, Stage } from '@/data/types'

type View = 'board' | 'list' | 'review' | 'followup'
const dirOf = (c: { dir: string }) => (c.dir === 'in' ? 'in' : 'out') as 'in' | 'out'
const valueOf = (c: Contact) => c.purchase?.amount ?? 0

export function StagesPage() {
  const nav = useNavigate(); const [sp, setSp] = useSearchParams(); const s = useStore()
  const view = (sp.get('view') as View) || 'board'
  const setView = (v: View) => { if (v === 'board') sp.delete('view'); else sp.set('view', v); setSp(sp, { replace: true }) }
  const camp0 = s.campaigns.find((k) => k.id === (sp.get('camp') ?? 'k1')) ?? s.campaigns[0]
  const [pipe, setPipe] = React.useState<Pipe>(camp0.pipe); const [dir, setDir] = React.useState<'in' | 'out'>(dirOf(camp0)); const [camp, setCamp] = React.useState<string>(camp0.id)
  const [edit, setEdit] = React.useState<Stage | null | undefined>(undefined); const [feed, setFeed] = React.useState(true)
  const stages = s.stages[pipe][dir]
  const camps = s.campaigns.filter((k) => k.pipe === pipe && dirOf(k) === dir)
  const leads = s.contacts.filter((c) => { const k = s.campaigns.find((x) => x.id === c.camp); return !!k && k.pipe === pipe && dirOf(k) === dir && (camp === 'all' || c.camp === camp) })
  const review = s.assigned.filter((a) => !a.done && (a.kind === 'stage' || a.kind === 'qual'))
  const pickCamp = (id: string) => { if (id === 'all') { setCamp('all'); return } const k = s.campaigns.find((x) => x.id === id)!; setCamp(id); setPipe(k.pipe); setDir(dirOf(k)); sp.set('camp', id); setSp(sp, { replace: true }) }
  const pickDir = (d: 'in' | 'out') => { setDir(d); const k = s.campaigns.find((x) => x.pipe === pipe && dirOf(x) === d); setCamp(k?.id ?? 'all') }
  const copy = async () => { const other = dir === 'out' ? 'inbound' : 'outbound'; if (await askConfirm({ title: `Copy these ${stages.length} stages to ${other}?`, description: `Your ${other} stages for this business are replaced by a copy of these, with the same names, colours and rules. You can edit them after.`, ok: `Copy to ${other}` })) { s.copyStages(pipe, dir); toast.success(`Copied to ${other} stages`) } }
  const campOpts = [...s.campaigns.map((k) => ({ value: k.id, label: k.name, icon: <DirIcon dir={k.dir} size={12} withTip={false} /> })), { value: 'all', label: `All ${pipe === 'realestate' ? 'real estate' : pipe} ${dir === 'in' ? 'inbound' : 'outbound'} campaigns` }]
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Stages" icon={<Kanban />} actions={<><Button variant="header" onClick={copy}><Copy />Copy to {dir === 'out' ? 'inbound' : 'outbound'}</Button><Button variant="primary" onClick={() => setEdit(null)}><Plus />New stage</Button></>} />
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 pb-3">
        <Select variant="button" value={camp} onValueChange={pickCamp} options={campOpts} />
        <Segmented value={dir} onChange={pickDir} options={[{ value: 'out', label: 'Outbound stages', icon: <DirIcon dir="out" size={12} withTip={false} /> }, { value: 'in', label: 'Inbound stages', icon: <DirIcon dir="in" size={12} withTip={false} /> }]} />
        <span className="mx-1 hidden h-5 w-px bg-border-strong sm:block" />
        <Segmented value={view} onChange={setView} options={[{ value: 'board', label: 'Board', icon: <Kanban /> }, { value: 'list', label: 'List', icon: <Rows3 /> }, { value: 'review', label: <>Review for me<Count n={review.length} tone="red" /></>, icon: <ListChecks /> }, { value: 'followup', label: 'Follow-up stages', icon: <Repeat /> }]} />
        {view === 'board' && <Button variant="ghost" className="ml-auto" onClick={() => setFeed(!feed)}><Activity />{feed ? 'Hide' : 'Show'} live activity</Button>}
      </div>
      {!s.prefs.stagesTipHidden && view !== 'followup' && (
        <div className="shrink-0 px-4 pb-3"><Banner tone="info" onDismiss={() => s.setPref('stagesTipHidden', true)}>The AI reads every call, text and email and <b className="font-semibold">always follows the latest message</b>. “Yes, I’m interested” at 4:30 moves a lead to Interested; “Actually, I need time to think” at 4:35 moves it to Pending.</Banner></div>
      )}
      {view === 'board' && <Board stages={stages} leads={leads} pipe={pipe} dir={dir} feed={feed} onEdit={setEdit} />}
      {view === 'list' && <ListView stages={stages} leads={leads} initialStage={sp.get('stage')} />}
      {view === 'review' && <ReviewView />}
      {view === 'followup' && <FollowupView pipe={pipe} dir={dir} />}
      {camp !== 'all' && !camps.some((k) => k.id === camp) && <p className="px-4 pb-2 text-sm text-muted">This campaign doesn’t use {dir === 'in' ? 'inbound' : 'outbound'} stages — showing the stage set only. <button className="text-primary hover:underline" onClick={() => nav('/campaigns')}>Campaigns</button></p>}
      <StageDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} pipe={pipe} dir={dir} stage={edit ?? null} />
    </div>
  )
}

/* ---------- Board ---------- */
function Board({ stages, leads, pipe, dir, feed, onEdit }: { stages: Stage[]; leads: Contact[]; pipe: Pipe; dir: 'in' | 'out'; feed: boolean; onEdit: (s: Stage) => void }) {
  const s = useStore()
  const [active, setActive] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [, force] = React.useReducer((x: number) => x + 1, 0)
  React.useEffect(() => { const t = setInterval(force, 2000); return () => clearInterval(t) }, [])
  const dragged = leads.find((c) => c.id === active)
  return (
    <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
      <DndContext sensors={sensors} onDragStart={(e) => setActive(String(e.active.id))} onDragCancel={() => setActive(null)}
        onDragEnd={(e) => { setActive(null); const to = e.over?.id ? String(e.over.id) : null; const c = leads.find((x) => x.id === e.active.id); if (to && c && c.stage !== to) { s.moveLead(c.id, to, 'you', 'moved by hand'); toast.success(`${c.name || 'Lead'} moved to ${to} · history and dashboards updated`) } }}>
        <div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-x-auto pb-2">
          {stages.map((st) => <Column key={st.id} st={st} leads={leads.filter((c) => c.stage === st.name)} onEdit={() => onEdit(st)} pipe={pipe} dir={dir} />)}
        </div>
        <DragOverlay dropAnimation={null}>{dragged ? <LeadCard c={dragged} st={stages.find((x) => x.name === dragged.stage)} overlay /> : null}</DragOverlay>
      </DndContext>
      {feed && (
        <Card className="hidden w-[280px] shrink-0 flex-col overflow-hidden xl:flex">
          <CardHeader title="Live activity" action={<span className="flex h-7 items-center gap-1.5 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success animate-[pulse-dot_2s_infinite]" />Live</span>} />
          <div className="min-h-0 flex-1 overflow-y-auto">{s.activity.map((a) => <div key={a.id} className={cn('border-t border-border-2 px-4 py-2', a.fresh && 'anim-fade bg-subtle-2')}><div className="text-sm [&_b]:font-semibold" dangerouslySetInnerHTML={{ __html: a.text }} /><div className="text-xs text-muted">{a.time}</div></div>)}</div>
        </Card>
      )}
    </div>
  )
}

function Column({ st, leads, onEdit, pipe, dir }: { st: Stage; leads: Contact[]; onEdit: () => void; pipe: Pipe; dir: 'in' | 'out' }) {
  const { removeStage } = useStore()
  const { setNodeRef, isOver } = useDroppable({ id: st.name })
  const I = STAGE_ICONS[st.icon]
  const total = st.rev ? leads.reduce((n, c) => n + valueOf(c), 0) : 0
  return (
    <div className="flex w-[272px] shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="flex size-6 items-center justify-center rounded-control" style={{ background: st.color + '1f', color: st.color }}>{I ? <I className="size-3.5" /> : <span className="size-2 rounded-full" style={{ background: st.color }} />}</span>
        <Tip content={<div className="space-y-0.5"><div className="font-semibold">Moves here when:</div>{st.criteria.map((c) => <div key={c}>· {c}</div>)}</div>}><h3 className="min-w-0 truncate">{st.name}</h3></Tip>
        <span className="text-sm text-muted tabular">{leads.length}</span>
        {st.rev && <Tip content="This stage counts revenue"><Badge tone="green">{money(total)}</Badge></Tip>}
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={`${st.name} menu`}><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Moves here when</DropdownMenuLabel>
            {st.criteria.map((c) => <div key={c} className="px-2 py-0.5 text-sm text-muted">· {c}</div>)}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onEdit}><Pencil />Edit stage</DropdownMenuItem>
            <DropdownMenuItem danger onSelect={async () => { if (await askConfirm({ title: `Delete “${st.name}”?`, description: 'People in it move to the previous stage.', ok: 'Delete stage', danger: true })) { removeStage(pipe, dir, st.id); toast.success('Stage deleted') } }}><Trash2 />Delete stage</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>
      </div>
      <div ref={setNodeRef} className={cn('min-h-0 flex-1 space-y-2 overflow-y-auto rounded-card p-1.5 transition-colors', isOver ? 'bg-fill-selected' : 'bg-fill-hover')}>
        {leads.map((c) => <Draggable key={c.id} c={c} st={st} />)}
        {!leads.length && <p className="px-2 py-6 text-center text-xs text-muted">Drop a lead here</p>}
      </div>
    </div>
  )
}

function Draggable({ c, st }: { c: Contact; st: Stage }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: c.id })
  return <div ref={setNodeRef} {...attributes} {...listeners} className={cn('touch-none', isDragging && 'opacity-40')}><LeadCard c={c} st={st} /></div>
}

function LeadCard({ c, st, overlay }: { c: Contact; st?: Stage; overlay?: boolean }) {
  const nav = useNavigate(); const s = useStore()
  const plats = [...new Set(s.convos.filter((v) => v.cid === c.id).map((v) => v.plat))]
  const moved = s.recent[c.id] && Date.now() - s.recent[c.id] < 6000
  return (
    <Card className={cn('cursor-grab p-2.5 transition-shadow active:cursor-grabbing', overlay && 'rotate-1 shadow-dialog', moved && 'anim-fade outline outline-2 outline-primary')} onClick={() => nav(`/contacts/${c.id}`)}>
      <div className="flex items-center gap-2"><Avatar name={c.name || '?'} size={24} /><span className={cn('min-w-0 flex-1 truncate text-sm font-medium', !c.name && 'text-warning')}>{c.name || 'Name missing'}</span>{c.agent && <Tip content={`Handled by ${s.agents.find((a) => a.id === c.agent)?.name}`}><span><AgentAvatar name={s.agents.find((a) => a.id === c.agent)?.name ?? '?'} size={20} /></span></Tip>}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
        {plats.length ? plats.map((p) => <PlatIcon key={p} p={p} size={12} />) : <DirIcon dir={c.dir} size={12} />}
        <span className="truncate">{c.source}</span><span className="ml-auto shrink-0">{moved ? <span className="font-medium text-primary">Moved just now</span> : agoTxt(c.lastDays)}</span>
      </div>
      {st?.rev && valueOf(c) > 0 && <div className="mt-1.5 text-xs"><span className="font-semibold text-success tabular">{money(valueOf(c))}</span> <span className="text-muted">· {c.purchase?.product}</span></div>}
    </Card>
  )
}

/* ---------- List ---------- */
function ListView({ stages, leads, initialStage }: { stages: Stage[]; leads: Contact[]; initialStage: string | null }) {
  const nav = useNavigate(); const s = useStore()
  const [q, setQ] = React.useState(''); const [stage, setStage] = React.useState<string[]>(initialStage ? [initialStage] : []); const [agent, setAgent] = React.useState<string[]>([])
  const rows = leads.filter((c) => (!stage.length || stage.includes(c.stage)) && (!agent.length || (c.agent && agent.includes(c.agent))) && `${c.name} ${c.phone} ${c.stage}`.toLowerCase().includes(q.toLowerCase()))
  const agentIds = [...new Set(leads.map((c) => c.agent).filter(Boolean))] as string[]
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SearchRow value={q} onChange={setQ} placeholder="Search leads" />
        <PillRow>
          <FilterPill label="Stage" value={stage.length ? stage.join(', ') : undefined} onClear={() => setStage([])}><CheckList options={stages.map((st) => ({ v: st.name, l: <StageTag name={st.name} stages={stages} size="sm" /> }))} value={stage} onChange={setStage} /></FilterPill>
          <FilterPill label="Agent" value={agent.length ? agent.map((id) => s.agents.find((a) => a.id === id)?.name).join(', ') : undefined} onClear={() => setAgent([])}><CheckList options={agentIds.map((id) => ({ v: id, l: s.agents.find((a) => a.id === id)?.name ?? id }))} value={agent} onChange={setAgent} /></FilterPill>
          <span className="text-xs text-muted">{nf(rows.length)} leads</span>
        </PillRow>
        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <thead><tr><Th>Name</Th><Th>Stage</Th><Th>Channels</Th><Th>Agent</Th><Th>Campaign</Th><Th>Last update</Th><Th align="right">Revenue</Th></tr></thead>
            <tbody>{rows.map((c) => { const st = stages.find((x) => x.name === c.stage); const convos = s.convos.filter((v) => v.cid === c.id); return (
              <Tr key={c.id}>
                <Td><button onClick={() => nav(`/contacts/${c.id}`)} className="flex items-center gap-2 font-medium hover:text-primary"><Avatar name={c.name || '?'} size={20} />{c.name || <span className="text-warning">Name missing</span>}</button></Td>
                <Td>
                  <DropdownMenu><DropdownMenuTrigger asChild><button className="rounded-tag hover:opacity-80"><StageTag name={c.stage} stages={stages} /></button></DropdownMenuTrigger>
                    <DropdownMenuContent><DropdownMenuLabel>Move to</DropdownMenuLabel>{stages.map((x) => <DropdownMenuItem key={x.id} onSelect={() => { s.moveLead(c.id, x.name, 'you'); toast.success(`${c.name || 'Lead'} moved to ${x.name}`) }}><StageTag name={x.name} stages={stages} size="sm" />{c.stage === x.name && <Check className="ml-auto" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
                </Td>
                <Td>{convos.length ? <span className="flex gap-1">{convos.map((v) => { const who = [...new Set(v.items.flatMap((it) => (it.t === 'm' && it.d === 'o' && it.who ? [it.who] : it.t === 'call' ? [it.who] : [])))].map((id) => (id === 'you' ? 'You' : s.agents.find((a) => a.id === id)?.name)).filter(Boolean)
                  return <Tip key={v.id} content={<span><b className="font-semibold">{PLATFORMS[v.plat].label}</b> · {who.join(', ') || 'no messages yet'} — click to open</span>}><button onClick={() => nav(`/inbox?kind=chat&id=${v.id}`)} className="flex size-6 items-center justify-center rounded-control hover:bg-fill-hover" aria-label={`Open ${PLATFORMS[v.plat].label} conversation`}><PlatIcon p={v.plat} size={14} tip={false} /></button></Tip> })}</span> : <span className="text-muted">—</span>}</Td>
                <Td><AgentChip id={c.agent} size={18} /></Td>
                <Td className="max-w-[200px]"><CampaignChip id={c.camp} className="block truncate" /></Td>
                <Td className="text-muted">{agoTxt(c.lastDays)}</Td>
                <Td align="right">{st?.rev && valueOf(c) ? <span className="font-medium text-success">{money(valueOf(c))}</span> : ''}</Td>
              </Tr>
            ) })}</tbody>
          </Table>
          {!rows.length && <EmptyState compact icon={<Kanban />} title="No leads match" />}
        </div>
      </Card>
    </div>
  )
}

/* ---------- Review for me ---------- */
function ReviewView() {
  const nav = useNavigate(); const s = useStore()
  const items = s.assigned.filter((a) => !a.done && (a.kind === 'stage' || a.kind === 'qual'))
  const [pick, setPick] = React.useState<Record<string, string>>({})
  const decide = (id: string, stage: string, how: 'you' | 'ai') => {
    const a = s.assigned.find((x) => x.id === id)!; const c = s.contacts.find((x) => x.id === a.cid)
    if (c) s.moveLead(c.id, stage, how === 'you' ? 'you' : c.agent ?? 's1', how === 'you' ? 'chosen in Review' : 'AI decided')
    s.resolveAssigned(id, `Moved to ${stage}`)
    toast.success(how === 'you' ? `Moved to ${stage} · the AI learned from this and will decide cases like it by itself` : `AI moved ${c?.name ?? 'the lead'} to ${stage}`)
  }
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-16">
      <div className="mx-auto max-w-[900px] space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>When the AI isn’t sure about a stage, the lead waits here with everything you need to decide.</span>
          <span className="ml-auto flex items-center gap-2">Send here when the AI is less than<Select variant="button" value={s.prefs.reviewAt ?? '70'} onValueChange={(v) => { s.setPref('reviewAt', v); toast(`Leads come here when the AI is less than ${v}% sure`) }} options={['60', '70', '80', '90'].map((v) => ({ value: v, label: `${v}% sure` }))} /></span>
        </div>
        {items.map((a) => { const c = s.contacts.find((x) => x.id === a.cid); const camp = s.campaigns.find((k) => k.id === a.camp); const stages = stagesFor(camp, s.stages); const val = pick[a.id] ?? a.suggest ?? stages[0]?.name ?? ''; return (
          <Card key={a.id}>
            <div className="flex flex-wrap items-start gap-3 p-4 pb-3">
              <Avatar name={c?.name || '?'} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3>{c ? <button className="hover:text-primary" onClick={() => nav(`/contacts/${c.id}`)}>{c.name}</button> : a.title}</h3>{camp && <Badge tone="outline"><DirIcon dir={camp.dir} size={11} withTip={false} />{camp.name}</Badge>}<span className="text-xs text-muted">{a.time}</span></div>
                <p className="mt-1 text-sm">{a.desc}</p>
              </div>
              {c && <span className="flex items-center gap-1.5 text-sm text-muted">Now in <StageTag name={c.stage} stages={stages} /></span>}
            </div>
            {(a.summary || a.rec) && (
              <div className="space-y-2 border-t border-border-2 px-4 py-3">
                {a.rec && <Recording dur="2:41" className="max-w-[420px]" />}
                {a.summary && <p className="text-sm"><span className="font-semibold">Summary: </span>{a.summary}</p>}
                {a.tr && <Transcript lines={a.tr} />}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-border-2 px-4 py-3">
              {a.suggest && <span className="flex items-center gap-1.5 text-sm text-muted"><Sparkles className="size-4" />AI’s best guess: <StageTag name={a.suggest} stages={stages} /></span>}
              <span className="flex-1" />
              {a.convo && <Button variant="ghost" onClick={() => nav(`/inbox?kind=chat&id=${a.convo}`)}><ExternalLink />Open conversation</Button>}
              <Select variant="button" value={val} onValueChange={(v) => setPick({ ...pick, [a.id]: v })} options={stages.map((st) => ({ value: st.name, label: st.name, icon: <span className="size-2 rounded-full" style={{ background: st.color }} /> }))} />
              <Button variant="primary" onClick={() => decide(a.id, val, 'you')}><Check />Set stage</Button>
            </div>
          </Card>
        ) })}
        {!items.length && <Card><EmptyState icon={<ListChecks />} title="Nothing to review" description="The AI was sure about every stage. New cases show up here and in Assigned to me." /></Card>}
      </div>
    </div>
  )
}

/* ---------- Follow-up stages ---------- */
type FStage = { n: string; c: string; count: number }
const FDEF: Record<'in' | 'out', FStage[]> = {
  out: [{ n: 'Follow-up 1', c: 'No reply 1 day after the first message', count: 42 }, { n: 'Follow-up 2', c: 'No reply 3 days after Follow-up 1', count: 18 }, { n: 'Nurture', c: 'Asked to be contacted next month or later', count: 27 }, { n: 'Re-engage', c: 'No reply for 30 days', count: 64 }],
  in: [{ n: 'Missed call', c: 'Called in and nobody answered', count: 9 }, { n: 'Follow-up 1', c: 'Asked a question but didn’t book within a day', count: 14 }, { n: 'Nurture', c: 'Wants to book later', count: 11 }],
}
function FollowupView({ pipe, dir }: { pipe: Pipe; dir: 'in' | 'out' }) {
  const s = useStore(); const key = `follow.${pipe}.${dir}`
  const list: FStage[] = s.prefs[key] ?? FDEF[dir]
  const setList = (l: FStage[]) => s.setPref(key, l)
  const cfg: FollowConfig = s.prefs[`followCfg.${pipe}`] ?? defaultFollow('s1')
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-16">
      <div className="mx-auto grid max-w-[1200px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="self-start overflow-hidden">
          <CardHeader title={`${dir === 'in' ? 'Inbound' : 'Outbound'} follow-up stages`} description="Leads that need another try wait here until they reply or drop out." action={<Button variant="ghost" onClick={() => { s.setPref(`follow.${pipe}.${dir === 'out' ? 'in' : 'out'}`, list); toast.success(`Copied to ${dir === 'out' ? 'inbound' : 'outbound'} follow-up stages`) }}><Copy />Copy to {dir === 'out' ? 'inbound' : 'outbound'}</Button>} />
          {list.map((f, i) => (
            <div key={i} className="group flex items-center gap-3 border-t border-border-2 px-4 py-2.5">
              <Repeat className="size-4 shrink-0 text-icon" />
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{f.n}</span><span className="block text-sm text-muted">{f.c}</span></span>
              <span className="text-sm tabular">{nf(f.count)}</span>
              <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100" onClick={async () => { const c = await askText({ title: `When does a lead enter “${f.n}”?`, label: 'Rule', value: f.c }); if (c) setList(list.map((x, j) => (j === i ? { ...x, c } : x))) }} aria-label="Edit"><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100" onClick={() => setList(list.filter((_, j) => j !== i))} aria-label="Remove"><X /></Button>
            </div>
          ))}
          <div className="border-t border-border-2 px-4 py-3"><Button onClick={async () => { const n = await askText({ title: 'New follow-up stage', label: 'Name', placeholder: 'e.g. Follow-up 3', ok: 'Next' }); if (!n) return; const c = await askText({ title: `When does a lead enter “${n}”?`, label: 'Rule', placeholder: 'e.g. No reply 7 days after Follow-up 2', ok: 'Add stage' }); if (c) setList([...list, { n, c, count: 0 }]) }}><Plus />Add follow-up stage</Button></div>
        </Card>
        <Card>
          <CardHeader title="Follow-up conditions and instructions" description="Set separately for inbound and outbound. Campaigns can override these." />
          <div className="px-4 pb-4"><FollowUpEditor value={cfg} onChange={(v) => s.setPref(`followCfg.${pipe}`, v)} /></div>
        </Card>
      </div>
    </div>
  )
}
