import * as React from 'react'
import { DropdownMenu as D } from 'radix-ui'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DropdownMenu = D.Root
export const DropdownMenuTrigger = D.Trigger
export const DropdownMenuGroup = D.Group
export const DropdownMenuSub = D.Sub
export const DropdownMenuRadioGroup = D.RadioGroup

export const menuContentClass =
  'z-[1000] min-w-[200px] overflow-hidden rounded-menu border border-border bg-surface p-1 shadow-menu anim-pop'
export const menuItemClass =
  'relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-[7px] px-3 text-base text-text outline-none data-[highlighted]:bg-subtle data-[disabled]:opacity-50 data-[disabled]:pointer-events-none [&_svg]:size-4 [&_svg]:text-muted [&_svg]:shrink-0'

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.Content>>(
  ({ className, sideOffset = 6, ...props }, ref) => (
    <D.Portal>
      <D.Content ref={ref} sideOffset={sideOffset} collisionPadding={8} className={cn(menuContentClass, className)} {...props} />
    </D.Portal>
  ),
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.SubContent>>(
  ({ className, ...props }, ref) => (
    <D.Portal><D.SubContent ref={ref} sideOffset={4} className={cn(menuContentClass, className)} {...props} /></D.Portal>
  ),
)
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

export const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.SubTrigger>>(
  ({ className, children, ...props }, ref) => (
    <D.SubTrigger ref={ref} className={cn(menuItemClass, 'data-[state=open]:bg-subtle', className)} {...props}>
      {children}<ChevronRight className="ml-auto" />
    </D.SubTrigger>
  ),
)
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.Item> & { danger?: boolean; shortcut?: string }>(
  ({ className, danger, shortcut, children, ...props }, ref) => (
    <D.Item ref={ref} className={cn(menuItemClass, danger && 'text-danger [&_svg]:text-danger data-[highlighted]:bg-danger-soft', className)} {...props}>
      {children}
      {shortcut && <span className="ml-auto pl-4 text-xs text-faint">{shortcut}</span>}
    </D.Item>
  ),
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.CheckboxItem>>(
  ({ className, children, ...props }, ref) => (
    <D.CheckboxItem ref={ref} className={cn(menuItemClass, 'pl-7', className)} {...props}>
      <span className="absolute left-2 flex size-4 items-center justify-center"><D.ItemIndicator><Check className="!text-primary" /></D.ItemIndicator></span>
      {children}
    </D.CheckboxItem>
  ),
)
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

export const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.RadioItem>>(
  ({ className, children, ...props }, ref) => (
    <D.RadioItem ref={ref} className={cn(menuItemClass, 'pl-7', className)} {...props}>
      <span className="absolute left-2 flex size-4 items-center justify-center"><D.ItemIndicator><Check className="!text-primary" /></D.ItemIndicator></span>
      {children}
    </D.RadioItem>
  ),
)
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

export const DropdownMenuLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof D.Label>) => (
  <D.Label className={cn('px-2 py-1.5 text-xs font-medium text-muted', className)} {...props} />
)
export const DropdownMenuSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof D.Separator>) => (
  <D.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
)
