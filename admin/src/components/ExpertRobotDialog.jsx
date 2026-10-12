import React, { useState } from 'react';
import { Modal } from './Overlay.jsx';
import { Icon } from './Common.jsx';

// 专家助理「配置机器人」弹窗（Buddy 空间管理 → 构建能力 → 专家助理 页签使用）。
//
// 语义：机器人配置**按 Buddy 空间维度**存储，同一专家助理在不同空间可分别配置不同的机器人。
//   数据结构：expert.robotByTenant = { [tenantId]: { robotName, robotId, appKey, appSecret, webhookUrl } }
//
// 布局与 Buddy 空间管理「机器人配置」页签完全同口径：纯标题 + 5 个通栏字段
//（左侧 90px 灰色标签列、无分隔线、无字段说明小字、AppSecret 支持明文切换）。
export function ExpertRobotDialog({ expert, tenant, onClose, onSubmit }) {
  const init = ((expert && expert.robotByTenant) || {})[tenant && tenant.id] || {};
  const [form, setForm] = useState({
    robotName: init.robotName || '',
    robotId: init.robotId || '',
    appKey: init.appKey || '',
    appSecret: init.appSecret || '',
    webhookUrl: init.webhookUrl || '',
  });
  const [showSecret, setShowSecret] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open
      title={`配置机器人 - 专家助理「${expert ? expert.name : ''}」`}
      onClose={onClose}
      width="wide"
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={() => onSubmit(form)}>确定</button>
        </>
      }
    >
      <div>
        <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 14 }}>
          当前 Buddy 空间：<strong style={{ color: '#E89E57' }}>{tenant ? tenant.brandName : ''}</strong>
          <span style={{ color: '#9CA3AF' }}>（该配置仅在此空间内生效，不同空间可分别配置）</span>
        </div>

        <RobotConfigRow label="机器人名称">
          <input
            className="input"
            placeholder="如 招小顾聚力机器人"
            value={form.robotName}
            onChange={(e) => set('robotName', e.target.value)}
          />
        </RobotConfigRow>
        <RobotConfigRow label="机器人ID">
          <input
            className="input"
            placeholder="请输入聚力机器人ID"
            value={form.robotId}
            onChange={(e) => set('robotId', e.target.value)}
          />
        </RobotConfigRow>
        <RobotConfigRow label="AppKey">
          <input
            className="input"
            placeholder="请输入聚力机器人AppKey"
            value={form.appKey}
            onChange={(e) => set('appKey', e.target.value)}
          />
        </RobotConfigRow>
        <RobotConfigRow label="AppSecret">
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showSecret ? 'text' : 'password'}
              placeholder="请输入聚力机器人AppSecret"
              style={{ paddingRight: 40 }}
              value={form.appSecret}
              onChange={(e) => set('appSecret', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              title={showSecret ? '隐藏 AppSecret' : '查看 AppSecret'}
              style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                width: 30, height: 30, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <Icon name="eye" size={16} color={showSecret ? '#E89E57' : '#9CA3AF'} />
            </button>
          </div>
        </RobotConfigRow>
        <RobotConfigRow label="Webhook地址">
          <input
            className="input"
            placeholder="请输入聚力机器人Webhook地址"
            value={form.webhookUrl}
            onChange={(e) => set('webhookUrl', e.target.value)}
          />
        </RobotConfigRow>
      </div>
    </Modal>
  );
}

// 机器人配置行：与 Buddy 空间管理同款布局 —— 左侧 90px 灰色标签 + 右侧通栏输入框（无虚线分隔、无说明文案）
function RobotConfigRow({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', padding: '10px 0' }}>
      <div style={{ fontSize: 14, color: '#6B7280' }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}
