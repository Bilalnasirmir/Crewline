import * as React from 'react'
import { Pause, Play, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const toSec = (d: string) => { const [m, s] = d.replace(/[^\d:]/g, '').split(':').map(Number); return (m || 0) * 60 + (s || 0) }
const fmt = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`
const BARS = Array.from({ length: 48 }, (_, i) => 30 + Math.round(Math.abs(Math.sin(i * 1.7) * 50 + Math.cos(i * 0.6) * 20)))

/** Call recording player (simulated audio): play/pause, waveform you can click to seek, speed. */
export function Recording({ dur = '2:05', className }: { dur?: string; className?: string }) {
  const total = Math.max(1, toSec(dur))
  const [on, setOn] = React.useState(false); const [t, setT] = React.useState(0); const [speed, setSpeed] = React.useState(1)
  React.useEffect(() => {
    if (!on) return
    const id = setInterval(() => setT((x) => { const n = x + 0.25 * speed; if (n >= total) { setOn(false); return 0 } return n }), 250)
    return () => clearInterval(id)
  }, [on, speed, total])
  const p = t / total
  return (
    <div className={cn('flex min-w-0 items-center gap-2 rounded-control bg-subtle-2 py-1 pl-1 pr-2', className)}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOn(!on)} aria-label={on ? 'Pause recording' : 'Play recording'}>{on ? <Pause /> : <Play />}</Button>
      <div className="flex h-6 min-w-0 flex-1 cursor-pointer items-center gap-[2px]" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setT(((e.clientX - r.left) / r.width) * total) }} role="slider" aria-label="Seek" aria-valuenow={Math.round(p * 100)}>
        {BARS.map((h, i) => <span key={i} className={cn('w-[2px] shrink-0 rounded-full transition-colors', i / BARS.length <= p ? 'bg-text' : 'bg-border-strong')} style={{ height: `${h}%` }} />)}
      </div>
      <span className="shrink-0 text-xs text-muted tabular">{fmt(t)} / {fmt(total)}</span>
      <button onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)} className="shrink-0 rounded-tag px-1 text-xs font-medium text-muted hover:bg-fill-hover hover:text-text" aria-label="Playback speed">{speed}×</button>
    </div>
  )
}

/** Speaker-by-speaker transcript, collapsed to a toggle by default. */
export function Transcript({ lines, open: startOpen = false, className }: { lines: [string, string][]; open?: boolean; className?: string }) {
  const [open, setOpen] = React.useState(startOpen)
  return (
    <div className={className}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs font-medium text-muted hover:text-text"><ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />{open ? 'Hide transcript' : 'Show transcript'}</button>
      {open && <div className="mt-1.5 space-y-1 border-l-2 border-border pl-3 anim-fade">{lines.map(([who, text], i) => <p key={i} className="text-sm"><span className="font-semibold">{who}:</span> {text}</p>)}</div>}
    </div>
  )
}
