import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { X, Sparkles, Plus, Maximize2, Check, Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tip } from '@/components/ui/tooltip'
import { useStore } from '@/store'
import { useMax } from './store'
import { Composer, ThreadView } from './chat'
import { guideFor } from './engine'

/** Max side panel available on every screen. Also hosts guided mode. */
export function MaxPanel() {
  const open = useStore((s) => s.maxPanelOpen), setOpen = useStore((s) => s.setMaxPanel)
  const guide = useStore((s) => s.guide), setGuide = useStore((s) => s.setGuide)
  const { send, newThread } = useMax()
  const loc = useLocation(); const nav = useNavigate()
  const [done, setDone] = React.useState<number[]>([])
  const g = guide ? guideFor(loc.pathname) ?? { title: 'Guided mode', steps: ['Open the screen you want help with', 'Max will tell you what to do next'] } : null
  React.useEffect(() => { setDone([]) }, [loc.pathname])
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) setOpen(false) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])
  if (loc.pathname.startsWith('/max')) return null
  return (
    <>
      {!open && (
        <Tip content="Ask Max (⌘J)" side="left">
          <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-[90] flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 text-base font-medium shadow-menu transition-transform hover:scale-[1.02]" aria-label="Open Max">
            <Sparkles className="size-4 text-ai" />Ask Max
          </button>
        </Tip>
      )}
      <aside className={cn('fixed inset-y-0 right-0 z-[95] flex w-[min(420px,100vw)] flex-col border-l border-border bg-surface shadow-dialog transition-transform duration-200 ease-in-out', open ? 'translate-x-0' : 'translate-x-full')} aria-hidden={!open}>
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <span className="flex size-6 items-center justify-center rounded-full bg-ai-soft text-ai"><Sparkles className="size-3.5" /></span>
          <span className="text-base font-semibold">Max</span>
          {g && <span className="rounded-tag bg-ai-soft px-1.5 text-xs font-medium text-ai">Guided mode</span>}
          <span className="flex-1" />
          <Tip content="New chat"><Button variant="ghost" size="icon-sm" onClick={newThread} aria-label="New chat"><Plus /></Button></Tip>
          <Tip content="Open full screen"><Button variant="ghost" size="icon-sm" onClick={() => { setOpen(false); nav('/max') }} aria-label="Full screen"><Maximize2 /></Button></Tip>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close"><X /></Button>
        </div>
        {g && (
          <div className="shrink-0 border-b border-border bg-ai-soft/30 p-3">
            <div className="mb-1.5 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 font-medium"><Compass className="size-3.5 text-ai" />{g.title}</span><button className="text-xs text-muted hover:text-text" onClick={() => setGuide(null)}>Exit guide</button></div>
            <ol className="space-y-1">{g.steps.map((s, i) => { const d = done.includes(i); const cur = !d && done.length === i; return (
              <li key={i} className={cn('flex items-center gap-2 rounded-[6px] px-2 py-1 text-sm', cur && 'bg-bg shadow-btn', d && 'text-muted line-through')}>
                <button onClick={() => setDone(d ? done.filter((x) => x !== i) : [...done, i])} className={cn('flex size-4 items-center justify-center rounded-full border', d ? 'border-success bg-success text-white' : cur ? 'border-ai' : 'border-border-strong')} aria-label="Mark step done">{d && <Check className="size-2.5" strokeWidth={3} />}</button>
                <span className="flex-1">{s}</span>{cur && <span className="text-[11px] font-medium text-ai">Do this now</span>}
              </li>
            ) })}</ol>
          </div>
        )}
        <ThreadView compact empty={
          <div className="pt-6 text-center">
            <p className="text-base font-medium">How can I help on this screen?</p>
            <p className="mt-1 text-sm text-muted">I can explain any number, change a setting, or do the task for you.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {['Explain this page', 'Guide me through this', 'What should I fix today?', 'Switch to dark theme'].map((q) => <button key={q} onClick={() => (q === 'Guide me through this' ? setGuide(loc.pathname) : send(q, { page: loc.pathname }))} className="h-7 rounded-full border border-border px-3 text-sm hover:bg-subtle">{q}</button>)}
            </div>
          </div>
        } />
        <div className="shrink-0 border-t border-border p-3"><Composer compact hint={null} placeholder="Ask Max about this screen…" onSend={(t, o) => send(t, { ...o, page: loc.pathname })} /></div>
      </aside>
    </>
  )
}
