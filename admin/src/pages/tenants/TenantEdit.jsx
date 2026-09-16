import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Icon, Section, Tabs } from '../../components/Common.jsx';
import { ColorPicker } from '../../components/ColorPicker.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { MarkdownEditor } from '../../components/MarkdownEditor.jsx';
import { themeColors, accentColors, channels, adminAccounts, DEFAULT_SYSTEM_PROMPT } from '../../data/mock.js';
import emptyBtnIcon from '../../assets/default-btn/empty.png';
import filledBtnIcon from '../../assets/default-btn/filled.png';
import pausedBtnIcon from '../../assets/default-btn/paused.png';

// 系统默认按钮图标（按状态：empty 输入文字前 / filled 输入文字后 / paused 暂停）
const DEFAULT_BTN_ICONS = {
  empty: emptyBtnIcon,
  filled: filledBtnIcon,
  paused: pausedBtnIcon,
};



const TABS = [
  { key: 'basic', label: '基本信息' },
  { key: 'brand', label: '主题风格' },
  { key: 'system', label: '系统提示词' },
  { key: 'robot', label: '聚力机器人' },
];

function generateAppCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 聚力机器人消息接收 URL（创建 Buddy 空间时随 appCode 自动生成，创建后保持不变）
function generateReceiveUrl(appCode) {
  return 'https://juli-open.workbuddy.link/robot/receive/' + (appCode || '');
}

// 可配置的功能导航菜单（默认全部展示；hideNavMenus 记录被隐藏的菜单 key）
const NAV_MENUS = [
  { key: 'skillCenter', label: '技能中心' },
  { key: 'expertAssistant', label: '专家助理' },
  { key: 'automationTask', label: '自动化任务' },
];

