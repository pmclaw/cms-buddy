import { Outlet } from 'react-router'

import Sidebar from '@/components/sidebar'
import { ToastProvider } from '@/components/toast'

export default function AppShell() {
  return (
    <ToastProvider>
      <div className="text-ink flex h-svh w-full overflow-hidden bg-white">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}
