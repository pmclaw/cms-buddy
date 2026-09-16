import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Modal } from './Overlay.jsx';
import { Icon, Confirm } from './Common.jsx';
import { Tag } from './Tag.jsx';
import { Pagination } from './Pagination.jsx';
import { MultiSelectDropdown } from './MultiSelectDropdown.jsx';
import { useStore } from '../contexts/StoreContext.jsx';
import { openScopes, orgUsers, userGroups, orgDepartments } from '../data/mock.js';
import { flattenDepartments } from '../pages/user-groups/OrgTree.jsx';
import { groupMembers, usersOfDept, getDept } from '../pages/user-groups/utils.js';

// 计算已授权用户清单：用户组(展开成员) ∪ 部门(直属用户) ∪ 单个用户，去重并记录来源；排除名单仅作用于组/部门派生用户
function calcAuthorizedUsers(userAuth) {
  const { groupIds = [], deptIds = [], userIds = [], excludedUserIds = [] } = userAuth || {};
  const excluded = new Set(excludedUserIds);
  const map = new Map();
  const addDerived = (u, src) => {
    if (excluded.has(u.id)) return;
    const key = u.id;
    if (!map.has(key)) map.set(key, { ...u, srcs: [src] });
    else if (!map.get(key).srcs.includes(src)) map.get(key).srcs.push(src);
  };
  groupIds.forEach((gid) => {
    const g = userGroups.find((x) => x.id === gid);
    if (!g) return;
    const src = `用户组「${g.name}」`;
    groupMembers(g).forEach((u) => addDerived(u, src));
  });
  deptIds.forEach((did) => {
    const d = getDept(did);
    const src = `部门「${d ? d.name : did}」`;
    usersOfDept(did).forEach((u) => addDerived(u, src));
  });
  userIds.forEach((uid) => {
    const u = orgUsers.find((x) => x.id === uid);
    if (!u) return;
    const key = u.id;
    const src = '手动指定';
    if (!map.has(key)) map.set(key, { ...u, srcs: [src] });
    else if (!map.get(key).srcs.includes(src)) map.get(key).srcs.push(src);
  });
  return Array.from(map.values());
}

