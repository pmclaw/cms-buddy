import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm, Section } from '../../components/Common.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Tooltip } from '../../components/Tooltip.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Tag } from '../../components/Tag.jsx';

export function TenantList() {
  const navigate = useNavigate();
  const { tenants, mcps, deleteTenant, upsertTenant, defaultSpaceId, setDefaultSpaceId } = useStore();
  const toast = useToast();
  const { user } = useRole();
  const isPlatform = user.role === 'system_admin';
  // 空间管理员可管理的空间ID（仅对这些空间显示"构建能力"）
  const managedTenantIds = isPlatform ? null : (user.managedTenants || (user.tenantId ? [user.tenantId] : []));

  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // 三点操作菜单当前打开行

  // 点击页面其它区域关闭三点菜单
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => {
      if (!e.target.closest('[data-tenant-action-menu]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  // 列表直接切换 上线/下线 状态
  const toggleStatus = (t) => {
    const next = t.status === '已上线' ? '已下线' : '已上线';
    upsertTenant({ ...t, status: next });
    toast.success(`Buddy空间 ${t.brandName} 已${next === '已上线' ? '上线' : '下线'}`);
  };

  // 设置/取消默认Buddy空间：默认空间为全局单值（互斥），设置时自动替换原默认项
  const toggleDefaultSpace = (t, checked) => {
    if (checked) {
      setDefaultSpaceId(t.id);
      toast.success(`已将 ${t.brandName} 设为默认Buddy空间`);
    } else {
      setDefaultSpaceId(null);
      toast.success(`已取消 ${t.brandName} 的默认设置`);
    }
  };

  const filtered = tenants.filter((t) => {
    // 空间管理员仅查看自己管理的Buddy空间
    if (!isPlatform && !managedTenantIds.includes(t.id)) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      return (t.brandName + t.nickname + t.description).toLowerCase().includes(k);
    }
    return true;
  });

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="fade-enter">
      <div className="page-body">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Buddy空间管理</h1>
            <div className="page-desc">
              管理 Buddy空间 的品牌 Agent runtime 平台。每个 Buddy空间 可独立配置品牌、形象、关联 MCP/Skill/专家助理等能力。
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default">
              <Icon name="refresh" size={14} />
              刷新
            </button>
            {isPlatform && (
              <button className="btn btn-primary" onClick={() => navigate('/tenants/new')}>
                <Icon name="plus" size={14} />
                新建Buddy空间
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        {isPlatform && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16
        }}>
          {[
            { label: 'Buddy空间总数', value: tenants.length, color: '#E89E57', icon: 'building' },
            { label: '已上线', value: tenants.filter((t) => t.status === '已上线').length, color: '#10B981', icon: 'check' },
            { label: '已下线', value: tenants.filter((t) => t.status === '已下线').length, color: '#9CA3AF', icon: 'close' },
            { label: '本月新增', value: 2, color: '#3B82F6', icon: 'spark' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#1F2937' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Filter */}
        <div className="filter-bar">
          <div className="filter-item">
            <span className="filter-item-label">Buddy空间名称</span>
            <input
              className="input"
              placeholder="请输入"
              value={filters.keyword}
              onChange={(e) => { setFilters((f) => ({ ...f, keyword: e.target.value })); setPage(1); }}
            />
          </div>
          <div className="filter-item">
            <span className="filter-item-label">状态</span>
            <select
              className="select"
              value={filters.status}
              onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
            >
              <option value="">全部</option>
              <option value="已上线">已上线</option>
              <option value="已下线">已下线</option>
            </select>
          </div>
          <div className="filter-item">
            <button className="btn btn-primary">
              <Icon name="search" size={14} />
              查询
            </button>
            <button className="btn btn-default" onClick={() => setFilters({ keyword: '', status: '' })}>
              重置
            </button>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              共 <strong style={{ color: '#E89E57' }}>{total}</strong> 个Buddy空间
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th width={60}>ID</th>
                <th width={200}>Buddy空间名称</th>
                {!isPlatform && (
                  <th width={120}>
                    设置默认空间
                    <Tooltip text="设置为默认空间后，管理空间相关内容时将默认选中该空间" />
                  </th>
                )}
                <th>Buddy空间宣传语</th>
                <th width={90}>主题色</th>
                <th width={120}>关联能力</th>
                <th width={100}>上线状态</th>
                <th width={120}>创建人</th>
                <th width={130}>创建时间</th>
                <th width={140}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={isPlatform ? 9 : 10}>
                    <Empty icon="🏢" tip="暂无Buddy空间数据，请先创建" />
                  </td>
                </tr>
              ) : paged.map((t) => (
                <tr key={t.id}>
                  <td style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{t.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img className="avatar" src={t.logo} alt={t.brandName} style={{ borderRadius: 6 }} />
                      <div>
                        <div style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer' }}
                          onClick={() => navigate(`/tenants/edit/${t.id}`)}>
                          {t.brandName}
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>昵称:{t.nickname}</div>
                      </div>
                    </div>
                  </td>
                  {!isPlatform && (
                    <td>
                      <Toggle
                        checked={defaultSpaceId === t.id}
                        onChange={(checked) => toggleDefaultSpace(t, checked)}
                      />
                    </td>
                  )}
                  <td>
                    <div style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: '#1F2937' }}>{t.slogan}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 4, background: t.themeColor,
                        border: '2px solid #fff', boxShadow: '0 0 0 1px #E5E7EB'
                      }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6B7280' }}>
                        {t.themeColor}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, fontSize: 12, color: '#4B5563' }}>
                      <span title="MCP工具"><Icon name="wrench" size={11} />
                        {(t.mcpIds || []).reduce((sum, id) => {
                          const m = mcps.find((x) => x.id === id);
                          return sum + (m?.enabledTools?.length || 0);
                        }, 0)}
                      </span>
                      <span style={{ color: '#E5E7EB' }}>|</span>
                      <span title="Skill"><Icon name="spark" size={11} /> {t.skillCount}</span>
                      <span style={{ color: '#E5E7EB' }}>|</span>
                      <span title="专家"><Icon name="bot" size={11} /> {t.expertCount}</span>
                    </div>
                  </td>
                  <td>
                    <Toggle checked={t.status === '已上线'} onChange={() => toggleStatus(t)} />
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: '#4B5563' }}>
                      {t.creator}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#6B7280' }}>{t.createTime}</td>
                  <td>
                    <div data-tenant-action-menu style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                      <span
                        style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                        onClick={() => window.open('http://www.deepseek.com', '_blank', 'noopener,noreferrer')}
                      >预览</span>
                      <button
                        type="button"
                        aria-label="更多操作"
                        title="更多操作"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setOpenMenuId(openMenuId === t.id ? null : t.id);
                        }}
                        style={{
                          background: 'transparent', border: 'none', padding: 4,
                          cursor: 'pointer', borderRadius: 4,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          color: '#6B7280',
                        }}
                      >
                        <Icon name="more" size={16} color="#6B7280" />
                      </button>
                      {openMenuId === t.id && (() => {
                        // 菜单项按角色/管理范围动态组装
                        const items = [];
                        items.push({ key: 'edit', label: '编辑', onClick: () => navigate(`/tenants/edit/${t.id}`) });
                        if (isPlatform || managedTenantIds.includes(t.id)) {
                          items.push({ key: 'build', label: '构建能力', onClick: () => navigate(`/tenants/build-capabilities/${t.id}`) });
                        }
                        if (isPlatform) {
                          items.push({ key: 'del', label: '删除', danger: true, onClick: () => setConfirmDelete(t) });
                        }
                        return (
                          <div
                            role="menu"
                            style={{
                              position: 'absolute', right: 0, top: '100%', zIndex: 50,
                              minWidth: 140, marginTop: 4,
                              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: 4,
                            }}
                          >
                            {items.map((it) => (
                              <div
                                key={it.key}
                                role="menuitem"
                                onClick={(ev) => { ev.stopPropagation(); setOpenMenuId(null); it.onClick(); }}
                                onMouseEnter={(ev) => { ev.currentTarget.style.background = it.danger ? '#FEF2F2' : '#F5F6F8'; }}
                                onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; }}
                                style={{
                                  padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                                  color: it.danger ? '#EF4444' : '#4B5563', borderRadius: 4,
                                  transition: 'all 0.15s', userSelect: 'none',
                                }}
                              >{it.label}</div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
            />
          )}
        </div>

        <Confirm
          open={!!confirmDelete}
          title="删除Buddy空间确认"
          content={
            <div>
              <div style={{ marginBottom: 12 }}>
                确定要删除Buddy空间 <strong style={{ color: '#E89E57' }}>{confirmDelete?.brandName}</strong> 吗？
              </div>
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C'
              }}>
                ⚠️ 删除后该Buddy空间的 chatbot 配置、关联的 MCP/Skill/专家助理绑定关系将被清除，操作不可恢复。
              </div>
            </div>
          }
          danger
          onOk={() => {
            deleteTenant(confirmDelete.id);
            toast.success(`Buddy空间 ${confirmDelete.brandName} 已删除`);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </div>
  );
}
