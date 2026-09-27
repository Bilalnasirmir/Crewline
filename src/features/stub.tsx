import { PageBody, PageHeader } from '@/components/app/page'
import { EmptyState } from '@/components/ui/card'
import { Hammer } from 'lucide-react'
export function Stub({ title }: { title: string }) {
  return (<div className="flex min-h-0 flex-1 flex-col"><PageHeader title={title} /><PageBody><EmptyState icon={<Hammer />} title={`${title} is next`} description="This module is being rebuilt on the new design system." /></PageBody></div>)
}
