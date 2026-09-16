import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { ChatbotDialog } from '../../components/ChatbotDialog.jsx';
import { AuthorizeSpaceDialog } from '../../components/AuthorizeSpaceDialog.jsx';
import { AuthorizeUserDialog } from '../../components/AuthorizeUserDialog.jsx';
export function ExpertList() {
  const navigate = useNavigate();
  const { user } = useRole();
  const { experts, tenants, deleteExpert, upsertExpert } = useStore();
  const toast = useToast();
  const isPlatform = user.role === 'system_admin';

  // 空间管理员可管理的空间列表
  const managedTenants = useMemo(() => {
    if (isPlatform) return tenants;
    return tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));
  }, [tenants, user, isPlatform]);

  // 「所属空间」列：空间管理员创建的资产展示空间名称；系统管理员创建的展示「系统」
  const renderOwnedCell = (creatorTenant) => {
    if (!creatorTenant) return <Tag color="default">系统</Tag>;
    const t = tenants.find((x) => x.id === creatorTenant);
    return <Tag color="info">{t ? t.brandName : '—'}</Tag>;
  };

  const [filters, setFilters] = useState({ keyword: '', businessOwner: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [spaceAuthTarget, setSpaceAuthTarget] = useState(null); // 授权空间弹窗目标专家
  const [userAuthTarget, setUserAuthTarget] = useState(null); // 授权用户弹窗目标专家
  const [viewTab, setViewTab] = useState('center');
  const [chatbotExpert, setChatbotExpert] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // 三点操作菜单当前打开行

  const filtered = useMemo(() => {
    const k = filters.keyword.toLowerCase();
    let list = experts.filter((e) => {
      if (filters.businessOwner && e.businessOwner !== filters.businessOwner) return false;
      if (filters.keyword) {
        return (e.name + ' ' + e.nickname).toLowerCase().includes(k);
      }
      return true;
    });

    // 空间管理员双Tab过滤
    if (!isPlatform) {
      if (viewTab === 'mine') {
        list = list.filter((e) => e.creatorTenant === user.tenantId);
      } else if (viewTab === 'granted') {
        // 授权给我的：其他主体（系统/其他空间）创建并显式授权给本空间的专家助理
        list = list.filter((e) => (e.openTenants || []).includes(user.tenantId) && e.creatorTenant !== user.tenantId);
      } else {
        // 专家助理库：展示平台所有已上架的专家助理（含未授权给本空间的平台开放资源）
        list = list.filter((e) => e.status === '已上架');
      }
    }

    return list;
  }, [experts, filters, isPlatform, viewTab, user]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 上架/下架切换
  const toggleExpertStatus = (expert) => {
    const newStatus = expert.status === '已上架' ? '已下架' : '已上架';
    upsertExpert({ ...expert, status: newStatus });
    toast.success(`「${expert.name}」已${newStatus}`);
  };

  // 是否为空间管理员中心视图
  const isCenterView = !isPlatform && viewTab === 'center';
  // 是否为空间管理员「授权给我的」视图（列结构等同资产库；操作仅 查看详情/授权用户）
  const isGrantedView = !isPlatform && viewTab === 'granted';

  // 点击页面其它区域关闭三点菜单
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => {
      if (!e.target.closest('[data-expert-action-menu]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">专家助理管理</h1>
            <div className="page-desc">
              {isPlatform
                ? '为不同业务场景创建专属的专家助理。每个专家可绑定多个 MCP 工具与 Skill 技能，用户选用时将基于其配置的能力运行。'
                : '管理本空间的专家助理，或从专家助理库一键启用平台开放资源。'}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default">
              <Icon name="refresh" size={14} />
              刷新
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/experts/new')}>
              <Icon name="plus" size={14} />
              新建专家助理
            </button>
          </div>
        </div>

        {/* 空间管理员双Tab */}
        {!isPlatform && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #F2F4F7' }}>
            {[
              { k: 'center', label: '专家助理库' },
              { k: 'granted', label: '授权给我的' },
              { k: 'mine', label: '管理空间专家助理' },
            ].map((t) => (
              <div
                key={t.k}
                onClick={() => { setViewTab(t.k); setPage(1); }}
                style={{
                  padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  color: viewTab === t.k ? '#E89E57' : '#6B7280',
                  borderBottom: viewTab === t.k ? '2px solid #E89E57' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        )}

        {/* 统计 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { label: '专家总数', value: filtered.length, color: '#E89E57' },
            { label: '已上架', value: filtered.filter((e) => e.status === '已上架').length, color: '#10B981' },
            { label: '已下架', value: filtered.filter((e) => e.status === '已下架').length, color: '#9CA3AF' },
            { label: '全局可用', value: filtered.filter((e) => e.openScope === 'all').length, color: '#3B82F6' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: s.color + '15', color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 600,
              }}>
                {s.value}
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="filter-bar">
          <div className="filter-item">
            <span className="filter-item-label">专家助理名称 / 昵称</span>
            <input
              className="input"
              placeholder="请输入专家助理名称 / 昵称"
              value={filters.keyword}
              onChange={(e) => { setFilters((f) => ({ ...f, keyword: e.target.value })); setPage(1); }}
            />
          </div>
          <div className="filter-item">
            <span className="filter-item-label">业务归属方</span>
            <select
              className="select"
              value={filters.businessOwner}
              onChange={(e) => { setFilters((f) => ({ ...f, businessOwner: e.target.value })); setPage(1); }}
            >
              <option value="">全部</option>
              {['数字化办公室', '机构业务部', '托管业务部', '财富管理部', '零售业务部'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <button className="btn btn-primary">
              <Icon name="search" size={14} />
              查询
            </button>
            <button className="btn btn-default" onClick={() => setFilters({ keyword: '', businessOwner: '' })}>重置</button>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>
            共 <strong style={{ color: '#E89E57' }}>{total}</strong> 个专家
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th width={70}>ID</th>
                <th width={220}>专家助理</th>
                <th width={120}>业务归属方</th>
                {/* 授权空间列：仅系统管理员可见（空间管理员三页签均不展示） */}
                {isPlatform && <th width={140}>授权空间</th>}
                <th width={110}>所属空间</th>
                <th width={110}>关联能力</th>
                {!(isCenterView || isGrantedView) && <th width={90}>上架状态</th>}
                <th width={100}>更新人</th>
                <th width={120}>更新时间</th>
                <th width={150}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={(isCenterView || isGrantedView ? 9 : 10) - (isPlatform ? 0 : 1)}>
                    <Empty icon="🤖" tip={viewTab === 'center' ? '暂无平台开放资源' : viewTab === 'granted' ? '暂无其他空间授权给你的专家助理' : '暂无专家助理，点击「新建」创建'} />
                  </td>
                </tr>
              ) : paged.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{e.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={e.avatar} alt={e.name} className="avatar" style={{ borderRadius: 8 }} />
                      <div>
                        <div style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer' }}
                          onClick={() => setChatbotExpert(e)}>
                          {e.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>昵称：{e.nickname}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Tag color="info">{e.businessOwner || '—'}</Tag>
                  </td>
                  {isPlatform && (
                    <td>
                      {e.openScope === 'all' || e.openScope === 'private' ? (
                        <Tag color="success">全局开放</Tag>
                      ) : (e.openTenants || []).length > 0 ? (
                        <Tag color="warning" title={(e.openTenants || []).map((tid) => { const t = tenants.find((tn) => tn.id === tid); return t ? t.brandName : tid; }).join('、')}>
                          {(e.openTenants || []).length} 个空间
                        </Tag>
                      ) : (
                        <Tag color="default">暂未授权</Tag>
                      )}
                    </td>
                  )}
                  <td>{renderOwnedCell(e.creatorTenant)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, fontSize: 12, color: '#4B5563' }}>
                      <span title="MCP工具"><Icon name="wrench" size={11} />
                        {Object.values(e.mcpToolMap || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0)}
                      </span>
                      <span style={{ color: '#E5E7EB' }}>|</span>
                      <span title="Skill"><Icon name="spark" size={11} /> {e.skillIds?.length || 0}</span>
                    </div>
                  </td>
                  {!(isCenterView || isGrantedView) && (
                    <td>
                      {isPlatform && e.creatorTenant ? (
                        // 系统管理员视角：空间管理员创建的专家助理仅文字展示上下架状态
                        <span style={{ color: e.status === '已上架' ? '#15803D' : '#9CA3AF', fontSize: 13 }}>
                          {e.status === '已上架' ? '已上架' : '已下架'}
                        </span>
                      ) : (
                        <Toggle
                          checked={e.status === '已上架'}
                          onChange={() => toggleExpertStatus(e)}
                        />
                      )}
                    </td>
                  )}
                  <td style={{ fontSize: 12, color: '#6B7280' }}>{e.creator}</td>
                  <td style={{ fontSize: 12, color: '#9CA3AF' }}>{e.updateTime}</td>
                  <td>
                    <div data-expert-action-menu style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                      <span
                        style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                        onClick={() => setChatbotExpert(e)}
                      >预览</span>
                      <button
                        type="button"
                        aria-label="更多操作"
                        title="更多操作"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setOpenMenuId(openMenuId === e.id ? null : e.id);
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
                      {openMenuId === e.id && (() => {
                        // 菜单项按场景动态组装
                        const items = [];
                        if (isCenterView || isGrantedView) {
                          items.push({ key: 'view', label: '查看详情', onClick: () => navigate(`/experts/view/${e.id}`) });
                          // 授权给我的：可将授权至本空间的专家进一步下放给本空间用户
                          if (isGrantedView) {
                            items.push({ key: 'authUser', label: '授权用户', onClick: () => setUserAuthTarget(e) });
                          }
                        } else {
                          items.push({ key: 'edit', label: '编辑', onClick: () => navigate(`/experts/edit/${e.id}`) });
                          // 授权入口规则：
                          //  - 系统管理员：不提供「授权用户」（用户级授权收敛），仅「系统」创建（无 creatorTenant）的专家保留「授权空间」；空间创建的由空间自行管理，全部隐藏
                          //  - 空间管理员「管理空间专家助理」：不提供「授权空间」（跨空间授权归系统管理员），保留「授权用户」
                          const tenantCreated = !!e.creatorTenant;
                          if (isPlatform ? !tenantCreated : viewTab !== 'mine') {
                            items.push({ key: 'authSpace', label: '授权空间', onClick: () => setSpaceAuthTarget(e) });
                          }
                          if (!isPlatform) {
                            items.push({ key: 'authUser', label: '授权用户', onClick: () => setUserAuthTarget(e) });
                          }
                          items.push({ key: 'del', label: '删除', danger: true, onClick: () => setConfirmDelete(e) });
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
              page={page} pageSize={pageSize} total={total}
              onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
            />
          )}
        </div>

        <Confirm
          open={!!confirmDelete}
          title="删除专家助理"
          content={
            <div>
              <div style={{ marginBottom: 8 }}>
                确定要删除专家助理 <strong style={{ color: '#E89E57' }}>{confirmDelete?.name}</strong> 吗？
              </div>
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C'
              }}>
                ⚠️ 删除后将取消所有Buddy空间的关联，存量用户的对话体验可能受影响。
              </div>
            </div>
          }
          danger
          onOk={() => {
            deleteExpert(confirmDelete.id);
            toast.success(`专家助理 ${confirmDelete.name} 已删除`);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />

        {/* Chatbot 体验弹窗 */}
        {chatbotExpert && (
          <ChatbotDialog
            expert={chatbotExpert}
            onClose={() => setChatbotExpert(null)}
          />
        )}

        {/* 授权空间弹窗 */}
        {spaceAuthTarget && (
          <AuthorizeSpaceDialog
            resource={spaceAuthTarget}
            resourceType="专家助理"
            spaceNotice="温馨提示：当前专家助理授权给空间后，空间将默认获得专家助理关联的Skill技能与MCP工具的使用权限。"
            onClose={() => setSpaceAuthTarget(null)}
            onSubmit={(openScope, openTenants, allowSysAuth) => {
              upsertExpert({ ...spaceAuthTarget, openScope, openTenants, allowSysAuth });
              toast.success(`专家助理「${spaceAuthTarget.name}」空间授权已更新`);
              setSpaceAuthTarget(null);
            }}
          />
        )}

        {/* 授权用户弹窗 */}
        {userAuthTarget && (
          <AuthorizeUserDialog
            resource={userAuthTarget}
            resourceType="专家助理"
            onClose={() => setUserAuthTarget(null)}
            onSubmit={(userAuth) => {
              upsertExpert({ ...userAuthTarget, userAuth });
              toast.success(`专家助理「${userAuthTarget.name}」用户授权已更新`);
              setUserAuthTarget(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
