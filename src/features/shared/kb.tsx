import * as React from 'react'
import { toast } from 'sonner'
import { Folder, FileText, Link2, Type, Video, Image, Upload, Plus, Trash2, Pencil, Sparkles, Check, X, Mic } from 'lucide-react'
import { cn, uid } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Tip } from '@/components/ui/tooltip'
import { askConfirm, askText } from '@/components/app/ask'
import { LineList } from './led'
import type { KbFolder, KbItem } from '@/data/types'

const KIND: Record<KbItem['k'], { I: React.ComponentType<{ className?: string }>; l: string }> = {
  file: { I: FileText, l: 'File' }, link: { I: Link2, l: 'Website' }, text: { I: Type, l: 'Text' }, video: { I: Video, l: 'Video' }, image: { I: Image, l: 'Picture' },
}
const kindOf = (name: string): KbItem['k'] => (/\.(mp4|mov|webm|avi)$/i.test(name) ? 'video' : /\.(png|jpe?g|gif|webp|heic)$/i.test(name) ? 'image' : 'file')

/** One button adds files, pictures, videos, website links and pasted text together, saved as one folder. */
export function AddKnowledgeDialog({ open, onOpenChange, onSave, into }: { open: boolean; onOpenChange: (o: boolean) => void; onSave: (name: string, items: KbItem[]) => void; into?: string }) {
  const [name, setName] = React.useState(''); const [files, setFiles] = React.useState<string[]>([]); const [links, setLinks] = React.useState<string[]>([]); const [text, setText] = React.useState('')
  const [ai, setAi] = React.useState(''); const [aiBusy, setAiBusy] = React.useState(false)
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { if (open) { setName(''); setFiles([]); setLinks([]); setText(''); setAi('') } }, [open])
  const items: KbItem[] = [
    ...files.map((f) => ({ k: kindOf(f), n: f, s: kindOf(f) === 'video' ? 'Will be transcribed' : kindOf(f) === 'image' ? 'Read by AI' : 'Uploaded' })),
    ...links.map((l) => ({ k: 'link' as const, n: l, s: 'Reads up to 50 pages' })),
    ...(text.trim() ? [{ k: 'text' as const, n: text.trim().split('\n')[0].slice(0, 40) || 'Pasted text', s: `Pasted text · ${text.trim().split(/\s+/).length} words` }] : []),
  ]
  const build = () => {
    if (!ai.trim()) return
    setAiBusy(true)
    setTimeout(() => { setAiBusy(false); setText(`Frequently asked questions\n\nQ: How long does it take?\nA: Most orders are ready within 2 days.\n\nQ: Can I cancel?\nA: Yes, anytime, with no fee.\n\nPolicies: ${ai.trim()}`); setName(name || 'Written with AI'); toast.success('AI drafted an FAQ and policies — check the text below') }, 900)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" title={into ? `Add to “${into}”` : 'Add knowledge base'} description="Files, pictures, videos, website links and text — everything is saved into one folder"
        footer={<><span className="mr-auto text-sm text-muted">{items.length} item{items.length === 1 ? '' : 's'}</span><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!items.length} onClick={() => { onSave(name.trim() || `Knowledge ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, items); onOpenChange(false); toast.success(`Learning ${items.length} item${items.length === 1 ? '' : 's'} · ready in about a minute`) }}><Check />Save</Button></>}>
        <div className="space-y-4">
          {!into && <Field label="Folder name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Plans & prices 2026" autoFocus /></Field>}
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border-strong px-4 py-6 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFiles([...files, ...Array.from(e.dataTransfer.files).map((f) => f.name)]) }}>
            <Upload className="size-5 text-icon" />
            <p className="text-sm"><span className="font-medium">Drop files here</span> <span className="text-muted">— PDF, Word, Excel, pictures, videos</span></p>
            <input ref={ref} type="file" multiple hidden onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? []).map((f) => f.name)]); e.target.value = '' }} />
            <div className="flex gap-2"><Button onClick={() => ref.current?.click()}>Choose files</Button><Button variant="ghost" onClick={() => setFiles([...files, 'Price list 2026.pdf', 'Store photo.jpg', 'Setup guide.mp4'])}>Use sample files</Button></div>
            {files.length > 0 && <div className="flex flex-wrap justify-center gap-1.5">{files.map((f, i) => { const K = KIND[kindOf(f)]; return <Badge key={i} tone="outline"><K.I />{f}<button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f}`}><X /></button></Badge> })}</div>}
          </div>
          <Field label="Website links" hint="We read each page and follow links on the same site."><LineList items={links} onChange={setLinks} placeholder="Paste a link and press Enter — e.g. yoursite.com/pricing" /></Field>
          <Field label="Paste text"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Opening hours, FAQs, policies, anything your agent should know" className="min-h-24" /></Field>
          <div className="rounded-card border border-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium"><Sparkles className="size-4" />Create your knowledge base with AI</div>
            <div className="flex gap-2">
              <Input value={ai} onChange={(e) => setAi(e.target.value)} placeholder="Describe your business, or say it — AI writes the FAQ and policies" onKeyDown={(e) => e.key === 'Enter' && build()} />
              <Tip content="Say it instead"><Button variant="ghost" size="icon" aria-label="Voice" onClick={() => setAi('We install home internet in Mississauga, free installation, no contract, 24/7 support')}><Mic /></Button></Tip>
              <Button loading={aiBusy} onClick={build}><Sparkles />Write it</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Knowledge shown as folders. Open one to see what the agent learned from it. */
