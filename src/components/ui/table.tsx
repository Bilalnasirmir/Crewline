import * as React from 'react'
import { cn } from '@/lib/utils'

/** Polaris index table: 36px grey header (12px / 550), 33px rows, #ebebeb row dividers. */
export function Table({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-sm', className)} {...p} />
}
export function Th({ className, align, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('sticky top-0 z-[1] h-9 whitespace-nowrap border-b border-border bg-subtle-2 px-2 text-left text-xs font-medium text-muted first:pl-3 last:pr-3', align === 'right' && 'text-right', className)}
      {...p}
    />
  )
}
/** Cells inherit the row colour, so hover and selection show across the whole row. */
export function Td({ className, align, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('whitespace-nowrap border-t border-border-2 bg-inherit px-2 py-1.5 align-middle first:pl-3 last:pr-3', align === 'right' && 'text-right tabular', className)} {...p} />
}
export function Tr({ className, clickable, selected, ...p }: React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean; selected?: boolean }) {
  return <tr className={cn('group bg-surface transition-colors', clickable && 'cursor-pointer hover:bg-subtle-2', selected && 'bg-subtle hover:bg-subtle', className)} {...p} />
}
