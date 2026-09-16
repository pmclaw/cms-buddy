import React, { useMemo } from 'react';
import { useStore } from '../contexts/StoreContext.jsx';
import { openScopes } from '../data/mock.js';
import { Icon } from './Common.jsx';
import { Checkbox } from './Checkbox.jsx';
import { TENANT_ASSOC_FIELD } from './AuthorizeDialog.jsx';

// 「授权设置」区块组件：用于能力资源（技能 / MCP服务）的添加 / 编辑 / 详情表单内嵌
// 包含：
//   1) 授权给空间 —— 全局开放 / 指定空间（多选空间），沿用行操作「授权」弹窗的锁定语义：
//      已指定且已在 Buddy 空间构建能力中关联了该资产的空间不可取消指定（对勾 → 锁形）
//   2) 允许Buddy系统管理员授权 allowSysAuth —— 复选框勾选项，位于本区块最下方
//      （指定空间时位于空间列表之下）：勾选后 Buddy 系统管理员可将该资产授权给其他空间使用；
//      取消勾选则系统管理员授权入口被禁用
//      hideSysAuth=true 时不渲染该区块（用于「授权空间」弹窗：系统管理员视角无需该配置项）
// 注：spaceOnlyVisible（仅限本空间可见）配置入口已下线，数据字段保留以兼容存量数据与中心库过滤。
// onChange 直接写回外层表单字段：openScope / openTenants / allowSysAuth
export function AuthSettingsSection({
  resourceType,
  resource,
  allowSysAuth = true,
  readOnly = false,
  onChange,
  spaceNotice,
  hideSysAuth = false,
}) {
  const { tenants } = useStore();
  const openScope = resource.openScope === 'tenant' ? 'tenant' : 'all';
  const openTenants = resource.openTenants || [];

  // 已关联的指定空间：该空间正在使用此资产（构建能力中已关联），不可取消指定
  const linkedTenantIds = useMemo(() => {
    if (resource.openScope !== 'tenant' || !resource.id) return [];
    const assocField = TENANT_ASSOC_FIELD[resourceType] || 'skillIds';
    return (resource.openTenants || []).filter((tid) => {
      const t = tenants.find((x) => x.id === tid);
      return !!t && (t[assocField] || []).includes(resource.id);
    });
  }, [resource, resourceType, tenants]);

  const toggleTenant = (id) => {
    if (readOnly || linkedTenantIds.includes(id)) return; // 已关联的指定空间不可取消指定
    const arr = openTenants.includes(id)
      ? openTenants.filter((x) => x !== id)
      : [...openTenants, id];
    onChange('openTenants', arr);
  };

  return (
    <div>
      {/* ===== 授权给空间 ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 3, height: 14, background: '#E89E57', borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>授权给空间</span>
      </div>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
        设置该{resourceType}的开放范围，指定空间后仅被授权的空间可见可用。
      </div>
      {/* 可选红色补充说明（如：授权时关联的技能与MCP工具一并开放） */}
      {spaceNotice && (
        <div style={{ marginBottom: 12, fontSize: 12, color: '#EF4444', lineHeight: 1.6 }}>
          {spaceNotice}
        </div>
      )}

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
              borderRadius: 6, cursor: readOnly ? 'default' : 'pointer',
              fontSize: 13, fontWeight: openScope === sc.value ? 500 : 400,
              opacity: readOnly ? 0.75 : 1,
            }}
          >
            <input
              type="radio" name="authScope"
              style={{ display: 'none' }}
              checked={openScope === sc.value}
              onChange={() => onChange('openScope', sc.value)}
              disabled={readOnly}
            />
            {sc.label}
          </label>
        ))}
      </div>

      {/* 指定空间：多选空间 */}
      {openScope === 'tenant' && (
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: 12, maxHeight: 260, overflow: 'auto', marginBottom: 8 }}>
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
                    borderRadius: 6, cursor: linked || readOnly ? 'not-allowed' : 'pointer', fontSize: 13,
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
        <div style={{ marginBottom: 12, fontSize: 12, color: '#9CA3AF' }}>
          未选择任何空间时，该{resourceType}暂不向任何空间开放（列表中显示为「暂未授权」）
        </div>
      )}

      {/* 允许 Buddy 系统管理员授权：复选框勾选项，位于本区块最下方（指定空间时在空间列表之下）
          hideSysAuth=true（授权空间弹窗）时不展示该区块 */}
      {!hideSysAuth && (
        <div
          onClick={() => !readOnly && onChange('allowSysAuth', !allowSysAuth)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 6,
            background: '#FBFCFD',
            cursor: readOnly ? 'default' : 'pointer',
          }}
        >
          <Checkbox
            checked={!!allowSysAuth}
            disabled={readOnly}
            onChange={() => onChange('allowSysAuth', !allowSysAuth)}
          />
          <div>
            <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>允许Buddy系统管理员授权</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, lineHeight: 1.6 }}>
              允许后，Buddy系统管理员可以将该{resourceType}授权给其他空间使用。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
