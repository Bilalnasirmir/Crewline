import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageCircleQuestion, MessageSquare, CalendarPlus, BookPlus } from 'lucide-react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, EmptyState } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { AgentAvatar } from '@/components/ui/avatar'
import { Kpi, AgentChip, ContactChip } from '@/components/app/bits'
import { PlatIcon } from '@/components/app/icons'
import { IndexTabs, SearchRow } from '@/components/app/index-table'
import type { Query } from '@/data/types'
import type { BookingPreset } from './shared'

/** The distinct mark for information-only conversations, so they never look like bookings. */
export function QueryIcon({ className }: { className?: string }) {
  return <span className={`flex size-6 shrink-0 items-center justify-center rounded-control bg-info-soft text-info ${className ?? ''}`} aria-label="Query"><MessageCircleQuestion className="size-3.5" /></span>
}

/** Receptionist queries: people who called or texted just to ask something. */
export function Queries({ camp, onBook }: { camp: string; onBook: (p: BookingPreset) => void }) {
  const nav = useNavigate(); const s = useStore()
  const [tab, setTab] = React.useState<'all' | 'answered' | 'booked'>('all'); const [q, setQ] = React.useState(''); const [open, setOpen] = React.useState<Query | null>(null)
  const list = s.queries.filter((x) => x.camp === camp)
  const booked = list.filter((x) => x.out === 'Turned into a booking')
  const rows = list.filter((x) => (tab === 'all' || (tab === 'booked') === (x.out === 'Turned into a booking')) && (!q || `${x.who} ${x.q} ${x.a}`.toLowerCase().includes(q.toLowerCase())))
  const addToQA = (x: Query) => {
    const a = s.agents.find((g) => g.id === x.agent); if (!a) return
    if (a.qa.some((p) => p.q === x.q)) { toast(`${a.name} already knows this answer`); return }
    s.updateAgent(a.id, { qa: [...a.qa, { q: x.q, a: x.a }] }); toast.success(`Added to ${a.name}’s questions and answers`)
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Queries this week" value={list.length} />
        <Kpi label="Answered by AI" value={list.length ? '100%' : '—'} sub="no one waited" />
        <Kpi label="Turned into bookings" value={booked.length} sub={list.length ? `${Math.round((booked.length / list.length) * 100)}%` : undefined} />
        <Kpi label="Average reply" value="4 sec" />
      </div>
      <Card className="overflow-hidden">
        <IndexTabs tabs={[{ value: 'all', label: 'All', count: list.length }, { value: 'answered', label: 'Answered', count: list.length - booked.length }, { value: 'booked', label: 'Turned into a booking', count: booked.length }]} value={tab} onChange={setTab} />
        <SearchRow value={q} onChange={setQ} placeholder="Search questions, answers or people" />
        {rows.length ? (
          <div className="overflow-x-auto">
            <Table>
              <thead><tr><Th className="w-10" /><Th>Who</Th><Th>Asked</Th><Th>Answer</Th><Th>By</Th><Th>When</Th><Th>Outcome</Th></tr></thead>
              <tbody>{rows.map((x) => (
                <Tr key={x.id} clickable onClick={() => setOpen(x)}>
                  <Td><QueryIcon /></Td>
                  <Td><span className="flex items-center gap-2"><PlatIcon p={x.ch} size={14} />{x.cid ? <ContactChip id={x.cid} size={18} /> : <span className="tabular">{x.who}</span>}</span></Td>
                  <Td className="max-w-[260px] truncate font-medium">{x.q}</Td>
                  <Td className="max-w-[300px] truncate text-muted">{x.a}</Td>
                  <Td><AgentChip id={x.agent} size={18} /></Td>
                  <Td className="text-muted">{x.time}</Td>
                  <Td><Badge tone={x.out === 'Turned into a booking' ? 'green' : 'neutral'}>{x.out}</Badge></Td>
                </Tr>
              ))}</tbody>
            </Table>
          </div>
        ) : <EmptyState compact icon={<MessageCircleQuestion />} title="No queries yet" description="When someone calls or texts only to ask something, it shows up here instead of in bookings." />}
      </Card>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent size="md" title={<span className="flex items-center gap-2"><QueryIcon />Query from {open.who}</span>} description={`${open.time} · answered by ${s.agents.find((a) => a.id === open.agent)?.name ?? 'an agent'}`}
            footer={<>
              <Button className="mr-auto" onClick={() => addToQA(open)}><BookPlus />Save as a Q&A answer</Button>
              <Button onClick={() => { setOpen(null); nav(open.cid ? `/inbox?to=${open.cid}` : '/inbox') }}><MessageSquare />Open conversation</Button>
              <Button variant="primary" onClick={() => { setOpen(null); onBook({ camp, who: open.cid ?? open.who }) }}><CalendarPlus />Book for them</Button>
            </>}>
            <div className="space-y-3">
              <div className="flex justify-end"><div className="max-w-[85%] rounded-[14px] rounded-br-[4px] bg-subtle px-3 py-2 text-sm">{open.q}</div></div>
              <div className="flex gap-2"><AgentAvatar name={s.agents.find((a) => a.id === open.agent)?.name ?? 'AI'} size={24} className="mt-0.5" /><div className="max-w-[85%] rounded-[14px] rounded-bl-[4px] border border-border px-3 py-2 text-sm">{open.a}</div></div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted"><PlatIcon p={open.ch} size={14} />Came in by {open.ch === 'call' ? 'phone call' : open.ch === 'sms' ? 'text' : open.ch === 'wa' ? 'WhatsApp' : 'web chat'} · <Badge tone={open.out === 'Turned into a booking' ? 'green' : 'neutral'}>{open.out}</Badge></div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
