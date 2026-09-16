import React, { useState } from 'react';
import { Tabs, Icon } from '../../components/Common.jsx';
import { MarkdownEditor } from '../../components/MarkdownEditor.jsx';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { DEFAULT_SYSTEM_PROMPT } from '../../data/mock.js';

// Buddy 参数管理：系统管理员维护系统级初始化参数
// 当前支持两组默认系统提示词：新建 Buddy 空间 / 新建专家助理时自动带入
const TABS = [
  { key: 'space', label: 'Buddy空间系统提示词' },
  { key: 'expert', label: '专家助理系统提示词' },
];

const META = {
  space: {
    field: 'spacePrompt',
    title: 'Buddy空间系统提示词（System Prompt）',
    desc: '新建 Buddy 空间时，系统提示词自动带入以下内容（创建时仍可继续修改）。保存后仅对之后新建的空间生效，已创建空间不受影响。',
  },
  expert: {
    field: 'expertPrompt',
    title: '专家助理系统提示词（System Prompt）',
    desc: '新建专家助理时，系统提示词自动带入以下内容（创建时仍可继续修改）。保存后仅对之后新建的专家助理生效，已创建专家不受影响。',
  },
};

export function BuddyParams() {
  const { systemSettings, saveSystemSettings } = useStore();
  const toast = useToast();

  const [tab, setTab] = useState('space');
  const [drafts, setDrafts] = useState(() => ({
    space: systemSettings?.spacePrompt || DEFAULT_SYSTEM_PROMPT,
    expert: systemSettings?.expertPrompt || DEFAULT_SYSTEM_PROMPT,
  }));

  const meta = META[tab];
  const cur = drafts[tab];
  const setCur = (v) => setDrafts((d) => ({ ...d, [tab]: v }));

  const onSave = () => {
    if (!cur || !cur.trim()) {
      toast.error('请输入系统提示词');
      return;
    }
    saveSystemSettings({ [meta.field]: cur });
    toast.success('默认系统提示词已更新，新建时自动生效');
  };

  const onReset = () => {
    setCur(DEFAULT_SYSTEM_PROMPT);
    toast.success('已恢复为系统内置默认值，点击「保存」后生效');
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Buddy参数管理</h1>
            <div className="page-desc">
              维护系统级默认参数：新建 Buddy 空间与专家助理时自动带入的默认系统提示词 · 仅系统管理员可维护 · 修改不影响已创建实例
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <Tabs items={TABS} active={tab} onChange={setTab} />
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 1.6 }}>{meta.desc}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>
              <span style={{ color: '#EF4444' }}>*</span> {meta.title}
            </div>
            <MarkdownEditor value={cur} onChange={setCur} height={380} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
              字数：<strong style={{ color: '#E89E57' }}>{(cur || '').length}</strong> ·
              预估 token：{Math.ceil((cur || '').length / 2)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={onSave}>
                <Icon name="check" size={14} />
                保存
              </button>
              <button className="btn btn-default" onClick={onReset}>恢复默认</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
