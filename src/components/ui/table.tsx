import * as React from 'react'
import { cn } from '@/lib/utils'

export function Table({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-base', className)} {...p} />
}
export function Th({ className, align, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('sticky top-0 z-[1] h-8 whitespace-nowrap border-b border-border bg-subtle-2 px-3 text-left text-sm font-medium text-muted first:pl-4', align === 'right' && 'text-right', className)}
      {...p}
    />
  )
}
export function Td({ className, align, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('h-9 whitespace-nowrap border-b border-border px-3 align-middle first:pl-4', align === 'right' && 'text-right tabular', className)} {...p} />
}
export function Tr({ className, clickable, selected, ...p }: React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean; selected?: boolean }) {
  return <tr className={cn('group transition-colors', clickable && 'cursor-pointer hover:bg-subtle-2', selected && 'bg-primary-soft/50 hover:bg-primary-soft/50', className)} {...p} />
}
