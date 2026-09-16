import React, { useState } from 'react';
import { Modal } from './Overlay.jsx';
import { AuthSettingsSection } from './AuthSettingsSection.jsx';
import { useRole } from '../contexts/RoleContext.jsx';

// 授权空间弹窗：专家助理 / Skill技能 / MCP服务 列表行操作「授权空间」使用。
// 内容与新建 / 编辑弹窗中的「授权设置」页签保持一致：
//   1) 授权给空间 —— 全局开放 / 指定空间（多选空间，含“已关联资产的指定空间锁定为锁形”语义）
//   2) 允许Buddy系统管理员授权 —— 复选框勾选项（位于区块最下方）
//      注：系统管理员视角下不展示该区块（系统管理员无需配置“是否允许自己授权”）
// onSubmit(openScope, openTenants, allowSysAuth)
// spaceNotice：可选红色补充说明，渲染在「授权给空间」下方（如：关联的技能与MCP工具将一并授权）
export function AuthorizeSpaceDialog({ resource, resourceType, onClose, onSubmit, spaceNotice }) {
  const { user } = useRole();
  const isPlatform = user?.role === 'system_admin';
  const [openScope, setOpenScope] = useState(resource.openScope === 'tenant' ? 'tenant' : 'all');
  const [openTenants, setOpenTenants] = useState(resource.openTenants || []);
  const [allowSysAuth, setAllowSysAuth] = useState(resource.allowSysAuth !== false);

  const change = (k, v) => {
    if (k === 'openScope') setOpenScope(v === 'tenant' ? 'tenant' : 'all');
    else if (k === 'openTenants') setOpenTenants(v || []);
    else if (k === 'allowSysAuth') setAllowSysAuth(!!v);
  };

  return (
    <Modal
      open
      title={`授权空间 - ${resourceType}「${resource.name}」`}
      onClose={onClose}
      width="wide"
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(openScope, openTenants, allowSysAuth)}
          >确定</button>
        </>
      }
    >
      <div>
        <div style={{ marginBottom: 12, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
          配置该{resourceType}的开放范围与共享授权策略，保存后立即生效。
        </div>
        <AuthSettingsSection
          resourceType={resourceType}
          resource={{ id: resource.id, name: resource.name, openScope, openTenants }}
          allowSysAuth={allowSysAuth}
          onChange={change}
          spaceNotice={spaceNotice}
          hideSysAuth={isPlatform}
        />
      </div>
    </Modal>
  );
}
