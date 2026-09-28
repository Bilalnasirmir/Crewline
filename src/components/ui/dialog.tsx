import * as React from 'react'
import { Dialog as D } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export const Dialog = D.Root
export const DialogTrigger = D.Trigger
export const DialogClose = D.Close

const widths = { sm: 'max-w-[440px]', md: 'max-w-[620px]', lg: 'max-w-[800px]', xl: 'max-w-[980px]' }

/** Polaris modal header: grey bar (bg-surface-tertiary), heading-md title, divider below. */
function PanelHeader({ title, description, hideClose }: { title?: React.ReactNode; description?: React.ReactNode; hideClose?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-subtle-3 py-3 pl-4 pr-3">
      <div className="min-w-0">
        <D.Title className="truncate text-lg font-semibold">{title}</D.Title>
        {description ? <D.Description className="truncate text-sm text-muted">{description}</D.Description> : <D.Description className="sr-only">Dialog</D.Description>}
      </div>
      {!hideClose && <D.Close asChild><Button variant="ghost" size="icon" aria-label="Close"><X /></Button></D.Close>}
    </div>
  )
}

export function DialogContent({
  className, children, title, description, footer, size = 'md', hideClose, bodyClassName, ...props
}: Omit<React.ComponentPropsWithoutRef<typeof D.Content>, 'title'> & {
  title?: React.ReactNode; description?: React.ReactNode; footer?: React.ReactNode; size?: keyof typeof widths; hideClose?: boolean; bodyClassName?: string
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-[1000] bg-[var(--overlay)] anim-fade" />
      <D.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[1001] flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-dialog bg-surface shadow-dialog outline-none anim-pop',
          widths[size], className,
        )}
        {...props}
      >
        {title !== undefined ? <PanelHeader title={title} description={description} hideClose={hideClose} /> : <D.Title className="sr-only">Dialog</D.Title>}
        <div className={cn('min-h-0 flex-1 overflow-y-auto p-4', bodyClassName)}>{children}</div>
        {footer && <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>}
      </D.Content>
    </D.Portal>
  )
}

export function Sheet({
  open, onOpenChange, title, description, children, footer, side = 'right', width = 440, className, bodyClassName,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title?: React.ReactNode; description?: React.ReactNode; children: React.ReactNode
  footer?: React.ReactNode; side?: 'right' | 'left'; width?: number; className?: string; bodyClassName?: string
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[1000] bg-[var(--overlay)] anim-fade" />
        <D.Content
          style={{ width: `min(${width}px, calc(100vw - 16px))` }}
          className={cn(
            'fixed top-0 z-[1001] flex h-dvh flex-col bg-surface shadow-dialog outline-none',
            side === 'right' ? 'right-0 anim-slide-right' : 'left-0',
            className,
          )}
        >
          <PanelHeader title={title} description={description} />
          <div className={cn('min-h-0 flex-1 overflow-y-auto p-4', bodyClassName)}>{children}</div>
          {footer && <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}
