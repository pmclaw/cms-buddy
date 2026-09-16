// Buddy空间管理员 - 基本信息维护
import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon } from '../../components/Common.jsx';
import { ColorPicker } from '../../components/ColorPicker.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { MarkdownEditor } from '../../components/MarkdownEditor.jsx';
import { themeColors, accentColors, channels } from '../../data/mock.js';

export function TenantBasicInfo() {
  const { activeTenantId, user } = useRole();
  const { tenants, upsertTenant } = useStore();
  const toast = useToast();
  const tenant = tenants.find((t) => t.id === activeTenantId);
  const [form, setForm] = useState(tenant);

  useEffect(() => {
    setForm(tenants.find((t) => t.id === activeTenantId));
  }, [activeTenantId, tenants]);

  if (!form) return <div className="page-body">请先选择Buddy空间</div>;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = () => {
    if (!form.nickname) {
      toast.error('请填写昵称');
      return;
    }
    if (!form.systemPrompt || !form.systemPrompt.trim()) {
      toast.error('请填写系统提示词');
      return;
    }
    upsertTenant(form);
    toast.success('基本信息已保存');
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">基本信息维护</h1>
            <div className="page-desc">
              {user.role === 'tenant_admin'
                ? '本Buddy空间管理员可修改以下基本配置，修改保存后 chatbot 即时生效。'
                : '查看与维护Buddy空间的基本配置'}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default" onClick={() => setForm(tenants.find((t) => t.id === activeTenantId))}>
              <Icon name="refresh" size={14} />
              重置
            </button>
            <button className="btn btn-primary" onClick={onSave}>
              <Icon name="check" size={14} />
              保存
            </button>
          </div>
        </div>

        {/* 头像 + Slogan */}
        <div className="card" style={{ padding: 24, marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
          <img src={form.logo} alt={form.brandName} style={{ width: 64, height: 64, borderRadius: 12, border: '1px solid #E5E7EB' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{form.brandName}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{form.slogan}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>默认通道：{form.channel}</div>
          </div>
          <Tag color={form.status === '已上线' ? 'success' : 'default'}>{form.status}</Tag>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F4F7', fontSize: 15, fontWeight: 600 }}>
            Buddy空间基础信息
          </div>
          <div style={{ padding: '8px 24px' }}>
            <BasicRow label="Buddy名称">
              <input className="input" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
            </BasicRow>
            <BasicRow label="昵称" required>
              <input className="input" value={form.nickname} onChange={(e) => set('nickname', e.target.value)} />
              <div className="help-text">Agent 与用户对话时的自称</div>
            </BasicRow>
            <BasicRow label="Slogan 宣传语">
              <input className="input" value={form.slogan} onChange={(e) => set('slogan', e.target.value)} />
            </BasicRow>
            <BasicRow label="Buddy能力说明">
              <textarea className="input" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </BasicRow>
            <BasicRow label="备注">
              <textarea className="input" rows={3} value={form.remark || form.generalDesc || ''} onChange={(e) => set('remark', e.target.value)} />
            </BasicRow>
            <BasicRow label="导航 LOGO">
              <ImageUploader value={form.logo} onChange={(v) => set('logo', v)} shape="avatar" />
            </BasicRow>
            <BasicRow label="IP 形象图">
              <ImageUploader value={form.ipImage} onChange={(v) => set('ipImage', v)} shape="rect" />
            </BasicRow>
            <BasicRow label="主题色" vertical>
              <ColorPicker value={form.themeColor} onChange={(v) => set('themeColor', v)} options={themeColors} />
            </BasicRow>
            <BasicRow label="辅助色" vertical>
              <ColorPicker value={form.accentColor} onChange={(v) => set('accentColor', v)} options={accentColors} />
            </BasicRow>
            <BasicRow label="按钮图标（输入前）">
              <ImageUploader value={form.buttonIconEmpty} onChange={(v) => set('buttonIconEmpty', v)} shape="rect" hint="建议 PNG 透明背景，48x48px" />
            </BasicRow>
            <BasicRow label="按钮图标（输入后）">
              <ImageUploader value={form.buttonIconFilled} onChange={(v) => set('buttonIconFilled', v)} shape="rect" hint="建议 PNG 透明背景，48x48px" />
            </BasicRow>
            <BasicRow label="按钮图标（加载中）">
              <ImageUploader value={form.buttonIconLoading} onChange={(v) => set('buttonIconLoading', v)} shape="rect" hint="建议 PNG 透明背景，48x48px" />
            </BasicRow>
            <BasicRow label="按钮图标（暂停）">
              <ImageUploader value={form.buttonIconPaused} onChange={(v) => set('buttonIconPaused', v)} shape="rect" hint="建议 PNG 透明背景，48x48px" />
            </BasicRow>
            <BasicRow label="默认消息通道">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {channels.map((c) => (
                  <label key={c} style={{
                    padding: '6px 16px', cursor: 'pointer', fontSize: 13,
                    border: '1px solid ' + (form.channel === c ? form.themeColor : '#E5E7EB'),
                    background: form.channel === c ? '#FBF1E5' : '#fff',
                    color: form.channel === c ? '#B87136' : '#6B7280',
                    borderRadius: 6,
                  }}>
                    <input type="radio" name="channel" style={{ display: 'none' }}
                      checked={form.channel === c}
                      onChange={() => set('channel', c)} />
                    {c}
                  </label>
                ))}
              </div>
            </BasicRow>
            <BasicRow label="系统提示词" required vertical>
              <MarkdownEditor
                value={form.systemPrompt || ''}
                onChange={(v) => set('systemPrompt', v)}
                height={300}
              />
              <div className="help-text">调用该空间 Agent 时注入的系统提示词，建议描述身份设定与服务边界</div>
            </BasicRow>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicRow({ label, children, vertical, required }) {
  const labelNode = (
    <span>
      {required && <span style={{ color: '#EF4444', marginRight: 3 }}>*</span>}
      {label}
    </span>
  );
  if (vertical) {
    return (
      <div style={{ padding: '14px 0', borderBottom: '1px dashed #F2F4F7' }}>
        <div className="label">{labelNode}</div>
        {children}
      </div>
    );
  }
  return (
    <div className="form-row" style={{ borderBottom: '1px dashed #F2F4F7' }}>
      <div className="label">{labelNode}</div>
      <div>{children}</div>
    </div>
  );
}

function Tag({ children, color }) {
  return <span className={`tag ${color ? 'tag-' + color : ''}`}>{children}</span>;
}
