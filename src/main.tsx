import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import { AppShell } from '@/components/app/shell'
import { HomePage } from '@/features/home/page'
import { MaxPage } from '@/features/max/page'
import { ContactsPage } from '@/features/contacts/page'
import { ContactProfile } from '@/features/contacts/profile'
import { Stub } from '@/features/stub'

const router = createHashRouter([
  { path: '/', element: <AppShell />, children: [
    { index: true, element: <Navigate to="/home" replace /> },
    { path: 'get-started', element: <Stub title="Get Started" /> },
    { path: 'home', element: <HomePage /> },
    { path: 'max', element: <MaxPage /> },
    { path: 'inbox', element: <Stub title="Inbox" /> },
    { path: 'contacts', element: <ContactsPage /> },
    { path: 'contacts/:id', element: <ContactProfile /> },
    { path: 'campaigns', element: <Stub title="Campaigns" /> },
    { path: 'campaigns/new', element: <Stub title="New campaign" /> },
    { path: 'campaigns/:id', element: <Stub title="Campaign" /> },
    { path: 'stages', element: <Stub title="Stages" /> },
    { path: 'bookings', element: <Stub title="Bookings" /> },
    { path: 'agents', element: <Stub title="AI Agents" /> },
    { path: 'agents/:id', element: <Stub title="Agent" /> },
    { path: 'expenses', element: <Stub title="Expenses" /> },
    { path: 'reports', element: <Stub title="Reports" /> },
    { path: 'settings/*', element: <Stub title="Settings" /> },
    { path: 'pricing', element: <Stub title="Plans & pricing" /> },
    { path: 'assigned', element: <Stub title="Assigned to me" /> },
    { path: '*', element: <Navigate to="/home" replace /> },
  ] },
])

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>)
