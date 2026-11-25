import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Common.jsx';
import { useRole } from '../contexts/RoleContext.jsx';
import brandLogo from '../assets/cmslogo2026.png';

// 新菜单结构：
// 1) Buddy 开放中心 - 系统管理员 & 空间管理员通用
//    - Buddy 空间管理（系统管理员可见全部；空间管理员仅可见自己的）
//    - 专家助理管理
//    - Skill 技能管理
//    - MCP 服务注册
//    - 任务模板管理
// 2) 会话辅助管理
//    - 伴随助理管理
// 3) 运营监控管理
//    - Buddy 运营看板 / 历史问答记录 / 自动化任务订阅 / 任务执行记录
// 4) 系统配置管理（占位）
//    - 模型接入管理 / 系统提示词管理 / 权限配置管理
const MENUS = [
  {
    key: 'open',
    icon: 'layers',
    title: 'Buddy开放中心',
    children: [
      { key: 'tenant', label: 'Buddy空间管理', path: '/tenants' },
      { key: 'expert', label: '专家助理管理', path: '/experts' },
      { key: 'skill', label: 'Skill技能管理', path: '/skills' },
      { key: 'mcp', label: 'MCP服务注册', path: '/mcps' },
      { key: 'template', label: '任务模板管理', path: '/templates' },
      { key: 'cockpit', label: 'Buddy运营看板', path: '/ops/cockpit' },
      { key: 'run', label: '任务执行记录', path: '/ops/run' },
      { key: 'userGroup', label: '用户组管理', path: '/user-groups' },
      { key: 'buddyParams', label: 'Buddy参数管理', path: '/buddy-params', roles: ['system_admin'] },
    ],
  },
  {
    key: 'session',
    icon: 'spark',
    title: '会话辅助管理',
    children: [
      { key: 'companion', label: '伴随助理管理', path: '/companion-assistants' },
    ],
  },
  {
    key: 'ops',
    icon: 'monitor',
    title: '运营监控管理',
    children: [
      { key: 'qa', label: '历史问答记录', path: '/ops/qa', disabled: true },
      { key: 'subscribe', label: '自动化任务订阅', path: '/ops/subscribe', disabled: true },
    ],
  },
  {
    key: 'sys',
    icon: 'shield',
    title: '系统配置管理',
    children: [
      { key: 'model', label: '模型接入管理', path: '/sys/model', disabled: true },
      { key: 'prompt', label: '系统提示词管理', path: '/sys/prompt', disabled: true },
      { key: 'perm', label: '权限配置管理', path: '/sys/perm', disabled: true },
    ],
  },
];

export function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useRole();
  // 默认展开当前路由所属的一级菜单（线上带 /cms-buddy/admin 前缀，故用后缀匹配）
  const matchPath = (path) => {
    const cur = location.pathname;
    return cur === path || cur.endsWith(path) || cur.includes(path + '/');
  };
  const [openKeys, setOpenKeys] = useState(() => {
    const opened = MENUS
      .filter((m) => m.children.some((c) => c.path && matchPath(c.path)))
      .map((m) => m.key);
    return Array.from(new Set(['open', ...opened]));
  });

  // 路由变化时自动展开所属一级菜单：线上深链（404 回跳）首帧 pathname 可能是站点根，需在路由就绪后再展开一次
  useEffect(() => {
    const opened = MENUS
      .filter((m) => m.children.some((c) => c.path && matchPath(c.path)))
      .map((m) => m.key);
    if (opened.length === 0) return;
    setOpenKeys((prev) => {
      const next = Array.from(new Set([...prev, ...opened]));
      return next.length === prev.length ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggle = (k) => {
    setOpenKeys((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  const isActive = (item) => matchPath(item.path);

  // 按当前角色过滤可见菜单项（roles 未指定时对所有角色可见）
  const visibleOf = (children) =>
    children.filter((c) => !c.disabled && (!c.roles || c.roles.includes(user.role)));

  if (collapsed) {
    return (
      <aside style={{
        width: 60, background: '#fff', borderRight: '1px solid #E5E7EB',
        display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14,
        overflow: 'auto', flex: '0 0 60px'
      }}>
        {MENUS.map((m) => {
          const first = visibleOf(m.children)[0];
          return (
            <div
              key={m.key}
              title={m.title}
              onClick={() => navigate(first?.path || '/')}
              style={{
                width: 40, height: 40, marginBottom: 6, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#4B5563'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FBF1E5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name={m.icon} size={18} />
            </div>
          );
        })}
      </aside>
    );
  }

  return (
    <aside style={{
      width: 220, background: '#fff', borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', flex: '0 0 220px', overflow: 'hidden'
    }}>
      {/* Logo 区 */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #F2F4F7',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <img
          src={brandLogo}
          alt="Buddy Admin"
          style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }}
        />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>Buddy Admin</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Buddy空间智能体管理平台</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
        {MENUS.map((m) => {
          const visibleChildren = visibleOf(m.children);

          return (
            <div key={m.key} className="menu-group">
              <div className="menu-group-title" onClick={() => toggle(m.key)}>
                <Icon name={m.icon} size={14} />
                <span style={{ flex: 1 }}>{m.title}</span>
                <Icon
                  name={openKeys.includes(m.key) ? 'chevronDown' : 'chevronRight'}
                  size={12} color="#9CA3AF"
                />
              </div>
              {openKeys.includes(m.key) && (
                <div>
                  {m.children.map((c) => {
                    if (c.disabled) {
                      return (
                        <div
                          key={c.key}
                          className="menu-item"
                          style={{ color: '#D1D5DB', cursor: 'not-allowed' }}
                          onClick={() => {/* 不跳转 */}}
                          title="该模块暂无页面"
                        >
                          <span style={{ width: 14, height: 14, display: 'inline-block' }}>·</span>
                          <span style={{ flex: 1 }}>{c.label}</span>
                          <span style={{ fontSize: 10, background: '#F2F4F7', padding: '0 6px', borderRadius: 8 }}>暂无</span>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={c.key}
                        to={c.path}
                        className={`menu-item ${isActive(c) ? 'active' : ''}`}
                      >
                        <span style={{ flex: 1 }}>{c.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{
        padding: '12px 16px', borderTop: '1px solid #F2F4F7',
        fontSize: 12, color: '#9CA3AF', textAlign: 'center'
      }}>
        v1.0.0 · Buddy Admin
      </div>
    </aside>
  );
}