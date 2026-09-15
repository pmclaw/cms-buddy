import { HashRouter, Route, Routes } from 'react-router'

import { ToastProvider } from '@/components/toast'
import { AutomationProvider } from '@/lib/automation-store'
import { DrawerProvider } from '@/lib/drawer'
import { TaskDraftProvider } from '@/lib/task-draft'
import { AutomationTemplatesPage } from '@/pages/automation-templates'
import { AutomationPage } from '@/pages/automation'
import { AutomationDetailPage } from '@/pages/automation-detail'
import { ExpertDetailPage } from '@/pages/expert-detail'
import { ExpertsPage } from '@/pages/experts'
import { SkillDetailPage } from '@/pages/skill-detail'
import { SkillsPage } from '@/pages/skills'
import { TaskPage } from '@/pages/task'

/**
 * 移动端应用（在手机外壳的 iframe 内运行，也可用真机直接打开 mobile.html）。
 * 路由用 hash，避免子目录部署时的服务端回退问题。
 */
export default function MobileApp() {
  return (
    <ToastProvider>
      <TaskDraftProvider>
        <AutomationProvider>
          <HashRouter>
            <div className="bg-page relative h-full overflow-clip">
              <DrawerProvider>
                <Routes>
                <Route path="/" element={<TaskPage />} />
                <Route path="/task/:id" element={<TaskPage />} />
                <Route path="/experts" element={<ExpertsPage />} />
                <Route path="/experts/:id" element={<ExpertDetailPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/skills/:id" element={<SkillDetailPage />} />
                <Route path="/automation" element={<AutomationPage />} />
                <Route
                  path="/automation/templates"
                  element={<AutomationTemplatesPage />}
                />
                <Route path="/automation/new" element={<AutomationPage />} />
                <Route path="/automation/:id/edit" element={<AutomationPage />} />
                <Route
                  path="/automation/:id/detail"
                  element={<AutomationDetailPage />}
                />
                <Route path="*" element={<TaskPage />} />
                </Routes>
              </DrawerProvider>
            </div>
          </HashRouter>
        </AutomationProvider>
      </TaskDraftProvider>
    </ToastProvider>
  )
}