// 提交按钮图标单元格：ImageUploader + 默认图标预览/使用/清空
function ButtonIconField({ label, hint, value, onChange, defaultIcon }) {
  const isDefault = value === defaultIcon;
  const isEmpty = !value;
  return (
    <div>
      <div className="label">{label}</div>
      <ImageUploader
        value={value}
        onChange={onChange}
        shape="rect"
        hint="建议 PNG 透明背景，48x48px"
      />
      <div className="help-text">{hint}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 10,
        padding: 8, background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: 6,
      }}>
        <img
          src={defaultIcon}
          alt="系统默认图标"
          style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'contain', flexShrink: 0, background: '#fff' }}
        />
        <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#6B7280' }}>
          <div style={{ color: '#374151', fontWeight: 500, marginBottom: 2 }}>系统默认图标</div>
          {isDefault && <span style={{ color: '#15803D', fontSize: 11 }}>✓ 当前为系统默认</span>}
          {isEmpty && <span style={{ color: '#9CA3AF', fontSize: 11 }}>未设置将使用系统默认</span>}
          {!isEmpty && !isDefault && <span style={{ color: '#B45309', fontSize: 11 }}>已自定义上传</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {!isDefault && (
            <button
              type="button"
              onClick={() => onChange(defaultIcon)}
              style={{ fontSize: 12, color: '#E89E57', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
            >使用系统默认</button>
          )}
          {!isEmpty && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
            >清空</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TenantEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tenants, upsertTenant, systemSettings } = useStore();
  const toast = useToast();
  const isEdit = !!id;

  const [tab, setTab] = useState('basic');
  const [showSecret, setShowSecret] = useState(false); // AppSecret 明文/掩码切换
  const [form, setForm] = useState(() => {
    if (isEdit) {
      const t = tenants.find((x) => x.id === id);
      return t ? { ...t } : null;
    }
    const appCode = generateAppCode();
    return {
      id: 'T' + String(tenants.length + 1).padStart(3, '0'),
      appCode,
      receiveUrl: generateReceiveUrl(appCode),
      brandName: '',
      nickname: '',
      guideText: '',
      slogan: '',
      description: '',
      logo: '',
      ipImage: '',
      themeColor: '#E89E57',
      accentColor: '#F59E0B',
      buttonIconEmpty: '',
      buttonIconFilled: '',
      buttonIconLoading: '',
      buttonIconPaused: '',
      channel: '企业微信',
      spaceAdmins: [],
      systemPrompt: (systemSettings?.spacePrompt || DEFAULT_SYSTEM_PROMPT),
      robotName: '',
      appKey: '',
      appSecret: '',
      robotId: '',
      webhookUrl: '',
      hideNavMenus: [],
      status: '已上线',
      creator: '系统管理员',
    };
  });

  useEffect(() => {
    if (isEdit) {
      const t = tenants.find((x) => x.id === id);
      if (t) {
        setForm({
          ...t,
          // 聚力机器人配置缺省补全：老空间若未生成过则按 appCode 自动生成 URL
          receiveUrl: t.receiveUrl || generateReceiveUrl(t.appCode || t.code || ''),
          robotName: t.robotName || '',
          appKey: t.appKey || '',
          appSecret: t.appSecret || '',
          robotId: t.robotId || '',
          webhookUrl: t.webhookUrl || '',
          hideNavMenus: t.hideNavMenus || [],
        });
      }
    }
  }, [id, isEdit, tenants]);

  if (!form) return <div className="page-body">未找到Buddy空间</div>;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // 复制消息接收 URL（优先 Clipboard API，失败降级 execCommand）
  const copyReceiveUrl = async () => {
    const url = form.receiveUrl || '';
    try {
      await navigator.clipboard.writeText(url);
      toast.success('消息接收URL已复制');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast.success('消息接收URL已复制');
      } catch {
        toast.error('复制失败，请手动选择复制');
      }
    }
  };

  const onSave = () => {
    if (!form.brandName) {
      toast.error('请填写Buddy名称');
      setTab('basic');
      return;
    }
    if (!form.nickname) {
      toast.error('请填写Buddy昵称');
      setTab('basic');
      return;
    }
    if (!form.systemPrompt || !form.systemPrompt.trim()) {
      toast.error('请填写系统提示词');
      setTab('system');
      return;
    }
    upsertTenant(form);
    toast.success(isEdit ? '修改成功' : '创建成功');
    navigate('/tenants');
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {isEdit ? `编辑Buddy空间 · ${form.brandName}` : '新建Buddy空间'}
            </h1>
            <div className="page-desc">
              {isEdit ? `ID ${form.id} · 创建于 ${form.createTime}` : '配置Buddy空间的基础信息与主题风格'}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default" onClick={() => navigate('/tenants')}>取消</button>
            <button className="btn btn-primary" onClick={onSave}>
              <Icon name="check" size={14} />
              保存
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <Tabs items={TABS} active={tab} onChange={setTab} />

          <div style={{ padding: '24px' }}>
            {tab === 'basic' && (
              <div>
                <Section title="核心信息" bodyStyle={{ padding: '8px 20px' }}>
                  <FormRow label="APP_CODE">
                    <input
                      className="input"
                      value={form.appCode || form.code || ''}
                      disabled
                    />
                    <div className="help-text">系统自动生成的12位唯一标识，不可更改</div>
                  </FormRow>
                  <FormRow label="Buddy名称" required>
                    <input
                      className="input"
                      placeholder="对外正式名称，如 招小顾"
                      value={form.brandName}
                      onChange={(e) => set('brandName', e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="Buddy昵称" required>
                    <input
                      className="input"
                      placeholder="chatbot 自称昵称，如 小顾"
                      value={form.nickname}
                      onChange={(e) => set('nickname', e.target.value)}
                      onFocus={() => {
                        // 焦点进入昵称时，若昵称为空且已填写 Buddy 名称，自动回填
                        if (!form.nickname && form.brandName) set('nickname', form.brandName);
                      }}
                    />
                    <div className="help-text">Agent 与用户对话时的自称，例如"我是小顾..."</div>
                  </FormRow>
                  <FormRow label="默认引导语">
                    <input
                      className="input"
                      placeholder="例如：你好，我是小招Buddy，请问有什么可以帮您？"
                      value={form.guideText || ''}
                      onChange={(e) => set('guideText', e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="Slogan 宣传语">
                    <input
                      className="input"
                      placeholder="一句对外宣传语"
                      value={form.slogan}
                      onChange={(e) => set('slogan', e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="Buddy能力说明">
                    <textarea
                      className="input"
                      placeholder="一段简要介绍，将在 chatbot 中展示"
                      rows={4}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="描述">
                    <textarea
                      className="input"
                      placeholder="描述信息（内部备注）"
                      rows={3}
                      value={form.generalDesc || form.remark || ''}
                      onChange={(e) => set('remark', e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="空间管理员" required vertical>
                    <MultiSelectAccounts
                      value={form.spaceAdmins || []}
                      onChange={(v) => set('spaceAdmins', v)}
                    />
                    <div className="help-text">支持填写多个 OA 账号（如 jiangchao5），将以多选标签形式展示</div>
                  </FormRow>
                  <FormRow label="默认消息通道" required vertical>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {channels.map((c) => (
                        <label
                          key={c}
                          style={{
                            padding: '6px 16px',
                            border: '1px solid ' + (form.channel === c ? form.themeColor : '#E5E7EB'),
                            background: form.channel === c ? '#FBF1E5' : '#fff',
                            color: form.channel === c ? '#B87136' : '#6B7280',
                            borderRadius: 6, cursor: 'pointer', fontSize: 13,
                            fontWeight: form.channel === c ? 500 : 400,
                          }}
                        >
                          <input
                            type="radio" name="channel"
                            style={{ display: 'none' }}
                            checked={form.channel === c}
                            onChange={() => set('channel', c)}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                    <div className="help-text">
                      <Icon name="doc" size={12} /> 设置默认消息通道后，用户在该Buddy空间下创建的自动化任务，定时推送将仅可通过所选通道投递。
                    </div>
                  </FormRow>
                  <FormRow label="上线状态" required>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['已上线', '已下线'].map((s) => (
                        <label
                          key={s}
                          style={{
                            padding: '6px 16px', cursor: 'pointer', fontSize: 13,
                            border: '1px solid ' + (form.status === s ? form.themeColor : '#E5E7EB'),
                            background: form.status === s ? '#FBF1E5' : '#fff',
                            color: form.status === s ? '#B87136' : '#6B7280',
                            borderRadius: 6,
                          }}
                        >
                          <input
                            type="radio"
                            name="status" style={{ display: 'none' }}
                            checked={form.status === s}
                            onChange={() => set('status', s)}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </FormRow>
                </Section>
              </div>
            )}

            {tab === 'brand' && (
              <div>
                <Section title="视觉形象" bodyStyle={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    <div>
                      <div className="label">导航 LOGO</div>
                      <ImageUploader
                        value={form.logo}
                        onChange={(v) => set('logo', v)}
                        shape="avatar"
                      />
                    </div>
                    <div>
                      <div className="label">首页 IP 形象</div>
                      <ImageUploader
                        value={form.ipImage}
                        onChange={(v) => set('ipImage', v)}
                        shape="rect"
                        hint="建议 PNG 透明背景，400x400px"
                      />
                    </div>
                  </div>
                </Section>

                <Section title="主题色" bodyStyle={{ padding: '16px 20px' }}>
                  <FormRow label="主色" vertical>
                    <ColorPicker
                      value={form.themeColor}
                      onChange={(v) => set('themeColor', v)}
                      options={themeColors}
                    />
                  </FormRow>
                  <FormRow label="辅助色" vertical>
                    <ColorPicker
                      value={form.accentColor}
                      onChange={(v) => set('accentColor', v)}
                      options={accentColors}
                    />
                  </FormRow>
                </Section>

                <Section title="提交按钮图标" bodyStyle={{ padding: '16px 20px' }}>
                  <div style={{
                    padding: '8px 12px', background: '#FFF8EE', border: '1px solid #FBE4C0',
                    borderRadius: 6, marginBottom: 16, fontSize: 12, color: '#92400E',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    未上传图标时，系统将自动使用系统提供的默认按钮图标。
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                    <ButtonIconField
                      label="输入文字前"
                      hint="用户未输入文字时发送按钮的图标素材"
                      value={form.buttonIconEmpty}
                      onChange={(v) => set('buttonIconEmpty', v)}
                      defaultIcon={DEFAULT_BTN_ICONS.empty}
                    />
                    <ButtonIconField
                      label="输入文字后"
                      hint="用户输入文字后发送按钮的图标素材"
                      value={form.buttonIconFilled}
                      onChange={(v) => set('buttonIconFilled', v)}
                      defaultIcon={DEFAULT_BTN_ICONS.filled}
                    />
                    <ButtonIconField
                      label="暂停"
                      hint="对话暂停时发送按钮的图标素材"
                      value={form.buttonIconPaused}
                      onChange={(v) => set('buttonIconPaused', v)}
                      defaultIcon={DEFAULT_BTN_ICONS.paused}
                    />
                  </div>
                </Section>

                <Section title="导航菜单" bodyStyle={{ padding: '16px 20px' }}>
                  <div style={{
                    padding: '8px 12px', background: '#FFF8EE', border: '1px solid #FBE4C0',
                    borderRadius: 6, marginBottom: 16, fontSize: 12, color: '#92400E',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    控制功能导航菜单是否展示，默认全部展示；关闭开关后对应菜单将被隐藏。
                  </div>
                  <div style={{ border: '1px solid #F2F4F7', borderRadius: 8, overflow: 'hidden' }}>
                    {NAV_MENUS.map((m, i) => {
                      const hidden = (form.hideNavMenus || []).includes(m.key);
                      return (
                        <div
                          key={m.key}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px',
                            borderBottom: i < NAV_MENUS.length - 1 ? '1px solid #F2F4F7' : 'none',
                            background: i % 2 === 1 ? '#FBFCFD' : '#fff',
                          }}
                        >
                          <span style={{ flex: 1, fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{m.label}</span>
                          <span style={{ fontSize: 12, color: hidden ? '#9CA3AF' : '#15803D', marginRight: 2 }}>
                            {hidden ? '已隐藏' : '展示中'}
                          </span>
                          <Toggle
                            checked={!hidden}
                            onChange={(checked) => {
                              const cur = form.hideNavMenus || [];
                              set('hideNavMenus', checked ? cur.filter((k) => k !== m.key) : [...cur, m.key]);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Section>

              </div>
            )}

            {tab === 'system' && (
              <div>
                <Section title={<span><span style={{ color: '#EF4444' }}>*</span> 系统提示词（System Prompt）</span>} bodyStyle={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 1.6 }}>
                    在调用该空间的 Agent 时，将作为知识注入到运行框架中。新建空间时已预置默认提示词，可在此基础上修改。
                  </div>
                  <MarkdownEditor
                    value={form.systemPrompt || ''}
                    onChange={(v) => set('systemPrompt', v)}
                    height={340}
                  />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
                    字数：<strong style={{ color: '#E89E57' }}>{(form.systemPrompt || '').length}</strong> ·
                    预估 token：{Math.ceil((form.systemPrompt || '').length / 2)}
                  </div>
                </Section>
              </div>
            )}

            {tab === 'robot' && (
              <div>
                {/* 消息接收 URL */}
                <Section title="消息接收 URL" bodyStyle={{ padding: '16px 20px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', background: '#FFF8EE', border: '1px solid #FBE4C0',
                    borderRadius: 6, marginBottom: 16, fontSize: 12, color: '#92400E',
                  }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    聚力机器人接收消息的唯一回调地址，由系统在创建 Buddy 空间时自动生成，创建后保持不变。
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      flex: 1, minWidth: 0,
                      padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 6,
                      background: '#F8F9FB', fontSize: 13, color: '#1F2937',
                      fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }} title={form.receiveUrl}>{form.receiveUrl}</div>
                    <button
                      type="button"
                      onClick={copyReceiveUrl}
                      className="btn btn-default"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <Icon name="copy" size={14} color="#E89E57" />
                      复制
                    </button>
                  </div>
                </Section>

                {/* 机器人配置 */}
                <Section title="机器人配置" bodyStyle={{ padding: '8px 20px' }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF', padding: '10px 0 6px' }}>
                    配置聚力机器人的关键 KEY 信息，用于消息推送鉴权与签名校验。
                  </div>
                  <FormRow label="机器人名称">
                    <input
                      className="input"
                      style={{ maxWidth: 420 }}
                      placeholder="如 招小顾聚力机器人"
                      value={form.robotName || ''}
                      onChange={(e) => set('robotName', e.target.value)}
                    />
                    <div className="help-text">需与聚力开放平台创建的机器人名称保持一致</div>
                  </FormRow>
                  <FormRow label="机器人ID">
                    <input
                      className="input"
                      style={{ maxWidth: 420, fontFamily: 'monospace' }}
                      placeholder="请输入聚力机器人ID"
                      value={form.robotId || ''}
                      onChange={(e) => set('robotId', e.target.value)}
                    />
                    <div className="help-text">聚力机器人的唯一ID信息</div>
                  </FormRow>
                  <FormRow label="AppKey">
                    <input
                      className="input"
                      style={{ maxWidth: 420, fontFamily: 'monospace' }}
                      placeholder="请输入机器人 AppKey"
                      value={form.appKey || ''}
                      onChange={(e) => set('appKey', e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="AppSecret">
                    <div style={{ position: 'relative', maxWidth: 420 }}>
                      <input
                        className="input"
                        type={showSecret ? 'text' : 'password'}
                        placeholder="请输入机器人 AppSecret"
                        style={{ width: '100%', paddingRight: 40, fontFamily: 'monospace' }}
                        value={form.appSecret || ''}
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
                    <div className="help-text">AppSecret 用于接口签名校验</div>
                  </FormRow>
                  <FormRow label="Webhook地址">
                    <input
                      className="input"
                      style={{ maxWidth: 420, fontFamily: 'monospace' }}
                      placeholder="请输入聚力机器人 Webhook 地址"
                      value={form.webhookUrl || ''}
                      onChange={(e) => set('webhookUrl', e.target.value)}
                    />
                    <div className="help-text">聚力机器人主动发送消息的 API 地址</div>
                  </FormRow>
                </Section>
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px', borderTop: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'flex-end', gap: 10
          }}>
            <button className="btn btn-default" onClick={() => navigate('/tenants')}>取消</button>
            <button className="btn btn-primary" onClick={onSave}>
              <Icon name="check" size={14} />
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiSelectAccounts({ value = [], onChange }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const add = (v) => {
    const t = (v || '').trim();
    if (!t) return;
    if (value.includes(t)) {
      toast.info('账号已存在');
      return;
    }
    onChange([...value, t]);
    setInput('');
  };

  const remove = (v) => {
    onChange(value.filter((x) => x !== v));
  };

  // 过滤候选列表
  const suggestions = adminAccounts.filter(
    (a) => !value.includes(a.value) && a.value.includes(input)
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6,
        background: '#fff', minHeight: 38, alignItems: 'center'
      }}>
        {value.map((v) => (
          <span
            key={v}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 4,
              background: '#FBF1E5', color: '#B87136', fontSize: 12,
              border: '1px solid #F4D9B6'
            }}
          >
            {v}
            <span
              onClick={() => remove(v)}
              style={{ cursor: 'pointer', color: '#B87136', fontWeight: 600, marginLeft: 2 }}
              title="移除"
            >×</span>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            } else if (e.key === 'Backspace' && !input && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={value.length ? '' : '输入 OA 账号后回车，如 jiangchao5'}
          style={{
            border: 'none', outline: 'none', flex: 1, minWidth: 200,
            fontSize: 13, padding: '4px 0', background: 'transparent'
          }}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginTop: 4, zIndex: 10,
          maxHeight: 200, overflow: 'auto'
        }}>
          {suggestions.map((s) => (
            <div
              key={s.value}
              onMouseDown={() => add(s.value)}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                color: '#1F2937'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FBF1E5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
            >
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormRow({ label, children, required, vertical }) {
  if (vertical) {
    return (
      <div style={{ padding: '12px 0' }}>
        <div className="label">{required && <span className="req">*</span>}{label}</div>
        {children}
      </div>
    );
  }
  return (
    <div className="form-row" style={{ borderBottom: '1px dashed #F2F4F7' }}>
      <div className="label">{required && <span className="req">*</span>}{label}</div>
      <div>{children}</div>
    </div>
  );
}

