import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import { AppShell } from '@/components/app/shell'
import { HomePage } from '@/features/home/page'
import { MaxPage } from '@/features/max/page'

/** Each module is its own chunk, loaded the first time you open it. */
const page = <M,>(load: () => Promise<M>, name: keyof M) => async () => ({ Component: (await load())[name] as ComponentType })

const router = createHashRouter([
  { path: '/', element: <AppShell />, HydrateFallback: () => <div className="h-dvh bg-bg" />, children: [
    { index: true, element: <Navigate to="/home" replace /> },
    { path: 'home', element: <HomePage /> },
    { path: 'max', element: <MaxPage /> },
    { path: 'get-started', lazy: page(() => import('@/features/getstarted/page'), 'GetStartedPage') },
    { path: 'inbox', lazy: page(() => import('@/features/inbox/page'), 'InboxPage') },
    { path: 'contacts', lazy: page(() => import('@/features/contacts/page'), 'ContactsPage') },
    { path: 'contacts/:id', lazy: page(() => import('@/features/contacts/profile'), 'ContactProfile') },
    { path: 'campaigns', lazy: page(() => import('@/features/campaigns/page'), 'CampaignsPage') },
    { path: 'campaigns/new', lazy: page(() => import('@/features/campaigns/wizard'), 'NewCampaignPage') },
    { path: 'campaigns/:id', lazy: page(() => import('@/features/campaigns/detail'), 'CampaignDetailPage') },
    { path: 'stages', lazy: page(() => import('@/features/stages/page'), 'StagesPage') },
    { path: 'bookings', lazy: page(() => import('@/features/bookings/page'), 'BookingsPage') },
    { path: 'agents', lazy: page(() => import('@/features/agents/page'), 'AgentsPage') },
    { path: 'agents/:id', lazy: page(() => import('@/features/agents/editor'), 'AgentEditorPage') },
    { path: 'expenses', lazy: page(() => import('@/features/expenses/page'), 'ExpensesPage') },
    { path: 'reports', lazy: page(() => import('@/features/reports/page'), 'ReportsPage') },
    { path: 'settings', element: <Navigate to="/settings/business" replace /> },
    { path: 'settings/:section', lazy: page(() => import('@/features/settings/page'), 'SettingsPage') },
    { path: 'pricing', lazy: page(() => import('@/features/pricing/page'), 'PricingPage') },
    { path: 'assigned', lazy: page(() => import('@/features/assigned/page'), 'AssignedPage') },
    { path: '*', element: <Navigate to="/home" replace /> },
  ] },
])

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>)
