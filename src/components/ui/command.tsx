import * as React from 'react'
import { Command as C } from 'cmdk'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Command = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof C>) => (
  <C className={cn('flex h-full w-full flex-col overflow-hidden bg-surface text-sm text-text', className)} {...p} />
)
export function CommandInput({ className, ...p }: React.ComponentPropsWithoutRef<typeof C.Input>) {
  return (
    <div className="flex h-11 items-center gap-2 border-b border-border px-3">
      <Search className="size-4 shrink-0 text-icon" />
      <C.Input className={cn('h-full w-full bg-transparent text-sm outline-none placeholder:text-muted', className)} {...p} />
    </div>
  )
}
export const CommandList = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof C.List>) => (
  <C.List className={cn('max-h-[360px] overflow-y-auto p-1.5', className)} {...p} />
)
export const CommandEmpty = (p: React.ComponentPropsWithoutRef<typeof C.Empty>) => (
  <C.Empty className="py-8 text-center text-sm text-muted" {...p} />
)
export const CommandGroup = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof C.Group>) => (
  <C.Group className={cn('[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted', className)} {...p} />
)
export const CommandItem = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof C.Item>) => (
  <C.Item className={cn('flex h-8 cursor-pointer select-none items-center gap-2 rounded-control px-2 text-sm outline-none data-[selected=true]:bg-subtle-2 data-[disabled=true]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-icon', className)} {...p} />
)
export const CommandSeparator = (p: React.ComponentPropsWithoutRef<typeof C.Separator>) => <C.Separator className="-mx-1.5 my-1.5 h-px bg-border" {...p} />
