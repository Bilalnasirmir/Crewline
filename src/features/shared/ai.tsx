import * as React from 'react'
import { toast } from 'sonner'
import { Check, Sparkles, AlertTriangle, CircleCheck, FolderOpen, Download, ArrowRight } from 'lucide-react'
import { cn, uid } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Sheet, Dialog, DialogContent } from '@/components/ui/dialog'
import { Checkbox, Progress } from '@/components/ui/controls'
import { Select } from '@/components/ui/select'
import { Composer, Md } from '@/features/max/chat'

type Turn = { id: string; who: 'you' | 'ai'; text: string }

/** A focused "Ask AI" chat for one screen (a campaign, bookings, expenses). The answer function is local and simulated. */
export function AskSheet({ open, onOpenChange, title, description, suggestions, answer, onAnswer }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; suggestions: string[]; answer: (q: string) => string; onAnswer?: (q: string) => void
}) {
  const [turns, setTurns] = React.useState<Turn[]>([]); const [typing, setTyping] = React.useState(false)
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [turns.length, typing])
  const ask = (q: string) => {
    setTurns((t) => [...t, { id: uid('t'), who: 'you', text: q }]); setTyping(true)
    setTimeout(() => { const text = answer(q); setTurns((t) => [...t, { id: uid('t'), who: 'ai', text }]); setTyping(false); onAnswer?.(q) }, 700)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={<span className="flex items-center gap-2"><Sparkles className="size-4" />{title}</span>} description={description} width={460} bodyClassName="flex flex-col p-0">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {!turns.length && (
          <div className="space-y-2">
            <p className="text-sm text-muted">Ask in your own words. The answer uses this screen’s live numbers.</p>
            <div className="flex flex-col items-start gap-1.5">{suggestions.map((s) => <Button key={s} onClick={() => ask(s)} className="h-auto min-h-7 whitespace-normal py-1 text-left">{s}</Button>)}</div>
          </div>
        )}
        {turns.map((t) => t.who === 'you'
          ? <div key={t.id} className="flex justify-end"><div className="max-w-[85%] rounded-[14px] rounded-br-[4px] bg-subtle px-3 py-2 text-sm">{t.text}</div></div>
          : <div key={t.id} className="flex gap-2 anim-fade"><span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai"><Sparkles className="size-3" /></span><Md md={t.text} className="min-w-0 flex-1 text-sm leading-5" /></div>)}
        {typing && <div className="flex h-6 items-center gap-1 pl-8"><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite]" /><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite_.2s]" /><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite_.4s]" /></div>}
        <div ref={end} />
      </div>
      <div className="shrink-0 border-t border-border p-3"><Composer compact hint={null} placeholder="Ask anything about this…" onSend={(t) => ask(t)} /></div>
    </Sheet>
  )
}

export type Analysis = {
  title: string; subject: string
  kpis: { l: string; v: string; d?: string }[]
  flow?: { l: string; n: number; color?: string }[]
  wrong: string[]; works: string[]; often?: string[]
  suggestions: string[]
  folder?: string; kind?: string
}

