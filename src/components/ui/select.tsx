import * as React from 'react'
import { Select as S } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Option = { value: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; group?: string }

export function Select({
  value, onValueChange, options, placeholder = 'Select…', className, size = 'md', disabled, id, align = 'start', triggerClassName, name,
}: {
  value?: string; onValueChange?: (v: string) => void; options: Option[]; placeholder?: string; className?: string
  size?: 'sm' | 'md'; disabled?: boolean; id?: string; align?: 'start' | 'end'; triggerClassName?: string; name?: string
}) {
  const groups = Array.from(new Set(options.map((o) => o.group ?? '')))
  return (
    <S.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
      <S.Trigger
        id={id}
        className={cn(
          'group flex w-full min-w-0 items-center justify-between gap-2 rounded-control border border-border bg-bg px-2.5 text-left text-base text-text transition-colors hover:border-border-strong focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 data-[placeholder]:text-faint disabled:opacity-50 [&>span:first-child]:truncate [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:gap-2',
          size === 'sm' ? 'h-7 text-sm' : 'h-8',
          className, triggerClassName,
        )}
      >
        <S.Value placeholder={placeholder} />
        <S.Icon asChild><ChevronDown className="size-4 shrink-0 text-muted" /></S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          position="popper"
          align={align}
          sideOffset={4}
          collisionPadding={8}
          className="z-[1000] max-h-[320px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card border border-border bg-bg p-1 shadow-menu anim-pop"
        >
          <S.Viewport>
            {groups.map((g) => (
              <S.Group key={g}>
                {g && <S.Label className="px-2 py-1.5 text-xs font-medium text-muted">{g}</S.Label>}
                {options.filter((o) => (o.group ?? '') === g).map((o) => (
                  <S.Item
                    key={o.value}
                    value={o.value}
                    disabled={o.disabled}
                    className="relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-[6px] pl-2 pr-8 text-base outline-none data-[highlighted]:bg-subtle data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted"
                  >
                    {o.icon}
                    <S.ItemText>{o.label}</S.ItemText>
                    <S.ItemIndicator className="absolute right-2"><Check className="size-4 !text-primary" /></S.ItemIndicator>
                  </S.Item>
                ))}
              </S.Group>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  )
}
