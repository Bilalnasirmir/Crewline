import { create } from 'zustand'
import { reply, userMsg, maxMsg, seedThread, titleFor, campaignQuestion, nextCampaignStep, applyPlan, type Thread, type Block, type Flow } from './engine'
import * as seed from '@/data/seed'
import { uid } from '@/lib/utils'

interface MaxState {
  threads: Thread[]; activeId: string; typing: boolean; streamText: string | null
  active: () => Thread
  newThread: () => void; open: (id: string) => void; rename: (id: string, t: string) => void; remove: (id: string) => void
  send: (text: string, o?: { attachments?: string[]; voice?: boolean; page?: string }) => void
  pickOption: (msgId: string, blockId: string, value: string, multi?: boolean, label?: string) => void
  submitOptions: (msgId: string, blockId: string) => void
  decidePlan: (msgId: string, planId: string, ok: boolean) => void
  answerFlow: (blockId: string, value: any, label: string) => void
}

const history: Thread[] = seed.maxThreads.map((t) => ({ ...t, msgs: [], flow: null, mode: null }))
history[1].msgs = [userMsg('Build a dental recall campaign'), maxMsg([{ t: 'text', md: 'Done — **Dental — 6-month Recall** is scheduled for Oct 1, 9:00 AM with Rhea and Sam on texts and calls.' }, { t: 'campaign', id: 'k3', name: 'Dental — Appointment Booking' }])]
history[2].msgs = [userMsg('Find people in Brooklyn'), maxMsg([{ t: 'text', md: 'I found **14 people in Brooklyn**. 9 have an email and 11 agreed to calls.' }, { t: 'link', to: '/contacts?folder=f4', label: 'Open Brooklyn Buyers', icon: 'folder' }])]
history[3].msgs = [userMsg('What’s the best campaign I could run in Q4?'), maxMsg([{ t: 'text', md: 'The strongest play is a **“Switch and save” inbound ad campaign** with text-first follow-up. Full reasoning is in the presentation.' }, { t: 'doc', title: 'Q4 campaign ideas — competitor research', kind: 'presentation', pages: ['What competitors ran', 'Your best messages', 'Recommended campaign', 'Budget', 'Next steps'] }])]
history[0].msgs = [
  userMsg('Why did Win-back replies drop?'),
  maxMsg([{ t: 'text', md: 'Reply rate on **Fiber — Win-back** fell from 12% to 7% this week. The campaign was paused on Sep 20 with 228 people never contacted, and later sends went out after 7 PM.' }, { t: 'kpis', items: [{ l: 'Reply rate', v: '7%', d: '−40%' }, { l: 'Never contacted', v: '228' }, { l: 'Best agent', v: 'Ellie' }] }]),
]

