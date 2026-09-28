import * as React from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/controls'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/* Polaris IndexFilters + IndexTable pieces. A table card is:
   <Card> tabs row · search row · filter pills · (bulk bar | table) · footer </Card> */

const tabBtn = 'flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-control px-3 text-xs font-medium text-text transition-colors hover:bg-fill-hover'

/** Saved views as tabs, inside the top of a table card. */
export function IndexTabs<T extends string>({ tabs, value, onChange, right, onAdd, addLabel = 'Save as view' }: {
  tabs: { value: T; label: React.ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; right?: React.ReactNode; onAdd?: () => void; addLabel?: string
}) {
  return (
    <div className="flex min-h-11 items-center gap-2 border-b border-border-2 px-2 py-1.5">
      <div role="tablist" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((t) => (
          <button key={t.value} role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)} className={cn(tabBtn, value === t.value && 'bg-fill-selected hover:bg-fill-selected')}>
            {t.label}{t.count !== undefined && <span className="text-muted tabular">{nf(t.count)}</span>}
          </button>
        ))}
        {onAdd && <Button variant="ghost" size="icon-sm" onClick={onAdd} aria-label={addLabel} title={addLabel}><span className="text-lg leading-none">+</span></Button>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
    </div>
  )
}

/** Search field row. Polaris puts it under the tabs, full width, with a light fill. */
export function SearchRow({ value, onChange, placeholder = 'Search', right, left, autoFocus, className, onKeyDown }: {
  value: string; onChange: (v: string) => void; placeholder?: string; right?: React.ReactNode; left?: React.ReactNode; autoFocus?: boolean; className?: string; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <div className={cn('flex items-center gap-2 border-b border-border-2 p-2', className)}>
      <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-control bg-subtle-2 px-2.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
        {left ?? <Search className="size-4 shrink-0 text-icon" />}
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} autoFocus={autoFocus} placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:outline-none" />
        {value && <button onClick={() => onChange('')} className="text-icon hover:text-text" aria-label="Clear search"><X className="size-4" /></button>}
      </label>
      {right}
    </div>
  )
}

/** Row of filter pills under the search row. */
export function PillRow({ children, right, className }: { children: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 border-b border-border-2 px-2 py-1.5', className)}>
      {children}
      {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
    </div>
  )
}

/** Filter pill: dashed while empty, solid with the value and an × once applied. */
export function FilterPill({ label, value, onClear, children, open, onOpenChange, width = 280 }: {
  label: string; value?: React.ReactNode; onClear?: () => void; children: React.ReactNode; open?: boolean; onOpenChange?: (o: boolean) => void; width?: number
}) {
  const active = value !== undefined && value !== null && value !== ''
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <span className={cn('inline-flex h-7 items-center rounded-control border bg-surface text-xs font-medium text-text', active ? 'border-border-strong' : 'border-dashed border-border-strong')}>
        <PopoverTrigger asChild>
          <button className={cn('flex h-full items-center gap-1 rounded-control px-2 transition-colors hover:bg-subtle-2', active && 'rounded-r-none pr-1.5')}>
            {active ? <span className="max-w-[260px] truncate">{label}: {value}</span> : label}
            <ChevronDown className="size-3.5 text-icon" />
          </button>
        </PopoverTrigger>
        {active && onClear && <button onClick={onClear} className="flex h-full items-center rounded-r-control border-l border-border px-1.5 text-icon transition-colors hover:bg-subtle-2 hover:text-text" aria-label={`Remove ${label} filter`}><X className="size-3.5" /></button>}
      </span>
      <PopoverContent style={{ width }}>{children}</PopoverContent>
    </Popover>
  )
}

/** Checkbox list for multi-select filter pills. */
export function CheckList({ options, value, onChange }: { options: { v: string; l: React.ReactNode }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="max-h-[260px] space-y-0.5 overflow-y-auto">
      {options.map((o) => (
        <label key={o.v} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 text-sm hover:bg-subtle-2">
          <Checkbox checked={value.includes(o.v)} onCheckedChange={(c) => onChange(c ? [...value, o.v] : value.filter((x) => x !== o.v))} />{o.l}
        </label>
      ))}
    </div>
  )
}

/** Replaces the table header while rows are selected (Polaris bulk actions). */
export function BulkBar({ count, total, onToggleAll, children, className }: { count: number; total: number; onToggleAll: () => void; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('sticky top-0 z-[3] flex min-h-9 flex-wrap items-center gap-1.5 border-b border-border bg-subtle-2 py-1 pl-3 pr-2 anim-fade', className)}>
      <Checkbox checked={count === total ? true : 'indeterminate'} onCheckedChange={onToggleAll} aria-label="Select all" />
      <span className="mr-1 text-xs font-medium">{nf(count)} selected</span>
      {children}
    </div>
  )
}

/** Card footer with pagination, like the Shopify admin's "‹ › 1–50". */
export function Pager({ page, size, total, onChange, children }: { page: number; size: number; total: number; onChange: (p: number) => void; children?: React.ReactNode }) {
  const from = total ? page * size + 1 : 0, to = Math.min(total, (page + 1) * size)
  return (
    <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-2 px-2 py-1 text-xs text-muted">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft /></Button>
        <Button variant="ghost" size="icon-sm" disabled={to >= total} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight /></Button>
        <span className="ml-1 font-medium text-text tabular">{nf(from)}–{nf(to)}</span><span>of {nf(total)}</span>
      </div>
      {children}
    </div>
  )
}