// ========== 授权给用户区块 ==========
// 独立导出：供「授权用户」弹窗（AuthorizeUserDialog）与合并版 AuthorizeDialog 复用
// tenantId（可选）：授权所属空间。传入后「按用户组」渠道仅列出归属该空间或系统级的用户组，
// 且切换空间时自动移除不属于该空间的已选用户组，保证授权对象落在所选空间内。
export function UserAuthPanel({ resourceType, value, onChange, tenantId }) {
  const [authPage, setAuthPage] = useState(1);
  const [authPageSize, setAuthPageSize] = useState(10);
  const [confirmRemove, setConfirmRemove] = useState(null);

  // 授权清单变化（渠道勾选/移出）后回到第一页
  useEffect(() => {
    setAuthPage(1);
  }, [value]);

  // 所属空间变化：剔除已选用户组中不属于新空间（且为空间级）的组
  useEffect(() => {
    if (!tenantId) return;
    const current = value.groupIds || [];
    const kept = current.filter((gid) => {
      const g = userGroups.find((x) => x.id === gid);
      return !g || !g.creatorTenant || g.creatorTenant === tenantId;
    });
    if (kept.length !== current.length) {
      onChange({ ...value, groupIds: kept });
    }
    // 仅在所属空间切换时校验清理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const toggle = (key, id) => {
    const arr = value[key] || [];
    onChange({ ...value, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] });
  };

  const authorized = useMemo(() => calcAuthorizedUsers(value), [value]);
  const authTotalPages = Math.max(1, Math.ceil(authorized.length / authPageSize));
  const safeAuthPage = Math.min(authPage, authTotalPages);
  const pagedAuthorized = authorized.slice((safeAuthPage - 1) * authPageSize, safeAuthPage * authPageSize);
  const onAuthPageChange = (p, size) => {
    if (size) setAuthPageSize(size);
    setAuthPage(p);
  };

  // 移出已授权用户：从手动指定中移除 + 加入排除名单（防止从用户组/部门再次派生）
  const removeAuthorized = (u) => {
    const next = { ...value };
    if ((value.userIds || []).includes(u.id)) {
      next.userIds = value.userIds.filter((x) => x !== u.id);
    }
    const excluded = value.excludedUserIds || [];
    if (!excluded.includes(u.id)) {
      next.excludedUserIds = [...excluded, u.id];
    }
    onChange(next);
    setConfirmRemove(null);
  };

  // 三个授权渠道（全部展开，各为一行下拉多选）
  const channels = [
    {
      key: 'groupIds',
      label: '按用户组',
      placeholder: '请选择用户组',
      searchPlaceholder: '搜索用户组名称',
      options: userGroups
        .filter((g) => !tenantId || !g.creatorTenant || g.creatorTenant === tenantId)
        .map((g) => ({
          id: g.id,
          name: g.name,
          sub: `${groupMembers(g).length} 人`,
        })),
      match: (o, kw) => !kw || o.name.toLowerCase().includes(kw),
    },
    {
      key: 'deptIds',
      label: '按部门',
      placeholder: '请选择部门',
      searchPlaceholder: '搜索部门名称 / 路径',
      options: flattenDepartments(orgDepartments).map((d) => ({
        id: d.id,
        name: d.name,
        sub: d.path.join(' / '),
      })),
      match: (o, kw) => !kw || o.name.toLowerCase().includes(kw) || o.sub.toLowerCase().includes(kw),
    },
    {
      key: 'userIds',
      label: '指定用户',
      placeholder: '请选择用户',
      searchPlaceholder: '搜索用户姓名 / 部门',
      options: orgUsers.map((u) => ({ id: u.id, name: u.name, sub: u.deptName })),
      match: (o, kw) => !kw || o.name.toLowerCase().includes(kw) || o.sub.toLowerCase().includes(kw),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
        将该{resourceType}授权给指定用户使用，被授权的用户在相关空间拥有该{resourceType}的使用权限。
      </div>

      {/* 三渠道下拉多选（全部展开，非 Tab） */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {channels.map((ch) => (
          <MultiSelectDropdown
            key={ch.key}
            label={ch.label}
            options={ch.options}
            selectedIds={value[ch.key] || []}
            onToggle={(id) => toggle(ch.key, id)}
            placeholder={ch.placeholder}
            searchPlaceholder={ch.searchPlaceholder}
            match={ch.match}
          />
        ))}
      </div>

      {/* 已授权用户清单 */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>
          已授权用户 <span style={{ color: '#E89E57' }}>{authorized.length}</span> 人
        </div>
        {authorized.length === 0 ? (
          <div style={{ padding: '14px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12, border: '1px dashed #E5E7EB', borderRadius: 6 }}>
            尚未授权任何用户
          </div>
        ) : (
          <>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table className="table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>用户</th>
                      <th style={{ width: 160 }}>所属部门</th>
                      <th>授权来源</th>
                      <th style={{ width: 70 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAuthorized.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</td>
                        <td style={{ fontSize: 12, color: '#6B7280' }}>{u.deptName}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {u.srcs.map((s) => (
                              <Tag key={s} color="info" style={{ fontSize: 11 }}>{s}</Tag>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{ color: '#EF4444', cursor: 'pointer', fontSize: 13 }}
                            onClick={() => setConfirmRemove(u)}
                            title="从已授权用户中移出"
                          >移出</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Pagination
                page={safeAuthPage}
                pageSize={authPageSize}
                total={authorized.length}
                onChange={onAuthPageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* 移出确认 */}
      <Confirm
        open={!!confirmRemove}
        title="移出授权用户"
        content={
          <div>
            确定将 <strong style={{ color: '#E89E57' }}>{confirmRemove?.name}</strong> 从已授权用户中移出吗？
            <div style={{
              background: '#FFFBEB', border: '1px solid #FCD34D',
              padding: 10, borderRadius: 6, fontSize: 12, color: '#92400E', marginTop: 12
            }}>
              移出后该用户将不再拥有该{resourceType}的使用权限；
              若其来自用户组或部门，仅移除当前用户，不影响该渠道其他用户。
            </div>
          </div>
        }
        danger
        onOk={() => removeAuthorized(confirmRemove)}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}

// 资源授权弹窗：统一管理能力资源（专家助理/技能/MCP服务/任务模板）的开放范围
// 逻辑与原有「开放范围-指定范围」一致：全局开放 / 指定空间（多选空间）
// showUserAuth=true 时额外展示「授权给用户」区块（专家助理 / 技能模块使用）

// 各能力资产在 Buddy 空间「构建能力」中的关联集合字段：空间已关联该资源 → 其指定授权不可撤销
export const TENANT_ASSOC_FIELD = {
  专家助理: 'expertIds',
  技能: 'skillIds',
  'MCP服务': 'mcpIds',
  任务模板: 'templateIds',
};

export function AuthorizeDialog({ resource, resourceType, onClose, onSubmit, showUserAuth = false }) {
  const { tenants } = useStore();
  const [openScope, setOpenScope] = useState(resource.openScope === 'tenant' ? 'tenant' : 'all');
  const [openTenants, setOpenTenants] = useState(resource.openTenants || []);
  const [userAuth, setUserAuth] = useState(
    resource.userAuth || { groupIds: [], deptIds: [], userIds: [], excludedUserIds: [] }
  );

  // 已关联的指定空间：仅当「已指定的空间」同时已在 Buddy空间构建能力中关联了当前能力资产时锁定
  // （该空间正在使用此资产，不可在此弹窗中取消指定 → 对勾改为锁形标记、点击不生效）；
  // 其余已指定但尚未关联的空间仍保留对勾，可正常取消授权
  const linkedTenantIds = useMemo(() => {
    if (resource.openScope !== 'tenant') return [];
    const assocField = TENANT_ASSOC_FIELD[resourceType] || 'skillIds';
    return (resource.openTenants || []).filter((tid) => {
      const t = tenants.find((x) => x.id === tid);
      return !!t && (t[assocField] || []).includes(resource.id);
    });
  }, [resource, resourceType, tenants]);

  const toggleTenant = (id) => {
    if (linkedTenantIds.includes(id)) return; // 已关联的指定空间不可取消指定
    setOpenTenants((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
    );
  };

  return (
    <Modal
      open
      title={`授权 - ${resourceType}「${resource.name}」`}
      onClose={onClose}
      width="wide"
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSubmit(openScope, openTenants, showUserAuth ? userAuth : undefined);
            }}
          >确定</button>
        </>
      }
    >
      <div>
        {/* ===== 区块一：授权给空间 ===== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            width: 3, height: 14, background: '#E89E57', borderRadius: 2, flexShrink: 0,
          }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>授权给空间</span>
        </div>
        <div style={{ marginBottom: 12, fontSize: 13, color: '#4B5563' }}>
          设置该{resourceType}的开放范围，指定空间后仅被授权的空间可见可用。
        </div>

        {/* 开放范围单选 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {openScopes.map((sc) => (
            <label
              key={sc.value}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', border: '1px solid ' + (openScope === sc.value ? '#E89E57' : '#E5E7EB'),
                background: openScope === sc.value ? '#FBF1E5' : '#fff',
                color: openScope === sc.value ? '#B87136' : '#4B5563',
                borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: openScope === sc.value ? 500 : 400,
              }}
            >
              <input
                type="radio" name="authOpenScope"
                style={{ display: 'none' }}
                checked={openScope === sc.value}
                onChange={() => setOpenScope(sc.value)}
              />
              {sc.label}
            </label>
          ))}
        </div>

        {/* 指定空间：多选租户 */}
        {openScope === 'tenant' && (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: 12, maxHeight: 320, overflow: 'auto' }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#9CA3AF' }}>
              已选择 {openTenants.length} 个空间
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {tenants.map((t) => {
                const checked = openTenants.includes(t.id);
                const linked = checked && linkedTenantIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    title={
                      linked
                        ? `该空间已与当前${resourceType}关联，不可取消指定`
                        : t.status === '已下线'
                          ? '该空间当前已下线，仍可被指定授权'
                          : '该空间已上线'
                    }
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      border: '1px solid ' + (checked ? '#E89E57' : '#E5E7EB'),
                      background: checked ? '#FBF1E5' : '#fff',
                      color: checked ? '#B87136' : '#4B5563',
                      borderRadius: 6, cursor: linked ? 'not-allowed' : 'pointer', fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox" style={{ display: 'none' }}
                      checked={checked}
                      onChange={() => toggleTenant(t.id)}
                    />
                    <img src={t.logo} alt="" style={{ width: 18, height: 18, borderRadius: 4 }} />
                    <span style={{ flex: 1 }}>{t.brandName}</span>
                    <span
                      title={t.status === '已下线' ? '该空间当前已下线，仍可被指定授权' : '该空间已上线'}
                      style={{
                        fontSize: 11, lineHeight: 1, padding: '3px 6px', borderRadius: 4, flexShrink: 0,
                        background: t.status === '已下线' ? '#F2F4F7' : '#F0FDF4',
                        color: t.status === '已下线' ? '#6B7280' : '#15803D',
                      }}
                    >
                      {t.status === '已下线' ? '已下线' : '已上线'}
                    </span>
                    {linked
                      ? <Icon name="lock" size={12} />
                      : checked && <Icon name="check" size={12} />}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {openScope === 'tenant' && openTenants.length === 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
            未选择任何空间时，该{resourceType}暂不向任何空间开放（列表中显示为「暂未授权」）
          </div>
        )}

        {/* ===== 区块二：授权给用户 ===== */}
        {showUserAuth && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 3, height: 14, background: '#E89E57', borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>授权给用户</span>
            </div>
            <UserAuthPanel resourceType={resourceType} value={userAuth} onChange={setUserAuth} />
          </div>
        )}
      </div>
    </Modal>
  );
}
