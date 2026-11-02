import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Section, Tabs, Confirm, Empty } from '../../components/Common.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { Tooltip } from '../../components/Tooltip.jsx';
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
  { key: 'robot', label: '机器人配置' },
  { key: 'recommend', label: '推荐问管理' },
];

// 当前时间：yyyy-MM-dd HH:mm:ss（推荐问的更新人/更新时间展示口径）
function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

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
  const { user } = useRole();
  const [faqTarget, setFaqTarget] = useState(null); // null=关闭；{}=新增；推荐问对象=修改
  const [faqDelTarget, setFaqDelTarget] = useState(null); // 待删除的推荐问
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
      // 推荐问设置：客户端首页展示的推荐问数量与推荐方式
      recommendCount: 6,
      recommendMode: 'fixed',
      recommendQuestions: [],
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
          // 推荐问设置缺省补全：默认 6 条 + 固定
          recommendCount: t.recommendCount ?? 6,
          recommendMode: t.recommendMode || 'fixed',
          hideNavMenus: t.hideNavMenus || [],
        });
      }
    }
  }, [id, isEdit, tenants]);

  if (!form) return <div className="page-body">未找到Buddy空间</div>;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ===== 推荐问管理（按当前 Buddy 空间独立配置，随「保存配置」一并提交） =====
  const faqs = form.recommendQuestions || [];
  // 展示顺序：排序序号升序；序号相同时按创建时间倒序（最新添加的在前）
  const sortedFaqs = [...faqs].sort(
    (a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0)
      || String(b.createTime || '').localeCompare(String(a.createTime || ''))
  );
  const faqUpdater = user?.name || '管理员';
  const saveFaq = (q) => {
    const stamp = nowStamp();
    setForm((f) => {
      const list = f.recommendQuestions || [];
      const exists = !!q.id && list.some((x) => x.id === q.id);
      const nextList = exists
        ? list.map((x) => (x.id === q.id ? { ...x, ...q, updater: faqUpdater, updateTime: stamp } : x))
        : [...list, { ...q, id: `RQ${Date.now().toString(36)}`, updater: faqUpdater, updateTime: stamp, createTime: stamp }];
      return { ...f, recommendQuestions: nextList };
    });
    toast.success(q.id ? '推荐问已修改' : '推荐问已新增');
  };
  const patchFaq = (id, patch) => {
    const stamp = nowStamp();
    setForm((f) => ({
      ...f,
      recommendQuestions: (f.recommendQuestions || []).map((x) => (
        x.id === id ? { ...x, ...patch, updater: faqUpdater, updateTime: stamp } : x
      )),
    }));
  };
  const removeFaq = (id) => {
    setForm((f) => ({ ...f, recommendQuestions: (f.recommendQuestions || []).filter((x) => x.id !== id) }));
    setFaqDelTarget(null);
    toast.success('推荐问已删除');
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
    // 推荐问设置：数量必须是 1-50 的整数（默认 6），方式缺省为「固定」
    const recommendCount = Number(form.recommendCount);
    if (!Number.isInteger(recommendCount) || recommendCount < 1 || recommendCount > 50) {
      toast.error('推荐数量需为 1-50 的整数');
      setTab('basic');
      return;
    }
    upsertTenant({
      ...form,
      recommendCount,
      recommendMode: form.recommendMode || 'fixed',
    });
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
                  {/* 推荐问设置：管理参数，推荐数量默认 6、推荐方式默认「固定」 */}
                  <FormRow label="推荐问设置">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap' }}>推荐数量</span>
                        <input
                          className="input"
                          type="number"
                          min={1}
                          max={50}
                          style={{ width: 120 }}
                          value={form.recommendCount ?? 6}
                          onChange={(e) => set('recommendCount', e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap' }}>推荐方式</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[{ key: 'fixed', label: '固定' }, { key: 'random', label: '随机' }].map((o) => {
                            const active = (form.recommendMode || 'fixed') === o.key;
                            return (
                              <label
                                key={o.key}
                                style={{
                                  padding: '6px 18px', cursor: 'pointer', fontSize: 13,
                                  border: '1px solid ' + (active ? form.themeColor : '#E5E7EB'),
                                  background: active ? '#FBF1E5' : '#fff',
                                  color: active ? '#B87136' : '#6B7280',
                                  borderRadius: 6, fontWeight: active ? 500 : 400,
                                }}
                              >
                                <input
                                  type="radio"
                                  name="recommendMode"
                                  style={{ display: 'none' }}
                                  checked={active}
                                  onChange={() => set('recommendMode', o.key)}
                                />
                                {o.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="help-text">
                      推荐数量为客户端首页展示的推荐问条数（默认 6）；「固定」按排序序号取前 N 条，「随机」每次随机抽取 N 条，「始终推荐」的问题每次都会出现。
                    </div>
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
              // 机器人配置：按设计稿（附图）布局 —— 纯标题 + 通栏字段，无卡片边框 / 无字段下方说明文案
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 6 }}>
                  机器人配置
                </div>
                <RobotConfigRow label="机器人名称">
                  <input
                    className="input"
                    placeholder="如 招小顾聚力机器人"
                    value={form.robotName || ''}
                    onChange={(e) => set('robotName', e.target.value)}
                  />
                </RobotConfigRow>
                <RobotConfigRow label="机器人ID">
                  <input
                    className="input"
                    placeholder="请输入聚力机器人ID"
                    value={form.robotId || ''}
                    onChange={(e) => set('robotId', e.target.value)}
                  />
                </RobotConfigRow>
                <RobotConfigRow label="AppKey">
                  <input
                    className="input"
                    placeholder="请输入聚力机器人AppKey"
                    value={form.appKey || ''}
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
                </RobotConfigRow>
                <RobotConfigRow label="Webhook地址">
                  <input
                    className="input"
                    placeholder="请输入聚力机器人Webhook地址"
                    value={form.webhookUrl || ''}
                    onChange={(e) => set('webhookUrl', e.target.value)}
                  />
                </RobotConfigRow>
              </div>
            )}

            {tab === 'recommend' && (
              <div>
                {/* 说明 + 新增入口 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#9CA3AF', lineHeight: 1.8 }}>
                    推荐问是客户端首页的常见问题气泡：按排序序号从小到大展示，序号相同的以最新添加的在前；「始终推荐」只在推荐方式为随机时生效，这类问题每次都会出现。
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flexShrink: 0 }}
                    onClick={() => setFaqTarget({})}
                  >
                    <Icon name="plus" size={14} />
                    新增推荐问
                  </button>
                </div>

                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>推荐问标题</th>
                        <th style={{ width: 80 }}>排序</th>
                        <th style={{ width: 100 }}>是否启用</th>
                        <th style={{ width: 120 }}>是否始终推荐</th>
                        <th style={{ width: 100 }}>更新人</th>
                        <th style={{ width: 170 }}>更新时间</th>
                        <th style={{ width: 110 }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFaqs.length === 0 ? (
                        <tr>
                          <td colSpan={7}>
                            <Empty icon="💬" tip="暂无推荐问，点击右上角「新增推荐问」添加" />
                          </td>
                        </tr>
                      ) : sortedFaqs.map((q) => (
                        <tr key={q.id}>
                          <td style={{ fontSize: 13, color: '#1F2937' }}>{q.title}</td>
                          <td style={{ fontSize: 13, color: '#4B5563' }}>{q.sort ?? 0}</td>
                          <td>
                            <Toggle checked={!!q.enabled} onChange={(v) => patchFaq(q.id, { enabled: v })} />
                          </td>
                          <td>
                            <Toggle checked={!!q.always} onChange={(v) => patchFaq(q.id, { always: v })} />
                          </td>
                          <td style={{ fontSize: 12, color: '#6B7280' }}>{q.updater || '-'}</td>
                          <td style={{ fontSize: 12, color: '#6B7280' }}>{q.updateTime || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <button
                                type="button"
                                onClick={() => setFaqTarget(q)}
                                style={{ fontSize: 13, color: '#E89E57', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              >
                                修改
                              </button>
                              <button
                                type="button"
                                onClick={() => setFaqDelTarget(q)}
                                style={{ fontSize: 13, color: '#EF4444', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

      {/* 新增 / 修改推荐问 */}
      {faqTarget && (
        <RecommendQuestionDialog
          initial={faqTarget}
          onClose={() => setFaqTarget(null)}
          onSubmit={(q) => {
            saveFaq({ ...q, id: faqTarget.id });
            setFaqTarget(null);
          }}
        />
      )}

      {/* 删除推荐问二次确认 */}
      <Confirm
        open={!!faqDelTarget}
        title="删除推荐问"
        content={`确定删除推荐问「${faqDelTarget?.title || ''}」吗？删除后该问题将不再出现在客户端首页。`}
        danger
        onCancel={() => setFaqDelTarget(null)}
        onOk={() => removeFaq(faqDelTarget.id)}
      />
    </div>
  );
}

// ========== 推荐问：新增 / 修改弹窗 ==========
function RecommendQuestionDialog({ initial, onClose, onSubmit }) {
  const isEdit = !!initial?.id;
  const [title, setTitle] = useState(initial?.title || '');
  const [sort, setSort] = useState(initial?.sort ?? 0);
  const [enabled, setEnabled] = useState(isEdit ? !!initial.enabled : true);
  const [always, setAlways] = useState(!!initial?.always);
  const toast = useToast();

  const submit = () => {
    if (!title.trim()) {
      toast.error('请填写推荐问标题');
      return;
    }
    onSubmit({
      title: title.trim(),
      sort: Number(sort) || 0,
      enabled,
      always,
    });
  };

  return (
    <Modal
      open
      title={isEdit ? '修改推荐问' : '新增推荐问'}
      onClose={onClose}
      width={640}
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={submit}>确认</button>
        </>
      }
    >
      <div style={{ padding: '4px 0' }}>
        <FaqRow label="推荐问标题" required>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              style={{ paddingRight: 76 }}
              maxLength={200}
              placeholder="例如：帮我生成今日最新的盘前小结"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 12, color: '#9CA3AF', pointerEvents: 'none',
            }}>
              {title.length} / 200
            </span>
          </div>
        </FaqRow>
        <FaqRow label="排序" tip="数值越小越靠前；排序序号相同时，最新添加的排在前面">
          <input
            className="input"
            type="number"
            min={0}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </FaqRow>
        <FaqRow label="是否启用">
          <Toggle checked={enabled} onChange={setEnabled} />
        </FaqRow>
        <FaqRow label="是否始终推荐" tip="仅在推荐方式为随机时生效；开启后该问题每次都会出现">
          <Toggle checked={always} onChange={setAlways} />
        </FaqRow>
      </div>
    </Modal>
  );
}

// 弹窗字段行：110px 标签列 + 通栏控件（无分隔线）
function FaqRow({ label, required, tip, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <div style={{ fontSize: 13, color: '#4B5563', display: 'flex', alignItems: 'center' }}>
        {required && <span style={{ color: '#EF4444', marginRight: 2 }}>*</span>}
        <span>{label}</span>
        {tip && <Tooltip text={tip} />}
      </div>
      <div>{children}</div>
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

// 机器人配置行：按设计稿布局 —— 左侧 90px 灰色标签 + 右侧通栏输入框（无虚线分隔、无说明文案）
function RobotConfigRow({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', padding: '10px 0' }}>
      <div style={{ fontSize: 14, color: '#6B7280' }}>{label}</div>
      <div>{children}</div>
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

