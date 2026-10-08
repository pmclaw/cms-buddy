// 角色切换控件（演示用）
// 从顶部 Header 下放到各管理页面标题区，位于主操作按钮（如「添加技能」）左侧，
// 便于在页面内直接切换管理员角色。后续页面按同样方式引入即可。
//
// 两个角色名称：Buddy系统管理员 / Buddy空间管理员
import React from 'react';
import { useRole } from '../contexts/RoleContext.jsx';

export function RoleSwitcher({ onChange, style }) {
  const { user, setRole } = useRole();
  const isPlatform = user.role === 'system_admin';
  const nextRole = isPlatform ? 'tenant_admin' : 'system_admin';

  return (
    <div
      title="演示用：切换管理员角色"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        height: 36, padding: '0 6px 0 12px',
        border: '1px solid #E5E7EB', borderRadius: 18, background: '#fff',
        fontSize: 13, flexShrink: 0,
        ...style,
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: 999, flexShrink: 0,
        background: isPlatform ? '#10B981' : '#E89E57',
      }} />
      <span style={{ color: '#4B5563' }}>
        {isPlatform ? 'Buddy系统管理员' : 'Buddy空间管理员'}
      </span>
      <button
        className="btn btn-text"
        style={{ fontSize: 13 }}
        onClick={() => {
          setRole(nextRole);
          if (onChange) onChange(nextRole);
        }}
      >切换</button>
    </div>
  );
}
