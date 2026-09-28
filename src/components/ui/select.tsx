import * as React from 'react'
import { Select as S } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Option = { value: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; group?: string }

/** `field` is a form select (input look). `button` is a filter control for toolbars: it looks like a
 *  Polaris secondary button (12px / 550, bevel) and sizes to its label, like Shopify's "Today ⌄" filters. */
export function Select({
  value, onValueChange, options, placeholder = 'Select…', className, size = 'md', variant = 'field', disabled, id, align = 'start', triggerClassName, name,
}: {
  value?: string; onValueChange?: (v: string) => void; options: Option[]; placeholder?: string; className?: string
  size?: 'sm' | 'md'; variant?: 'field' | 'button'; disabled?: boolean; id?: string; align?: 'start' | 'end'; triggerClassName?: string; name?: string
}) {
  const groups = Array.from(new Set(options.map((o) => o.group ?? '')))
  return (
    <S.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
      <S.Trigger
        id={id}
        className={cn(
          'group flex min-w-0 items-center justify-between text-left text-text transition-colors disabled:opacity-50 [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:gap-2 [&>span:first-child]:truncate',
          variant === 'button'
            ? 'h-8 w-auto max-w-full gap-1 rounded-control bg-surface px-3 text-xs font-medium shadow-btn hover:bg-btn-2-hover active:bg-btn-2-active md:h-7'
            : cn('w-full gap-2 rounded-control border border-input-border bg-input-bg px-3 text-sm hover:border-input-border-hover data-[placeholder]:text-muted', size === 'sm' ? 'h-8 md:h-7' : 'h-9 md:h-8'),
          className, triggerClassName,
        )}
      >
        <S.Value placeholder={placeholder} />
        <S.Icon asChild><ChevronDown className="size-4 shrink-0 text-icon" /></S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          position="popper"
          align={align}
          sideOffset={4}
          collisionPadding={8}
          className="z-[1000] max-h-[320px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-menu border border-border bg-surface p-1.5 shadow-menu anim-pop"
        >
          <S.Viewport>
            {groups.map((g) => (
              <S.Group key={g}>
                {g && <S.Label className="px-2 py-1 text-xs font-semibold text-muted">{g}</S.Label>}
                {options.filter((o) => (o.group ?? '') === g).map((o) => (
                  <S.Item
                    key={o.value}
                    value={o.value}
                    disabled={o.disabled}
                    className="relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-control pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-subtle-2 data-[state=checked]:bg-subtle data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-icon"
                  >
                    {o.icon}
                    <S.ItemText>{o.label}</S.ItemText>
                    <S.ItemIndicator className="absolute right-2"><Check className="size-4 !text-text" /></S.ItemIndicator>
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