/** "Analyze with AI": reads everything, then shows a small report dashboard with a flow, findings and suggestions. */
export function AnalyzeDialog({ open, onOpenChange, a, onApply }: { open: boolean; onOpenChange: (o: boolean) => void; a: Analysis; onApply?: (picked: string[]) => void }) {
  const addReport = useStore((s) => s.addReport), folders = useStore((s) => s.reportFolders)
  const [step, setStep] = React.useState(0); const [picked, setPicked] = React.useState<string[]>(a.suggestions)
  const [folder, setFolder] = React.useState(a.folder ?? 'r6')
  const steps = ['Reading conversations and calls', 'Checking stages and outcomes', 'Comparing agents and messages', 'Writing the report']
  React.useEffect(() => {
    if (!open) return
    setStep(0); setPicked(a.suggestions)
    const t = setInterval(() => setStep((s) => { if (s >= steps.length) { clearInterval(t); return s } return s + 1 }), 450)
    return () => clearInterval(t)
  }, [open])
  const done = step >= steps.length
  const max = Math.max(...(a.flow ?? []).map((f) => f.n), 1)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" title={<span className="flex items-center gap-2"><Sparkles className="size-4" />{a.title}</span>} description={a.subject}
        footer={done ? <>
          <Select variant="button" value={folder} onValueChange={setFolder} options={folders.map((f) => ({ value: f.id, label: `Save in: ${f.name}` }))} />
          <Button onClick={() => { addReport({ name: a.title, folder, date: '2026-09-27', by: 'Max', kind: a.kind ?? 'Analysis' }); toast.success(`Saved to Reports › ${folders.find((f) => f.id === folder)?.name}`) }}><FolderOpen />Save to Reports</Button>
          <Button onClick={() => toast('PDF downloaded (demo)')}><Download />PDF</Button>
          <Button variant="primary" disabled={!picked.length} onClick={() => { onApply?.(picked); onOpenChange(false); toast.success(`${picked.length} change${picked.length === 1 ? '' : 's'} applied · Max will watch the numbers`) }}><Check />Apply {picked.length} suggestion{picked.length === 1 ? '' : 's'}</Button>
        </> : <Button onClick={() => onOpenChange(false)}>Cancel</Button>}>
        {!done ? (
          <div className="mx-auto max-w-[420px] space-y-3 py-8">
            <Progress value={(step / steps.length) * 100} />
            {steps.map((s, i) => <div key={s} className={cn('flex items-center gap-2 text-sm', i >= step && 'text-muted')}><span className={cn('flex size-4 items-center justify-center rounded-full', i < step ? 'bg-success text-white' : 'border border-border-strong')}>{i < step && <Check className="size-2.5" strokeWidth={3} />}</span>{s}</div>)}
          </div>
        ) : (
          <div className="space-y-4 anim-fade">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{a.kpis.map((k) => <div key={k.l} className="rounded-card border border-border p-3"><div className="text-xs text-muted">{k.l}</div><div className="text-2xl font-semibold tabular">{k.v}</div>{k.d && <div className="text-xs text-muted">{k.d}</div>}</div>)}</div>
            {a.flow && (
              <div className="rounded-card border border-border p-3">
                <h3 className="mb-3">What’s happening</h3>
                <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
                  {a.flow.map((f, i) => (
                    <React.Fragment key={f.l}>
                      <div className="min-w-[112px] flex-1 rounded-control bg-subtle-2 p-2">
                        <div className="truncate text-xs text-muted">{f.l}</div>
                        <div className="text-lg font-semibold tabular">{f.n.toLocaleString('en-US')}</div>
                        <div className="mt-1 h-1.5 rounded-full bg-fill-selected"><div className="h-full rounded-full" style={{ width: `${(f.n / max) * 100}%`, background: f.color ?? 'var(--primary)' }} /></div>
                        {i > 0 && a.flow![i - 1].n > 0 && <div className="mt-1 text-xs text-muted">{Math.round((f.n / a.flow![i - 1].n) * 100)}% of previous</div>}
                      </div>
                      {i < a.flow!.length - 1 && <ArrowRight className="size-4 shrink-0 self-center text-faint" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-card border border-border p-3"><h3 className="mb-2">What’s going wrong</h3><ul className="space-y-1.5">{a.wrong.map((w) => <li key={w} className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />{w}</li>)}</ul></div>
              <div className="rounded-card border border-border p-3"><h3 className="mb-2">What works</h3><ul className="space-y-1.5">{a.works.map((w) => <li key={w} className="flex gap-2 text-sm"><CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />{w}</li>)}</ul></div>
            </div>
            {a.often && <div className="rounded-card border border-border p-3"><h3 className="mb-2">What happens most often</h3><ol className="list-decimal space-y-1 pl-5 text-sm">{a.often.map((w) => <li key={w}>{w}</li>)}</ol></div>}
            <div className="rounded-card border border-border">
              <div className="flex items-center justify-between border-b border-border-2 px-3 py-2"><h3>Suggestions</h3><span className="text-xs text-muted">Nothing changes until you apply</span></div>
              {a.suggestions.map((s) => <label key={s} className="flex cursor-pointer items-start gap-2 border-b border-border-2 px-3 py-2 text-sm last:border-0 hover:bg-subtle-2"><Checkbox className="mt-0.5" checked={picked.includes(s)} onCheckedChange={(c) => setPicked(c ? [...picked, s] : picked.filter((x) => x !== s))} />{s}</label>)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
