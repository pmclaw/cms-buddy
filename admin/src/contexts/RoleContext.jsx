// 当前用户 / 角色 / 激活Buddy空间上下文
import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext(null);

const SYSTEM_USER = {
  id: 'SA001',
  name: '管理员',
  fullName: '系统管理员 - 江辰',
  role: 'system_admin', // 'system_admin' | 'tenant_admin'
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jiangchen',
};

const TENANT_USER = {
  id: 'TA001',
  name: '林依然',
  fullName: 'Buddy空间管理员 - 林依然',
  role: 'tenant_admin',
  tenantId: 'T001',
  managedTenants: ['T001', 'T002'],
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liran',
};

export function RoleProvider({ children }) {
  // 默认登录为系统管理员，方便演示
  const [user, setUser] = useState(SYSTEM_USER);
  // 当前激活Buddy空间（系统管理员视角下，Buddy空间列表页管理所有Buddy空间，其他页面无激活Buddy空间）
  const [activeTenantId, setActiveTenantId] = useState('T001');

  const switchUser = () => {
    setUser((u) => (u.role === 'system_admin' ? TENANT_USER : SYSTEM_USER));
  };

  const setRole = (r) => {
    setUser(r === 'system_admin' ? SYSTEM_USER : TENANT_USER);
  };

  return (
    <RoleContext.Provider value={{ user, switchUser, setRole, activeTenantId, setActiveTenantId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
