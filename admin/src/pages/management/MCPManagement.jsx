import React, { useState, useMemo } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { EnableScopeDialog } from './SkillManagement.jsx';
import { AuthorizeSpaceDialog } from '../../components/AuthorizeSpaceDialog.jsx';
import { AuthSettingsSection } from '../../components/AuthSettingsSection.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { SelectCombobox } from '../../components/SelectCombobox.jsx';
import { platformSources, addDictItem } from '../../data/mock.js';

const MCP_CATEGORIES = ['投研服务', '投顾服务', '系统工具', '数据服务', '资讯舆情'];

export function MCPManagement() {
  const { user } = useRole();
  const { mcps, tenants, upsertMcp, deleteMcp } = useStore();
  const toast = useToast();
  const isPlatform = user.role === 'system_admin';

  // 空间管理员可管理的空间列表
  const managedTenants = useMemo(() => {
    if (isPlatform) return tenants;
    return tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));
  }, [tenants, user, isPlatform]);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [authTarget, setAuthTarget] = useState(null); // 授权空间弹窗目标 MCP
  const [confirmDel, setConfirmDel] = useState(null);
  const [viewTab, setViewTab] = useState('center');
  const [enabledIds, setEnabledIds] = useState(new Set());
  const [enabling, setEnabling] = useState(null);
  const [detailMcp, setDetailMcp] = useState(null); // MCP详情查看
  const [viewing, setViewing] = useState(null); // 中心查看详情（只读）
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let list = mcps.filter((m) => {
      const matchK = !k || m.name.toLowerCase().includes(k);
      const matchC = !category || m.category === category;
      const matchS = !sourceFilter || m.source === sourceFilter;
      return matchK && matchC && matchS;
    });

    if (!isPlatform) {
      if (viewTab === 'mine') {
        list = list.filter((m) => m.creatorTenant === user.tenantId);
      } else if (viewTab === 'granted') {
        // 授权给我的：其他主体（系统/其他空间）创建并显式授权给本空间的 MCP 服务
        list = list.filter((m) => (m.openTenants || []).includes(user.tenantId) && m.creatorTenant !== user.tenantId);
      } else {
        // MCP工具库：展示平台所有已上架的 MCP 服务与工具（含未授权给本空间的平台开放资源）；
        // 「仅限本空间可见」且属于其他空间创建的 MCP 服务对当前空间不可见
        list = list.filter(
          (m) =>
            m.status === '已上架' &&
            !(m.spaceOnlyVisible && m.creatorTenant && m.creatorTenant !== user.tenantId)
        );
      }
    }
    return list;
  }, [mcps, keyword, category, sourceFilter, isPlatform, viewTab, user]);

  const handleEnable = (selectedTenants, selectedTools) => {
    setEnabledIds((prev) => new Set(prev).add(enabling.id));
    const names = selectedTenants.map((id) => tenants.find((t) => t.id === id)?.brandName).filter(Boolean);
    const toolInfo = selectedTools.length > 0 ? `（含 ${selectedTools.length} 个工具）` : '';
    toast.success(`已将「${enabling.name}」启用到：${names.join('、')}${toolInfo}`);
    setEnabling(null);
  };

  // 工具上架/下架切换
  const toggleToolPublished = (mcpId, toolIdx) => {
    const mcp = mcps.find((m) => m.id === mcpId);
    if (!mcp || !mcp.tools) return;
    const newTools = [...mcp.tools];
    newTools[toolIdx] = { ...newTools[toolIdx], published: !newTools[toolIdx].published };
    upsertMcp({ ...mcp, tools: newTools });
    toast.success(`工具「${newTools[toolIdx].label}」已${newTools[toolIdx].published ? '上架' : '下架'}`);
  };

  // 工具全局标记切换
  const toggleToolGlobal = (mcpId, toolIdx) => {
    const mcp = mcps.find((m) => m.id === mcpId);
    if (!mcp || !mcp.tools) return;
    const newTools = [...mcp.tools];
    newTools[toolIdx] = { ...newTools[toolIdx], globalTool: !newTools[toolIdx].globalTool };
    upsertMcp({ ...mcp, tools: newTools });
    toast.success(`工具「${newTools[toolIdx].label}」已${newTools[toolIdx].globalTool ? '设为全局工具' : '取消全局工具'}`);
  };

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 「所属空间」列：空间管理员创建的资产展示空间名称；系统管理员创建的展示「系统」
  const renderOwnedCell = (creatorTenant) => {
    if (!creatorTenant) return <Tag color="default">系统</Tag>;
    const t = tenants.find((x) => x.id === creatorTenant);
    return <Tag color="info">{t ? t.brandName : '—'}</Tag>;
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">MCP 服务注册</h1>
            <div className="page-desc">
              {isPlatform
                ? '注册全平台的 MCP 服务（含服务地址、API Key 等），设置是否全局开放或指定特定 Buddy 空间。'
                : '管理本空间的 MCP 服务，或从 MCP 服务中心一键启用平台开放资源。'}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setEditing({})}>
              <Icon name="plus" size={14} />
              注册 MCP
            </button>
          </div>
        </div>

        {/* 空间管理员双Tab - 无统计数字 */}
        {!isPlatform && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #F2F4F7' }}>
            {[
              { k: 'center', label: 'MCP工具库' },
              { k: 'granted', label: '授权给我的' },
              { k: 'mine', label: '管理空间MCP工具' },
            ].map((t) => (
              <div
                key={t.k}
                onClick={() => setViewTab(t.k)}
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

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '12px 16px', borderBottom: '1px solid #F2F4F7',
            background: '#FBFCFD'
          }}>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 140 }}>
              <option value="">MCP 分类</option>
              {MCP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {isPlatform && (
              <select className="select" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
                <option value="">全部来源</option>
                {platformSources.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
            <input
              className="input"
              placeholder="MCP 服务名称"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              style={{ maxWidth: 240 }}
            />
            <button className="btn btn-default" onClick={() => { setKeyword(''); setCategory(''); setSourceFilter(''); setPage(1); }}>
              <Icon name="refresh" size={12} />重置
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>
              共 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 个 MCP
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th width={90}>ID</th>
                  <th width={180}>MCP 服务名称</th>
                  <th>服务地址</th>
                  <th width={110}>MCP 分类</th>
                  {(isPlatform || (!isPlatform && viewTab === 'mine')) && <th width={90}>上架状态</th>}
                  <th width={150}>授权空间</th>
                  <th width={110}>所属空间</th>
                  <th width={110}>来源渠道</th>
                  <th width={100}>更新人</th>
                  <th width={140}>更新时间</th>
                  <th width={130}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isPlatform || viewTab === 'mine' ? 11 : 10}>
                      <Empty icon="🔌" tip={viewTab === 'center' ? '暂无平台开放资源' : viewTab === 'granted' ? '暂无其他空间授权给你的 MCP 服务' : '暂无 MCP 数据，请先注册'} />
                    </td>
                  </tr>
                )}
                {paged.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{m.id}</td>
                    <td>
                      <span
                        style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer' }}
                        onClick={() => setDetailMcp(m)}
                      >
                        {m.name}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: '#6B7280', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.serviceUrl || m.code}>
                      {m.serviceUrl || `https://api.example.com/${m.code}/mcp`}
                    </td>
                    <td><Tag color="info">{m.category || '投研服务'}</Tag></td>
                    {(isPlatform || (!isPlatform && viewTab === 'mine')) && (
                      <td>
                        {isPlatform && m.creatorTenant ? (
                          // 系统管理员视角：空间管理员创建的 MCP 服务仅文字展示上下架状态
                          <span style={{ color: m.status === '已上架' ? '#15803D' : '#9CA3AF', fontSize: 13 }}>
                            {m.status === '已上架' ? '已上架' : '已下架'}
                          </span>
                        ) : (
                          <Toggle
                            checked={m.status === '已上架'}
                            onChange={(v) => upsertMcp({ ...m, status: v ? '已上架' : '已下架' })}
                          />
                        )}
                      </td>
                    )}
                    <td>
                      {m.openScope === 'all' || m.openScope === 'private' ? (
                        <Tag color="success">全局开放</Tag>
  ) : (m.openTenants || []).length > 0 ? (
                        <Tag color="warning" title={( m.openTenants || []).map((tid) => { const t = tenants.find((tn) => tn.id === tid); return t ? t.brandName : tid; }).join('、')}>
                        {(m.openTenants || []).length} 个空间
                      </Tag>
                      ) : (
                        <Tag color="default">暂未授权</Tag>
                      )}
                    </td>
                    <td>{renderOwnedCell(m.creatorTenant)}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{m.source}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{m.creator || '—'}</td>
                    <td style={{ fontSize: 12, color: '#9CA3AF' }}>{m.updateTime}</td>
                    <td>
                      {!isPlatform && (viewTab === 'center' || viewTab === 'granted') ? (
                        <span
                          style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                          onClick={() => setViewing(m)}
                        >查看详情</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }} onClick={() => setEditing(m)}>编辑</span>
                          {/* 空间创建的 MCP 若关闭「允许系统管理员授权」，系统管理员的授权入口禁用 */}
                          {isPlatform && m.allowSysAuth === false ? (
                            <span
                              style={{ color: '#B6BCC6', cursor: 'not-allowed', fontSize: 13 }}
                              title="该 MCP 服务不允许系统管理员授权给其他空间"
                              onClick={() => toast.error('该 MCP 服务不允许系统管理员授权给其他空间')}
                            >授权空间</span>
                          ) : (
                            <span style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }} onClick={() => setAuthTarget(m)}>授权空间</span>
                          )}
                          <span style={{ color: '#EF4444', cursor: 'pointer', fontSize: 13 }} onClick={() => setConfirmDel(m)}>删除</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paged.length > 0 && (
              <Pagination
                page={page} pageSize={pageSize} total={total}
                onChange={(p, ps) => { setPage(p); if (ps) setPageSize(ps); }}
              />
            )}
          </div>
        </div>
      </div>

      {/* MCP 详情弹窗 */}
      {detailMcp && (
        <MCPDetailDialog
          mcp={detailMcp}
          isPlatform={isPlatform}
          viewTab={viewTab}
          onToggleToolPublished={toggleToolPublished}
          onToggleToolGlobal={toggleToolGlobal}
          onClose={() => setDetailMcp(null)}
        />
      )}

      {/* 编辑 / 注册弹窗 */}
      {editing && (
        <MCPEditDialog
          initial={editing}
          isPlatform={isPlatform}
          onClose={() => setEditing(null)}
          onSubmit={(m) => {
            upsertMcp(m);
            toast.success(editing.id ? '修改成功' : '注册成功');
            setEditing(null);
          }}
        />
      )}

      {/* 授权空间弹窗 */}
      {authTarget && (
        <AuthorizeSpaceDialog
          resource={authTarget}
          resourceType="MCP服务"
          onClose={() => setAuthTarget(null)}
          onSubmit={(openScope, openTenants, allowSysAuth) => {
            upsertMcp({ ...authTarget, openScope, openTenants, allowSysAuth });
            toast.success(`MCP服务「${authTarget.name}」空间授权已更新`);
            setAuthTarget(null);
          }}
        />
      )}

      {/* 中心查看详情弹窗（只读） */}
      {viewing && (
        <MCPEditDialog
          initial={viewing}
          isPlatform={isPlatform}
          readOnly
          onClose={() => setViewing(null)}
        />
      )}

      {/* 启用范围选择弹窗 */}
      {enabling && (
        <EnableScopeDialog
          resource={enabling}
          resourceType="mcp"
          managedTenants={managedTenants}
          tools={enabling.tools || []}
          onClose={() => setEnabling(null)}
          onConfirm={handleEnable}
        />
      )}

      <Confirm
        open={!!confirmDel}
        title="删除 MCP 服务确认"
        content={
          <div>
            确定要删除 MCP 服务 <strong style={{ color: '#E89E57' }}>{confirmDel?.name}</strong> 吗？
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C', marginTop: 12
            }}>
              ⚠️ 删除后所有已关联该 MCP 的 Buddy 空间将不可用，操作不可恢复。
            </div>
          </div>
        }
        danger
        onOk={() => {
          deleteMcp(confirmDel.id);
          toast.success(`已删除 ${confirmDel.name}`);
          setConfirmDel(null);
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

// ========== MCP 服务详情弹窗（工具列表视图） ==========
function MCPDetailDialog({ mcp, isPlatform, viewTab, onToggleToolPublished, onToggleToolGlobal, onClose }) {
  const tools = mcp.tools || [];
  const mcpId = mcp.id;
  const toast = useToast();
  // 工具上架状态：系统管理员 / 空间管理员"我的MCP服务"中可编辑；"MCP服务中心"只读
  const canEditToolPublish = isPlatform || (!isPlatform && viewTab === 'mine');

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [jumpTo, setJumpTo] = useState('');

  const total = tools.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTools = tools.slice((safePage - 1) * pageSize, safePage * pageSize);

  // 模拟连接测试
  const handleTest = () => {
    toast.info('正在连接测试…');
    setTimeout(() => toast.success(`服务「${mcp.name}」连接成功`), 800);
  };
  // 模拟重新加载
  const handleReload = () => {
    toast.info('正在重新加载工具列表…');
    setTimeout(() => toast.success('工具列表已更新'), 600);
  };

  // 分页渲染
  const renderPagination = () => {
    if (total === 0) return null;
    const pages = [];
    const addPage = (p) => pages.push(
      <button
        key={p}
        onClick={() => setCurrentPage(p)}
        style={{
          minWidth: 32, height: 32, padding: '0 8px',
          border: '1px solid ' + (p === safePage ? '#E89E57' : '#E5E7EB'),
          background: p === safePage ? '#E89E57' : '#fff',
          color: p === safePage ? '#fff' : '#4B5563',
          borderRadius: 4, cursor: 'pointer', fontSize: 13,
        }}
      >{p}</button>
    );
    addPage(1);
    if (safePage > 3) pages.push(<span key="l-ell" style={{ padding: '0 4px', color: '#9CA3AF' }}>…</span>);
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) addPage(p);
    if (safePage < totalPages - 2) pages.push(<span key="r-ell" style={{ padding: '0 4px', color: '#9CA3AF' }}>…</span>);
    if (totalPages > 1) addPage(totalPages);

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', marginTop: 12,
        fontSize: 13, color: '#6B7280',
      }}>
        <div>
          共 <strong style={{ color: '#1F2937' }}>{total}</strong> 条数据
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>{pages}</div>
          {safePage < totalPages && (
            <button
              onClick={() => setCurrentPage(safePage + 1)}
              style={{
                minWidth: 32, height: 32, padding: '0 8px',
                border: '1px solid #E5E7EB', background: '#fff',
                color: '#4B5563', borderRadius: 4, cursor: 'pointer', fontSize: 13,
              }}
            >{'>'}</button>
          )}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            style={{ height: 32, padding: '0 8px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 13 }}
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>
          <span style={{ marginLeft: 8 }}>跳至</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpTo}
            onChange={(e) => setJumpTo(e.target.value)}
            style={{ width: 56, height: 32, padding: '0 8px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 13 }}
          />
          <span>页</span>
          <button
            onClick={() => {
              const p = Math.min(Math.max(1, Number(jumpTo) || 1), totalPages);
              setCurrentPage(p);
              setJumpTo('');
            }}
            style={{
              height: 32, padding: '0 12px', border: '1px solid #E89E57',
              background: '#fff', color: '#E89E57', borderRadius: 4,
              cursor: 'pointer', fontSize: 13,
            }}
          >确定</button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open
      title="MCP工具列表"
      onClose={onClose}
      width="xwide"
      footer={
        <button className="btn btn-primary" onClick={onClose}>关闭</button>
      }
    >
      <div>
        {/* 子头部：服务信息 + 操作按钮 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 16px', marginBottom: 12,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>{mcp.name}</span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>共 {total} 个工具</span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              服务地址：<span style={{ fontFamily: 'monospace', color: '#374151' }}>{mcp.serviceUrl || '-'}</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              className="btn btn-default"
              onClick={handleTest}
              style={{ fontSize: 13 }}
            >
              连接测试
            </button>
            <button
              className="btn btn-default"
              onClick={handleReload}
              style={{ fontSize: 13 }}
            >
              重新加载
            </button>
          </div>
        </div>

        {/* 工具列表 */}
        {total === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: '#9CA3AF',
            fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8,
            background: '#fff',
          }}>
            暂无工具数据
          </div>
        ) : (
          <div style={{
            border: '1px solid #E5E7EB', borderRadius: 8,
            background: '#fff', overflow: 'hidden',
          }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th width={150}>工具名称</th>
                    <th width={140}>能力描述</th>
                    <th>工具调用说明</th>
                    <th width={110}>上架状态</th>
                    <th width={260}>参数列表</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTools.map((tool, i) => {
                    const isPublished = tool.published !== false;

                    return (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#1F2937' }}>
                          {tool.name}
                        </td>
                        <td style={{ fontSize: 13, color: '#4B5563' }}>{tool.label}</td>
                        <td style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
                          {tool.usage || <span style={{ color: '#9CA3AF' }}>—</span>}
                        </td>
                        <td>
                          {canEditToolPublish ? (
                            <Toggle
                              checked={isPublished}
                              onChange={() => onToggleToolPublished(mcpId, i)}
                            />
                          ) : (
                            <Toggle checked={isPublished} disabled />
                          )}
                        </td>
                        <td>
                          {(tool.params || []).length === 0 ? (
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>无参数</span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {tool.params.map((p, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    fontSize: 12,
                                  }}
                                >
                                  <span style={{
                                    fontFamily: 'monospace', color: '#1F2937',
                                    minWidth: 90, fontWeight: 500,
                                  }}>{p.name}</span>
                                  <span style={{
                                    fontFamily: 'monospace', color: '#6B7280',
                                    minWidth: 56,
                                  }}>{p.type}</span>
                                  <span style={{
                                    color: p.required ? '#DC2626' : '#9CA3AF',
                                    minWidth: 32,
                                  }}>{p.required ? '必填' : '可选'}</span>
                                  <span style={{ color: '#4B5563', flex: 1 }}>{p.desc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </div>
        )}
      </div>
    </Modal>
  );
}

function MCPEditDialog({ initial, isPlatform, onClose, onSubmit, readOnly }) {
  const { user } = useRole();
  const { tenants } = useStore();
  // 空间管理员可管理的空间（「所属空间」下拉选项来源）
  const ownedTenants = isPlatform
    ? []
    : tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));
  const [form, setForm] = useState(() => ({
    enabled: true,
    openScope: 'all',
    openTenants: [],
    tools: [],
    source: '招小顾',
    category: '投研服务',
    status: '已上架',
    creator: user.fullName || '系统管理员',
    creatorTenant: user.tenantId || null,
    serviceUrl: 'https://api.example.com/api/mcp',
    transport: 'stdio',
    apiKey: '',
    authHeaders: '',
    remark: '',
    spaceOnlyVisible: false,
    allowSysAuth: true,
    ...initial,
  }));
  const [tab, setTab] = useState('base');
  const tabs = [
    { k: 'base', label: '基础信息' },
    { k: 'auth', label: '授权设置' },
  ];
  const activeTab = tabs.some((t) => t.k === tab) ? tab : 'base';

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name) return false;
    // 用户自定义的来源渠道写入字典
    addDictItem(platformSources, form.source);
    onSubmit({
      ...form,
      status: form.enabled ? '已上架' : '已下架',
      updateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    return true;
  };

  return (
    <Modal
      open
      title={readOnly ? 'MCP 服务详情' : (initial?.id ? '编辑 MCP 服务' : 'MCP 服务注册')}
      onClose={onClose}
      width={900}
      footer={
        readOnly ? (
          <button className="btn btn-primary" onClick={onClose}>关闭</button>
        ) : (
          <>
            <button className="btn btn-default" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={submit}>确认</button>
          </>
        )
      }
    >
      <div style={{ display: 'flex', minHeight: 460 }}>
        {/* 左侧 Tab - 无工具列表页签 */}
        <div style={{ width: 110, borderRight: '1px solid #F2F4F7', flexShrink: 0, background: '#FBFCFD' }}>
          {tabs.map((t) => {
            const active = activeTab === t.k;
            return (
              <div
                key={t.k}
                onClick={() => setTab(t.k)}
                style={{
                  padding: '12px 14px', cursor: 'pointer', fontSize: 13,
                  color: active ? '#E89E57' : '#4B5563',
                  background: active ? '#FBF1E5' : 'transparent',
                  borderLeft: active ? '3px solid #E89E57' : '3px solid transparent',
                  fontWeight: active ? 500 : 400,
                }}
              >{t.label}</div>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: 16, maxHeight: 480, overflow: 'auto' }}>
          {tab === 'base' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
              <Field label="MCP 分类" required>
                <select className="select" value={form.category} disabled={readOnly} onChange={(e) => set('category', e.target.value)}>
                  {MCP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="MCP 名称" required>
                <input className="input" value={form.name || ''} disabled={readOnly} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="来源渠道" required>
                <SelectCombobox
                  value={form.source}
                  options={platformSources}
                  placeholder="选择或输入新的来源渠道"
                  disabled={readOnly}
                  onChange={(v) => set('source', v)}
                />
              </Field>
              <Field label="服务地址" required>
                <input className="input" value={form.serviceUrl || ''} disabled={readOnly} onChange={(e) => set('serviceUrl', e.target.value)} placeholder="https://api.example.com/api/mcp" />
              </Field>
              <Field label="传输协议">
                <select className="select" value={form.transport} disabled={readOnly} onChange={(e) => set('transport', e.target.value)}>
                  <option>stdio</option>
                  <option>sse</option>
                  <option>http</option>
                </select>
              </Field>
              <Field label="API_Key">
                <input className="input" value={form.apiKey || ''} disabled={readOnly} onChange={(e) => set('apiKey', e.target.value)} placeholder="选填" />
              </Field>
              <Field label="认证 Header（JSON 格式）" full>
                <textarea
                  className="input" rows={4} value={form.authHeaders || ''}
                  disabled={readOnly}
                  onChange={(e) => set('authHeaders', e.target.value)}
                  placeholder='{"Authorization": "Bearer xxx"}'
                  style={{ fontFamily: 'monospace' }}
                />
              </Field>
              <Field label="备注" full>
                <textarea
                  className="input" rows={3} value={form.remark || ''}
                  disabled={readOnly}
                  onChange={(e) => set('remark', e.target.value)}
                />
              </Field>
              <Field label="上架状态">
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Toggle checked={form.enabled} disabled={readOnly} onChange={(v) => set('enabled', v)} />
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{form.enabled ? '已上架' : '已下架'}</span>
                </div>
              </Field>
              {/* 所属空间：与上架状态并列一行；查看详情（readOnly）时不展示，仅编辑时保留 */}
              {!isPlatform && !readOnly && (
                <Field label="所属空间">
                  <select
                    className="select"
                    style={{ maxWidth: 360 }}
                    value={form.creatorTenant || user.tenantId || ''}
                    disabled={readOnly}
                    onChange={(e) => set('creatorTenant', e.target.value)}
                  >
                    {ownedTenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.brandName}（{t.nickname}）</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}

          {activeTab === 'auth' && (
            <div>
              <div style={{ marginBottom: 12, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                配置该 MCP 服务的开放范围与共享授权策略，保存后立即生效。
                {readOnly && '（当前为只读查看模式）'}
              </div>
              <AuthSettingsSection
                resourceType="MCP服务"
                resource={{
                  id: form.id,
                  name: form.name,
                  openScope: form.openScope,
                  openTenants: form.openTenants || [],
                }}
                allowSysAuth={form.allowSysAuth !== false}
                readOnly={readOnly}
                onChange={set}
              />
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
}

function Field({ label, required, children, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
        {required && <span style={{ color: '#EF4444' }}>*</span>} {label}
      </div>
      {children}
    </div>
  );
}
