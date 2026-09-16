import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { StoreProvider } from './contexts/StoreContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { RoleProvider } from './contexts/RoleContext.jsx';
import { HomeDashboard } from './pages/HomeDashboard.jsx';
import { TenantList } from './pages/tenants/TenantList.jsx';
import { TenantEdit } from './pages/tenants/TenantEdit.jsx';
import { TenantBuildCapabilities } from './pages/tenants/TenantBuildCapabilities.jsx';
import { ExpertList } from './pages/experts/ExpertList.jsx';
import { ExpertEdit } from './pages/experts/ExpertEdit.jsx';
import { SkillManagement } from './pages/management/SkillManagement.jsx';
import { MCPManagement } from './pages/management/MCPManagement.jsx';
import { TemplateManagement } from './pages/management/TemplateManagement.jsx';
import { TenantBasicInfo } from './pages/tenant-features/TenantBasicInfo.jsx';
import { TenantSkills } from './pages/tenant-features/TenantSkills.jsx';
import { TenantMCPs } from './pages/tenant-features/TenantMCPs.jsx';
import { TenantExperts } from './pages/tenant-features/TenantExperts.jsx';
import { BuddyDashboard } from './pages/ops/BuddyDashboard.jsx';
import { TaskRecordList } from './pages/ops/TaskRecordList.jsx';
import { UserGroupList } from './pages/user-groups/UserGroupList.jsx';
import { UserGroupEdit } from './pages/user-groups/UserGroupEdit.jsx';
import { BuddyParams } from './pages/settings/BuddyParams.jsx';

export default function App() {
  return (
    <RoleProvider>
      <StoreProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomeDashboard />} />

              <Route path="tenants" element={<TenantList />} />
              <Route path="tenants/new" element={<TenantEdit />} />
              <Route path="tenants/edit/:id" element={<TenantEdit />} />
              <Route path="tenants/build-capabilities/:id" element={<TenantBuildCapabilities />} />

              <Route path="experts" element={<ExpertList />} />
              <Route path="experts/new" element={<ExpertEdit />} />
              <Route path="experts/edit/:id" element={<ExpertEdit />} />
              <Route path="experts/view/:id" element={<ExpertEdit readOnly />} />

              <Route path="skills" element={<SkillManagement />} />
              <Route path="mcps" element={<MCPManagement />} />
              <Route path="templates" element={<TemplateManagement />} />

              <Route path="ops/cockpit" element={<BuddyDashboard />} />
              <Route path="ops/run" element={<TaskRecordList />} />

              <Route path="user-groups" element={<UserGroupList />} />
              <Route path="user-groups/new" element={<UserGroupEdit />} />
              <Route path="user-groups/edit/:id" element={<UserGroupEdit />} />

              <Route path="buddy-params" element={<BuddyParams />} />

              <Route path="tenant/basic" element={<TenantBasicInfo />} />
              <Route path="tenant/skills" element={<TenantSkills />} />
              <Route path="tenant/mcps" element={<TenantMCPs />} />
              <Route path="tenant/experts" element={<TenantExperts />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </StoreProvider>
    </RoleProvider>
  );
}
