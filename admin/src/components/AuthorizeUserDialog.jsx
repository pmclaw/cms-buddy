import React, { useState, useMemo } from 'react';
import { Modal } from './Overlay.jsx';
import { UserAuthPanel, calcAuthorizedUsers, EMPTY_USER_AUTH } from './AuthorizeDialog.jsx';
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
export function AuthorizeUserDialog({ resource, resourceType, onClose, onSubmit }) {
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

  // 页签列表 = 我管理的空间 ∩ 资产被授权的空间
  const spaceOptions = useMemo(
    () => tenants.filter((t) => managedIds.includes(t.id) && authedIds.includes(t.id)),
    [tenants, managedIds, authedIds]
  );

  // 默认激活页签：优先沿用历史选择，其次当前空间，最后第一个
  const defaultId = useMemo(() => {
    const prior = resource.userAuth && resource.userAuth.tenantId;
    if (spaceOptions.some((t) => t.id === prior)) return prior;
    if (spaceOptions.some((t) => t.id === user.tenantId)) return user.tenantId;
    return spaceOptions.length ? spaceOptions[0].id : '';
  }, [resource, spaceOptions, user]);

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
          该{resourceType}暂未授权给我管理的空间，无可设置的空间
        </div>
      ) : (
        <div>
          {/* ===== 说明 ===== */}
          <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 14 }}>
            按空间分别设置授权用户，每个空间的授权用户互不影响。切换页签即可为不同空间设置不同的用户。
          </div>

          {/* ===== 空间页签（平铺） ===== */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 0, flexWrap: 'wrap',
            borderBottom: '2px solid #F2F4F7', marginBottom: 16,
          }}>
            {spaceOptions.map((t) => {
              const active = t.id === activeId;
              const count = calcAuthorizedUsers(byTenant[t.id] || EMPTY_USER_AUTH).length;
              return (
                <div
                  key={t.id}
                  title={`${t.brandName}（${t.nickname}）`}
                  onClick={() => setActiveId(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', cursor: 'pointer', fontSize: 13.5,
                    fontWeight: 500, marginBottom: -2, transition: 'all 0.2s',
                    color: active ? '#E89E57' : '#6B7280',
                    borderBottom: active ? '2px solid #E89E57' : '2px solid transparent',
                  }}
                >
                  <img
                    src={t.logo}
                    alt=""
                    style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }}
                  />
                  <span>{t.brandName}</span>
                  <span
                    title={`该空间已授权 ${count} 人`}
                    style={{
                      fontSize: 11, lineHeight: 1, padding: '2px 7px', borderRadius: 9,
                      flexShrink: 0,
                      background: count > 0 ? '#FBF1E5' : '#F2F4F7',
                      color: count > 0 ? '#B87136' : '#9CA3AF',
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', paddingBottom: 8 }}>
              共 {spaceOptions.length} 个空间
            </span>
          </div>

          {/* ===== 当前空间说明 ===== */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            fontSize: 12, color: '#6B7280',
          }}>
            <span style={{ width: 3, height: 12, background: '#E89E57', borderRadius: 2, flexShrink: 0 }} />
            正在设置：
            <strong style={{ color: '#B87136', fontWeight: 500 }}>
              {(() => {
                const t = spaceOptions.find((x) => x.id === activeId);
                return t ? `${t.brandName}（${t.nickname}）` : '—';
              })()}
            </strong>
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
