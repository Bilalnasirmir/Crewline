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

/** Screens with their own message box in the bottom-right corner hide the floating "Ask Max" button
 *  (Max stays one click away in the top bar, or ⌘J). */
const OWN_COMPOSER = [/^\/inbox/, /^\/agents\/[^/]+$/]

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
      {!open && !OWN_COMPOSER.some((r) => r.test(loc.pathname)) && (
        <Tip content="Ask Max (⌘J)" side="left">
          <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-[90] flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 text-xs font-medium text-text shadow-[0_0_#0000,var(--shadow-btn),var(--shadow-menu)] transition-colors hover:bg-btn-2-hover" aria-label="Open Max">
            <Sparkles className="size-4 text-icon" />Ask Max
          </button>
        </Tip>
      )}
      <aside className={cn('fixed inset-y-0 right-0 z-[95] flex w-[min(420px,100vw)] flex-col border-l border-border bg-surface shadow-dialog transition-transform duration-200 ease-in-out', open ? 'translate-x-0' : 'translate-x-full')} aria-hidden={!open}>
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-subtle-3 pl-4 pr-2">
          <Sparkles className="size-4 text-icon" />
          <span className="text-lg font-semibold">Max</span>
          {g && <span className="inline-flex h-5 items-center rounded-tag bg-neutral-badge px-2 text-xs font-medium text-text-2">Guided mode</span>}
          <span className="flex-1" />
          <Tip content="New chat"><Button variant="ghost" size="icon-sm" onClick={newThread} aria-label="New chat"><Plus /></Button></Tip>
          <Tip content="Open full screen"><Button variant="ghost" size="icon-sm" onClick={() => { setOpen(false); nav('/max') }} aria-label="Full screen"><Maximize2 /></Button></Tip>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close"><X /></Button>
        </div>
        {g && (
          <div className="shrink-0 border-b border-border bg-subtle-2 p-3">
            <div className="mb-1.5 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 font-medium"><Compass className="size-3.5 text-ai" />{g.title}</span><button className="text-xs text-muted hover:text-text" onClick={() => setGuide(null)}>Exit guide</button></div>
            <ol className="space-y-1">{g.steps.map((s, i) => { const d = done.includes(i); const cur = !d && done.length === i; return (
              <li key={i} className={cn('flex items-center gap-2 rounded-[6px] px-2 py-1 text-sm', cur && 'bg-bg shadow-btn', d && 'text-muted line-through')}>
                <button onClick={() => setDone(d ? done.filter((x) => x !== i) : [...done, i])} className={cn('flex size-4 items-center justify-center rounded-full border', d ? 'border-success bg-success text-white' : cur ? 'border-ai' : 'border-border-strong')} aria-label="Mark step done">{d && <Check className="size-2.5" strokeWidth={3} />}</button>
                <span className="flex-1">{s}</span>{cur && <span className="text-xs font-medium text-text">Do this now</span>}
              </li>
            ) })}</ol>
          </div>
        )}
        <ThreadView compact empty={
          <div className="pt-6 text-center">
            <h3>How can I help on this screen?</h3>
            <p className="mt-1 text-sm text-muted">I can explain any number, change a setting, or do the task for you.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {['Explain this page', 'Guide me through this', 'What should I fix today?', 'Switch to dark theme'].map((q) => <Button key={q} onClick={() => (q === 'Guide me through this' ? setGuide(loc.pathname) : send(q, { page: loc.pathname }))}>{q}</Button>)}
            </div>
          </div>
        } />
        <div className="shrink-0 border-t border-border p-3"><Composer compact hint={null} placeholder="Ask Max about this screen…" onSend={(t, o) => send(t, { ...o, page: loc.pathname })} /></div>
      </aside>
    </>
  )
}
