import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Common.jsx';
import { useRole } from '../contexts/RoleContext.jsx';
import { useStore } from '../contexts/StoreContext.jsx';

function findBreadcrumb(path, tenants) {
  if (path === '/' || path === '') return ['首页'];
  if (path.startsWith('/tenants')) {
    if (path === '/tenants') return ['Buddy开放中心', 'Buddy空间管理'];
    if (path === '/tenants/new') return ['Buddy开放中心', 'Buddy空间管理', '新建Buddy空间'];
    if (path.startsWith('/tenants/edit')) return ['Buddy开放中心', 'Buddy空间管理', '编辑Buddy空间'];
    if (path.match(/\/tenants\/build-capabilities\//)) {
      const tid = path.split('/')[3];
      const t = tenants.find((x) => x.id === tid);
      return ['Buddy开放中心', 'Buddy空间管理', t ? t.brandName : 'Buddy空间', '构建能力'];
    }
    return ['Buddy开放中心', 'Buddy空间管理'];
  }
  if (path.startsWith('/experts')) {
    if (path === '/experts') return ['Buddy开放中心', '专家助理管理'];
    if (path === '/experts/new') return ['Buddy开放中心', '专家助理管理', '新建专家助理'];
    if (path.startsWith('/experts/view/')) return ['Buddy开放中心', '专家助理管理', '专家助理详情'];
    return ['Buddy开放中心', '专家助理管理', '编辑专家助理'];
  }
  if (path.startsWith('/skills')) return ['Buddy开放中心', 'Skill技能管理'];
  if (path.startsWith('/mcps')) return ['Buddy开放中心', 'MCP服务注册'];
  if (path.startsWith('/templates')) return ['Buddy开放中心', '任务模板管理'];
  if (path.startsWith('/tenant/basic')) return ['Buddy开放中心', '基本信息维护'];
  if (path.startsWith('/tenant/skills')) return ['Buddy开放中心', 'Skill技能'];
  if (path.startsWith('/tenant/mcps')) return ['Buddy开放中心', 'MCP工具'];
  if (path.startsWith('/tenant/experts')) return ['Buddy开放中心', 'Agent专家'];
  if (path.startsWith('/tenant/expert-edit')) return ['Buddy开放中心', 'Agent专家', '编辑专家助理'];
  if (path.startsWith('/tenant/expert-new')) return ['Buddy开放中心', 'Agent专家', '新建专家助理'];
  return ['首页'];
}

export function Header({ onToggleSidebar, collapsed }) {
  const location = useLocation();
  const { user, switchUser, setRole, activeTenantId, setActiveTenantId } = useRole();
  const { tenants } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const crumbs = findBreadcrumb(location.pathname, tenants);

  return (
    <header style={{
      height: 56, padding: '0 24px',
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50
    }}>
      <button
        className="btn btn-ghost"
        onClick={onToggleSidebar}
        style={{ padding: 6 }}
        title={collapsed ? '展开菜单' : '收起菜单'}
      >
        <Icon name={collapsed ? 'chevronRight' : 'refresh'} size={16} />
      </button>

      <div style={{ fontSize: 13, color: '#6B7280' }}>
        <Link to="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Buddy管理</Link>
        {crumbs.slice(1).map((c, i) => (
          <span key={i}>
            <span style={{ margin: '0 8px', color: '#D1D5DB' }}>/</span>
            <span style={{ color: i === crumbs.length - 2 ? '#1F2937' : '#6B7280' }}>{c}</span>
          </span>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* 角色切换（演示用） */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', border: '1px solid #E5E7EB',
        borderRadius: 16, fontSize: 12, cursor: 'pointer'
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 999,
          background: user.role === 'system_admin' ? '#10B981' : '#E89E57'
        }} />
        <span style={{ color: '#4B5563' }}>
          {user.role === 'system_admin' ? '系统管理员视角' : 'Buddy空间管理员视角'}
        </span>
        <button
          className="btn btn-text"
          style={{ fontSize: 12 }}
          onClick={switchUser}
          title="演示用：点击切换"
        >切换</button>
      </div>

      {/* Buddy空间切换 - Buddy空间管理员视角下显示 */}
      {user.role === 'tenant_admin' && (
        <select
          className="select"
          style={{ width: 160, height: 32 }}
          value={activeTenantId}
          onChange={(e) => setActiveTenantId(e.target.value)}
        >
          {tenants.filter((t) => t.status === '已上线').map((t) => (
            <option key={t.id} value={t.id}>{t.brandName}（{t.nickname}）</option>
          ))}
        </select>
      )}

      {/* 通知 */}
      <button className="btn btn-ghost" style={{ padding: 6, position: 'relative' }}>
        <Icon name="doc" size={16} />
        <span style={{
          position: 'absolute', top: 4, right: 4, width: 6, height: 6,
          background: '#DC2626', borderRadius: '50%'
        }} />
      </button>

      {/* 用户 */}
      <div style={{ position: 'relative' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 4 }}
          onClick={() => setUserMenuOpen((o) => !o)}
        >
          <img
            className="avatar"
            src={user.avatar}
            alt={user.name}
            style={{ borderRadius: '50%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{user.name}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              {user.role === 'system_admin' ? '平台超级管理员' : 'Buddy空间管理员'}
            </span>
          </div>
          <Icon name="chevronDown" size={12} color="#9CA3AF" />
        </div>
        {userMenuOpen && (
          <div
            style={{
              position: 'absolute', top: '110%', right: 0, width: 200,
              background: '#fff', borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB', padding: 4, zIndex: 1000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ padding: '8px 12px', fontSize: 13, color: '#4B5563', cursor: 'pointer', borderRadius: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >个人中心</div>
            <div
              style={{ padding: '8px 12px', fontSize: 13, color: '#4B5563', cursor: 'pointer', borderRadius: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >账号设置</div>
            <div style={{ borderTop: '1px solid #F2F4F7', margin: '4px 0' }} />
            <div
              style={{ padding: '8px 12px', fontSize: 13, color: '#DC2626', cursor: 'pointer', borderRadius: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >退出登录</div>
          </div>
        )}
      </div>
    </header>
  );
}
