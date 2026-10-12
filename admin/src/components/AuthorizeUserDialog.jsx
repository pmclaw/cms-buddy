import React, { useState, useMemo } from 'react';
import { Modal } from './Overlay.jsx';
import { Toggle } from './Toggle.jsx';
import { UserAuthPanel, EMPTY_USER_AUTH } from './AuthorizeDialog.jsx';
import { useRole } from '../contexts/RoleContext.jsx';
import { useStore } from '../contexts/StoreContext.jsx';

// 授权用户弹窗：专家助理 / Skill技能 列表行操作「授权用户」使用（空间管理员视角）。
//
// 交互：按「空间」平铺为 Tab 页签，一个空间一个页签，每个页签内是一套完整的授权用户表单，
// 各空间的授权用户互不影响，可分别设置不同用户。
//
// 数据结构（按空间分组保存）：
//   userAuth = { byTenant: { [tenantId]: { groupIds, deptIds, userIds, excludedUserIds } } }
// 兼容历史扁平结构 { groupIds, deptIds, ... }：读取时归入默认空间，不丢失既有数据。
//
// 可选空间 = 当前空间管理员管理的空间 ∩ 当前资产被授权（开放）的空间
//
// 可选 props（构建能力页使用，不影响既有调用方）：
//  - scopeTenantId：把可选空间锁定为指定的单个 Buddy 空间（不做「已管理 ∩ 已授权」交集）
//  - switchItems：在弹窗顶部渲染若干切换开关配置项
//      [{ key, label, desc, checked, onChange }]，切换即时生效（与列表中的关联/启用操作协同）
export function AuthorizeUserDialog({ resource, resourceType, onClose, onSubmit, scopeTenantId, switchItems = [] }) {
  const { user } = useRole();
  const { tenants } = useStore();

  // 当前空间管理员管理的空间（含主空间）
  const managedIds = useMemo(
    () => user.managedTenants || (user.tenantId ? [user.tenantId] : []),
    [user]
  );
  // 当前资产被授权的空间：全局开放视为已授权全部空间；指定空间则取 openTenants
  const authedIds = useMemo(() => {
    if (!resource) return [];
    if (resource.openScope !== 'tenant') return tenants.map((t) => t.id);
    return resource.openTenants || [];
  }, [resource, tenants]);

  // 页签列表 = 我管理的空间 ∩ 资产被授权的空间；scopeTenantId 存在时锁定为单个空间
  const spaceOptions = useMemo(() => {
    if (scopeTenantId) {
      const t = tenants.find((x) => x.id === scopeTenantId);
      return t ? [t] : [];
    }
    return tenants.filter((t) => managedIds.includes(t.id) && authedIds.includes(t.id));
  }, [tenants, managedIds, authedIds, scopeTenantId]);

  // 默认激活页签：优先沿用历史选择，其次当前空间，最后第一个
  const defaultId = useMemo(() => {
    if (scopeTenantId && spaceOptions.some((t) => t.id === scopeTenantId)) return scopeTenantId;
    const prior = resource.userAuth && resource.userAuth.tenantId;
    if (spaceOptions.some((t) => t.id === prior)) return prior;
    if (spaceOptions.some((t) => t.id === user.tenantId)) return user.tenantId;
    return spaceOptions.length ? spaceOptions[0].id : '';
  }, [resource, spaceOptions, user, scopeTenantId]);

  // 按空间分组数据（初始化一次，后续由各页签各自维护）
  const [byTenant, setByTenant] = useState(() => normalizeByTenant(resource.userAuth, defaultId));
  const [activeId, setActiveId] = useState(defaultId);

  const activeAuth = byTenant[activeId] || EMPTY_USER_AUTH;
  const setActiveAuth = (next) => setByTenant((m) => ({ ...m, [activeId]: next }));

  return (
    <Modal
      open
      title={`授权用户 - ${resourceType}「${resource.name}」`}
      onClose={onClose}
      width="wide"
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            disabled={!spaceOptions.length}
            onClick={() => onSubmit({ byTenant })}
          >确定</button>
        </>
      }
    >
      {spaceOptions.length === 0 ? (
        <div style={{
          padding: '28px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13,
          border: '1px dashed #E5E7EB', borderRadius: 6,
        }}>
          {scopeTenantId ? '未找到指定的 Buddy 空间' : `该${resourceType}暂未授权给我管理的空间，无可设置的空间`}
        </div>
      ) : (
        <div>
          {/* ===== 空间页签（平铺，置顶） ===== */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 0, flexWrap: 'wrap',
            borderBottom: '2px solid #F2F4F7', marginBottom: 16,
          }}>
            {spaceOptions.map((t) => {
              const active = t.id === activeId;
              return (
                <div
                  key={t.id}
                  title={`${t.brandName}（${t.nickname}）`}
                  onClick={() => setActiveId(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '9px 18px', cursor: 'pointer', fontSize: 13.5,
                    fontWeight: 500, marginBottom: -2, transition: 'all 0.2s',
                    color: active ? '#E89E57' : '#6B7280',
                    borderBottom: active ? '2px solid #E89E57' : '2px solid transparent',
                  }}
                >
                  <span>{t.brandName}</span>
                </div>
              );
            })}
            {!scopeTenantId && (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', paddingBottom: 8 }}>
                共 {spaceOptions.length} 个空间
              </span>
            )}
          </div>

          {/* ===== 关联 / 启用配置项（构建能力页传入）===== */}
          {switchItems.length > 0 && (
            <div style={{
              padding: '12px 16px', background: '#FBF7F1', border: '1px solid #F3E3D0',
              borderRadius: 8, marginBottom: 16,
            }}>
              {switchItems.map((it, i) => (
                <div
                  key={it.key}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: i === 0 ? 0 : 10 }}
                >
                  <span style={{ fontSize: 13.5, color: '#374151', minWidth: 104, flexShrink: 0 }}>{it.label}</span>
                  <Toggle checked={!!it.checked} onChange={it.onChange} />
                  {it.desc && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{it.desc}</span>}
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 12, color: '#B08968' }}>
                开关调整会即时同步到构建能力列表；下方「取消 / 确定」仅作用于用户授权。
              </div>
            </div>
          )}

          {/* ===== 说明 ===== */}
          <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 14 }}>
            {scopeTenantId
              ? `仅为当前 Buddy 空间「${spaceOptions[0]?.brandName || scopeTenantId}」设置授权用户，下方用户授权即为该空间内的可用人员。`
              : '按空间分别设置授权用户，每个空间的授权用户互不影响。切换页签即可为不同空间设置不同的用户。'}
          </div>

          {/* ===== 授权给用户（当前空间，独立表单） ===== */}
          <UserAuthPanel
            key={activeId}
            resourceType={resourceType}
            tenantId={activeId || undefined}
            value={activeAuth}
            onChange={setActiveAuth}
          />
        </div>
      )}
    </Modal>
  );
}

// 取扁平的授权对象（剔除 tenantId 等非授权字段）
function pickFlatAuth(o) {
  return {
    groupIds: (o && o.groupIds) || [],
    deptIds: (o && o.deptIds) || [],
    userIds: (o && o.userIds) || [],
    excludedUserIds: (o && o.excludedUserIds) || [],
  };
}

function hasContent(o) {
  return !!o && ['groupIds', 'deptIds', 'userIds', 'excludedUserIds'].some(
    (k) => (o[k] || []).length > 0
  );
}

// 归一化为 { [tenantId]: {...} }
//  - 新版：userAuth.byTenant 直接使用
//  - 旧版扁平结构：若有内容则归入默认空间，避免既有授权丢失
function normalizeByTenant(userAuth, fallbackTenantId) {
  if (userAuth && userAuth.byTenant) {
    return Object.fromEntries(
      Object.entries(userAuth.byTenant).map(([tid, v]) => [tid, pickFlatAuth(v)])
    );
  }
  if (hasContent(userAuth) && fallbackTenantId) {
    return { [fallbackTenantId]: pickFlatAuth(userAuth) };
  }
  return {};
}
