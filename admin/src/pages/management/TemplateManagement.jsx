import React, { useState, useMemo } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { EnableScopeDialog } from './SkillManagement.jsx';
import { AuthorizeDialog } from '../../components/AuthorizeDialog.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { platformSources } from '../../data/mock.js';

const MODELS = ['DeepSeekV4', 'GPT-4o', 'Claude 3.5', 'Qwen-Max', 'Hunyuan-Pro'];
const EXEC_TYPES = ['每日定时', '每周定时', '每月定时', '事件触发', 'Cron 表达式'];
// 任务结果接收渠道：仅保留 聚力 / 企业微信
const RESULT_CHANNELS = ['聚力', '企业微信'];

export function TemplateManagement() {
  const { user } = useRole();
  const { templates, tenants, upsertTemplate, deleteTemplate } = useStore();
  const toast = useToast();
  const isPlatform = user.role === 'system_admin';

  // 空间管理员可管理的空间列表
  const managedTenants = useMemo(() => {
    if (isPlatform) return tenants;
    return tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));
  }, [tenants, user, isPlatform]);

  // 「所属空间」列：空间管理员创建的资产展示空间名称；系统管理员创建的展示「系统」
  const renderOwnedCell = (creatorTenant) => {
    if (!creatorTenant) return <Tag color="default">系统</Tag>;
    const t = tenants.find((x) => x.id === creatorTenant);
    return <Tag color="info">{t ? t.brandName : '—'}</Tag>;
  };

  const [keyword, setKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [authTarget, setAuthTarget] = useState(null); // 授权弹窗目标任务模板
  const [confirmDel, setConfirmDel] = useState(null);
  const [viewTab, setViewTab] = useState('center');
  const [enabledIds, setEnabledIds] = useState(new Set());
  const [enabling, setEnabling] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let list = templates.filter((t) => {
      const matchK = !k || t.name.toLowerCase().includes(k);
      const matchS = !sourceFilter || t.source === sourceFilter;
      return matchK && matchS;
    });

    if (!isPlatform) {
      if (viewTab === 'mine') {
        list = list.filter((t) => t.creatorTenant === user.tenantId);
      } else if (viewTab === 'granted') {
        // 授权给我的：其他主体（系统/其他空间）创建并显式授权给本空间的任务模板
        list = list.filter((t) => (t.openTenants || []).includes(user.tenantId) && t.creatorTenant !== user.tenantId);
      } else {
        // 任务模板库：展示平台所有已上架的自动化任务模板（含未授权给本空间的平台开放资源）
        list = list.filter((t) => t.status === '已启用');
      }
    }
    return list;
  }, [templates, keyword, sourceFilter, isPlatform, viewTab, user]);

  const handleEnable = (selectedTenants) => {
    setEnabledIds((prev) => new Set(prev).add(enabling.id));
    const names = selectedTenants.map((id) => tenants.find((t) => t.id === id)?.brandName).filter(Boolean);
    toast.success(`已将「${enabling.name}」启用到：${names.join('、')}`);
    setEnabling(null);
  };

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">任务模板管理</h1>
            <div className="page-desc">
              {isPlatform
                ? '管理与发布全平台的自动化任务模板，设置是否全局开放或指定特定 Buddy 空间。'
                : '管理本空间的自动化任务模板，或从任务模板库一键启用平台开放资源。'}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setEditing({})}>
              <Icon name="plus" size={14} />
              添加模板
            </button>
          </div>
        </div>

        {/* 空间管理员双Tab - 无统计数字 */}
        {!isPlatform && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #F2F4F7' }}>
            {[
              { k: 'center', label: '任务模板库' },
              { k: 'granted', label: '授权给我的' },
              { k: 'mine', label: '管理空间任务模板' },
            ].map((t) => (
              <div
                key={t.k}
                onClick={() => { setViewTab(t.k); setPage(1); }}
                style={{
                  padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  color: viewTab === t.k ? '#E89E57' : '#6B7280',
                  borderBottom: viewTab === t.k ? '2px solid #E89E57' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '12px 16px', borderBottom: '1px solid #F2F4F7',
            background: '#FBFCFD'
          }}>
            {isPlatform && (
              <select className="select" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} style={{ maxWidth: 140 }}>
                <option value="">全部来源</option>
                {platformSources.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
            <input
              className="input"
              placeholder="自动化任务名称"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              style={{ maxWidth: 240 }}
            />
            <button className="btn btn-default" onClick={() => { setKeyword(''); setSourceFilter(''); setPage(1); }}>
              <Icon name="refresh" size={12} />重置
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>
              共 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 个模板
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th width={90}>ID</th>
                  <th width={170}>自动化任务名称</th>
                  <th width={80}>使用人数</th>
                  <th width={180}>运行计划</th>
                  {(isPlatform || (!isPlatform && viewTab === 'mine')) && <th width={90}>上架状态</th>}
                  {/* 授权空间列：仅系统管理员可见（空间管理员三页签均不展示） */}
                  {isPlatform && <th width={150}>授权空间</th>}
                  <th width={110}>所属空间</th>
                  <th width={100}>更新人</th>
                  <th width={140}>更新时间</th>
                  <th width={130}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={(isPlatform || viewTab === 'mine' ? 10 : 9) - (isPlatform ? 0 : 1)}>
                      <Empty icon="🗂️" tip={viewTab === 'center' ? '暂无平台开放资源' : viewTab === 'granted' ? '暂无其他空间授权给你的任务模板' : '暂无任务模板，请先添加'} />
                    </td>
                  </tr>
                )}
                {paged.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{t.id}</td>
                    <td style={{ color: '#E89E57', fontWeight: 500 }}>{t.name}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{t.usedCount || 0}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{t.execTime || t.schedule}</td>
                    {(isPlatform || (!isPlatform && viewTab === 'mine')) && (
                      <td>
                        {isPlatform && t.creatorTenant ? (
                          // 系统管理员视角：空间管理员创建的任务模板仅文字展示状态
                          <span style={{ color: t.status === '已启用' ? '#15803D' : '#9CA3AF', fontSize: 13 }}>
                            {t.status === '已启用' ? '已启用' : '已停用'}
                          </span>
                        ) : (
                          <Toggle
                            checked={t.status === '已启用'}
                            onChange={(v) => upsertTemplate({ ...t, status: v ? '已启用' : '已停用' })}
                          />
                        )}
                      </td>
                    )}
                    {isPlatform && (
                      <td>
                        {t.openScope === 'all' || t.openScope === 'private' ? (
                          <Tag color="success">全局开放</Tag>
                        ) : (t.openTenants || []).length > 0 ? (
                          <Tag color="warning" title={(t.openTenants || []).map((tid) => { const x = tenants.find((tn) => tn.id === tid); return x ? x.brandName : tid; }).join('、')}>
                            {(t.openTenants || []).length} 个空间
                          </Tag>
                        ) : (
                          <Tag color="default">暂未授权</Tag>
                        )}
                      </td>
                    )}
                    <td>{renderOwnedCell(t.creatorTenant)}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{t.creator}</td>
                    <td style={{ fontSize: 12, color: '#9CA3AF' }}>{t.updateTime}</td>
                    <td>
                      {!isPlatform && (viewTab === 'center' || viewTab === 'granted') ? (
                        <span
                          style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }}
                          onClick={() => setViewing(t)}
                        >查看详情</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }} onClick={() => setEditing(t)}>编辑</span>
                          {/* 授权空间入口规则：仅系统管理员对「系统」创建（无 creatorTenant）的模板提供；空间创建的由空间自行管理；TA 管理空间任务模板不提供 */}
                          {isPlatform && !t.creatorTenant && (
                            <span style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }} onClick={() => setAuthTarget(t)}>授权空间</span>
                          )}
                          <span style={{ color: '#EF4444', cursor: 'pointer', fontSize: 13 }} onClick={() => setConfirmDel(t)}>删除</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paged.length > 0 && (
              <Pagination
                page={page} pageSize={pageSize} total={total}
                onChange={(p, ps) => { setPage(p); if (ps) setPageSize(ps); }}
              />
            )}
          </div>
        </div>
      </div>

      {editing && (
        <TemplateEditDialog
          initial={editing}
          isPlatform={isPlatform}
          onClose={() => setEditing(null)}
          onSubmit={(t) => {
            upsertTemplate(t);
            toast.success(editing.id ? '修改成功' : '创建成功');
            setEditing(null);
          }}
        />
      )}

      {/* 授权弹窗 */}
      {authTarget && (
        <AuthorizeDialog
          resource={authTarget}
          resourceType="任务模板"
          onClose={() => setAuthTarget(null)}
          onSubmit={(openScope, openTenants) => {
            upsertTemplate({ ...authTarget, openScope, openTenants });
            toast.success(`任务模板「${authTarget.name}」授权已更新`);
            setAuthTarget(null);
          }}
        />
      )}

      {/* 查看详情弹窗（只读） */}
      {viewing && (
        <TemplateEditDialog
          initial={viewing}
          isPlatform={isPlatform}
          readOnly
          onClose={() => setViewing(null)}
        />
      )}

      {/* 启用范围选择弹窗 */}
      {enabling && (
        <EnableScopeDialog
          resource={enabling}
          resourceType="template"
          managedTenants={managedTenants}
          onClose={() => setEnabling(null)}
          onConfirm={handleEnable}
        />
      )}

      <Confirm
        open={!!confirmDel}
        title="删除任务模板确认"
        content={
          <div>
            确定要删除任务模板 <strong style={{ color: '#E89E57' }}>{confirmDel?.name}</strong> 吗？
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C', marginTop: 12
            }}>
              ⚠️ 删除后已订阅该模板的用户将无法继续执行，操作不可恢复。
            </div>
          </div>
        }
        danger
        onOk={() => {
          deleteTemplate(confirmDel.id);
          toast.success(`已删除 ${confirmDel.name}`);
          setConfirmDel(null);
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

function TemplateEditDialog({ initial, isPlatform, onClose, onSubmit, readOnly }) {
  const { user } = useRole();
  const { tenants, skills, experts } = useStore();
  // 空间管理员可管理的空间（「所属空间」下拉选项来源）
  const ownedTenants = isPlatform
    ? []
    : tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id));
  const [form, setForm] = useState(() => ({
    enabled: true,
    openScope: 'all',
    openTenants: [],
    source: '卡片模式',
    status: '已启用',
    creator: user.fullName || '系统管理员',
    creatorTenant: user.tenantId || null,
    channel: '聚力',
    model: 'DeepSeekV4',
    execType: '每日定时',
    execTime: '09:00',
    taskType: 'skill',
    expert: '',
    ...initial,
  }));
  const [tab, setTab] = useState('base');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name) return false;
    onSubmit({
      ...form,
      status: form.enabled ? '已启用' : '已停用',
      execTime: form.execType === '事件触发' ? '事件触发' : `${form.execType} ${form.execTime}`,
      updateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    return true;
  };

  return (
    <Modal
      open
      title={readOnly ? '任务模板详情' : (initial?.id ? '编辑任务模板' : '创建自动化任务模板')}
      onClose={onClose}
      width={900}
      footer={
        readOnly ? (
          <button className="btn btn-primary" onClick={onClose}>关闭</button>
        ) : (
          <>
            <button className="btn btn-default" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={submit}>确认</button>
          </>
        )
      }
    >
      <div style={{ display: 'flex', minHeight: 460 }}>
        <div style={{ width: 100, borderRight: '1px solid #F2F4F7' }}>
          {[
            { k: 'base', label: '基础信息' },
            { k: 'exec', label: '执行规则' },
          ].map((t) => (
            <div
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                padding: '12px 14px', cursor: 'pointer', fontSize: 13,
                color: tab === t.k ? '#E89E57' : '#4B5563',
                background: tab === t.k ? '#FBF1E5' : 'transparent',
                borderLeft: tab === t.k ? '3px solid #E89E57' : '3px solid transparent',
              }}
            >{t.label}</div>
          ))}
        </div>

        <div style={{ flex: 1, padding: 16, maxHeight: 480, overflow: 'auto' }}>
          {tab === 'base' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
              <Field label="任务名称" required full>
                <input className="input" value={form.name || ''} disabled={readOnly} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="执行任务的技能">
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="select" style={{ maxWidth: 140 }} value={form.taskType || 'skill'} disabled={readOnly} onChange={(e) => set('taskType', e.target.value)}>
                    <option value="skill">skill技能</option>
                    <option value="expert">专家助理</option>
                  </select>
                  {form.taskType === 'expert' ? (
                    <select className="select" style={{ flex: 1 }} value={form.expert || ''} disabled={readOnly} onChange={(e) => set('expert', e.target.value)}>
                      <option value="">选择专家助理</option>
                      {experts.map((e) => (
                        <option key={e.id} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select className="select" style={{ flex: 1 }} value={form.skill || ''} disabled={readOnly} onChange={(e) => set('skill', e.target.value)}>
                      <option value="">选择技能</option>
                      {skills.filter((s) => !form.skillCategory || s.category === form.skillCategory).map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </Field>
              <Field label="使用模型">
                <select className="select" value={form.model} disabled={readOnly} onChange={(e) => set('model', e.target.value)}>
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="任务指令 / 提示词" required full>
                <textarea
                  className="input" rows={5} value={form.command || ''}
                  disabled={readOnly}
                  onChange={(e) => set('command', e.target.value)}
                  placeholder="例如：获取今日盘前热点资讯，并整理为结构化摘要。"
                />
              </Field>
              <Field label="任务结果接收渠道" full>
                <div style={{ padding: '8px 12px', background: '#F8F9FB', borderRadius: 6, fontSize: 12, color: '#6B7280' }}>
                  任务运行结果接收渠道（始终可在招小顾 Claw 中查看）
                </div>
                <select className="select" value={form.channel} disabled={readOnly} onChange={(e) => set('channel', e.target.value)} style={{ marginTop: 8 }}>
                  {RESULT_CHANNELS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="备注" full>
                <textarea
                  className="input" rows={2} value={form.remark || ''}
                  disabled={readOnly}
                  onChange={(e) => set('remark', e.target.value)}
                />
              </Field>
              <Field label="上架状态">
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Toggle checked={form.enabled} disabled={readOnly} onChange={(v) => set('enabled', v)} />
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{form.enabled ? '已上架' : '已下架'}</span>
                </div>
              </Field>
              {/* 所属空间：与上架状态并列一行；查看详情（readOnly）时不展示，仅编辑时保留 */}
              {!isPlatform && !readOnly && (
                <Field label="所属空间">
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
                </Field>
              )}
            </div>
          )}

          {tab === 'exec' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
              <Field label="执行频率" required>
                <select className="select" value={form.execType} disabled={readOnly} onChange={(e) => set('execType', e.target.value)}>
                  {EXEC_TYPES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              {form.execType !== '事件触发' && (
                <Field label="执行时间" required>
                  <input className="input" type="time" value={form.execTime || '09:00'} disabled={readOnly} onChange={(e) => set('execTime', e.target.value)} />
                </Field>
              )}
              <Field label="任务执行结果回复方式" full>
                <select className="select" value={form.source || '卡片模式'} disabled={readOnly} onChange={(e) => set('source', e.target.value)}>
                  <option value="卡片模式">卡片模式</option>
                  <option value="完整回复模式">完整回复模式</option>
                </select>
              </Field>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
}

function Field({ label, required, children, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
        {required && <span style={{ color: '#EF4444' }}>*</span>} {label}
      </div>
      {children}
    </div>
  );
}
