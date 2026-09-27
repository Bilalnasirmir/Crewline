import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { cn } from '@/lib/utils'

export type ComboOption = { value: string; label: string; icon?: React.ReactNode; hint?: string; group?: string }

/** Searchable single or multi select. Multi shows chips inside the trigger. */
export function Combobox({
  value, onChange, options, placeholder = 'Select…', searchPlaceholder = 'Search…', multiple, className, size = 'md', emptyText = 'No results', creatable, disabled, width,
}: {
  value: string | string[] | undefined; onChange: (v: any) => void; options: ComboOption[]; placeholder?: string; searchPlaceholder?: string
  multiple?: boolean; className?: string; size?: 'sm' | 'md'; emptyText?: string; creatable?: boolean; disabled?: boolean; width?: number
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const vals = multiple ? ((value as string[]) ?? []) : value ? [value as string] : []
  const byVal = new Map(options.map((o) => [o.value, o]))
  const toggle = (v: string) => {
    if (multiple) onChange(vals.includes(v) ? vals.filter((x) => x !== v) : [...vals, v])
    else { onChange(v); setOpen(false) }
  }
  const groups = Array.from(new Set(options.map((o) => o.group ?? '')))
  const canCreate = creatable && q.trim() && !options.some((o) => o.label.toLowerCase() === q.trim().toLowerCase())
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full min-w-0 items-center justify-between gap-2 rounded-control border border-border bg-bg px-2.5 text-left text-base transition-colors hover:border-border-strong focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-50',
            size === 'sm' ? 'min-h-7 text-sm' : 'min-h-8', multiple && vals.length ? 'py-1' : '', className,
          )}
        >
          <span className={cn('flex min-w-0 flex-1 flex-wrap items-center gap-1', !vals.length && 'text-faint')}>
            {!vals.length ? placeholder : multiple ? vals.map((v) => (
              <span key={v} className="inline-flex h-5 items-center gap-1 rounded-tag bg-subtle px-1.5 text-xs font-medium">
                {byVal.get(v)?.label ?? v}
                <span role="button" tabIndex={-1} onClick={(e) => { e.stopPropagation(); toggle(v) }} className="text-muted hover:text-text"><X className="size-3" /></span>
              </span>
            )) : <span className="flex items-center gap-2 truncate">{byVal.get(vals[0])?.icon}{byVal.get(vals[0])?.label ?? vals[0]}</span>}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: width ?? 'var(--radix-popover-trigger-width)', minWidth: 220 }}>
        <Command loop>
          <CommandInput placeholder={searchPlaceholder} value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {canCreate && (
              <CommandGroup>
                <CommandItem value={`__create_${q}`} onSelect={() => { onChange(multiple ? [...vals, q.trim()] : q.trim()); setQ(''); if (!multiple) setOpen(false) }}>
                  Add “{q.trim()}”
                </CommandItem>
              </CommandGroup>
            )}
            {groups.map((g) => (
              <CommandGroup key={g} heading={g || undefined}>
                {options.filter((o) => (o.group ?? '') === g).map((o) => (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                    {o.icon}
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.hint && <span className="text-xs text-faint">{o.hint}</span>}
                    {vals.includes(o.value) && <Check className="!text-primary" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
