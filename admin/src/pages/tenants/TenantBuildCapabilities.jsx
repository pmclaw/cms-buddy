import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Icon, Tabs } from '../../components/Common.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Checkbox } from '../../components/Checkbox.jsx';
import { Tag } from '../../components/Tag.jsx';
import { McpToolsDialog } from '../../components/McpToolsDialog.jsx';
import { SelectedToolsDialog } from '../../components/SelectedToolsDialog.jsx';

const TABS = [
  { key: 'mcp', label: 'MCP服务' },
  { key: 'skill', label: 'Skill技能' },
  { key: 'template', label: '自动化任务模板' },
  { key: 'expert', label: '专家助理' },
];

export function TenantBuildCapabilities() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenants, mcps, skills, templates, experts, setToolGlobal, setMcpEnabledGlobal, setMcpToolConfig, upsertSkill } = useStore();
  const toast = useToast();
  const tenant = tenants.find((t) => t.id === id);

  const [tab, setTab] = useState('mcp');
  const [toolDialogMcp, setToolDialogMcp] = useState(null);
  const [toolsViewMcp, setToolsViewMcp] = useState(null); // 已选工具查看弹窗
  const [mcpKeyword, setMcpKeyword] = useState('');
  const [mcpPage, setMcpPage] = useState(1);
  const MCP_PAGE_SIZE = 6;

  // 仅展示已上架资源（构建能力页面）
  // 「仅限本空间可见」且属于其他空间创建的资源：仅创建空间可配置，其他空间（含系统管理员为其配置时）不可见
  const isSpacePrivate = (r) => r.spaceOnlyVisible && r.creatorTenant && r.creatorTenant !== id;

  // 「所属空间」列：系统平台创建 → 「系统」；空间创建 → 对应空间名称（在当前空间视角下即当前空间名称）
  const ownerCell = (creatorTenant) => {
    if (!creatorTenant) return <Tag color="default">系统</Tag>;
    const t = tenants.find((x) => x.id === creatorTenant);
    return <Tag color="info">{t ? t.brandName : creatorTenant}</Tag>;
  };

  const availableMcps = mcps.filter((m) => m.status === '已上架' && !isSpacePrivate(m));
  const availableSkills = skills.filter((s) => !isSpacePrivate(s)); // skills 默认全部展示（含未上架，供管理侧）
  const availableTemplates = templates.filter((t) => t.status === '已启用' || t.status === '已上架');
  const availableExperts = experts.filter((e) => e.status === '已上架');

  const [associatedMcps, setAssociatedMcps] = useState(
    availableMcps.slice(0, 4).map((m) => m.id)
  );
  const [associatedSkills, setAssociatedSkills] = useState(
    availableSkills.slice(0, 8).map((s) => s.id)
  );
  const [associatedTemplates, setAssociatedTemplates] = useState(
    availableTemplates.slice(0, 4).map((t) => t.id)
  );
  const [associatedExperts, setAssociatedExperts] = useState(
    availableExperts.slice(0, 3).map((e) => e.id)
  );

  // 已关联 MCP 工具数（口径：已关联 MCP 的已选工具总数）
  const associatedToolCount = associatedMcps.reduce((sum, id) => {
    const m = mcps.find((x) => x.id === id);
    return sum + (m?.enabledTools?.length || 0);
  }, 0);

  if (!tenant) {
    return <div className="page-body">未找到Buddy空间</div>;
  }

  // MCP 搜索 + 分页
  const filteredMcps = availableMcps.filter((m) => {
    const k = mcpKeyword.trim().toLowerCase();
    if (!k) return true;
    return (m.name + ' ' + m.id + ' ' + (m.category || '')).toLowerCase().includes(k);
  });
  const mcpTotalPage = Math.max(1, Math.ceil(filteredMcps.length / MCP_PAGE_SIZE));
  const mcpSafePage = Math.min(mcpPage, mcpTotalPage);
  const pagedMcps = filteredMcps.slice((mcpSafePage - 1) * MCP_PAGE_SIZE, mcpSafePage * MCP_PAGE_SIZE);

  const toggleSkill = (id) =>
    setAssociatedSkills((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
    );

  // 技能全选 / 取消全选
  const allSkillsChecked = availableSkills.length > 0 &&
    availableSkills.every((s) => associatedSkills.includes(s.id));
  const toggleAllSkills = () => {
    setAssociatedSkills(allSkillsChecked ? [] : availableSkills.map((s) => s.id));
  };

  // 切换技能的默认启用/关闭状态
  const toggleSkillDefault = (s) => {
    upsertSkill({ ...s, defaultEnabled: !s.defaultEnabled });
    toast.success(`技能「${s.name}」已设为${!s.defaultEnabled ? '默认启用' : '默认关闭'}`);
  };

  const toggleTemplate = (id) =>
    setAssociatedTemplates((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
    );

  // 模板全选 / 取消全选
  const allTemplatesChecked = availableTemplates.length > 0 &&
    availableTemplates.every((t) => associatedTemplates.includes(t.id));
  const toggleAllTemplates = () => {
    setAssociatedTemplates(allTemplatesChecked ? [] : availableTemplates.map((t) => t.id));
  };

  const toggleExpert = (id) =>
    setAssociatedExperts((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
    );

  // 专家全选 / 取消全选
  const allExpertsChecked = availableExperts.length > 0 &&
    availableExperts.every((e) => associatedExperts.includes(e.id));
  const toggleAllExperts = () => {
    setAssociatedExperts(allExpertsChecked ? [] : availableExperts.map((e) => e.id));
  };

  const onSave = () => {
    toast.success('能力配置已保存');
    navigate('/tenants');
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              className="avatar lg"
              src={tenant.logo}
              alt={tenant.brandName}
              style={{ borderRadius: 8 }}
            />
            <div>
              <h1 className="page-title">构建能力 · {tenant.brandName}</h1>
              <div className="page-desc">
                为本Buddy空间配置 MCP 服务、Skill 技能、自动化任务模板和专家助理，Buddy空间管理员可在其 chatbot 中使用。
              </div>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default" onClick={() => navigate('/tenants')}>返回</button>
            <button className="btn btn-primary" onClick={onSave}>
              <Icon name="check" size={14} />
              保存配置
            </button>
          </div>
        </div>

        {/* 当前Buddy空间摘要 - 仅展示统计，移除 Slogan */}
        <div style={{
          background: 'linear-gradient(135deg, #FBF1E5 0%, #fff 100%)',
          borderRadius: 8, border: '1px solid #F7E3CC',
          padding: '14px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 28
        }}>
          {[
            { label: '已关联 MCP 工具', count: associatedToolCount, color: tenant.themeColor },
            { label: '已关联 Skill', count: associatedSkills.length, color: '#3B82F6' },
            { label: '已关联模板', count: associatedTemplates.length, color: '#10B981' },
            { label: '已关联专家', count: associatedExperts.length, color: '#8B5CF6' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: s.color + '20', color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 14,
              }}>{s.count}</div>
              <span style={{ fontSize: 13, color: '#4B5563' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <Tabs items={TABS} active={tab} onChange={setTab} />

          <div style={{ padding: 24 }}>
            {tab === 'mcp' && (
              <div>
                <div style={{
                  padding: '8px 12px', background: '#FFFBEB', borderRadius: 6,
                  border: '1px solid #FCD34D', marginBottom: 16, fontSize: 12, color: '#92400E'
                }}>
                  说明：以下为平台已上架的 MCP 服务，点击「设置全局工具」为工具设置全局启用；设为全局的工具，平台运行时将自动加载并对本Buddy空间开放。
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <input
                    className="input"
                    placeholder="搜索 MCP 名称 / ID / 分类"
                    value={mcpKeyword}
                    onChange={(e) => { setMcpKeyword(e.target.value); setMcpPage(1); }}
                    style={{ maxWidth: 360 }}
                  />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                    共 {filteredMcps.length} 个 MCP 服务，已关联 {associatedMcps.length}
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
                        <th width={110}>所属空间</th>
                        <th width={110}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedMcps.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                            暂无匹配的 MCP 服务
                          </td>
                        </tr>
                      )}
                      {pagedMcps.map((m) => {
                        const enabledCount = (m.enabledTools || []).length;
                        return (
                          <tr key={m.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{m.id}</td>
                            <td>
                              <div style={{ fontWeight: 500, color: '#1F2937' }}>{m.name}</div>
                              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{m.desc}</div>
                            </td>
                            <td style={{ fontSize: 13, color: '#6B7280' }}>{m.tools?.length || 0}</td>
                            <td style={{ fontSize: 13 }}>
                              {enabledCount > 0 ? (
                                <span
                                  style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                                  onClick={() => setToolsViewMcp(m)}
                                  title="点击查看全部已选工具"
                                >{enabledCount}</span>
                              ) : (
                                <span style={{ color: '#9CA3AF' }}>0</span>
                              )}
                            </td>
                            <td><Tag color="info">{m.category || '投研服务'}</Tag></td>
                            <td>{ownerCell(m.creatorTenant)}</td>
                            <td>
                              <button
                                className="btn btn-text"
                                style={{ background: 'none', border: 'none', padding: 0, color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                                onClick={() => setToolDialogMcp(m)}
                              >设置全局工具</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {mcpTotalPage > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                    {Array.from({ length: mcpTotalPage }).map((_, i) => (
                      <button
                        key={i}
                        className={`btn ${mcpSafePage === i + 1 ? 'btn-primary' : 'btn-default'}`}
                        style={{ minWidth: 32, padding: '4px 10px' }}
                        onClick={() => setMcpPage(i + 1)}
                      >{i + 1}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'skill' && (
              <div>
                <div style={{
                  padding: '8px 12px', background: '#FFFBEB', borderRadius: 6,
                  border: '1px solid #FCD34D', marginBottom: 16, fontSize: 12, color: '#92400E'
                }}>
                  说明：勾选后用户在当前空间可在Skill技能库使用该技能；开关开启后 Agent runtime 平台运行时会将该技能作为默认启用。
                </div>

                <div className="table-wrap" style={{ border: 'none' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th width={50}>
                          <Checkbox checked={allSkillsChecked} onChange={toggleAllSkills} />
                        </th>
                        <th width={70}>ID</th>
                        <th>技能名称</th>
                        <th width={110}>技能分类</th>
                        <th width={110}>所属空间</th>
                        <th width={120}>默认启用</th>
                        <th>技能说明</th>
                        <th width={90}>更新人</th>
                        <th width={150}>更新时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableSkills.map((s) => {
                        const checked = associatedSkills.includes(s.id);
                        return (
                          <tr key={s.id}>
                            <td>
                              <Checkbox checked={checked} onChange={() => toggleSkill(s.id)} />
                            </td>
                            <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{s.id}</td>
                            <td style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                            <td style={{ fontSize: 13, color: '#6B7280' }}>{s.category}</td>
                            <td>{ownerCell(s.creatorTenant)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Toggle checked={s.defaultEnabled} onChange={() => toggleSkillDefault(s)} />
                                <span style={{ fontSize: 12, color: s.defaultEnabled ? '#10B981' : '#9CA3AF' }}>
                                  {s.defaultEnabled ? '启用' : '关闭'}
                                </span>
                              </div>
                            </td>
                            <td style={{ fontSize: 12, color: '#6B7280' }}>{s.desc}</td>
                            <td style={{ fontSize: 12, color: '#6B7280' }}>{s.creator}</td>
                            <td style={{ fontSize: 12, color: '#9CA3AF' }}>{s.updateTime}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'template' && (
              <div>
                <div style={{
                  padding: '8px 12px', background: '#FFFBEB', borderRadius: 6,
                  border: '1px solid #FCD34D', marginBottom: 16, fontSize: 12, color: '#92400E'
                }}>
                  说明：勾选后该模板可被本Buddy空间的 chatbot 用户快速创建自动化任务。
                </div>

                <div className="table-wrap" style={{ border: 'none' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th width={50}>
                          <Checkbox checked={allTemplatesChecked} onChange={toggleAllTemplates} />
                        </th>
                        <th width={70}>ID</th>
                        <th>模板名称</th>
                        <th width={110}>所属空间</th>
                        <th>调度规则</th>
                        <th width={150}>更新时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableTemplates.map((t) => {
                        const checked = associatedTemplates.includes(t.id);
                        return (
                          <tr key={t.id}>
                            <td>
                              <Checkbox checked={checked} onChange={() => toggleTemplate(t.id)} />
                            </td>
                            <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{t.id}</td>
                            <td style={{ fontSize: 13 }}>{t.name}</td>
                            <td>{ownerCell(t.creatorTenant)}</td>
                            <td style={{ fontSize: 13, color: '#6B7280' }}>{t.execTime || t.schedule}</td>
                            {/* 去掉上架状态列 */}
                            <td style={{ fontSize: 12, color: '#9CA3AF' }}>{t.updateTime}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'expert' && (
              <div>
                <div style={{
                  padding: '8px 12px', background: '#FFFBEB', borderRadius: 6,
                  border: '1px solid #FCD34D', marginBottom: 16, fontSize: 12, color: '#92400E'
                }}>
                  说明：勾选后该专家助理可在 chatbot 中被用户选用；以下仅展示已上架的专家助理。
                </div>

                <div className="table-wrap" style={{ border: 'none' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th width={50}>
                          <Checkbox checked={allExpertsChecked} onChange={toggleAllExperts} />
                        </th>
                        <th width={70}>ID</th>
                        <th>专家助理</th>
                        <th width={110}>所属空间</th>
                        <th>能力描述</th>
                        <th width={90}>更新人</th>
                        <th width={150}>更新时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableExperts.map((e) => {
                        const checked = associatedExperts.includes(e.id);
                        return (
                          <tr key={e.id}>
                            <td>
                              <Checkbox checked={checked} onChange={() => toggleExpert(e.id)} />
                            </td>
                            <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{e.id}</td>
                            <td style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</td>
                            <td>{ownerCell(e.creatorTenant)}</td>
                            <td style={{ fontSize: 12, color: '#6B7280' }}>{e.description}</td>
                            <td style={{ fontSize: 12, color: '#6B7280' }}>{e.creator}</td>
                            <td style={{ fontSize: 12, color: '#9CA3AF' }}>{e.updateTime}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px', borderTop: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#F8F9FB', borderRadius: '0 0 8px 8px'
          }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              💡 Buddy空间管理员可在 chatbot 中查看已关联的能力，并按需启用或停用
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-default" onClick={() => navigate('/tenants')}>取消</button>
              <button className="btn btn-primary" onClick={onSave}>
                <Icon name="check" size={14} />
                保存配置
              </button>
            </div>
          </div>
        </div>
      </div>

      {toolDialogMcp && (
        <McpToolsDialog
          mcp={toolDialogMcp}
          selected={toolDialogMcp.enabledTools || []}
          globalTools={toolDialogMcp.enabledToolsGlobal || []}
          showGlobalColumn
          globalOnly
          onClose={() => setToolDialogMcp(null)}
          onSubmit={(draft, globals) => {
            setMcpToolConfig(toolDialogMcp.id, draft, globals);
            setAssociatedMcps((arr) => (arr.includes(toolDialogMcp.id) ? arr : [...arr, toolDialogMcp.id]));
            toast.success(`「${toolDialogMcp.name}」全局工具已更新，全局 ${globals.length} 个`);
            setToolDialogMcp(null);
          }}
        />
      )}

      {toolsViewMcp && (
        <SelectedToolsDialog
          mcp={toolsViewMcp}
          selectedNames={toolsViewMcp.enabledTools || []}
          onClose={() => setToolsViewMcp(null)}
        />
      )}
    </div>
  );
}