export function KbFolders({ folders, onChange, empty }: { folders: KbFolder[]; onChange: (f: KbFolder[]) => void; empty?: React.ReactNode }) {
  const [open, setOpen] = React.useState<string | null>(folders[0]?.id ?? null); const [adding, setAdding] = React.useState<'new' | string | null>(null)
  const cur = folders.find((f) => f.id === open)
  return (
    <div className="space-y-3">
      <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
        {folders.map((f) => (
          <button key={f.id} onClick={() => setOpen(f.id === open ? null : f.id)} className={cn('flex items-start gap-2.5 rounded-card border p-3 text-left transition-colors hover:bg-subtle-2', f.id === open ? 'border-btn bg-subtle-2' : 'border-border')}>
            <Folder className="mt-0.5 size-5 shrink-0 text-icon" />
            <span className="min-w-0"><span className="block truncate text-sm font-medium">{f.name}</span><span className="block text-xs text-muted">{f.items.length} items · {f.date}</span></span>
          </button>
        ))}
        <button onClick={() => setAdding('new')} className="flex items-center justify-center gap-1.5 rounded-card border border-dashed border-border-strong p-3 text-sm font-medium text-muted transition-colors hover:bg-subtle-2 hover:text-text"><Plus className="size-4" />Add knowledge base</button>
      </div>
      {!folders.length && empty}
      {cur && (
        <div className="rounded-card border border-border anim-fade">
          <div className="flex flex-wrap items-center gap-2 border-b border-border-2 px-3 py-2">
            <Folder className="size-4 text-icon" /><h3 className="flex-1 truncate">{cur.name}</h3>
            <Button size="sm" onClick={() => setAdding(cur.id)}><Plus />Add to folder</Button>
            <Button size="sm" variant="ghost" onClick={async () => { const n = await askText({ title: 'Rename folder', label: 'Folder name', value: cur.name }); if (n) onChange(folders.map((f) => (f.id === cur.id ? { ...f, name: n } : f))) }}><Pencil />Rename</Button>
            <Button size="sm" variant="ghost" onClick={async () => { if (await askConfirm({ title: `Delete “${cur.name}”?`, description: 'The agent will forget everything in this folder.', ok: 'Delete folder', danger: true })) { onChange(folders.filter((f) => f.id !== cur.id)); setOpen(null) } }}><Trash2 />Delete</Button>
          </div>
          {cur.items.map((it, i) => { const K = KIND[it.k]; return (
            <div key={i} className="group flex items-center gap-3 border-b border-border-2 px-3 py-2 last:border-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-control bg-subtle text-icon"><K.I className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm">{it.n}</span><span className="block text-xs text-muted">{K.l} · {it.s}</span></span>
              <Badge tone="green"><Check />Learned</Badge>
              <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100" onClick={() => onChange(folders.map((f) => (f.id === cur.id ? { ...f, items: f.items.filter((_, j) => j !== i) } : f)))} aria-label="Remove item"><X /></Button>
            </div>
          ) })}
          {!cur.items.length && <p className="px-3 py-4 text-sm text-muted">This folder is empty.</p>}
        </div>
      )}
      <AddKnowledgeDialog open={!!adding} onOpenChange={(o) => !o && setAdding(null)} into={adding && adding !== 'new' ? folders.find((f) => f.id === adding)?.name : undefined}
        onSave={(name, items) => {
          if (adding && adding !== 'new') onChange(folders.map((f) => (f.id === adding ? { ...f, items: [...f.items, ...items] } : f)))
          else { const id = uid('kb'); onChange([...folders, { id, name, date: 'Today', items }]); setOpen(id) }
        }} />
    </div>
  )
}