export const useMax = create<MaxState>((set, get) => ({
  threads: [seedThread(), ...history], activeId: '', typing: false, streamText: null,
  active: () => { const s = get(); return s.threads.find((t) => t.id === s.activeId) ?? s.threads[0] },
  newThread: () => { const t = seedThread(); set((s) => ({ threads: [t, ...s.threads.filter((x) => x.msgs.length)], activeId: t.id })) },
  open: (id) => set({ activeId: id }),
  rename: (id, title) => set((s) => ({ threads: s.threads.map((t) => (t.id === id ? { ...t, title } : t)) })),
  remove: (id) => set((s) => { const th = s.threads.filter((t) => t.id !== id); return { threads: th.length ? th : [seedThread()], activeId: th[0]?.id ?? '' } }),

  send: (text, o = {}) => {
    const t = get().active(); const id = t.id
    const um = userMsg(text, { attachments: o.attachments, voice: o.voice })
    set((s) => ({ activeId: id, typing: true, threads: s.threads.map((x) => (x.id === id ? { ...x, title: x.msgs.length ? x.title : titleFor(text), msgs: [...x.msgs, um] } : x)) }))
    const r = reply(text, t, { page: o.page })
    const delay = 500 + Math.min(900, text.length * 12)
    setTimeout(() => {
      const mm = maxMsg(r.blocks)
      set((s) => ({ typing: false, threads: s.threads.map((x) => (x.id === id ? { ...x, msgs: [...x.msgs, mm], flow: r.flow === undefined ? x.flow : r.flow, mode: r.mode === undefined ? x.mode : r.mode } : x)) }))
    }, delay)
  },

  pickOption: (msgId, blockId, value, multi, label) => {
    const t = get().active()
    const msg = t.msgs.find((m) => m.id === msgId); const b = msg?.blocks.find((x) => x.t === 'options' && x.id === blockId) as Extract<Block, { t: 'options' }> | undefined
    if (!b) return
    const picked = multi ? (b.picked?.includes(value) ? b.picked.filter((v) => v !== value) : [...(b.picked ?? []), value]) : [value]
    set((s) => ({ threads: s.threads.map((x) => (x.id === t.id ? { ...x, msgs: x.msgs.map((m) => (m.id === msgId ? { ...m, blocks: m.blocks.map((bb) => (bb.t === 'options' && bb.id === blockId ? { ...bb, picked } : bb)) } : m)) } : x)) }))
    if (multi) return
    // single pick: answer immediately
    if (t.flow && ['dir', 'folder', 'ch', 'pipe', 'agents', 'booking', 'when'].includes(blockId)) {
      get().answerFlow(blockId, value, label ?? value)
    } else {
      get().send(label ?? value)
    }
  },
  submitOptions: (msgId, blockId) => {
    const t = get().active(); const msg = t.msgs.find((m) => m.id === msgId); const b = msg?.blocks.find((x) => x.t === 'options' && x.id === blockId) as Extract<Block, { t: 'options' }> | undefined
    if (!b) return
    const labels = (b.picked ?? []).map((v) => b.options.find((o) => o.v === v)?.l ?? v).join(', ')
    get().answerFlow(blockId, b.picked ?? [], labels || 'Skip')
  },
  answerFlow: (blockId, value, label) => {
    const t = get().active(); if (!t.flow) return
    const flow: Flow = { ...t.flow, a: { ...t.flow.a, [blockId]: value } }
    const nx = nextCampaignStep(flow)
    const um = userMsg(label)
    set((s) => ({ typing: true, threads: s.threads.map((x) => (x.id === t.id ? { ...x, msgs: [...x.msgs, um], flow: nx } : x)) }))
    setTimeout(() => { const mm = maxMsg(campaignQuestion(nx)); set((s) => ({ typing: false, threads: s.threads.map((x) => (x.id === t.id ? { ...x, msgs: [...x.msgs, mm] } : x)) })) }, 450)
  },
  decidePlan: (msgId, planId, ok) => {
    const t = get().active()
    set((s) => ({ threads: s.threads.map((x) => (x.id === t.id ? { ...x, flow: null, msgs: x.msgs.map((m) => (m.id === msgId ? { ...m, blocks: m.blocks.map((b) => (b.t === 'plan' && b.id === planId ? { ...b, state: ok ? 'approved' : 'declined' } : b)) } : m)) } : x)) }))
    const msg = t.msgs.find((m) => m.id === msgId); const b = msg?.blocks.find((x) => x.t === 'plan' && x.id === planId) as Extract<Block, { t: 'plan' }> | undefined
    if (!b) return
    const um = userMsg(ok ? 'OK, go ahead' : 'Not now')
    set((s) => ({ typing: ok, threads: s.threads.map((x) => (x.id === t.id ? { ...x, msgs: [...x.msgs, um] } : x)) }))
    if (!ok) { set((s) => ({ threads: s.threads.map((x) => (x.id === t.id ? { ...x, msgs: [...x.msgs, maxMsg([{ t: 'text', md: 'No problem — nothing was changed. Tell me what to adjust and I’ll update the plan.' }])] } : x)) })); return }
    setTimeout(() => { const blocks = applyPlan(b); set((s) => ({ typing: false, threads: s.threads.map((x) => (x.id === t.id ? { ...x, msgs: [...x.msgs, { id: uid('mm'), role: 'max', blocks, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }] } : x)) })) }, 900)
  },
}))
