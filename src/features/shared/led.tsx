import * as React from 'react'
import { X, Plus, Sparkles, Mic, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Tip } from '@/components/ui/tooltip'

/** Line-entry list: type a sentence, press Enter → item. Optional importance dropdown per line. */
export function LineList({
  items, onChange, placeholder = 'Type a sentence and press Enter', importance, ai, className, max, numbered,
}: { items: { text: string; imp?: string }[] | string[]; onChange: (v: any[]) => void; placeholder?: string; importance?: string[]; ai?: () => void; className?: string; max?: number; numbered?: boolean }) {
  const [v, setV] = React.useState('')
  const norm = (items as any[]).map((i) => (typeof i === 'string' ? { text: i } : i))
  const isStr = typeof (items as any[])[0] === 'string' || (!items.length && !importance)
  const emit = (arr: { text: string; imp?: string }[]) => onChange(isStr ? arr.map((x) => x.text) : arr)
  const add = () => { const t = v.trim(); if (!t) return; if (max && norm.length >= max) return; emit([...norm, { text: t, imp: importance?.[0] }]); setV('') }
  return (
    <div className={cn('rounded-card border border-border', className)}>
      {norm.length > 0 && <ul className="divide-y divide-border">{norm.map((it, i) => (
        <li key={i} className="group flex items-center gap-2 px-2.5 py-1.5 text-base">
          {numbered ? <span className="w-5 shrink-0 text-xs text-muted tabular">{i + 1}.</span> : <GripVertical className="size-3.5 shrink-0 text-faint opacity-0 group-hover:opacity-100" />}
          <span className="min-w-0 flex-1 leading-5">{it.text}</span>
          {importance && <Select size="sm" className="w-[110px]" value={it.imp ?? importance[0]} onValueChange={(imp) => emit(norm.map((x, j) => (j === i ? { ...x, imp } : x)))} options={importance.map((x) => ({ value: x, label: x }))} />}
          <button onClick={() => emit(norm.filter((_, j) => j !== i))} className="text-faint hover:text-danger" aria-label="Remove"><X className="size-3.5" /></button>
        </li>
      ))}</ul>}
      <div className={cn('flex items-center gap-1.5 px-2.5 py-1.5', norm.length && 'border-t border-border')}>
        <Plus className="size-3.5 shrink-0 text-faint" />
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} placeholder={placeholder} className="h-7 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-faint" />
        <Tip content="Say it instead"><Button variant="ghost" size="icon-xs" aria-label="Voice" onClick={() => setV('Customer confirms the service address')}><Mic /></Button></Tip>
        {ai && <Tip content="Let AI write these from your business"><Button variant="ghost" size="icon-xs" aria-label="AI" onClick={ai}><Sparkles className="!text-ai" /></Button></Tip>}
      </div>
    </div>
  )
}

/** Toggle row used in every settings list: label + optional description + control on the right. */
export function OptionRow({ title, description, children, className, icon }: { title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5', className)}>
      <div className="flex min-w-[min(100%,200px)] flex-1 items-start gap-2">{icon && <span className="mt-0.5 text-muted [&_svg]:size-4">{icon}</span>}<div className="min-w-0"><div className="text-base">{title}</div>{description && <div className="text-sm text-muted">{description}</div>}</div></div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
