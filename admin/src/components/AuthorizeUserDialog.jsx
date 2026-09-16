import React, { useState, useMemo } from 'react';
import { Modal } from './Overlay.jsx';
import { UserAuthPanel } from './AuthorizeDialog.jsx';
import { useRole } from '../contexts/RoleContext.jsx';
import { useStore } from '../contexts/StoreContext.jsx';

// 授权用户弹窗：专家助理 / Skill技能 列表行操作「授权用户」使用（空间管理员视角）。
// 弹窗顶部先选择「所属空间」——可选范围 = 当前空间管理员管理的空间 ∩ 当前资产被授权（开放）的空间，
// 用户授权仅作用于所选空间内的用户（用户组渠道按空间归属过滤，系统级用户组所有空间可用）。
// onSubmit(userAuth)：userAuth 内携带 tenantId（授权所属空间）
export function AuthorizeUserDialog({ resource, resourceType, onClose, onSubmit }) {
  const { user } = useRole();
  const { tenants } = useStore();
  const [userAuth, setUserAuth] = useState(
    resource.userAuth || { groupIds: [], deptIds: [], userIds: [], excludedUserIds: [] }
  );

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

  // 所属空间可选列表 = 我管理的空间 ∩ 资产被授权的空间
  const spaceOptions = useMemo(
    () => tenants.filter((t) => managedIds.includes(t.id) && authedIds.includes(t.id)),
    [tenants, managedIds, authedIds]
  );

  const initTenantId = () => {
    const prior = resource.userAuth && resource.userAuth.tenantId;
    if (spaceOptions.some((t) => t.id === prior)) return prior;
    if (spaceOptions.some((t) => t.id === user.tenantId)) return user.tenantId;
    return spaceOptions.length ? spaceOptions[0].id : '';
  };
  const [tenantId, setTenantId] = useState(initTenantId);

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
            onClick={() => onSubmit({ ...userAuth, tenantId: tenantId || undefined })}
          >确定</button>
        </>
      }
    >
      <div>
        {/* ===== 所属空间：可选范围 = 当前空间管理员管理的空间 ∩ 当前资产被授权的空间 ===== */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          paddingBottom: 14, marginBottom: 16, borderBottom: '1px dashed #E5E7EB',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', whiteSpace: 'nowrap' }}>所属空间</span>
          {spaceOptions.length ? (
            <select
              className="select"
              style={{ maxWidth: 320 }}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              {spaceOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.brandName}（{t.nickname}）</option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>该{resourceType}暂未授权给我管理的空间，无可选空间</span>
          )}
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>仅可将该{resourceType}授权给所选空间内的用户</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 3, height: 14, background: '#E89E57', borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>授权给用户</span>
        </div>
        <UserAuthPanel
          resourceType={resourceType}
          tenantId={tenantId || undefined}
          value={userAuth}
          onChange={setUserAuth}
        />
      </div>
    </Modal>
  );
}
