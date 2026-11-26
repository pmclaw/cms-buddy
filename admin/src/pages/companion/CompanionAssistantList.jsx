// 会话辅助管理 · 伴随助理管理
// 列表（名称查询 / 启用状态切换 / 编辑 / 删除）+ 添加·编辑弹窗（名称 / app_code / 应用场景 / 关联伴随服务 / 描述）
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Checkbox } from '../../components/Checkbox.jsx';
import { companionScenes, companionApps, qcSchemes, orgUsers } from '../../data/mock.js';

// 应用对象类型：企微单聊（按用户组授权）/ 企微群聊（按群主 + 企微群ID）
const APP_TARGETS = [
  { value: 'single', label: '企微单聊' },
  { value: 'group', label: '企微群聊' },
];

// 群主候选：后台组织架构中的用户（按姓名/部门搜索）
const OWNER_OPTIONS = orgUsers.map((u) => ({
  id: u.id,
  name: u.name,
  sub: u.deptName,
}));

// app_code：系统自动生成，10 位小写字母 + 数字，全局唯一，不对外开放修改
const CODE_CHARS = 'abcdef0123456789';
function genAppCode(existing = []) {
  let code = '';
  do {
    code = Array.from({ length: 10 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (existing.includes(code));
  return code;
}

export function CompanionAssistantList() {
  const toast = useToast();
  const { user } = useRole();
  const {
    companionAssistants, upsertCompanionAssistant, deleteCompanionAssistant, setCompanionEnabled,
  } = useStore();

  const [keyword, setKeyword] = useState(''); // 输入框内容
  const [query, setQuery] = useState('');     // 已生效的查询条件（点「查询」/回车后生效）
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialog, setDialog] = useState(null); // { mode: 'add' | 'edit', data }
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase();
    if (!k) return companionAssistants;
    return companionAssistants.filter((c) => c.name.toLowerCase().includes(k));
  }, [companionAssistants, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const doSearch = () => {
    setQuery(keyword);
    setPage(1);
  };

  const onPageChange = (p, size) => {
    if (size) setPageSize(size);
    setPage(p);
  };

  const submit = (data) => {
    const duplicated = companionAssistants.some(
      (c) => c.id !== data.id && c.name.trim() === data.name.trim()
    );
    if (duplicated) {
      toast.error('该伴随助理名称已存在，请更换名称');
      return;
    }
    const isEdit = dialog?.mode === 'edit';
    upsertCompanionAssistant({
      ...data,
      creator: isEdit ? data.creator : user.name,
      updater: user.name,
    });
    toast.success(isEdit ? `已保存伴随助理「${data.name}」` : `已添加伴随助理「${data.name}」`);
    setDialog(null);
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">伴随助理管理</h1>
            <div className="page-desc">
              伴随助理按应用场景配置关联的伴随应用与质检方案，客户端会话中由伴随助理实时提供知识问答、业务办理、产品推荐等伴随服务。
            </div>
          </div>
        </div>

        {/* 查询条 + 添加 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 16px',
        }}>
          <input
            className="input"
            placeholder="名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
            style={{ width: 240 }}
          />
          <button className="btn btn-default" onClick={doSearch}>
            <Icon name="search" size={13} />
            查询
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>
            共 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 个伴随助理
          </span>
          <button
            className="btn btn-primary"
            onClick={() => setDialog({ mode: 'add', data: null })}
          >
            <Icon name="plus" size={14} />
            添加伴随助理
          </button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8 }}>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="table" style={{ minWidth: 1080 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>伴随助理名称</th>
                  <th width={130}>app_code</th>
                  <th width={110} style={{ textAlign: 'center' }}>伴随应用数量</th>
                  <th width={100}>启用状态</th>
                  <th width={120}>应用场景</th>
                  <th>描述</th>
                  <th width={100}>创建人</th>
                  <th width={110}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <Empty
                        icon="🧑‍💼"
                        tip={query ? '未匹配到伴随助理' : '暂无伴随助理，点击右上角「添加伴随助理」创建'}
                      />
                    </td>
                  </tr>
                )}
                {paged.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ fontSize: 13, color: '#4B5563', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                      {c.appCode}
                    </td>
                    <td style={{ fontSize: 13, color: '#1F2937', textAlign: 'center' }}>{(c.appIds || []).length}</td>
                    <td>
                      <Toggle checked={c.enabled} onChange={(v) => setCompanionEnabled(c.id, v)} />
                    </td>
                    <td style={{ fontSize: 13, color: c.scene ? '#1F2937' : '#9CA3AF' }}>{c.scene || '--'}</td>
                    <td style={{ maxWidth: 320 }}>
                      <div
                        title={c.desc || ''}
                        style={{
                          fontSize: 12, color: '#6B7280', lineHeight: 1.7,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden', wordBreak: 'break-all',
                        }}
                      >{c.desc || '--'}</div>
                    </td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{c.creator || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="link" style={{ fontSize: 13 }} onClick={() => setDialog({ mode: 'edit', data: c })}>编辑</span>
                        <span className="danger-link" style={{ fontSize: 13 }} onClick={() => setConfirmDel(c)}>删除</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: '1px solid #F2F4F7' }}>
            <Pagination page={safePage} pageSize={pageSize} total={filtered.length} onChange={onPageChange} />
          </div>
        </div>
      </div>

      {dialog && (
        <CompanionDialog
          mode={dialog.mode}
          initial={dialog.data}
          existingCodes={companionAssistants.map((c) => c.appCode)}
          onClose={() => setDialog(null)}
          onSubmit={submit}
        />
      )}

      <Confirm
        open={!!confirmDel}
        title="删除伴随助理确认"
        content={
          <div>
            确定要删除伴随助理 <strong style={{ color: '#E89E57' }}>{confirmDel?.name}</strong> 吗？
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C', marginTop: 12,
            }}>
              ⚠️ 删除后该伴随助理不再对外提供伴随服务，已授权的会话将无法继续使用，操作不可恢复。
            </div>
          </div>
        }
        danger
        onOk={() => {
          deleteCompanionAssistant(confirmDel.id);
          toast.success(`已删除伴随助理「${confirmDel.name}」`);
          setConfirmDel(null);
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

// ========== 添加 / 编辑伴随助理弹窗 ==========
function CompanionDialog({ mode, initial, existingCodes, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const toast = useToast();
  const { userGroups } = useStore();

  const [form, setForm] = useState(() => (initial ? {
    ...initial,
    appIds: [...(initial.appIds || [])],
    appTarget: initial.appTarget || 'single',
    groupId: initial.groupId || '',
    ownerIds: [...(initial.ownerIds || [])],
    wecomGroupIds: initial.wecomGroupIds || '',
  } : {
    name: '',
    appCode: genAppCode(existingCodes),
    scene: '',
    appIds: [],
    qcSchemeId: '',
    appTarget: 'single',
    groupId: '',
    ownerIds: [],
    wecomGroupIds: '',
    desc: '',
    enabled: true,
  }));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // 切换应用对象时清空另一分支的选择，避免脏数据提交
  const changeTarget = (v) => setForm((f) => ({
    ...f,
    appTarget: v,
    groupId: v === 'single' ? f.groupId : '',
    ownerIds: v === 'group' ? f.ownerIds : [],
    wecomGroupIds: v === 'group' ? f.wecomGroupIds : '',
  }));

  const submit = () => {
    if (!form.name.trim()) return toast.error('请输入伴随助理名称');
    if (!form.scene) return toast.error('请选择应用场景');
    if (form.appTarget === 'single' && !form.groupId) return toast.error('请选择用户组');
    if (form.appTarget === 'group') {
      const hasOwner = form.ownerIds.length > 0;
      const hasGroupId = !!form.wecomGroupIds.trim();
      if (hasOwner && hasGroupId) return toast.error('群主与企微群ID不可同时填写，请二选一');
      if (!hasOwner && !hasGroupId) return toast.error('请选择群主或填写企微群ID');
    }
    if (form.appIds.length === 0) return toast.error('请至少选择一个伴随应用');
    if (!form.qcSchemeId) return toast.error('请选择质检方案');
    onSubmit({ ...form, name: form.name.trim() });
  };

  return (
    <Modal
      open
      title={isEdit ? '编辑伴随助理' : '伴随助理管理'}
      onClose={onClose}
      width={640}
      footer={(
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={submit}>确认</button>
        </>
      )}
    >
      <div>
        {/* 伴随助理名称 */}
        <FieldRow label="伴随助理名称" required hint="30个字符以内">
          <input
            className="input"
            placeholder="请输入伴随助理名称"
            maxLength={30}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </FieldRow>

        {/* app_code：系统生成，不可更改 */}
        <FieldRow label="app_code" required hint="系统自动生成，不可更改">
          <input
            className="input"
            value={form.appCode}
            readOnly
            disabled
            style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }}
          />
        </FieldRow>

        {/* 应用场景 */}
        <FieldRow label="应用场景" required>
          <select className="select" value={form.scene} onChange={(e) => set('scene', e.target.value)}>
            <option value="">请选择</option>
            {companionScenes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FieldRow>

        {/* 关联伴随服务 */}
        <FieldRow label="关联伴随服务" required hint="伴随应用支持多选，质检方案仅限单选">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AppMultiSelect
              value={form.appIds}
              options={companionApps}
              onChange={(ids) => set('appIds', ids)}
            />
            <select className="select" value={form.qcSchemeId} onChange={(e) => set('qcSchemeId', e.target.value)}>
              <option value="">请选择质检方案</option>
              {qcSchemes.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>
        </FieldRow>

        {/* 应用对象：同一行两个下拉（单聊 → 用户组 / 群聊 → 群主多选 + 企微群ID） */}
        <FieldRow
          label="应用对象"
          required
          hint={form.appTarget === 'group' ? '选择群主与填写企微群ID二选一，不可同时选择' : '按用户组授权，组内用户可在企微单聊中使用'}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <select
              className="select"
              value={form.appTarget}
              onChange={(e) => changeTarget(e.target.value)}
              style={{ flex: '0 0 200px' }}
            >
              {APP_TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            {form.appTarget === 'single' ? (
              <select
                className="select"
                value={form.groupId}
                onChange={(e) => set('groupId', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">请选择用户组</option>
                {userGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            ) : (
              <div style={{ flex: 1 }}>
                <AppMultiSelect
                  value={form.ownerIds}
                  options={OWNER_OPTIONS}
                  onChange={(ids) => set('ownerIds', ids)}
                  placeholder="请选择群主"
                  searchable
                  searchPlaceholder="搜索群主姓名/部门"
                />
              </div>
            )}
          </div>

          {form.appTarget === 'group' && (
            <textarea
              className="input"
              rows={4}
              placeholder="请填写企微群ID，每行一条信息"
              value={form.wecomGroupIds}
              onChange={(e) => set('wecomGroupIds', e.target.value)}
              style={{ width: '100%', resize: 'vertical', marginTop: 10 }}
            />
          )}
        </FieldRow>

        {/* 描述 */}
        <FieldRow label="描述" hint="100个字符以内" last>
          <textarea
            className="input"
            rows={3}
            maxLength={100}
            placeholder="请输入描述"
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </FieldRow>
      </div>
    </Modal>
  );
}

// 表单行：左标签（必填带红星）+ 右提示，控件通栏
function FieldRow({ label, required, hint, last, children }) {
  return (
    <div style={{ marginBottom: last ? 4 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span className="label" style={{ marginBottom: 0 }}>
          {required && <span className="req">*</span>}
          {label}
        </span>
        {hint && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// 伴随应用 / 群主 多选下拉（触发器外观与 .select 一致，面板内为复选列表；searchable 时带关键词搜索）
function AppMultiSelect({
  value, options, onChange, placeholder = '请选择伴随应用', searchable = false, searchPlaceholder = '搜索',
}) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const k = kw.trim().toLowerCase();
  const shown = k
    ? options.filter((o) => o.name.toLowerCase().includes(k) || (o.sub || '').toLowerCase().includes(k))
    : options;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => { setOpen((v) => { if (!v) setKw(''); return !v; }); }}
        style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
          minHeight: 34, padding: '5px 30px 5px 12px', position: 'relative',
          border: `1px solid ${open ? '#E89E57' : '#E5E7EB'}`, borderRadius: 6,
          background: '#fff', cursor: 'pointer', boxSizing: 'border-box',
          boxShadow: open ? '0 0 0 2px rgba(232,158,87,0.15)' : 'none',
        }}
      >
        {value.length === 0 ? (
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>{placeholder}</span>
        ) : value.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <span
              key={id}
              title="点击移除"
              onClick={(e) => { e.stopPropagation(); toggle(id); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: '#B87136', background: '#FBF1E5',
                border: '1px solid #F3D9BC', borderRadius: 4, padding: '1px 8px',
              }}
            >
              {opt.name}
              <span style={{ fontSize: 11 }}>×</span>
            </span>
          );
        })}
        <span style={{
          position: 'absolute', right: 10, top: 11, display: 'inline-flex',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
        }}>
          <Icon name="chevronDown" size={12} color="#9CA3AF" />
        </span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60, marginTop: 4,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6,
          boxShadow: '0 8px 24px rgba(15,23,42,0.14)', padding: '6px 0',
          maxHeight: 260, overflow: 'auto',
        }}>
          {searchable && (
            <div style={{ padding: '0 8px 6px' }}>
              <input
                className="input"
                autoFocus
                placeholder={searchPlaceholder}
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                style={{ width: '100%', height: 30, fontSize: 12 }}
              />
            </div>
          )}
          {shown.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: '#9CA3AF' }}>未找到匹配项</div>
          )}
          {shown.map((o) => {
            const checked = value.includes(o.id);
            return (
              <div
                key={o.id}
                onClick={() => toggle(o.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                  fontSize: 13, color: '#1F2937', cursor: 'pointer',
                  background: checked ? '#FFF9F2' : 'transparent',
                }}
              >
                <Checkbox checked={checked} onChange={() => toggle(o.id)} />
                <span>{o.name}</span>
                {o.sub && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{o.sub}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
