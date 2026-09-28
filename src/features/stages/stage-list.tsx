import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react'
import { nf } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tip } from '@/components/ui/tooltip'
import { askConfirm } from '@/components/app/ask'
import { StageDialog, STAGE_ICONS } from './stage-dialog'
import type { Pipe, Stage } from '@/data/types'

const TYPE: Record<Stage['type'], string> = { open: 'In progress', pending: 'Pending', won: 'Won', lost: 'Lost' }

/** Ordered stage list with edit, reorder, delete and "New stage". Counts are optional (people in each stage). */
export function StageList({ pipe, dir, counts, onOpen }: { pipe: Pipe; dir: 'in' | 'out'; counts?: Record<string, number>; onOpen?: (name: string) => void }) {
  const { stages, removeStage, moveStage } = useStore()
  const L = stages[pipe][dir]
  const [edit, setEdit] = React.useState<Stage | null | undefined>(undefined)
  return (
    <div>
      {L.map((st, i) => { const I = STAGE_ICONS[st.icon]; return (
        <div key={st.id} className="group flex items-center gap-3 border-t border-border-2 px-4 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-control" style={{ background: st.color + '1f', color: st.color }}>{I ? <I className="size-4" /> : <span className="size-2 rounded-full" style={{ background: st.color }} />}</span>
          <button className="min-w-0 flex-1 text-left" onClick={() => (onOpen ? onOpen(st.name) : setEdit(st))}>
            <span className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-medium">{st.name}</span>{st.type !== 'open' && <Badge tone={st.type === 'won' ? 'green' : st.type === 'lost' ? 'neutral' : 'amber'}>{TYPE[st.type]}</Badge>}{st.rev && <Badge tone="green">Counts revenue</Badge>}{!!st.camps?.length && <Badge tone="outline">{st.camps.length} campaign{st.camps.length === 1 ? '' : 's'}</Badge>}</span>
            <span className="block truncate text-sm text-muted">{st.criteria.slice(0, 2).join(' · ')}{st.criteria.length > 2 ? ` · +${st.criteria.length - 2} more` : ''}</span>
          </button>
          {counts && <span className="w-14 text-right text-sm tabular">{nf(counts[st.name] ?? 0)}</span>}
          <div className="flex shrink-0 items-center opacity-60 transition-opacity group-hover:opacity-100">
            <Tip content="Move up"><Button variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => moveStage(pipe, dir, st.id, -1)} aria-label="Move up"><ArrowUp /></Button></Tip>
            <Tip content="Move down"><Button variant="ghost" size="icon-sm" disabled={i === L.length - 1} onClick={() => moveStage(pipe, dir, st.id, 1)} aria-label="Move down"><ArrowDown /></Button></Tip>
            <Tip content="Edit stage"><Button variant="ghost" size="icon-sm" onClick={() => setEdit(st)} aria-label={`Edit ${st.name}`}><Pencil /></Button></Tip>
            <Tip content="Delete stage"><Button variant="ghost" size="icon-sm" onClick={async () => { if (await askConfirm({ title: `Delete “${st.name}”?`, description: `People in this stage move to the stage before it. Agents stop using it in every ${dir === 'in' ? 'inbound' : 'outbound'} campaign with these stages.`, ok: 'Delete stage', danger: true })) { removeStage(pipe, dir, st.id); toast.success(`“${st.name}” deleted`) } }} aria-label={`Delete ${st.name}`}><Trash2 /></Button></Tip>
          </div>
        </div>
      ) })}
      <div className="flex flex-wrap gap-2 border-t border-border-2 px-4 py-3">
        <Button onClick={() => setEdit(null)}><Plus />New stage</Button>
        <Button variant="ghost" onClick={() => toast('AI checked your stages against 1,240 conversations — they cover 97% of cases')}><Sparkles />Check with AI</Button>
      </div>
      <StageDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} pipe={pipe} dir={dir} stage={edit ?? null} />
    </div>
  )
}
