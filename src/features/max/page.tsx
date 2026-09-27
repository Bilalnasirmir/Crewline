import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Sparkles, Megaphone, Users, Receipt, BarChart3, Bot, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/app/page'
import { useMax } from './store'
import { Composer, ThreadView } from './chat'

const SUGGEST = [
  { l: 'Build a campaign', d: 'Max asks a few questions and sets it up', I: Megaphone, q: 'Build an outbound campaign for Mississauga Leads by text and call' },
  { l: 'Find people', d: '“Women in Brooklyn who have emails”', I: Users, q: 'Find people in Brooklyn who have emails' },
  { l: 'What should I fix today?', d: 'Campaigns, agents and setup that need attention', I: Sparkles, q: 'What should I fix today?' },
  { l: 'Reduce my costs', d: 'Where the money goes and 3 changes', I: Receipt, q: 'How can I reduce my costs?' },
  { l: 'Improve an agent', d: 'Review Robert’s prompt and criteria', I: Bot, q: 'Improve Robert agent' },
  { l: 'Research the best campaign', d: 'Competitors + a presentation', I: BarChart3, q: 'What’s the best campaign I could run? Look at what competitors are doing' },
]

export function MaxPage() {
  const { threads, activeId, open, newThread, send, rename, remove } = useMax()
  const [q, setQ] = React.useState('')
  const [histOpen, setHistOpen] = React.useState(true)
  const loc = useLocation(); const nav = useNavigate()
  React.useEffect(() => { const p = new URLSearchParams(loc.search).get('q'); if (p) { newThread(); setTimeout(() => send(p), 50); nav('/max', { replace: true }) } }, [loc.search])
  const active = threads.find((t) => t.id === activeId) ?? threads[0]
  const list = threads.filter((t) => t.msgs.length && t.title.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex min-h-0 flex-1">
      {/* history rail */}
      <aside className={cn('hidden w-[260px] shrink-0 flex-col border-r border-border bg-sidebar md:flex', !histOpen && 'md:hidden')}>
        <div className="flex h-12 items-center gap-2 border-b border-border px-3"><span className="text-base font-semibold">Chats</span><Button variant="ghost" size="icon-sm" className="ml-auto" onClick={newThread} aria-label="New chat"><Plus /></Button></div>
        <div className="p-2"><div className="relative"><Search className="absolute left-2.5 top-2 size-3.5 text-muted" /><Input className="h-7 pl-7 text-sm" placeholder="Search chats" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {list.map((t) => (
            <div key={t.id} className={cn('group flex h-8 items-center gap-1 rounded-control pl-2 pr-1 text-sm', t.id === active.id ? 'bg-subtle text-text' : 'text-text-2 hover:bg-subtle')}>
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => open(t.id)}>{t.title}</button>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" aria-label="Chat menu"><MoreHorizontal /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => { const n = window.prompt('Rename chat', t.title); if (n) rename(t.id, n) }}><Pencil />Rename</DropdownMenuItem><DropdownMenuItem danger onSelect={() => remove(t.id)}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </div>
          ))}
          {!list.length && <p className="px-2 py-6 text-center text-xs text-muted">No chats yet</p>}
        </div>
        <div className="border-t border-border p-3 text-xs text-muted">Chats, files and results are saved. Reports Max makes go to Reports.</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader title="Max" sub="your AI assistant — it can read, build and change anything in Crewline" icon={<Sparkles className="text-ai" />}
          actions={<><Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setHistOpen(!histOpen)} aria-label="Toggle chats"><PanelLeft /></Button><Button size="sm" onClick={newThread}><Plus />New chat</Button></>} />
        <ThreadView empty={
          <div className="pt-[8vh]">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-ai-soft text-ai"><Sparkles className="size-6" /></div>
            <h1 className="mt-4 text-center">Good evening, Bilal. What do you want to do?</h1>
            <p className="mt-1 text-center text-base text-muted">Ask in your own words. Max shows the options right here and never changes anything without asking.</p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SUGGEST.map((s) => <button key={s.l} onClick={() => send(s.q)} className="flex items-start gap-3 rounded-card border border-border p-3 text-left transition-colors hover:bg-subtle-2"><s.I className="mt-0.5 size-4 shrink-0 text-muted" /><span><span className="block font-medium">{s.l}</span><span className="block text-sm text-muted">{s.d}</span></span></button>)}
            </div>
          </div>
        } />
        <div className="shrink-0 px-4 pb-4"><div className="mx-auto max-w-[760px]"><Composer autoFocus onSend={(t, o) => send(t, o)} /></div></div>
      </div>
    </div>
  )
}
