import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Tabs } from '../../components/Common.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { MarkdownEditor } from '../../components/MarkdownEditor.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Checkbox } from '../../components/Checkbox.jsx';
import { McpToolsDialog } from '../../components/McpToolsDialog.jsx';
import { SelectedToolsDialog } from '../../components/SelectedToolsDialog.jsx';
import { tagOptions as tagOpts, DEFAULT_SYSTEM_PROMPT, businessOwners, addDictItem } from '../../data/mock.js';
import { SelectCombobox } from '../../components/SelectCombobox.jsx';

// 新页签结构：去掉「成长记录」、「系统信息」
// 能力描述并入基本信息（业务归属方下方）
// 关联工具与技能折成两个页签
const TABS = [
  { key: 'basic', label: '基本信息' },
  { key: 'instruction', label: '使用说明' },
  { key: 'tools', label: '关联工具' },
  { key: 'skills', label: '关联技能' },
  { key: 'system', label: '系统提示词' },
];

const PAGE_SIZE = 6;

export function ExpertEdit({ readOnly }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { experts, tenants, mcps, skills, upsertExpert, systemSettings } = useStore();
  const toast = useToast();
  const { user } = useRole();
  const isPlatform = user.role === 'system_admin';
  const isEdit = !!id;

  // 空间管理员可管理的空间（新增/编辑「所属空间」下拉选项来源）
  const ownedTenants = isPlatform
    ? []
    : tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));

  const [tab, setTab] = useState('basic');

  const empty = {
    id: 'E' + String(experts.length + 1).padStart(3, '0'),
    name: '',
    nickname: '',
    avatar: '',
    businessOwner: '数字化办公室',
    openScope: 'all',
    openTenants: [],
    tags: [],
    description: '',
    instruction: '',
    remark: '',
    systemPrompt: systemSettings?.expertPrompt || DEFAULT_SYSTEM_PROMPT,
    usage: '',
    mcpIds: [],
    mcpToolMap: {}, // { mcpId: [toolName] }
    skillIds: [],
    status: '已上架',
    creator: '系统管理员',
    creatorTenant: user.tenantId || null,
  };

  const [form, setForm] = useState(() => {
    if (isEdit) {
      const e = experts.find((x) => x.id === id);
      if (e) {
        return {
          ...empty,
          ...e,
          // 兼容历史 scope 字段
          openScope: typeof e.scope === 'string' ? e.scope : (e.openScope || (Array.isArray(e.scope) ? 'tenant' : 'all')),
          openTenants: Array.isArray(e.scope) ? e.scope : (e.openTenants || []),
          remark: e.remark || e.generalDesc || '',
        };
      }
    }
    return { ...empty };
  });

  useEffect(() => {
    if (isEdit) {
      const e = experts.find((x) => x.id === id);
      if (e) {
        setForm((f) => ({
          ...f,
          ...e,
          openScope: typeof e.scope === 'string' ? e.scope : (e.openScope || (Array.isArray(e.scope) ? 'tenant' : 'all')),
          openTenants: Array.isArray(e.scope) ? e.scope : (e.openTenants || []),
          remark: e.remark || e.generalDesc || '',
        }));
      }
    }
  }, [id, isEdit, experts]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = () => {
    if (!form.name) {
      toast.error('请填写专家助理名称');
      setTab('basic');
      return;
    }
    if (!form.nickname) {
      toast.error('请填写昵称');
      setTab('basic');
      return;
    }
    if (!form.systemPrompt || !form.systemPrompt.trim()) {
      toast.error('请填写系统提示词');
      setTab('system');
      return;
    }
    const submit = {
      ...form,
      openScope: form.openScope,
      openTenants: form.openTenants || [],
    };
    // 清理历史遗留字段
    delete submit.scope;
    delete submit.scopeTenants;
    delete submit.scopeLabel;
    // 用户自定义的业务归属方写入字典（供后续下拉直接选择）
    addDictItem(businessOwners, form.businessOwner);
    upsertExpert(submit);
    toast.success(isEdit ? '修改成功' : '创建成功');
    navigate('/experts');
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              className="avatar lg"
              src={form.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=new_expert'}
              alt={form.name || '新专家'}
              style={{ borderRadius: 10 }}
            />
            <div>
              <h1 className="page-title">
                {readOnly
                  ? `专家助理详情 · ${form.name || id}`
                  : (isEdit ? `编辑专家助理 · ${form.name || id}` : '新建专家助理')}
              </h1>
              <div className="page-desc">
                {readOnly
                  ? `ID ${form.id} · 创建于 ${form.createTime} · 业务归属方 ${form.businessOwner}（只读模式，不可编辑）`
                  : (isEdit
                    ? `ID ${form.id} · 创建于 ${form.createTime} · 业务归属方 ${form.businessOwner}`
                    : '创建一个专属领域的专家助理，绑定所需的 MCP 工具与 Skill 技能')}
              </div>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default" onClick={() => navigate('/experts')}>{readOnly ? '返回' : '取消'}</button>
            {!readOnly && (
              <button className="btn btn-primary" onClick={onSave}>
                <Icon name="check" size={14} />
                保存
              </button>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <Tabs items={TABS} active={tab} onChange={setTab} />
          <div style={{ padding: 24 }}>
            {tab === 'basic' && (
              <div>
                <FormSection title="基础信息">
                  <Row label="专家助理名称" required>
                    <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例如：财富管家女娲" disabled={readOnly} />
                  </Row>
                  <Row label="昵称" required>
                    <input className="input" value={form.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="用于对话中自称" disabled={readOnly} />
                  </Row>
                  <Row label="头像">
                    <ImageUploader value={form.avatar} onChange={(v) => set('avatar', v)} shape="avatar" readOnly={readOnly} />
                  </Row>
                  <Row label="业务归属方">
                    {/* 与添加技能弹窗同款交互：下拉选择 + 支持自定义输入 */}
                    <SelectCombobox
                      value={form.businessOwner || ''}
                      options={businessOwners}
                      placeholder="选择或输入新的业务归属方"
                      disabled={readOnly}
                      onChange={(v) => set('businessOwner', v)}
                    />
                  </Row>
                  {/* 所属空间：位于业务归属方下方；查看详情（readOnly）时不展示，仅编辑时保留 */}
                  {!isPlatform && !readOnly && (
                    <Row label="所属空间">
                      <select
                        className="select"
                        style={{ maxWidth: 360 }}
                        value={form.creatorTenant || user.tenantId || ''}
                        disabled={readOnly}
                        onChange={(e) => set('creatorTenant', e.target.value)}
                      >
                        {ownedTenants.map((t) => (
                          <option key={t.id} value={t.id}>{t.brandName}（{t.nickname}）</option>
                        ))}
                      </select>
                    </Row>
                  )}
                  <Row label="上架状态">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Toggle checked={form.status === '已上架'} onChange={(v) => set('status', v ? '已上架' : '已下架')} disabled={readOnly} />
                      <span style={{ fontSize: 13, color: '#4B5563' }}>{form.status === '已上架' ? '已上架' : '已下架'}</span>
                    </div>
                  </Row>
                  <Row label="备注" vertical>
                    <textarea className="input" rows={3} placeholder="对专家的备注信息" value={form.remark} onChange={(e) => set('remark', e.target.value)} disabled={readOnly} />
                  </Row>
                </FormSection>

                {/* 能力描述并入基本信息 - 位于业务归属方下方 */}
                <FormSection title="能力描述（Markdown 编辑器）" tip="详细介绍该专家能做什么、适合解决什么问题">
                  <MarkdownEditor value={form.description} onChange={(v) => set('description', v)} height={300} readOnly={readOnly} />
                </FormSection>

                <FormSection title="使用说明（Markdown 编辑器）" tip="介绍该专家的使用说明、任务指令示例等">
                  <MarkdownEditor value={form.usage || ''} onChange={(v) => set('usage', v)} height={300} readOnly={readOnly} />
                </FormSection>


                <FormSection title="能力标签" tip="最多 6 个标签，便于用户快速识别专家能力">
                  <Row label="能力标签" vertical>
                    <TagInput
                      value={form.tags}
                      onChange={(v) => set('tags', v)}
                      options={tagOpts.expert}
                      max={6}
                      readOnly={readOnly}
                    />
                  </Row>
                </FormSection>

                <FormSection title="Chatbot 对话配置" tip="配置专家助理 Chatbot 交互页面的初始信息">
                  <Row label="进入问候语" vertical>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder={`用户打开 Chatbot 时自动发送的问候语，例如：\n你好，我是${form.nickname || form.name || '小顾'}。请问有什么可以帮您的？`}
                      value={form.chatbotGreeting || ''}
                      onChange={(e) => set('chatbotGreeting', e.target.value)}
                      disabled={readOnly}
                    />
                    <div style={{ marginTop: 4, fontSize: 12, color: '#9CA3AF' }}>
                      用户点击专家助理名称打开 Chatbot 弹窗时，将自动展示此问候语。如不填写，将使用默认问候语。
                    </div>
                  </Row>
                  <Row label="默认推荐问" vertical>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="一行一个推荐问，用户打开 Chatbot 时展示为快捷问题按钮，例如：&#10;你好&#10;如何进行资产配置？&#10;你能做什么？"
                      value={form.defaultQuestions || ''}
                      onChange={(e) => set('defaultQuestions', e.target.value)}
                      disabled={readOnly}
                    />
                    <div style={{ marginTop: 4, fontSize: 12, color: '#9CA3AF' }}>
                      每行一个推荐问题，将展示为 Chatbot 底部的快捷问题按钮。如不填写，将根据专家能力标签自动推荐。
                    </div>
                  </Row>
                </FormSection>
              </div>
            )}

            {tab === 'instruction' && (
              <FormSection title="使用说明（Markdown 编辑器）" tip="用户在前端 chatbot 中看到的专家使用介绍">
                <MarkdownEditor value={form.instruction} onChange={(v) => set('instruction', v)} height={400} readOnly={readOnly} />
              </FormSection>
            )}

            {tab === 'tools' && (
              <MCPToolSelector
                mcps={mcps}
                mcpIds={form.mcpIds}
                mcpToolMap={form.mcpToolMap}
                onChangeMcpIds={(v) => set('mcpIds', v)}
                onChangeMcpToolMap={(v) => set('mcpToolMap', v)}
                readOnly={readOnly}
              />
            )}

            {tab === 'skills' && (
              <SkillSelector
                skills={skills}
                skillIds={form.skillIds}
                onChange={(v) => set('skillIds', v)}
                readOnly={readOnly}
              />
            )}

            {tab === 'system' && (
              <div>
                <FormSection
                  title={<span><span style={{ color: '#EF4444' }}>*</span> 系统提示词（System Prompt）</span>}
                >
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 1.6 }}>
                    在调用该专家助理时，将作为知识注入到 Agent runtime 运行框架中。新建时已预置默认提示词，可在此基础上修改。
                  </div>
                  <MarkdownEditor value={form.systemPrompt || ''} onChange={(v) => set('systemPrompt', v)} height={340} readOnly={readOnly} />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
                    字数：<strong style={{ color: '#E89E57' }}>{(form.systemPrompt || '').length}</strong> ·
                    预估 token：{Math.ceil((form.systemPrompt || '').length / 2)}
                  </div>
                </FormSection>
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px', borderTop: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'flex-end', gap: 10
          }}>
            <button className="btn btn-default" onClick={() => navigate('/experts')}>{readOnly ? '返回' : '取消'}</button>
            {!readOnly && (
              <button className="btn btn-primary" onClick={onSave}>
                <Icon name="check" size={14} />
                保存配置
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MCP 工具选择器（按工具关联、支持搜索/分页） ==========
function MCPToolSelector({ mcps, mcpIds, mcpToolMap, onChangeMcpIds, onChangeMcpToolMap, readOnly }) {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [toolDialogMcp, setToolDialogMcp] = useState(null);
  const [toolsViewMcp, setToolsViewMcp] = useState(null); // 已选工具查看弹窗

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return mcps;
    return mcps.filter((m) =>
      m.name.toLowerCase().includes(k) ||
      m.code.toLowerCase().includes(k) ||
      m.provider.toLowerCase().includes(k) ||
      (m.tools || []).some((t) => t.label.includes(k) || t.name.toLowerCase().includes(k))
    );
  }, [mcps, keyword]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // 只读模式：仅展示已关联的 MCP 服务与已选工具
  if (readOnly) {
    const associatedMcps = mcps.filter((m) => mcpIds.includes(m.id));
    return (
      <FormSection title="已关联的MCP工具" tip="该专家助理已关联的 MCP 服务与工具">
        {associatedMcps.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            暂无关联的 MCP 工具
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {associatedMcps.map((m) => {
              const selectedTools = mcpToolMap[m.id] || [];
              const tools = selectedTools.length > 0
                ? (m.tools || []).filter((t) => selectedTools.includes(t.name))
                : [];
              return (
                <div key={m.id} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 14, background: '#FFFCF8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1F2937' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        来源：{m.provider}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: 12, paddingTop: 12, borderTop: '1px dashed #F2F4F7',
                    display: 'flex', flexWrap: 'wrap', gap: 8
                  }}>
                    {tools.length === 0 ? (
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>未选择具体工具</span>
                    ) : (
                      tools.map((tool) => (
                        <span
                          key={tool.name}
                          style={{
                            padding: '4px 10px', background: '#FBF1E5', color: '#B87136',
                            borderRadius: 14, fontSize: 12, border: '1px solid #F7E3CC'
                          }}
                        >
                          {tool.label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FormSection>
    );
  }

  return (
    <FormSection title="关联 MCP 工具（按工具级粒度勾选）" tip="点击「关联工具」可在弹窗中勾选该 MCP 下的具体工具；用户选用该专家后，Agent runtime 框架将仅调用已勾选的工具">
      {/* 搜索 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="搜索 MCP 名称 / 工具名 / 供应商"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          style={{ maxWidth: 360 }}
        />
        <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
          共 {filtered.length} 个 MCP 服务
        </span>
      </div>

      <div className="table-wrap" style={{ border: '1px solid #E5E7EB', borderRadius: 8 }}>
        <table className="table">
          <thead>
            <tr>
              <th width={70}>ID</th>
              <th>MCP服务名称</th>
              <th width={90}>工具数量</th>
              <th width={100}>已选工具数</th>
              <th width={100}>MCP分类</th>
              <th width={110}>来源渠道</th>
              <th width={110}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                  没有匹配的 MCP 服务
                </td>
              </tr>
            )}
            {paged.map((m) => {
              const selectedTools = mcpToolMap[m.id] || [];
              return (
                <tr key={m.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{m.id}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#1F2937' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{m.desc}</div>
                  </td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{m.tools?.length || 0}</td>
                  <td style={{ fontSize: 13 }}>
                    {selectedTools.length > 0 ? (
                      <span
                        style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                        onClick={() => setToolsViewMcp(m)}
                        title="点击查看全部已选工具"
                      >{selectedTools.length}</span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>0</span>
                    )}
                  </td>
                  <td><Tag color="info">{m.category || '投研服务'}</Tag></td>
                  <td style={{ fontSize: 12, color: '#6B7280' }}>{m.source}</td>
                  <td>
                    <button
                      className="btn-text"
                      style={{ background: 'none', border: 'none', padding: 0, color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                      onClick={() => setToolDialogMcp(m)}
                    >关联工具</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: totalPage }).map((_, i) => (
            <button
              key={i}
              className={`btn ${safePage === i + 1 ? 'btn-primary' : 'btn-default'}`}
              style={{ minWidth: 32, padding: '4px 10px' }}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
        </div>
      )}

      {toolDialogMcp && (
        <McpToolsDialog
          mcp={toolDialogMcp}
          selected={mcpToolMap[toolDialogMcp.id] || []}
          onClose={() => setToolDialogMcp(null)}
          onSubmit={(draft) => {
            // 去掉复选框列后：通过「关联工具」弹窗提交即完成该 MCP 的关联
            if (!mcpIds.includes(toolDialogMcp.id)) {
              onChangeMcpIds([...mcpIds, toolDialogMcp.id]);
            }
            onChangeMcpToolMap({ ...mcpToolMap, [toolDialogMcp.id]: draft });
            setToolDialogMcp(null);
          }}
        />
      )}

      {toolsViewMcp && (
        <SelectedToolsDialog
          mcp={toolsViewMcp}
          selectedNames={mcpToolMap[toolsViewMcp.id] || []}
          onClose={() => setToolsViewMcp(null)}
        />
      )}
    </FormSection>
  );
}

// ========== Skill 技能选择器（支持搜索/分页） ==========
function SkillSelector({ skills, skillIds, onChange, readOnly }) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return skills.filter((s) => {
      const matchK = !k || s.name.toLowerCase().includes(k);
      const matchC = !category || s.category === category;
      return matchK && matchC;
    });
  }, [skills, keyword, category]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggle = (id) => {
    onChange(skillIds.includes(id) ? skillIds.filter((x) => x !== id) : [...skillIds, id]);
  };

  // 全选 / 取消全选（作用于当前筛选结果，保留其他已选技能）
  const allChecked = filtered.length > 0 && filtered.every((s) => skillIds.includes(s.id));
  const toggleAll = () => {
    if (allChecked) {
      const filteredIds = new Set(filtered.map((s) => s.id));
      onChange(skillIds.filter((id) => !filteredIds.has(id)));
    } else {
      const merged = new Set(skillIds);
      filtered.forEach((s) => merged.add(s.id));
      onChange(Array.from(merged));
    }
  };

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  // 只读模式：仅展示已关联的 Skill 技能
  if (readOnly) {
    const associatedSkills = skills.filter((s) => skillIds.includes(s.id));
    return (
      <FormSection title="已关联的Skill技能" tip="该专家助理已关联的 Skill 技能">
        {associatedSkills.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            暂无关联的技能
          </div>
        ) : (
          <div className="table-wrap" style={{ border: '1px solid #E5E7EB' }}>
            <table className="table">
              <thead>
                <tr>
                  <th width={70}>ID</th>
                  <th>技能名称</th>
                  <th width={110}>技能分类</th>
                  <th width={100}>业务归属方</th>
                  <th>技能说明</th>
                  <th width={90}>更新人</th>
                  <th width={150}>更新时间</th>
                </tr>
              </thead>
              <tbody>
                {associatedSkills.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{s.id}</td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{s.category}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{s.businessOwner || '—'}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{s.desc}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{s.creator}</td>
                    <td style={{ fontSize: 12, color: '#9CA3AF' }}>{s.updateTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FormSection>
    );
  }

  return (
    <FormSection title="关联 Skill 技能" tip="勾选该专家可调用的 Skill 技能">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          className="select"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{ maxWidth: 160 }}
        >
          <option value="">全部分类</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          className="input"
          placeholder="搜索技能名称"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          style={{ maxWidth: 360 }}
        />
        <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
          共 {filtered.length} 个技能，已选 {skillIds.length}
        </span>
      </div>

      <div className="table-wrap" style={{ border: '1px solid #E5E7EB' }}>
        <table className="table">
          <thead>
            <tr>
              <th width={50}>
                <Checkbox checked={allChecked} onChange={toggleAll} />
              </th>
              <th width={70}>ID</th>
              <th>技能名称</th>
              <th width={110}>技能分类</th>
              <th width={100}>业务归属方</th>
              <th>技能说明</th>
              <th width={90}>更新人</th>
              <th width={150}>更新时间</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                  没有匹配的技能
                </td>
              </tr>
            )}
            {paged.map((s) => {
              const checked = skillIds.includes(s.id);
              return (
                <tr key={s.id}>
                  <td>
                    <Checkbox checked={checked} onChange={() => toggle(s.id)} />
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{s.id}</td>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{s.category}</td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{s.businessOwner || '—'}</td>
                  <td style={{ fontSize: 12, color: '#6B7280' }}>{s.desc}</td>
                  <td style={{ fontSize: 12, color: '#6B7280' }}>{s.creator}</td>
                  <td style={{ fontSize: 12, color: '#9CA3AF' }}>{s.updateTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: totalPage }).map((_, i) => (
            <button
              key={i}
              className={`btn ${safePage === i + 1 ? 'btn-primary' : 'btn-default'}`}
              style={{ minWidth: 32, padding: '4px 10px' }}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </FormSection>
  );
}

function FormSection({ title, children, tip }) {
  return (
    <div className="section">
      <div className="section-header">
        <span>{title}</span>
        {tip && <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' }}>{tip}</span>}
      </div>
      <div className="section-body" style={{ padding: '8px 20px' }}>{children}</div>
    </div>
  );
}

function Row({ label, children, required, vertical }) {
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

function TagInput({ value = [], onChange, options = [], max = 5, readOnly }) {
  const [text, setText] = useState('');
  const add = (t) => {
    if (readOnly || !t || value.includes(t) || value.length >= max) return;
    onChange?.([...value, t]);
    setText('');
  };
  const remove = (t) => { if (!readOnly) onChange(value.filter((x) => x !== t)); };
  const available = options.filter((o) => !value.includes(o));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {value.map((t) => (
          <Tag key={t} color="brand" style={{ padding: '4px 10px' }}>
            {t}
            {!readOnly && (
              <span
                style={{ marginLeft: 4, cursor: 'pointer', color: '#B87136' }}
                onClick={() => remove(t)}
              >×</span>
            )}
          </Tag>
        ))}
        {value.length === 0 && <span style={{ fontSize: 12, color: '#9CA3AF' }}>暂无标签</span>}
      </div>
      {!readOnly && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="输入自定义标签后回车"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(text.trim()); }}}
            style={{ maxWidth: 240 }}
            disabled={value.length >= max}
          />
          <select
            className="select"
            style={{ maxWidth: 200 }}
            onChange={(e) => add(e.target.value)}
            value=""
            disabled={value.length >= max}
          >
            <option value="">从推荐中选择</option>
            {available.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}