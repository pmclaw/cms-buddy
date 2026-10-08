// 角色切换控件（演示用）
// 从顶部 Header 下放到各管理页面标题区，位于主操作按钮（如「添加技能」）左侧，
// 便于在页面内直接切换管理员角色。后续页面按同样方式引入即可。
//
// 两个角色名称：Buddy系统管理员 / Buddy空间管理员
// 展示为文字链：文案直接指向目标角色（「切换为空间管理员」/「切换为系统管理员」）
import React from 'react';
import { useRole } from '../contexts/RoleContext.jsx';

export function RoleSwitcher({ onChange, style }) {
  const { user, setRole } = useRole();
  const isPlatform = user.role === 'system_admin';
  const nextRole = isPlatform ? 'tenant_admin' : 'system_admin';
  const targetName = isPlatform ? '空间管理员' : '系统管理员';

  return (
    <button
      type="button"
      title={`演示用：切换为 ${targetName}`}
      onClick={() => {
        setRole(nextRole);
        if (onChange) onChange(nextRole);
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#B87136'; e.currentTarget.style.textDecoration = 'underline'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#E89E57'; e.currentTarget.style.textDecoration = 'none'; }}
      style={{
        background: 'none', border: 'none', padding: 0, margin: 0,
        fontSize: 13, lineHeight: '20px', color: '#E89E57',
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        fontFamily: 'inherit',
        ...style,
      }}
    >切换为{targetName}</button>
  );
}
