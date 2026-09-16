import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { ChatbotDialog } from '../../components/ChatbotDialog.jsx';
import { AuthorizeSpaceDialog } from '../../components/AuthorizeSpaceDialog.jsx';
import { AuthorizeUserDialog } from '../../components/AuthorizeUserDialog.jsx';
import { AuthSettingsSection } from '../../components/AuthSettingsSection.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { SelectCombobox } from '../../components/SelectCombobox.jsx';
import { skillCategories, platformSources, businessOwners, addDictItem } from '../../data/mock.js';

export function SkillManagement() {
  const { user } = useRole();
  const { skills, tenants, upsertSkill, deleteSkill } = useStore();
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

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [spaceAuthTarget, setSpaceAuthTarget] = useState(null); // 授权空间弹窗目标技能
  const [userAuthTarget, setUserAuthTarget] = useState(null); // 授权用户弹窗目标技能
  const [confirmDel, setConfirmDel] = useState(null);
  const [viewTab, setViewTab] = useState('center');
  const [viewingDetail, setViewingDetail] = useState(null); // 查看详情弹窗
  const [chatbotSkill, setChatbotSkill] = useState(null); // 测试技能弹窗
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null); // 三点操作菜单当前打开行

  // 点击页面其它区域关闭三点菜单
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => {
      if (!e.target.closest('[data-skill-action-menu]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  // 复制技能：以原技能为模板进入添加模式（id 清空 → upsert 视为新增）
  const handleCopySkill = (s) => {
    setEditing({ ...s, id: undefined, name: (s.name || '') + '_copy', __copy: true });
  };

  // 技能 → 弹窗兼容的 expert 结构
  const toChatbotExpert = (s) => ({
    id: s.id,
    name: s.name,
    nickname: undefined,
    avatar: s.icon || `https://api.dicebear.com/7.x/icons/svg?seed=${s.code || s.id}`,
    description: s.desc,
    tags: s.tags || [],
    mcpIds: [],
    skillIds: [s.id],
  });

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let list = skills.filter((s) => {
      const matchK = !k || s.name.toLowerCase().includes(k);
      const matchC = !category || s.category === category;
      const matchS = !sourceFilter || s.source === sourceFilter;
      return matchK && matchC && matchS;
    });

    if (!isPlatform) {
      if (viewTab === 'mine') {
        list = list.filter((s) => s.creatorTenant === user.tenantId);
      } else if (viewTab === 'granted') {
        // 授权给我的：其他主体（系统/其他空间）创建并显式授权给本空间的技能
        list = list.filter((s) => (s.openTenants || []).includes(user.tenantId) && s.creatorTenant !== user.tenantId);
      } else {
        // Skill技能库：展示平台所有已上架/启用的技能（含未授权给本空间的平台开放资源）；
        // 「仅限本空间可见」且属于其他空间创建的技能对当前空间不可见
        list = list.filter(
          (s) =>
            s.enabled !== false &&
            s.status !== '已下架' &&
            !(s.spaceOnlyVisible && s.creatorTenant && s.creatorTenant !== user.tenantId)
        );
      }
    }
    return list;
  }, [skills, keyword, category, sourceFilter, isPlatform, viewTab, user]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmit = (form) => {
    upsertSkill(form);
    toast.success(editing?.id ? '修改成功' : '添加成功');
    setEditing(null);
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Skill 技能管理</h1>
            <div className="page-desc">
              {isPlatform
                ? '管理全平台的 Skill 技能资源，设置是否全局开放或指定特定 Buddy 空间开放。'
                : '管理本空间的 Skill 技能，或从Skill技能库一键启用平台开放资源。'}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setEditing({})}>
              <Icon name="plus" size={14} />
              添加技能
            </button>
          </div>
        </div>

        {/* 空间管理员双Tab - 无统计数字 */}
        {!isPlatform && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #F2F4F7' }}>
            {[
              { k: 'center', label: 'Skill技能库' },
              { k: 'granted', label: '授权给我的' },
              { k: 'mine', label: '管理空间技能' },
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

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          {/* 筛选区 */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '12px 16px', borderBottom: '1px solid #F2F4F7',
            background: '#FBFCFD'
          }}>
            <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
              <option value="">技能分类</option>
              {skillCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
            {isPlatform && (
              <select className="select" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
                <option value="">全部来源</option>
                {[...platformSources, 'Agenthub'].map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
            <input
              className="input"
              placeholder="技能名称"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              style={{ maxWidth: 240 }}
            />
            <button className="btn btn-default" onClick={() => { setKeyword(''); setCategory(''); setSourceFilter(''); setPage(1); }}>
              <Icon name="refresh" size={12} />
              重置
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>
              共 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 个技能
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th width={90}>ID</th>
                  <th width={120}>技能名称</th>
                  <th width={140}>技能所在目录</th>
                  <th width={110}>技能分类</th>
                  {(isPlatform || viewTab === 'mine') && <th width={90}>上架状态</th>}
                  <th width={150}>授权空间</th>
                  <th width={110}>所属空间</th>
                  <th width={110}>来源渠道</th>
                  <th width={110}>业务归属方</th>
                  <th width={100}>更新人</th>
                  <th width={140}>更新时间</th>
                  <th width={120}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={(isPlatform || viewTab === 'mine') ? 12 : 11}>
                      <Empty icon="🧩" tip={viewTab === 'center' ? '暂无平台开放资源' : viewTab === 'granted' ? '暂无其他空间授权给你的技能' : '暂无技能数据，请先添加'} />
                    </td>
                  </tr>
                )}
                {paged.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{s.id}</td>
                    <td style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer' }} onClick={() => setChatbotSkill(s)}>{s.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{s.code}</td>
                    <td><Tag color="info">{s.category}</Tag></td>
                    {(isPlatform || viewTab === 'mine') && (
                      <td>
                        {isPlatform && s.creatorTenant ? (
                          // 系统管理员视角：空间管理员创建的技能仅文字展示上下架状态
                          <span style={{ color: s.enabled === false ? '#9CA3AF' : '#15803D', fontSize: 13 }}>
                            {s.enabled === false ? '已下架' : '已上架'}
                          </span>
                        ) : (
                          <Toggle
                            checked={s.enabled}
                            disabled={s.source === 'Agenthub' && s.status === '已下架'}
                            onChange={() => upsertSkill({ ...s, enabled: !s.enabled })}
                          />
                        )}
                      </td>
                    )}
                    <td>
                      {s.openScope === 'all' || s.openScope === 'private' ? (
                        <Tag color="success">全局开放</Tag>
  ) : (s.openTenants || []).length > 0 ? (
                        <Tag color="warning" title={( s.openTenants || []).map((tid) => { const t = tenants.find((tn) => tn.id === tid); return t ? t.brandName : tid; }).join('、')}>
                        {(s.openTenants || []).length} 个空间
                      </Tag>
                      ) : (
                        <Tag color="default">暂未授权</Tag>
                      )}
                    </td>
                    <td>{renderOwnedCell(s.creatorTenant)}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>
                      {s.source}
                      {s.source === 'Agenthub' && s.status === '已下架' && (
                        <div style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>已下线</div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{s.businessOwner || '—'}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{s.creator || '—'}</td>
                    <td style={{ fontSize: 12, color: '#9CA3AF' }}>{s.updateTime}</td>
                    <td>
                      <div data-skill-action-menu style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                        <span
                          style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                          onClick={() => setChatbotSkill(s)}
                        >测试技能</span>
                        <button
                          type="button"
                          aria-label="更多操作"
                          title="更多操作"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === s.id ? null : s.id);
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
                        {openMenuId === s.id && (() => {
                          // 菜单项按场景动态组装
                          const items = [];
                          if (!isPlatform && viewTab === 'center') {
                            items.push({ key: 'view', label: '查看详情', onClick: () => setViewingDetail(s) });
                          } else if (!isPlatform && viewTab === 'granted') {
                            // 授权给我的：查看详情 + 授权用户（授权至本空间内用户）
                            items.push({ key: 'view', label: '查看详情', onClick: () => setViewingDetail(s) });
                            items.push({ key: 'authUser', label: '授权用户', onClick: () => setUserAuthTarget(s) });
                          } else {
                            items.push({ key: 'edit', label: '编辑', onClick: () => setEditing(s) });
                            // 空间创建的技能若关闭「允许系统管理员授权」，系统管理员的「授权空间」入口禁用
                            const authSpaceBlocked = isPlatform && s.allowSysAuth === false;
                            items.push({ key: 'authSpace', label: '授权空间', disabled: authSpaceBlocked, onClick: () => setSpaceAuthTarget(s) });
                            // 授权用户：仅空间管理员提供（系统管理员视角用户级授权收敛，不提供该入口）
                            if (!isPlatform) {
                              items.push({ key: 'authUser', label: '授权用户', onClick: () => setUserAuthTarget(s) });
                            }
                            // 复制技能：仅对已上架 + 当前用户有权限的资源可见
                            const listed = s.enabled !== false && s.status !== '已下架';
                            const canCopy = isPlatform || s.creatorTenant === user.tenantId;
                            if (listed && canCopy) {
                              items.push({ key: 'copy', label: '复制', onClick: () => handleCopySkill(s) });
                            }
                            // 删除：空间管理员在「管理空间技能」中的行均属本空间自建，均可删除（含来源填 Agenthub 的自建技能）；
                            // 平台视角保留「Agenthub 同步技能不可删除」约束
                            const canDelete = isPlatform ? s.source !== 'Agenthub' : true;
                            if (canDelete) {
                              items.push({ key: 'del', label: '删除', danger: true, onClick: () => setConfirmDel(s) });
                            }
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
                                  title={it.disabled ? `该技能不允许系统管理员授权给其他空间` : undefined}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    if (it.disabled) {
                                      toast.error('该技能不允许系统管理员授权给其他空间');
                                      return;
                                    }
                                    it.onClick();
                                  }}
                                  onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = it.danger ? '#FEF2F2' : '#F5F6F8'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                  style={{
                                    padding: '8px 12px', cursor: it.disabled ? 'not-allowed' : 'pointer', fontSize: 13,
                                    color: it.disabled ? '#B6BCC6' : (it.danger ? '#EF4444' : '#4B5563'), borderRadius: 4,
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
                onChange={(p, ps) => { setPage(p); if (ps) setPageSize(ps); }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 编辑 / 添加弹窗 */}
      {editing && (
        <SkillEditDialog
          initial={editing}
          isPlatform={isPlatform}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      )}

      {/* 查看详情弹窗（复用编辑弹窗布局，readOnly 模式） */}
      {viewingDetail && (
        <SkillEditDialog
          initial={viewingDetail}
          isPlatform={isPlatform}
          readOnly
          onClose={() => setViewingDetail(null)}
        />
      )}

      {/* 测试技能弹窗 */}
      {chatbotSkill && (
        <ChatbotDialog
          expert={toChatbotExpert(chatbotSkill)}
          onClose={() => setChatbotSkill(null)}
          showQuickQuestions={false}
          showTags={false}
          showGreeting={false}
        />
      )}

      {/* 授权空间弹窗 */}
      {spaceAuthTarget && (
        <AuthorizeSpaceDialog
          resource={spaceAuthTarget}
          resourceType="技能"
          onClose={() => setSpaceAuthTarget(null)}
          onSubmit={(openScope, openTenants, allowSysAuth) => {
            upsertSkill({ ...spaceAuthTarget, openScope, openTenants, allowSysAuth });
            toast.success(`技能「${spaceAuthTarget.name}」空间授权已更新`);
            setSpaceAuthTarget(null);
          }}
        />
      )}

      {/* 授权用户弹窗 */}
      {userAuthTarget && (
        <AuthorizeUserDialog
          resource={userAuthTarget}
          resourceType="技能"
          onClose={() => setUserAuthTarget(null)}
          onSubmit={(userAuth) => {
            upsertSkill({ ...userAuthTarget, userAuth });
            toast.success(`技能「${userAuthTarget.name}」用户授权已更新`);
            setUserAuthTarget(null);
          }}
        />
      )}

      {/* 删除确认 */}
      <Confirm
        open={!!confirmDel}
        title="删除技能确认"
        content={
          <div>
            确定要删除技能 <strong style={{ color: '#E89E57' }}>{confirmDel?.name}</strong> 吗？
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C', marginTop: 12
            }}>
              ⚠️ 删除后已关联该技能的所有空间将无法继续使用，操作不可恢复。
            </div>
          </div>
        }
        danger
        onOk={() => {
          deleteSkill(confirmDel.id);
          toast.success(`技能 ${confirmDel.name} 已删除`);
          setConfirmDel(null);
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

// ========== 启用范围选择弹窗 ==========
export function EnableScopeDialog({ resource, resourceType, managedTenants, tools = [], onClose, onConfirm }) {
  const [selectedTenants, setSelectedTenants] = useState(
    managedTenants.length === 1 ? [managedTenants[0].id] : []
  );
  const [selectedTools, setSelectedTools] = useState([]);
  const [defaultEnabled, setDefaultEnabled] = useState(true);

  const toggleTenant = (id) => {
    setSelectedTenants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTool = (name) => {
    setSelectedTools((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const labelMap = {
    skill: '技能',
    mcp: 'MCP 服务',
    expert: '专家助理',
    template: '任务模板',
  };
  const verbMap = {
    skill: '安装',
    mcp: '启用',
    expert: '启用',
    template: '启用',
  };
  const label = labelMap[resourceType] || '资源';
  const verb = verbMap[resourceType] || '启用';

  return (
    <Modal
      open
      title={`${verb}${label} - ${resource.name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            disabled={selectedTenants.length === 0 || (resourceType === 'mcp' && selectedTools.length === 0)}
            onClick={() => onConfirm(selectedTenants, selectedTools, defaultEnabled)}
          >
            确认{verb}
          </button>
        </>
      }
    >
      <div style={{ minWidth: 460, maxHeight: 480, overflow: 'auto' }}>
        {/* 选择启用空间 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>
            选择启用的 Buddy 空间
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
            请选择要将该{label}{verb}到哪些空间（您可管理的所有空间）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {managedTenants.map((t) => {
              const checked = selectedTenants.includes(t.id);
              return (
                <label
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                    border: '1px solid ' + (checked ? '#E89E57' : '#E5E7EB'),
                    background: checked ? '#FBF1E5' : '#fff',
                    color: checked ? '#B87136' : '#4B5563',
                    borderRadius: 6, cursor: 'pointer', fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox" style={{ display: 'none' }}
                    checked={checked}
                    onChange={() => toggleTenant(t.id)}
                  />
                  <img src={t.logo} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
                  <span style={{ flex: 1 }}>{t.brandName}</span>
                  {checked && <Icon name="check" size={12} />}
                </label>
              );
            })}
          </div>
        </div>

        {/* 技能默认启用选项 */}
        {resourceType === 'skill' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>
              安装选项
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', border: '1px solid #E5E7EB',
              borderRadius: 6, background: '#FBFCFD',
            }}>
              <Toggle checked={defaultEnabled} onChange={setDefaultEnabled} />
              <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>是否默认启用</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                开启后，该技能安装到所选空间后将自动启用
              </span>
            </div>
          </div>
        )}

        {/* MCP 工具选择 */}
        {resourceType === 'mcp' && tools.length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>
              选择启用的工具
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
              该 MCP 服务包含以下工具，请选择需要启用的工具
            </div>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 6 }}>
              {tools.map((tool, i) => {
                const checked = selectedTools.includes(tool.name);
                return (
                  <label
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderBottom: i < tools.length - 1 ? '1px solid #F2F4F7' : 'none',
                      background: checked ? '#FBF1E5' : '#fff',
                      cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox" style={{ display: 'none' }}
                      checked={checked}
                      onChange={() => toggleTool(tool.name)}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280', minWidth: 200 }}>
                      {tool.name}
                    </span>
                    <span style={{ flex: 1, color: '#4B5563' }}>{tool.label}</span>
                    {checked && <Icon name="check" size={12} color="#E89E57" />}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div style={{
          marginTop: 16, padding: 10, background: '#FFFBEB',
          border: '1px solid #FCD34D', borderRadius: 6, fontSize: 12, color: '#92400E'
        }}>
          <Icon name="doc" size={12} color="#B45309" /> {verb}后，所选空间的用户即可使用该{label}。您可随时在「我的{label}」中管理已{verb}的资源。
        </div>
      </div>
    </Modal>
  );
}

// ========== 添加/编辑技能弹窗 ==========
function SkillEditDialog({ initial, isPlatform, onClose, onSubmit, readOnly }) {
  const { user } = useRole();
  const { tenants, mcps } = useStore();
  const toast = useToast();
  // 空间管理员可管理的空间（「所属空间」下拉选项来源）
  const ownedTenants = isPlatform
    ? []
    : tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));
  const [form, setForm] = useState(() => ({
    enabled: true,
    openScope: 'all',
    openTenants: [],
    source: '招小顾',
    category: skillCategories[0],
    creator: user.fullName || '系统管理员',
    creatorTenant: user.tenantId || null,
    icon: '',
    editMode: 'online',
    skillContent: '',
    businessOwner: '数字化办公室',
    cloudCompute: '支持',
    mcpIds: [],
    mcpToolMap: {},
    spaceOnlyVisible: false,
    allowSysAuth: true,
    ...initial,
  }));
  const [tab, setTab] = useState('base');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Agenthub 同步的技能：来源渠道不可编辑、技能内容只读
  const isSkillhub = form.source === 'Agenthub';
  // Agenthub 已下架技能：上架状态锁定，不可编辑
  const skillOffline = isSkillhub && form.status === '已下架';
  const tabs = [
    { k: 'base', label: '基础信息' },
    { k: 'edit', label: '技能编辑' },
    { k: 'browse', label: '浏览技能' },
    { k: 'auth', label: '授权设置' },
  ];
  if (isSkillhub) tabs.push({ k: 'meta', label: '其他信息' });
  const activeTab = tabs.some((t) => t.k === tab) ? tab : 'base';

  const submit = () => {
    if (!form.name) {
      toast.error('请填写技能名称');
      return false;
    }
    if (!form.mcpIds || form.mcpIds.length === 0) {
      toast.error('请关联至少一个 MCP 服务');
      setTab('base');
      return false;
    }
    // 用户自定义的来源渠道 / 业务归属方写入字典
    addDictItem(platformSources, form.source);
    addDictItem(businessOwners, form.businessOwner);
    onSubmit({
      ...form,
      code: form.code || form.name.toLowerCase().replace(/\s+/g, '_'),
      updateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    return true;
  };

  return (
    <Modal
      open
      title={readOnly ? `技能详情 - ${initial?.name || ''}` : (initial?.id && !initial?.__copy ? '编辑技能' : '添加技能')}
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
      <div style={{ display: 'flex', gap: 0, minHeight: 460 }}>
        {/* 左侧 Tab */}
        <div style={{
          width: 110, borderRight: '1px solid #F2F4F7', flexShrink: 0,
          display: 'flex', flexDirection: 'column', background: '#FBFCFD',
        }}>
          {tabs.map((t) => {
            const active = activeTab === t.k;
            return (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 14px', cursor: 'pointer', fontSize: 13,
                  fontFamily: 'inherit', background: 'none', border: 'none',
                  borderLeft: '3px solid ' + (active ? '#E89E57' : 'transparent'),
                  color: active ? '#E89E57' : '#4B5563',
                  background: active ? '#FBF1E5' : 'transparent',
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#F5F6F8'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; } }}
              >{t.label}</button>
            );
          })}
        </div>

        {/* 右侧表单 */}
        <div style={{ flex: 1, padding: 16, maxHeight: 480, overflow: 'auto' }}>
          {activeTab === 'base' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
              <Field label="技能名称" required>
                <input className="input" value={form.name || ''} onChange={(e) => set('name', e.target.value)} disabled={readOnly} />
              </Field>
              <Field label="技能编码" required>
                <input className="input" value={form.code || ''} onChange={(e) => set('code', e.target.value)} placeholder="例如 hot_news" disabled={readOnly} />
              </Field>
              <Field label="所属分类" required>
                <select className="select" value={form.category} onChange={(e) => set('category', e.target.value)} disabled={readOnly}>
                  {skillCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="来源渠道" required>
                <SelectCombobox
                  value={form.source}
                  options={platformSources}
                  placeholder="选择或输入新的来源渠道"
                  disabled={readOnly || isSkillhub}
                  onChange={(v) => set('source', v)}
                />
                {isSkillhub && (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                    该技能由 Agenthub 同步，来源渠道不可修改
                  </div>
                )}
              </Field>
              <Field label="业务归属方" required>
                <SelectCombobox
                  value={form.businessOwner || ''}
                  options={businessOwners}
                  placeholder="选择或输入新的业务归属方"
                  disabled={readOnly}
                  onChange={(v) => set('businessOwner', v)}
                />
              </Field>
              <Field label="云上算力" required>
                <select className="select" value={form.cloudCompute || '支持'} onChange={(e) => set('cloudCompute', e.target.value)} disabled={readOnly}>
                  <option value="支持">支持</option>
                  <option value="不支持">不支持</option>
                </select>
              </Field>
              <Field label="关联MCP工具" required full>
                <MCPToolSelect
                  mcps={mcps}
                  mcpIds={form.mcpIds || []}
                  mcpToolMap={form.mcpToolMap || {}}
                  onChangeMcpIds={(v) => set('mcpIds', v)}
                  onChangeMcpToolMap={(v) => set('mcpToolMap', v)}
                  readOnly={readOnly}
                />
              </Field>
              <Field label="技能描述" required full>
                <textarea
                  className="input" rows={4} value={form.desc || ''}
                  onChange={(e) => set('desc', e.target.value)}
                  placeholder="详细描述技能能力、调用场景、参数说明等"
                  disabled={readOnly}
                />
              </Field>
              <Field label="技能使用说明/任务指令示例" full>
                <textarea
                  className="input" rows={3} value={form.remark || ''}
                  onChange={(e) => set('remark', e.target.value)}
                  placeholder="填写技能的使用说明、任务指令示例等"
                  disabled={readOnly}
                />
              </Field>
              <Field label="技能图标" full>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {readOnly ? (
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      border: '1px solid #E5E7EB', background: '#F9FAFB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {form.icon ? (
                        <img src={form.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Icon name="package" size={32} color="#D1D5DB" />
                      )}
                    </div>
                  ) : (
                    <ImageUploader
                      value={form.icon || ''}
                      onChange={(v) => set('icon', v)}
                      shape="avatar"
                      height={80}
                    />
                  )}
                  <div style={{ fontSize: 12, color: '#9CA3AF', paddingTop: 4 }}>
                    上传技能的展示图标，将在技能列表和对话界面中展示。
                    <br />建议使用 PNG 格式，透明背景，尺寸 64x64px。
                  </div>
                </div>
              </Field>
              <Field label="上架状态">
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: (readOnly || skillOffline) ? 'default' : 'pointer' }}>
                    <Toggle
                      checked={form.enabled}
                      onChange={(v) => { set('enabled', v); set('status', v ? '已上架' : '未上架'); }}
                      disabled={readOnly || skillOffline}
                    />
                    <span style={{ fontSize: 13, color: '#4B5563' }}>
                      {form.status === '已下架' ? '已下架' : (form.status === '未上架' || !form.enabled ? '未上架' : '已上架')}
                    </span>
                  </label>
                  {skillOffline && (
                    <span style={{ fontSize: 12, color: '#EF4444' }}>该技能已下线，上架状态不可修改</span>
                  )}
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

          {activeTab === 'edit' && (
            <div>
              {isSkillhub ? (
                <>
                  <div style={{
                    padding: 10, background: '#FBF1E5', border: '1px solid #F7E3CC',
                    borderRadius: 6, fontSize: 12, color: '#B87136', marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Icon name="doc" size={12} color="#B87136" />
                    该技能由 Agenthub 同步，仅可查看技能相关信息，不可编辑
                  </div>
                  <MarkdownEditor
                    value={form.skillContent || ''}
                    onChange={() => {}}
                    readOnly
                  />
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 10 }}>选择编辑模式：</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[
                        { k: 'online', label: '在线编辑模式', desc: '通过在线编辑器编写技能提示词与逻辑' },
                        { k: 'upload', label: '上传技能压缩包', desc: '直接上传已打包的技能压缩包文件' },
                      ].map((m) => (
                        <label
                          key={m.k}
                          style={{
                            display: 'flex', flexDirection: 'column', gap: 4,
                            padding: '14px 18px', border: '1px solid ' + (form.editMode === m.k ? '#E89E57' : '#E5E7EB'),
                            background: form.editMode === m.k ? '#FBF1E5' : '#fff',
                            color: form.editMode === m.k ? '#B87136' : '#4B5563',
                            borderRadius: 8, cursor: readOnly ? 'default' : 'pointer', fontSize: 13, flex: 1,
                            fontWeight: form.editMode === m.k ? 500 : 400,
                            opacity: readOnly ? 0.7 : 1,
                          }}
                        >
                          <input
                            type="radio" name="editMode"
                            style={{ display: 'none' }}
                            checked={form.editMode === m.k}
                            onChange={() => set('editMode', m.k)}
                            disabled={readOnly}
                          />
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{m.desc}</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {form.editMode === 'online' ? (
                    <MarkdownEditor
                      value={form.skillContent || ''}
                      onChange={(v) => set('skillContent', v)}
                      readOnly={readOnly}
                    />
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 8 }}>上传技能压缩包</div>
                      {readOnly ? (
                        <div style={{
                          padding: '14px 16px', background: '#F8F9FB',
                          border: '1px solid #E5E7EB', borderRadius: 8,
                          fontSize: 13, color: '#6B7280',
                        }}>
                          {form.skillContent || '未上传压缩包'}
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              border: '2px dashed #E5E7EB', borderRadius: 8,
                              padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                              background: '#FAFBFC', transition: 'all 0.2s',
                            }}
                            onClick={() => document.getElementById('skill-upload-input')?.click()}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E89E57'; e.currentTarget.style.background = '#FBF1E5'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FAFBFC'; }}
                          >
                            <div style={{ fontSize: 36, color: '#D1D5DB', marginBottom: 8 }}>
                              <Icon name="doc" size={36} color="#D1D5DB" />
                            </div>
                            <div style={{ fontSize: 14, color: '#4B5563', fontWeight: 500, marginBottom: 4 }}>
                              点击或拖拽文件到此区域上传
                            </div>
                            <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                              支持 .zip / .tar.gz 格式，压缩包内需包含 SKILL.md 配置文件
                            </div>
                            <input
                              id="skill-upload-input"
                              type="file"
                              accept=".zip,.tar.gz,.tgz"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  set('skillContent', `[已上传压缩包] ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                                }
                              }}
                            />
                          </div>
                          {form.skillContent && form.skillContent.startsWith('[已上传压缩包]') && (
                            <div style={{
                              marginTop: 12, padding: '10px 14px',
                              background: '#F0FDF4', border: '1px solid #BBF7D0',
                              borderRadius: 6, fontSize: 13, color: '#15803D',
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                              <Icon name="check" size={14} color="#15803D" />
                              {form.skillContent}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'browse' && (
            <div>
              <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 4 }}>
                当前技能包的完整目录结构（仅查看，不可点击）
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                根目录：{form.code || form.name || 'skill'}/
              </div>
              <div style={{
                border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 16px',
                background: '#FAFBFC', fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.9,
                color: '#4B5563', maxHeight: 380, overflow: 'auto',
              }}>
                <DirTree tree={buildSkillTree(form)} />
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div>
              <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 4 }}>
                来自 Agenthub 同步的相关信息
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                该技能的发布与运营数据，仅供参考
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <MetaItem label="版本号" value={form.version || '-'} />
                <MetaItem label="下载量" value={form.downloads != null ? Number(form.downloads).toLocaleString() : '-'} />
                <MetaItem label="评分" value={form.rating != null ? `${form.rating} / 5` : '-'} />
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div>
              <div style={{ marginBottom: 12, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                配置该技能的开放范围与共享授权策略，保存后立即生效。
                {readOnly && '（当前为只读查看模式）'}
              </div>
              <AuthSettingsSection
                resourceType="技能"
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

// ========== 浏览技能：目录结构（模拟数据） ==========
function buildSkillTree(form) {
  const root = form.code || form.name || 'skill';
  return {
    name: root,
    type: 'dir',
    children: [
      { name: 'SKILL.md', type: 'file' },
      { name: 'prompt.md', type: 'file' },
      { name: 'requirements.txt', type: 'file' },
      {
        name: 'config', type: 'dir', children: [
          { name: 'settings.yaml', type: 'file' },
          { name: 'rules.json', type: 'file' },
        ],
      },
      {
        name: 'tools', type: 'dir', children: [
          { name: 'search.py', type: 'file' },
          { name: 'qa_engine.py', type: 'file' },
        ],
      },
      {
        name: 'references', type: 'dir', children: [
          { name: 'business_rules.md', type: 'file' },
          { name: 'compliance.md', type: 'file' },
        ],
      },
    ],
  };
}

function DirTree({ tree }) {
  const render = (node, depth, isLast) => {
    const indent = depth * 22;
    const prefix = depth === 0 ? '' : (isLast ? '└── ' : '├── ');
    return (
      <div key={node.name}>
        <div style={{ paddingLeft: indent }}>
          <span style={{ color: '#9CA3AF' }}>{prefix}</span>
          <span style={{ marginRight: 4 }}>{node.type === 'dir' ? '📁' : '📄'}</span>
          <span style={{
            color: node.type === 'dir' ? '#1F2937' : '#6B7280',
            fontWeight: node.type === 'dir' ? 600 : 400,
          }}>
            {node.name}
          </span>
          {node.type === 'dir' && <span style={{ color: '#9CA3AF', fontSize: 11 }}>/</span>}
        </div>
        {node.children && node.children.map((c, i) => render(c, depth + 1, i === node.children.length - 1))}
      </div>
    );
  };
  return <div>{render(tree, 0, true)}</div>;
}

// ========== 其他信息：两列指标卡片 ==========
function MetaItem({ label, value }) {
  return (
    <div style={{
      border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 16px', background: '#fff',
    }}>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>{value}</div>
    </div>
  );
}

// ========== 关联 MCP 工具二级下拉（复选框：勾选 MCP 服务默认全选工具，勾选工具自动选中所属服务） ==========
function MCPToolSelect({ mcps, mcpIds, mcpToolMap, onChangeMcpIds, onChangeMcpToolMap, readOnly }) {
  const [open, setOpen] = useState(false);

  // 勾选/取消 MCP 服务：勾选时默认全选其下工具
  const toggleMcp = (m) => {
    if (mcpIds.includes(m.id)) {
      onChangeMcpIds(mcpIds.filter((x) => x !== m.id));
      const next = { ...mcpToolMap };
      delete next[m.id];
      onChangeMcpToolMap(next);
    } else {
      onChangeMcpIds([...mcpIds, m.id]);
      const allTools = (m.tools || []).map((t) => t.name);
      onChangeMcpToolMap({ ...mcpToolMap, [m.id]: allTools });
    }
  };

  // 单独勾选/取消工具：勾选工具时自动选中一级 MCP 服务
  const toggleTool = (mcpId, toolName) => {
    const cur = mcpToolMap[mcpId] || [];
    const nextTools = cur.includes(toolName)
      ? cur.filter((x) => x !== toolName)
      : [...cur, toolName];
    onChangeMcpToolMap({ ...mcpToolMap, [mcpId]: nextTools });
    if (nextTools.length > 0 && !mcpIds.includes(mcpId)) {
      onChangeMcpIds([...mcpIds, mcpId]);
    }
  };

  const selectedToolsCount = Object.values(mcpToolMap || {}).reduce((n, arr) => n + (arr || []).length, 0);

  return (
    <div>
      <div
        onClick={() => !readOnly && setOpen(!open)}
        style={{
          cursor: readOnly ? 'default' : 'pointer', userSelect: 'none',
          border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 12px',
          background: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontSize: 13, color: '#4B5563',
        }}
      >
        <span>
          {mcpIds.length === 0
            ? '请选择关联的 MCP 服务与工具'
            : `已选择 ${mcpIds.length} 个 MCP 服务 / ${selectedToolsCount} 个工具`}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{open ? '收起' : '展开'}</span>
          <Icon name="chevronDown" size={12} color="#9CA3AF" />
        </span>
      </div>

      {open && (
        <div style={{
          border: '1px solid #E5E7EB', borderRadius: 6, marginTop: 6,
          maxHeight: 280, overflow: 'auto', background: '#fff',
        }}>
          {mcps.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
              暂无 MCP 服务
            </div>
          )}
          {mcps.map((m) => {
            const checked = mcpIds.includes(m.id);
            const tools = m.tools || [];
            const selectedTools = mcpToolMap[m.id] || [];
            return (
              <div key={m.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', cursor: readOnly ? 'default' : 'pointer',
                }}>
                  <input type="checkbox" checked={checked} disabled={readOnly}
                    onChange={() => toggleMcp(m)} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: checked ? '#B87136' : '#9CA3AF' }}>
                    {checked ? `已选 ${selectedTools.length}/${tools.length}` : `${tools.length} 个工具`}
                  </span>
                </label>
                {checked && (
                  <div style={{ padding: '0 12px 8px 32px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {tools.map((t) => {
                      const c = selectedTools.includes(t.name);
                      return (
                        <label key={t.name} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          cursor: readOnly ? 'default' : 'pointer', fontSize: 12, color: '#6B7280',
                        }}>
                          <input type="checkbox" checked={c} disabled={readOnly}
                            onChange={() => toggleTool(m.id, t.name)} />
                          <span style={{ fontSize: 12 }}>{t.label}</span>
                          <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{t.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
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

// ========== Markdown 编辑器组件（带工具栏） ==========
function MarkdownEditor({ value, onChange, readOnly }) {
  const taRef = useRef(null);

  const insertText = useCallback((before, after = '', placeholder = '') => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
      if (cursorPos !== ta.selectionEnd) {
        ta.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }, [value, onChange]);

  const insertLinePrefix = useCallback((prefix) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }, [value, onChange]);

  const insertBlock = useCallback((block) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = value.substring(0, start) + block + value.substring(end);
    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + block.length, start + block.length);
    });
  }, [value, onChange]);

  const tools = [
    { label: 'H1', title: '一级标题', action: () => insertLinePrefix('# ') },
    { label: 'H2', title: '二级标题', action: () => insertLinePrefix('## ') },
    { label: 'H3', title: '三级标题', action: () => insertLinePrefix('### ') },
    { type: 'divider' },
    { label: 'B', title: '粗体', action: () => insertText('**', '**', '粗体文本'), bold: true },
    { label: 'I', title: '斜体', action: () => insertText('*', '*', '斜体文本'), italic: true },
    { label: 'S', title: '删除线', action: () => insertText('~~', '~~', '删除线文本'), strike: true },
    { label: '</>', title: '行内代码', action: () => insertText('`', '`', 'code') },
    { type: 'divider' },
    { label: '“', title: '引用', action: () => insertLinePrefix('> ') },
    { label: '•', title: '无序列表', action: () => insertLinePrefix('- ') },
    { label: '1.', title: '有序列表', action: () => insertLinePrefix('1. ') },
    { label: '☐', title: '任务列表', action: () => insertLinePrefix('- [ ] ') },
    { type: 'divider' },
    { label: '{}', title: '代码块', action: () => insertText('\n```\n', '\n```\n', '代码内容') },
    { label: '—', title: '分割线', action: () => insertBlock('\n---\n') },
    { label: '🔗', title: '链接', action: () => insertText('[', '](url)', '链接文本') },
    { label: '🖼', title: '图片', action: () => insertText('![', '](image-url)', '图片描述') },
    { label: '📑', title: '表格', action: () => insertBlock('\n| 列1 | 列2 | 列3 |\n|---|---|---|\n| 内容 | 内容 | 内容 |\n') },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 8 }}>Markdown 编辑器</div>
      <div style={{
        border: '1px solid #E5E7EB', borderRadius: 6, overflow: 'hidden',
        background: '#fff',
      }}>
        {/* 工具栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '6px 8px', background: '#F8F9FB',
          borderBottom: '1px solid #E5E7EB',
          flexWrap: 'wrap',
        }}>
          {tools.map((tool, i) => {
            if (tool.type === 'divider') {
              return <span key={i} style={{ width: 1, height: 18, background: '#E5E7EB', margin: '0 4px' }} />;
            }
            return (
              <button
                key={i}
                title={tool.title}
                disabled={readOnly}
                onClick={tool.action}
                style={{
                  minWidth: 28, height: 28, padding: '0 6px',
                  border: 'none', background: 'transparent',
                  borderRadius: 4, cursor: readOnly ? 'default' : 'pointer',
                  fontSize: 13, color: '#4B5563',
                  fontWeight: tool.bold ? 700 : tool.italic ? 400 : 500,
                  fontStyle: tool.italic ? 'italic' : 'normal',
                  textDecoration: tool.strike ? 'line-through' : 'none',
                  fontFamily: tool.label === '</>' || tool.label === '{}' ? "'SF Mono', monospace" : 'inherit',
                  opacity: readOnly ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!readOnly) { e.currentTarget.style.background = '#E89E5720'; e.currentTarget.style.color = '#E89E57'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5563'; }}
              >
                {tool.label}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>Markdown</span>
        </div>

        {/* 文本编辑区 */}
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={'# 技能提示词\n\n请在此编写技能的系统提示词与调用逻辑...\n\n## 调用示例\n\n```\n用户输入: ...\n技能响应: ...\n```'}
          style={{
            width: '100%', minHeight: 280, padding: '14px 16px',
            background: readOnly ? '#F8F9FB' : '#FAFBFC',
            border: 'none', outline: 'none',
            color: '#1F2937', fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 13, lineHeight: 1.6, resize: 'vertical',
          }}
        />

        {/* 底部状态栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 12px', background: '#F8F9FB',
          borderTop: '1px solid #E5E7EB',
          fontSize: 11, color: '#9CA3AF',
        }}>
          <span>支持 Markdown 语法</span>
          <span>{value.length} 字符 · {value.split('\n').length} 行</span>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
        可编写技能的系统提示词、参数说明、调用逻辑等内容，工具栏支持快捷插入常用 Markdown 格式。
      </div>
    </div>
  );
}

