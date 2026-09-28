import * as React from 'react'
import { create } from 'zustand'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'

/* Polaris-style replacements for window.prompt / window.confirm.
   Call askText() or askConfirm() from anywhere; <AskHost /> in the shell renders the dialog. */
type TextAsk = { kind: 'text'; title: string; label?: string; value?: string; placeholder?: string; ok?: string; hint?: string; multiline?: boolean; resolve: (v: string | null) => void }
type ConfirmAsk = { kind: 'confirm'; title: string; description?: React.ReactNode; ok?: string; danger?: boolean; resolve: (v: boolean) => void }
const useAsk = create<{ q: TextAsk | ConfirmAsk | null }>(() => ({ q: null }))

export const askText = (o: Omit<TextAsk, 'kind' | 'resolve'>) => new Promise<string | null>((resolve) => useAsk.setState({ q: { kind: 'text', ...o, resolve } }))
export const askConfirm = (o: Omit<ConfirmAsk, 'kind' | 'resolve'>) => new Promise<boolean>((resolve) => useAsk.setState({ q: { kind: 'confirm', ...o, resolve } }))

export function AskHost() {
  const q = useAsk((s) => s.q)
  const [v, setV] = React.useState('')
  React.useEffect(() => { if (q?.kind === 'text') setV(q.value ?? '') }, [q])
  const close = (answer: string | boolean | null) => {
    if (!q) return
    if (q.kind === 'text') q.resolve(typeof answer === 'string' ? answer : null)
    else q.resolve(answer === true)
    useAsk.setState({ q: null })
  }
  const submit = () => { if (q?.kind === 'text') { const t = v.trim(); if (t) close(t) } else close(true) }
  return (
    <Dialog open={!!q} onOpenChange={(o) => { if (!o) close(null) }}>
      {q && (
        <DialogContent title={q.title} size="sm"
          footer={<><Button onClick={() => close(null)}>Cancel</Button><Button variant={q.kind === 'confirm' && q.danger ? 'destructive-solid' : 'primary'} disabled={q.kind === 'text' && !v.trim()} onClick={submit}>{q.ok ?? (q.kind === 'text' ? 'Save' : 'Confirm')}</Button></>}>
          {q.kind === 'text' ? (
            <Field label={q.label} hint={q.hint}>
              {q.multiline
                ? <Textarea autoFocus value={v} placeholder={q.placeholder} onChange={(e) => setV(e.target.value)} />
                : <Input autoFocus value={v} placeholder={q.placeholder} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />}
            </Field>
          ) : <div className="text-sm">{q.description}</div>}
        </DialogContent>
      )}
    </Dialog>
  )
}
