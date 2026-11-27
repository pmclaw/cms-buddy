import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { Checkbox } from '../../components/Checkbox.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { ChatbotDialog } from '../../components/ChatbotDialog.jsx';
import { AuthorizeSpaceDialog } from '../../components/AuthorizeSpaceDialog.jsx';
import { AuthorizeUserDialog } from '../../components/AuthorizeUserDialog.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { SelectCombobox } from '../../components/SelectCombobox.jsx';
import { Tooltip } from '../../components/Tooltip.jsx';
import { RoleSwitcher } from '../../components/RoleSwitcher.jsx';
import { AgentHubSkillSelect } from '../../components/AgentHubSkillSelect.jsx';
import { skillCategories, platformSources, businessOwners, addDictItem, agenthubSyncedSkills } from '../../data/mock.js';

// 算力通道：技能运行所在的算力通道（云上算力 / 内网算力）；存量数据无该字段时按云上算力兼容
const COMPUTE_CHANNELS = ['云上算力', '内网算力'];
const computeChannelOf = (s) => (s.computeChannel === '内网算力' ? '内网算力' : '云上算力');

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
  const [channelFilter, setChannelFilter] = useState(''); // 算力通道：'' | 云上算力 | 内网算力
  const [spaceFilter, setSpaceFilter] = useState(''); // 「所属空间」筛选：''=全部 / 'system'=系统 / 其余为空间 ID
  const [authSpaceFilter, setAuthSpaceFilter] = useState(''); // 「授权空间」筛选：''=全部 / 其余为空间 ID（归属该空间 或 被授权给该空间）
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
  // 批量选择：勾选多个技能后统一授权用户（仅空间管理员视角提供）
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchAuthOpen, setBatchAuthOpen] = useState(false);
  const [floatPos, setFloatPos] = useState(null); // 「批量授权用户」浮层坐标（跟随首个勾选行的复选框）

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
    // 需求1：来源渠道为 Agenthub 的技能，一律不在任何技能管理列表中展示（覆盖全部页签与两种角色）
    // 需求2：「所属空间」筛选：'' = 全部；'system' = 系统（无 creatorTenant）；其余为空间 ID
    // 需求4：「授权空间」筛选：'' = 全部；其余为空间 ID。
    //   选中某空间 T 后，保留「归属于 T」（creatorTenant === T）或「已授权给 T」的技能；
    //   已授权口径与列表「授权空间」列展示严格一致：全局开放（openScope 非 tenant）视为对所有空间开放，
    //   指定空间（openScope === 'tenant'）则以 openTenants 是否包含 T 判定。
    let list = skills.filter((s) => {
      if (s.source === 'Agenthub') return false;
      const matchK = !k || s.name.toLowerCase().includes(k);
      const matchC = !category || s.category === category;
      const matchS = !channelFilter || computeChannelOf(s) === channelFilter;
      const matchT = !spaceFilter || (spaceFilter === 'system' ? !s.creatorTenant : s.creatorTenant === spaceFilter);
      const matchG = !authSpaceFilter || (
        s.creatorTenant === authSpaceFilter ||
        s.openScope === 'all' || s.openScope === 'private' ||
        (s.openTenants || []).includes(authSpaceFilter)
      );
      return matchK && matchC && matchS && matchT && matchG;
    });

    if (!isPlatform) {
      if (viewTab === 'mine') {
        list = list.filter((s) => s.creatorTenant === user.tenantId);
      } else if (viewTab === 'granted') {
        // 授权给我的：其他主体（系统/其他空间）创建并显式授权给本空间的技能
        list = list.filter((s) => (s.openTenants || []).includes(user.tenantId) && s.creatorTenant !== user.tenantId);
      } else {
        // Skill技能库：展示平台所有已上架/启用的技能（含未授权给本空间的平台开放资源）。
        // 可见性口径：
        //  1) 本管理员所辖空间自建：始终可见、可测试；
        //  2) 存量「仅限本空间可见」（spaceOnlyVisible）的其他空间技能：不展示；
        //  3) 其余（系统平台创建 / 其他空间自建）：一律以「是否入驻到技能库」（inSkillLibrary）为准，
        //     显式关闭（false）即不展示；存量系统技能无该字段，按已入驻兼容处理。
        const myTenantIds = user.managedTenants || (user.tenantId ? [user.tenantId] : []);
        list = list.filter((s) => {
          if (s.enabled === false || s.status === '已下架') return false;
          if (s.creatorTenant && myTenantIds.includes(s.creatorTenant)) return true;
          if (s.creatorTenant && s.spaceOnlyVisible) return false;
          return s.inSkillLibrary !== false;
        });
      }
    }
    return list;
  }, [skills, keyword, category, channelFilter, spaceFilter, authSpaceFilter, isPlatform, viewTab, user]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ===== 批量选择（空间管理员视角；系统管理员的用户级授权按既有口径收敛，不提供该入口）=====
  const showSelect = !isPlatform;
  const pagedIds = paged.map((s) => s.id);
  const allPagedSelected = pagedIds.length > 0 && pagedIds.every((id) => selectedIds.includes(id));
  const selectedSkills = useMemo(
    () => skills.filter((s) => selectedIds.includes(s.id)),
    [skills, selectedIds]
  );

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  // 表头复选框：全选/取消全选当前页
  const toggleSelectAll = () => {
    setSelectedIds((prev) => (
      allPagedSelected
        ? prev.filter((id) => !pagedIds.includes(id))
        : Array.from(new Set([...prev, ...pagedIds]))
    ));
  };

  // 浮层定位：贴在「首个已勾选行的复选框」右侧；跨页时贴到表头复选框右侧
  useEffect(() => {
    if (!showSelect || selectedIds.length === 0) {
      setFloatPos(null);
      return;
    }
    const compute = () => {
      const firstId = paged.find((s) => selectedIds.includes(s.id))?.id;
      const anchor = firstId
        ? document.querySelector(`tr[data-skill-row="${firstId}"] .row-checkbox`)
        : document.querySelector('.skill-head-checkbox');
      if (!anchor) {
        setFloatPos(null);
        return;
      }
      const r = anchor.getBoundingClientRect();
      setFloatPos({ top: r.top + r.height / 2, left: r.right + 14 });
    };
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [showSelect, selectedIds, paged]);

  // 批量授权弹窗的数据源：可选空间 = 各技能已授权空间的交集（用户授权按空间分别设置）
  const batchAuthResource = useMemo(() => {
    const spacesOf = (s) => (s.openScope === 'tenant' ? (s.openTenants || []) : tenants.map((t) => t.id));
    let inter = tenants.map((t) => t.id);
    selectedSkills.forEach((s) => { inter = inter.filter((id) => spacesOf(s).includes(id)); });
    return {
      id: '__batch__',
      name: `${selectedSkills.length} 个技能`,
      openScope: 'tenant',
      openTenants: inter,
      userAuth: null,
    };
  }, [selectedSkills, tenants]);

  const handleSubmit = (form) => {
    upsertSkill(form);
    toast.success(editing?.id ? '修改成功' : '添加成功');
    setEditing(null);
  };

  // 页面内切换管理员角色后：重置该页视图状态，避免沿用上一个角色的页签/筛选/页码
  const handleRoleChange = useCallback(() => {
    setViewTab('center');
    setPage(1);
    setKeyword('');
    setCategory('');
    setChannelFilter('');
    setSpaceFilter('');
    setAuthSpaceFilter('');
    setOpenMenuId(null);
    setSelectedIds([]);
  }, []);

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
            {/* 角色切换：位于主操作按钮左侧（Header 中的切换入口后续统一移除） */}
            <RoleSwitcher onChange={handleRoleChange} />
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
              // 按需求：「管理空间技能」与第一个页签互换位置
              { k: 'mine', label: '管理空间技能' },
              { k: 'granted', label: '授权给我的' },
              { k: 'center', label: 'Skill技能库' },
            ].map((t) => (
              <div
                key={t.k}
                onClick={() => { setViewTab(t.k); setPage(1); setSelectedIds([]); }}
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
            {/* 需求2：所属空间筛选。系统管理员 = 系统 + 全部空间；空间管理员 = 系统 + 其在管的空间 */}
            <select className="select" value={spaceFilter} onChange={(e) => { setSpaceFilter(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
              <option value="">所属空间</option>
              <option value="system">系统</option>
              {managedTenants.map((t) => <option key={t.id} value={t.id}>{t.brandName}</option>)}
            </select>
            {/* 需求4：授权空间筛选。下拉选项为全部 Buddy 空间（不做角色收敛）；
                选中某空间后，展示「归属于该空间」或「已授权给该空间」的技能。 */}
            <select className="select" value={authSpaceFilter} onChange={(e) => { setAuthSpaceFilter(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
              <option value="">授权空间</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.brandName}</option>)}
            </select>
            {isPlatform && (
              <select className="select" value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
                <option value="">算力通道</option>
                {COMPUTE_CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
            <input
              className="input"
              placeholder="技能名称"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              style={{ maxWidth: 240 }}
            />
            <button className="btn btn-default" onClick={() => { setKeyword(''); setCategory(''); setChannelFilter(''); setSpaceFilter(''); setAuthSpaceFilter(''); setPage(1); setSelectedIds([]); }}>
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
                  {showSelect && (
                    <th width={44}>
                      <span className="skill-head-checkbox" style={{ display: 'inline-flex' }}>
                        <Checkbox checked={allPagedSelected} onChange={toggleSelectAll} />
                      </span>
                    </th>
                  )}
                  <th width={90}>ID</th>
                  <th width={120}>技能名称</th>
                  <th width={140}>技能所在目录</th>
                  <th width={110}>技能分类</th>
                  <th width={110}>算力通道</th>
                  {(isPlatform || viewTab === 'mine') && <th width={90}>上架状态</th>}
                  <th width={150}>授权空间</th>
                  <th width={110}>所属空间</th>
                  <th width={110}>业务归属方</th>
                  <th width={100}>更新人</th>
                  <th width={140}>更新时间</th>
                  <th width={120}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={((isPlatform || viewTab === 'mine') ? 12 : 11) + (showSelect ? 1 : 0)}>
                      <Empty icon="🧩" tip={viewTab === 'center' ? '暂无平台开放资源' : viewTab === 'granted' ? '暂无其他空间授权给你的技能' : '暂无技能数据，请先添加'} />
                    </td>
                  </tr>
                )}
                {paged.map((s) => (
                  <tr key={s.id} data-skill-row={s.id}>
                    {showSelect && (
                      <td>
                        <span className="row-checkbox" style={{ display: 'inline-flex' }}>
                          <Checkbox
                            checked={selectedIds.includes(s.id)}
                            onChange={() => toggleSelectRow(s.id)}
                          />
                        </span>
                      </td>
                    )}
                    <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{s.id}</td>
                    <td style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer' }} onClick={() => setChatbotSkill(s)}>{s.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{s.code}</td>
                    <td><Tag color="info">{s.category}</Tag></td>
                    <td style={{
                      fontSize: 12,
                      color: computeChannelOf(s) === '云上算力' ? '#EF4444' : '#6B7280',
                      fontWeight: computeChannelOf(s) === '云上算力' ? 500 : 400,
                    }}>{computeChannelOf(s)}</td>
                    {(isPlatform || viewTab === 'mine') && (
                      <td>
                        {/* 需求3：列表中出现的技能均可直接操作上下架（系统管理员覆盖系统平台技能与空间技能）。
                            上下架同时同步 enabled 与 status，避免 status 残留导致其它口径（技能库可见性、可复制判定）判断失真。 */}
                        <Toggle
                          checked={s.enabled}
                          onChange={() => {
                            const next = !s.enabled;
                            upsertSkill({ ...s, enabled: next, status: next ? '已上架' : '未上架' });
                          }}
                        />
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
                            // 下载技能：入口先占位，暂不实现交互逻辑
                            items.push({ key: 'download', label: '下载技能', onClick: () => {} });
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

      {/* 批量选择浮层：跟随首个已勾选行的复选框出现，「批量授权用户」按钮置于其右侧；取消全部勾选即消失 */}
      {showSelect && selectedIds.length > 0 && floatPos && (
        <div
          style={{
            position: 'fixed', top: floatPos.top, left: floatPos.left,
            transform: 'translateY(-50%)', zIndex: 70,
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #F3E3D0', borderRadius: 999,
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: '5px 6px 5px 14px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            已选 <strong style={{ color: '#E89E57' }}>{selectedIds.length}</strong> 个技能
          </span>
          <button
            className="btn btn-primary"
            style={{ height: 28, padding: '0 14px', fontSize: 12 }}
            onClick={() => setBatchAuthOpen(true)}
          >批量授权用户</button>
        </div>
      )}

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

      {/* 批量授权用户：与单条授权弹窗同一套交互；确定后清空选中，取消则保留选中 */}
      {batchAuthOpen && (
        <AuthorizeUserDialog
          resource={batchAuthResource}
          resourceType="技能"
          title={`批量授权用户 - 技能（共 ${selectedSkills.length} 个）`}
          onClose={() => setBatchAuthOpen(false)}
          onSubmit={(userAuth) => {
            selectedSkills.forEach((s) => upsertSkill({ ...s, userAuth }));
            toast.success(`已为 ${selectedSkills.length} 个技能批量更新用户授权`);
            setBatchAuthOpen(false);
            setSelectedIds([]);
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

// 技能编码已从表单移除（用户不可见/不可填），提交时由系统按技能名称自动生成：
// 名称含英文数字 → 取英文 slug（如 hot_news）；纯中文名称 → 直接沿用名称（与「技能所在目录」根节点口径一致）
// Agenthub 同步的技能仍沿用其原始编码
function genSkillCode(name) {
  const raw = String(name || '').trim();
  if (!raw) return `skill_${Date.now().toString(36)}`;
  // 纯 ASCII 名称 → 转下划线 slug；含中文等非 ASCII 字符 → 直接沿用名称，避免只截出零散英文片段
  if (!/^[\x20-\x7E]+$/.test(raw)) return raw;
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug || raw;
}

// 文件大小展示：B / KB / MB
function fmtFileSize(size) {
  const n = Number(size || 0);
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
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
    source: '',
    category: '',
    creator: user.fullName || '系统管理员',
    creatorTenant: user.tenantId || null,
    icon: '',
    // 新建技能默认「上传压缩包模式」；编辑存量技能（内容为在线编写）默认「在线编辑模式」
    editMode: initial?.editMode || (initial?.id ? 'online' : 'upload'),
    skillContent: '',
    businessOwner: '',
    cloudCompute: '',
    complianceNote: '',
    complianceFiles: [],
    computeChannel: '云上算力',
    mcpIds: [],
    mcpToolMap: {},
    spaceOnlyVisible: false,
    inSkillLibrary: false,
    allowSysAuth: true,
    welcome: '',
    ...initial,
  }));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Agenthub 同步的技能：来源渠道不可编辑、技能内容只读
  const isSkillhub = form.source === 'Agenthub';
  // Agenthub 已下架技能：上架状态锁定，不可编辑
  const skillOffline = isSkillhub && form.status === '已下架';

  // 「通过AgentHub创建」：编辑已有技能时禁用（复制新建视为新增，可修改）
  const isEdit = !!initial?.id && !initial?.__copy;
  // Agenthub 技能仓库：按更新时间倒序，最新的排在最前
  const agenthubSkills = useMemo(
    () => [...agenthubSyncedSkills].sort(
      (a, b) => String(b.updateTime || '').localeCompare(String(a.updateTime || ''))
    ),
    []
  );
  // 当前选中项：优先取本次选择的 Agenthub 技能；历史 Agenthub 技能（无该字段）回显自身名称
  const selectedHubSkill = useMemo(() => {
    if (form.agenthubSkillId) {
      const hit = agenthubSkills.find((s) => s.id === form.agenthubSkillId);
      if (hit) return hit;
    }
    if (isSkillhub && form.name) return { id: form.id || 'self', name: form.name };
    return null;
  }, [form.agenthubSkillId, form.id, form.name, isSkillhub, agenthubSkills]);

  // 选中前的表单快照：清除已选技能时用于「回到默认状态」
  const hubBaseRef = useRef(null);

  // 选中 Agenthub 技能后：回填下方表单字段（来源渠道自动选中 Agenthub）
  const applyHubSkill = (s) => {
    if (!s) return;
    setForm((f) => {
      if (!hubBaseRef.current) {
        hubBaseRef.current = {
          name: f.name || '',
          code: f.code || '',
          category: f.category,
          source: f.source,
          businessOwner: f.businessOwner,
          desc: f.desc || '',
          remark: f.remark || '',
          mcpIds: f.mcpIds || [],
          mcpToolMap: f.mcpToolMap || {},
        };
      }
      return {
        ...f,
        agenthubSkillId: s.id,
        name: s.name || '',
        code: s.code || f.code,
        category: s.category || f.category,
        source: 'Agenthub',
        businessOwner: s.businessOwner || f.businessOwner,
        desc: s.desc || '',
        remark: s.desc || '', // 技能使用说明回显技能描述内容
        mcpIds: (s.mcpIds && s.mcpIds.length) ? s.mcpIds : f.mcpIds,
        mcpToolMap: s.mcpToolMap || f.mcpToolMap,
      };
    });
  };

  // 清除已选 Agenthub 技能：还原选中前的表单内容，选择器回到默认（未选择）状态
  const clearHubSkill = () => {
    const base = hubBaseRef.current;
    hubBaseRef.current = null;
    setForm((f) => ({
      ...f,
      ...(base || {}),
      agenthubSkillId: null,
    }));
  };

  // 选择/拖入技能压缩包（仅记录文件名与大小，不做真实解压）
  const handleZipFile = (file) => {
    if (!file || readOnly) return;
    set('skillContent', `[已上传压缩包] ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  // 合规论证材料：支持 jpg / jpeg / png 图片与 zip 压缩包，单个文件 ≤10MB，可多选（仅记录文件名与大小）
  const COMPLIANCE_EXT = /\.(jpe?g|png|zip)$/i;
  const handleComplianceFiles = (fileList) => {
    if (readOnly) return;
    const list = Array.from(fileList || []);
    if (!list.length) return;
    if (list.some((f) => !COMPLIANCE_EXT.test(f.name))) {
      toast.error('仅支持 jpg/jpeg/png 图片与 zip 压缩包');
      return;
    }
    if (list.some((f) => f.size > 10 * 1024 * 1024)) {
      toast.error('单个文件大小需在 10MB 以内');
      return;
    }
    setForm((f) => ({
      ...f,
      complianceFiles: [...(f.complianceFiles || []), ...list.map((x) => ({ name: x.name, size: x.size }))],
    }));
  };

  const submit = () => {
    // 必填校验顺序与表单展示顺序一致
    const requiredList = [
      ['category', '请选择技能分类'],
      ['name', '请输入技能名称'],
      ['cloudCompute', '请选择云上算力'],
      ['businessOwner', '请选择业务归属方'],
      ['source', '请选择来源渠道'],
      ['desc', '请输入技能描述'],
      ['remark', '请输入技能使用说明/提问示例'],
    ];
    // 云上算力 = 支持 时，合规论证说明为必填（紧跟「云上算力」之后校验）
    if (form.cloudCompute === '支持') {
      requiredList.splice(3, 0, ['complianceNote', '请填写合规论证说明']);
    }
    for (const [k, msg] of requiredList) {
      if (!String(form[k] || '').trim()) {
        toast.error(msg);
        return false;
      }
    }
    // 用户自定义的来源渠道 / 业务归属方写入字典
    if (form.source) addDictItem(platformSources, form.source);
    if (form.businessOwner) addDictItem(businessOwners, form.businessOwner);
    onSubmit({
      ...form,
      code: form.code || genSkillCode(form.name),
      updateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    return true;
  };

  return (
    <Modal
      open
      title={readOnly ? `技能详情 - ${initial?.name || ''}` : (initial?.id && !initial?.__copy ? '编辑技能' : '添加技能')}
      onClose={onClose}
      width={1040}
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
      <div>
        {/* 统一视图：不再使用左侧页签，所有配置项在同一弹窗内顺序排布 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px 24px' }}>
              {/* 第一行：技能分类 / 技能名称 / 云上算力 */}
              <Field label="技能分类" required>
                <select className="select" value={form.category || ''} onChange={(e) => set('category', e.target.value)} disabled={readOnly}>
                  <option value="">请选择</option>
                  {skillCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="技能名称" required>
                <input
                  className="input" value={form.name || ''} placeholder="请输入技能名称"
                  onChange={(e) => set('name', e.target.value)} disabled={readOnly}
                />
              </Field>
              <Field label="云上算力" required>
                <select className="select" value={form.cloudCompute || ''} onChange={(e) => set('cloudCompute', e.target.value)} disabled={readOnly}>
                  <option value="">请选择</option>
                  <option value="支持">支持</option>
                  <option value="不支持">不支持</option>
                </select>
              </Field>

              {/* 合规论证说明：仅「云上算力 = 支持」时展示（说明文本 + 材料上传） */}
              {form.cloudCompute === '支持' && (
                <Field label="合规论证说明" full required>
                  <div style={{ border: '1px solid #F2F4F7', borderRadius: 8, padding: '14px 16px', background: '#FCFCFD' }}>
                    <CounterTextarea
                      value={form.complianceNote || ''} max={2000} rows={3} disabled={readOnly}
                      placeholder="请填写支持云上算力的合规论证说明"
                      onChange={(v) => set('complianceNote', v)}
                    />
                    <div style={{ fontSize: 13, color: '#4B5563', margin: '14px 0 8px' }}>
                      上传合规论证材料
                      <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>
                        支持 jpg / jpeg / png 图片与 zip 压缩包，单个文件不超过 10MB
                      </span>
                    </div>
                    {!readOnly && (
                      <div
                        onClick={() => document.getElementById('skill-compliance-input')?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleComplianceFiles(e.dataTransfer?.files); }}
                        style={{
                          border: '1px dashed #E5E7EB', borderRadius: 4, background: '#fff',
                          padding: '14px 16px', textAlign: 'center', fontSize: 13, color: '#4B5563',
                          cursor: 'pointer', transition: 'border-color .2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E89E57'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
                      >
                        将文件拖至此处，或
                        <span style={{ color: '#1677FF', marginLeft: 4 }}>点击上传</span>
                        <input
                          id="skill-compliance-input"
                          type="file"
                          accept=".jpg,.jpeg,.png,.zip"
                          multiple
                          hidden
                          onChange={(e) => { handleComplianceFiles(e.target.files); e.target.value = ''; }}
                        />
                      </div>
                    )}
                    {(form.complianceFiles || []).length > 0 ? (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(form.complianceFiles || []).map((f, i) => (
                          <div
                            key={`${f.name}-${i}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563',
                              background: '#fff', border: '1px solid #F2F4F7', borderRadius: 4, padding: '6px 10px',
                            }}
                          >
                            <Icon name="doc" size={14} color="#E89E57" />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtFileSize(f.size)}</span>
                            {!readOnly && (
                              <span
                                onClick={() => set('complianceFiles', (form.complianceFiles || []).filter((_, idx) => idx !== i))}
                                style={{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}
                              >移除</span>
                            )}
                            {/* 下载：紧随「移除」之后；mock 环境暂不做实际下载逻辑 */}
                            <span
                              onClick={() => {}}
                              style={{ fontSize: 12, color: '#1677FF', cursor: 'pointer' }}
                            >下载</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      readOnly && <div style={{ fontSize: 13, color: '#9CA3AF' }}>未上传材料</div>
                    )}
                  </div>
                </Field>
              )}

              {/* 第二行：业务归属方 / 来源渠道 / 通过AgentHub创建 */}
              <Field label="业务归属方" required>
                <SelectCombobox
                  value={form.businessOwner || ''}
                  options={businessOwners}
                  placeholder="请选择"
                  disabled={readOnly}
                  onChange={(v) => set('businessOwner', v)}
                />
              </Field>
              <Field label="来源渠道" required>
                <SelectCombobox
                  value={form.source || ''}
                  options={platformSources}
                  placeholder="请选择"
                  disabled={readOnly || isSkillhub}
                  onChange={(v) => set('source', v)}
                />
                {isSkillhub && (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                    该技能由 Agenthub 同步，来源渠道不可修改
                  </div>
                )}
              </Field>
              {/* 通过AgentHub创建：紧跟「来源渠道」在同一行 */}
              <Field label="通过AgentHub创建">
                <AgentHubSkillSelect
                  value={selectedHubSkill}
                  options={agenthubSkills}
                  defaultCount={6}
                  disabled={readOnly || isEdit}
                  onChange={applyHubSkill}
                  onClear={clearHubSkill}
                />
              </Field>

              <Field label="关联MCP工具" full>
                <MCPToolSelect
                  mcps={mcps}
                  mcpIds={form.mcpIds || []}
                  mcpToolMap={form.mcpToolMap || {}}
                  onChangeMcpIds={(v) => set('mcpIds', v)}
                  onChangeMcpToolMap={(v) => set('mcpToolMap', v)}
                  readOnly={readOnly}
                />
              </Field>

              {/* 技能欢迎语：非必填，最多 255 字 */}
              <Field label="技能欢迎语" full>
                <CounterTextarea
                  value={form.welcome || ''} max={255} rows={3} disabled={readOnly}
                  placeholder="请输入" onChange={(v) => set('welcome', v)}
                />
              </Field>

              <Field label="技能描述" required full>
                <CounterTextarea
                  value={form.desc || ''} max={3000} rows={4} disabled={readOnly}
                  placeholder="请输入" onChange={(v) => set('desc', v)}
                />
              </Field>

              <Field label="技能使用说明/提问示例" required full>
                <CounterTextarea
                  value={form.remark || ''} max={3000} rows={3} disabled={readOnly}
                  placeholder="请输入" onChange={(v) => set('remark', v)}
                />
              </Field>

              {/* 技能创建方式：上传压缩包模式 / 在线编辑模式 */}
              <Field label="技能创建方式" full>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  {[
                    { k: 'upload', label: '上传压缩包模式' },
                    { k: 'online', label: '在线编辑模式' },
                  ].map((m) => (
                    <label
                      key={m.k}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                        color: '#4B5563', cursor: readOnly ? 'default' : 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="skill-create-mode"
                        checked={form.editMode === m.k}
                        onChange={() => set('editMode', m.k)}
                        disabled={readOnly}
                        style={{ width: 15, height: 15, margin: 0, accentColor: '#E89E57', cursor: readOnly ? 'default' : 'pointer' }}
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              {/* 上传压缩包：左侧拖拽/点击上传区 + 右侧压缩包规范 */}
              <div style={{ gridColumn: '1 / -1', marginTop: -4 }}>
                {form.editMode === 'upload' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
                    <div
                      onClick={() => { if (!readOnly) document.getElementById('skill-zip-input')?.click(); }}
                      onDragOver={(e) => { if (!readOnly) e.preventDefault(); }}
                      onDrop={(e) => {
                        if (readOnly) return;
                        e.preventDefault();
                        handleZipFile(e.dataTransfer?.files?.[0]);
                      }}
                      style={{
                        border: '1px dashed #E5E7EB', borderRadius: 4, background: '#FCFCFD',
                        minHeight: 150, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: readOnly ? 'default' : 'pointer', textAlign: 'center', padding: 16,
                      }}
                      onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.borderColor = '#E89E57'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
                    >
                      {form.skillContent && form.skillContent.startsWith('[已上传压缩包]') ? (
                        <>
                          <Icon name="doc" size={26} color="#E89E57" />
                          <div style={{ fontSize: 13, color: '#4B5563' }}>{form.skillContent.replace('[已上传压缩包] ', '')}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>已上传，可重新上传覆盖</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: '#4B5563' }}>
                          将文件拖至此处，或
                          <span style={{ color: '#1677FF', marginLeft: 4 }}>点击上传</span>
                        </div>
                      )}
                      <input
                        id="skill-zip-input"
                        type="file"
                        accept=".zip"
                        hidden
                        onChange={(e) => handleZipFile(e.target.files?.[0])}
                      />
                    </div>
                    <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 2 }}>
                      <div>1、支持文件类型：zip</div>
                      <div>2、zip文件大小限制：10MB以内，单文件不超过1MB</div>
                      <div>3、压缩包必须包含 skill.md 文件，且技能文档书写规范</div>
                      <div>4、文件数量限制：一次上传1个文件</div>
                      <div>5、请确保所上传技能符合公司合规安全管理要求，无恶意指令或代码</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {isSkillhub && (
                      <div style={{
                        padding: 10, background: '#FBF1E5', border: '1px solid #F7E3CC',
                        borderRadius: 6, fontSize: 12, color: '#B87136', marginBottom: 12,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <Icon name="doc" size={12} color="#B87136" />
                        该技能由 Agenthub 同步，仅可查看技能相关信息，不可编辑
                      </div>
                    )}
                    <MarkdownEditor
                      value={form.skillContent || ''}
                      onChange={(v) => set('skillContent', v)}
                      readOnly={readOnly || isSkillhub}
                    />
                  </div>
                )}
              </div>

              {/* 上传图标 */}
              <Field label="上传图标" full>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {readOnly ? (
                    form.icon ? (
                      <img src={form.icon} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 13, color: '#9CA3AF' }}>未上传</span>
                    )
                  ) : (
                    <>
                      <span
                        onClick={() => document.getElementById('skill-icon-input')?.click()}
                        style={{ fontSize: 13, color: '#1677FF', cursor: 'pointer' }}
                      >浏览文件</span>
                      {form.icon && (
                        <>
                          <img src={form.icon} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', border: '1px solid #F2F4F7' }} />
                          <span
                            onClick={() => set('icon', '')}
                            style={{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}
                          >移除</span>
                        </>
                      )}
                      <input
                        id="skill-icon-input"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const reader = new FileReader();
                          reader.onload = () => set('icon', String(reader.result || ''));
                          reader.readAsDataURL(f);
                        }}
                      />
                    </>
                  )}
                </div>
              </Field>

              {/* 上架状态 / 是否入驻到技能库：两列并排 */}
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
                <Field label="上架状态">
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Toggle
                      checked={form.enabled}
                      onChange={(v) => { set('enabled', v); set('status', v ? '已上架' : '未上架'); }}
                      disabled={readOnly || skillOffline}
                    />
                    {skillOffline && (
                      <span style={{ fontSize: 12, color: '#EF4444' }}>该技能已下线，上架状态不可修改</span>
                    )}
                  </div>
                </Field>
                {/* 是否入驻到技能库：系统管理员与空间管理员均可设置，说明文案以 i 图标 tips 展示 */}
                <Field
                  label={
                    <>
                      是否入驻到技能库
                      <Tooltip text="入驻后，所有空间管理员可在「技能库」中查看并测试该技能" />
                    </>
                  }
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Toggle
                      checked={!!form.inSkillLibrary}
                      onChange={(v) => set('inSkillLibrary', v)}
                      disabled={readOnly}
                    />
                  </div>
                </Field>
              </div>
              {/* 所属空间：查看详情（readOnly）时不展示，仅编辑时保留 */}
              {!isPlatform && !readOnly && (
                <Field label="所属空间" full>
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

            {/* Agenthub 同步信息：仅 Agenthub 来源技能展示 */}
            {isSkillhub && (
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #F2F4F7' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 6 }}>Agenthub 同步信息</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                  该技能的发布与运营数据，仅供参考
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <MetaItem label="版本号" value={form.version || '-'} />
                  <MetaItem label="下载量" value={form.downloads != null ? Number(form.downloads).toLocaleString() : '-'} />
                  <MetaItem label="评分" value={form.rating != null ? `${form.rating} / 5` : '-'} />
                </div>
              </div>
            )}

      </div>
    </Modal>
  );
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
  const [kw, setKw] = useState('');

  // 按关键词过滤 MCP 服务与工具（一级服务名、二级工具名/标识均可命中）
  const kwText = kw.trim().toLowerCase();
  const shownMcps = useMemo(() => {
    if (!kwText) return mcps;
    return mcps
      .map((m) => {
        const tools = (m.tools || []).filter(
          (t) => String(t.label || '').toLowerCase().includes(kwText) || String(t.name || '').toLowerCase().includes(kwText)
        );
        const nameHit = String(m.name || '').toLowerCase().includes(kwText);
        if (!nameHit && tools.length === 0) return null;
        return { ...m, tools: nameHit ? (m.tools || []) : tools };
      })
      .filter(Boolean);
  }, [mcps, kwText]);

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
            ? '请选择（支持搜索，按MCP服务二级结构）'
            : `已选择 ${mcpIds.length} 个 MCP 服务 / ${selectedToolsCount} 个工具`}
        </span>
        <Icon name="chevronDown" size={12} color="#9CA3AF" />
      </div>

      {open && (
        <div style={{
          border: '1px solid #E5E7EB', borderRadius: 6, marginTop: 6,
          background: '#fff',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #F2F4F7' }}>
            <input
              className="input"
              value={kw}
              placeholder="搜索 MCP 服务或工具"
              onChange={(e) => setKw(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ maxHeight: 250, overflow: 'auto' }}>
          {shownMcps.length === 0 && kwText && (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
              未找到匹配的 MCP 服务或工具
            </div>
          )}
          {mcps.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
              暂无 MCP 服务
            </div>
          )}
          {shownMcps.map((m) => {
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

// 带字数统计的多行文本框：右下角显示「已输入 / 上限」
function CounterTextarea({ value, onChange, max = 3000, rows = 4, placeholder = '请输入', disabled }) {
  const len = String(value || '').length;
  return (
    <div>
      <textarea
        className="input"
        rows={rows}
        maxLength={max}
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <div style={{ textAlign: 'right', fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
        {len} / {max}
      </div>
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

