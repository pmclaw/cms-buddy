import React from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext.jsx';
import { useStore } from '../contexts/StoreContext.jsx';
import { Icon } from '../components/Common.jsx';
import { Tag } from '../components/Tag.jsx';

export function HomeDashboard() {
  const { user } = useRole();
  const { tenants, experts, skills, mcps, templates } = useStore();

  if (user.role === 'system_admin') {
    return (
      <div className="fade-enter">
        <div className="page-body">
          <div className="page-header">
            <div>
              <h1 className="page-title">欢迎回来，{user.name}</h1>
              <div className="page-desc">系统管理视角 · 维护全局的Buddy空间、专家助理、能力资源等</div>
            </div>
          </div>

          {/* 概览卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Buddy空间', value: tenants.length, icon: 'building', link: '/tenants', color: '#E89E57' },
              { label: '专家助理', value: experts.length, icon: 'bot', link: '/experts', color: '#3B82F6' },
              { label: 'Skill 技能', value: skills.length, icon: 'spark', link: '/skills', color: '#10B981' },
              { label: 'MCP 服务', value: mcps.length, icon: 'wrench', link: '/mcps', color: '#8B5CF6' },
            ].map((s, i) => (
              <Link
                key={i} to={s.link}
                className="card"
                style={{
                  padding: 20, display: 'flex', alignItems: 'center', gap: 14,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px -10px rgba(232, 158, 87, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `${s.color}15`, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={s.icon} size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 600, color: '#1F2937' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* 双栏：最新创建的空间 + 最新创建的专家助理 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid #F2F4F7',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>最新创建的空间</span>
                <Link to="/tenants" className="btn btn-text">查看全部 ›</Link>
              </div>
              <div style={{ padding: 8 }}>
                {tenants.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    to={`/tenants/edit/${t.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 12, borderRadius: 6, textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FBF1E5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={t.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{t.brandName}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{t.slogan}</div>
                    </div>
                    <Tag color={t.status === '已上线' ? 'success' : 'default'}>{t.status}</Tag>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid #F2F4F7',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>最新创建的专家助理</span>
                <Link to="/experts" className="btn btn-text">查看全部 ›</Link>
              </div>
              <div style={{ padding: 8 }}>
                {experts.slice(0, 5).map((e) => (
                  <Link
                    key={e.id}
                    to={`/experts/edit/${e.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 12, borderRadius: 6, textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FBF1E5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={e.avatar} alt="" style={{ width: 36, height: 36, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{(e.tags || []).slice(0, 3).join(' · ')}</div>
                    </div>
                    <Tag color="brand">{e.source}</Tag>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 快捷入口 */}
          <div className="card" style={{ marginTop: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>快捷入口</div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12
            }}>
              {[
                { label: '新建Buddy空间', path: '/tenants/new', icon: 'plus', color: '#E89E57' },
                { label: '新建专家', path: '/experts/new', icon: 'plus', color: '#3B82F6' },
                { label: 'Buddy空间管理', path: '/tenants', icon: 'building', color: '#10B981' },
                { label: '专家管理', path: '/experts', icon: 'bot', color: '#8B5CF6' },
                { label: '帮助文档', path: '#', icon: 'doc', color: '#F59E0B' },
              ].map((q, i) => (
                <Link
                  key={i} to={q.path}
                  style={{
                    padding: 16, textDecoration: 'none',
                    border: '1px solid #E5E7EB', borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = q.color;
                    e.currentTarget.style.background = q.color + '08';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: q.color + '15', color: q.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon name={q.icon} size={16} />
                  </div>
                  <span style={{ fontSize: 13, color: '#374151' }}>{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Buddy空间管理员
  const tenant = tenants.find((t) => t.id === 'T001');
  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={tenant?.logo || ''} alt="" style={{ width: 60, height: 60, borderRadius: 14 }} />
            <div>
              <h1 className="page-title">{tenant?.brandName}</h1>
              <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{tenant?.slogan}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>通道：{tenant?.channel} · ID: {tenant?.id}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '已关联 MCP', value: 12, icon: 'wrench', color: '#E89E57' },
            { label: '已关联 Skill', value: 24, icon: 'spark', color: '#3B82F6' },
            { label: '模板任务', value: 6, icon: 'refresh', color: '#10B981' },
            { label: '专家助理', value: 8, icon: 'bot', color: '#8B5CF6' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>开始管理你的 chatbot</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: '基本信息维护', path: '/tenant/basic', desc: '维护Buddy名称、LOGO、主题色等' },
              { label: 'Skill 技能', path: '/tenant/skills', desc: '查看已关联的技能并启用/停用' },
              { label: 'MCP 工具', path: '/tenant/mcps', desc: '查看已关联的工具并设置全局工具' },
              { label: 'Agent 专家', path: '/tenant/experts', desc: '查看与自建专家助理' },
            ].map((q, i) => (
              <Link
                key={i} to={q.path}
                className="card"
                style={{
                  padding: 18, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E89E57';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = '';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: '#FBF1E5', color: '#E89E57',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name="chevronRight" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{q.label}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{q.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
