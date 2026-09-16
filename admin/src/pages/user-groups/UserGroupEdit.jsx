// 用户组新建/编辑页：基本信息 + 按部门添加分组人员（下拉多选）+ 按用户添加分组人员（下拉多选）+ 已加入用户组的用户清单
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Confirm } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { MultiSelectDropdown } from '../../components/MultiSelectDropdown.jsx';
import { orgUsers, orgDepartments } from '../../data/mock.js';
import { flattenDepartments } from './OrgTree.jsx';
import { deptPath, getDept, usersOfDept, groupMembers } from './utils.js';

export function UserGroupEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userGroups, upsertUserGroup, tenants } = useStore();
  const toast = useToast();
  const { user } = useRole();
  const isEdit = !!id;
  const isPlatform = user.role === 'system_admin';

  // 可归属空间（仅空间管理员展示「所属空间」表单项，下拉可选其管理的空间）：
  // 系统管理员新建/编辑用户组统一归属「系统」，不提供该选项
  const ownedTenants = useMemo(
    () => (isPlatform
      ? []
      : tenants.filter((t) => (user.managedTenants || [user.tenantId]).includes(t.id))),
    [tenants, isPlatform, user]
  );

  const [form, setForm] = useState({
    name: '', desc: '', deptIds: [], userIds: [], excludedUserIds: [],
    // 新建默认归属：系统管理员 → 系统（不归属）；空间管理员 → 自身所在空间
    creatorTenant: user.role === 'system_admin' ? '' : user.tenantId || '',
  });
  const [confirmRemove, setConfirmRemove] = useState(null); // 移除成员确认（type: user|dept）
  const [memberKeyword, setMemberKeyword] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);

  // 编辑模式回填
  useEffect(() => {
    if (isEdit) {
      const g = userGroups.find((x) => x.id === id);
      if (g) {
        setForm({
          id: g.id, name: g.name || '', desc: g.desc || '',
          deptIds: g.deptIds || [], userIds: g.userIds || [],
          excludedUserIds: g.excludedUserIds || [],
          creatorTenant: g.creatorTenant || '',
          creator: g.creator, createTime: g.createTime, updateTime: g.updateTime,
        });
      }
    }
  }, [id, isEdit, userGroups]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // 成员聚合（部门自动纳入 - 排除名单 + 指定用户）
  const members = useMemo(() => groupMembers(form), [form]);
  const memberMap = useMemo(() => new Map(members.map((u) => [u.id, u])), [members]);
  const deptAutoCount = members.filter((u) => u.source === '部门').length;
  const manualCount = members.filter((u) => u.source === '指定用户').length;

  // 成员清单搜索 + 分页
  const filteredMembers = useMemo(() => {
    const k = memberKeyword.trim().toLowerCase();
    if (!k) return members;
    return members.filter((u) => (u.name + u.deptName + deptPath(u.deptId)).toLowerCase().includes(k));
  }, [members, memberKeyword]);
  const memberTotalPages = Math.max(1, Math.ceil(filteredMembers.length / memberPageSize));
  const safeMemberPage = Math.min(memberPage, memberTotalPages);
  const pagedMembers = filteredMembers.slice((safeMemberPage - 1) * memberPageSize, safeMemberPage * memberPageSize);
  const onMemberPageChange = (p, size) => {
    if (size) setMemberPageSize(size);
    setMemberPage(p);
  };

  // 部门下拉多选：仅选中当前部门，不含子部门；移除部门时清除该部门用户的排除记录，保证重新选择后所有直属用户重新加入
  const toggleDeptById = (did) => {
    if (form.deptIds.includes(did)) {
      removeDept(did);
    } else {
      set('deptIds', [...form.deptIds, did]);
    }
  };
  const removeDept = (did) => {
    set('deptIds', form.deptIds.filter((x) => x !== did));
    const deptUserIds = usersOfDept(did).map((u) => u.id);
    set('excludedUserIds', (form.excludedUserIds || []).filter((x) => !deptUserIds.includes(x)));
  };

  // 用户下拉多选：全部用户可搜索；已被部门覆盖且未手动指定的用户置灰，不可重复添加
  const toggleUserById = (uid) => {
    if (memberMap.has(uid) && !form.userIds.includes(uid)) return;
    set('userIds', form.userIds.includes(uid) ? form.userIds.filter((x) => x !== uid) : [...form.userIds, uid]);
  };
  const removeUser = (uid) => set('userIds', form.userIds.filter((x) => x !== uid));

  // 部门 / 用户下拉选项（与授权弹窗「按部门」「指定用户」交互一致）
  const deptOptions = useMemo(() => flattenDepartments(orgDepartments).map((d) => ({ id: d.id, name: d.name, sub: d.path.join(' / ') })), []);
  const deptMatch = (o, kw) => !kw || o.name.toLowerCase().includes(kw) || o.sub.toLowerCase().includes(kw);
  const userOptions = useMemo(() => orgUsers.map((u) => ({ id: u.id, name: u.name, sub: u.deptName })), []);
  const userMatch = (o, kw) => !kw || o.name.toLowerCase().includes(kw) || o.sub.toLowerCase().includes(kw);

  // 成员清单移除：统一弹确认；部门成员仅移除当前用户（加入排除名单），不影响部门其他用户
  const handleRemoveMember = (u) => {
    if (u.source === '指定用户') {
      setConfirmRemove({ type: 'user', userId: u.id, name: u.name, deptName: null });
    } else {
      const d = getDept(u.deptId);
      setConfirmRemove({
        type: 'dept',
        userId: u.id,
        name: u.name,
        deptName: d ? d.name : u.deptId,
      });
    }
  };

  const onConfirmRemove = () => {
    if (!confirmRemove) return;
    if (confirmRemove.type === 'user') {
      removeUser(confirmRemove.userId);
      toast.success(`已将「${confirmRemove.name}」移出用户组`);
    } else {
      set('excludedUserIds', [...(form.excludedUserIds || []), confirmRemove.userId]);
      toast.success(`已将「${confirmRemove.name}」移出用户组，不影响「${confirmRemove.deptName}」其他用户`);
    }
    setConfirmRemove(null);
  };

  const onSave = () => {
    if (!form.name.trim()) {
      toast.error('请填写用户组名称');
      return;
    }
    upsertUserGroup({
      ...form,
      name: form.name.trim(),
      creator: form.creator || user.fullName || '系统管理员',
      updater: user.fullName || form.updater || form.creator || '系统管理员',
    });
    toast.success(isEdit ? '修改成功' : '创建成功');
    navigate('/user-groups');
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? `编辑用户组 · ${form.name || id}` : '新建用户组'}</h1>
            <div className="page-desc">
              下拉选择部门（仅含直属用户，不含子部门）与指定用户即可配置成员；成员将用于 Skill 技能与专家助理的权限配置。
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-default" onClick={() => navigate('/user-groups')}>取消</button>
            <button className="btn btn-primary" onClick={onSave}>
              <Icon name="check" size={14} />
              保存配置
            </button>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="section">
          <div className="section-header"><span>基本信息</span></div>
          <div className="section-body" style={{ padding: '8px 20px' }}>
            <div className="form-row" style={{ borderBottom: '1px dashed #F2F4F7' }}>
              <div className="label"><span className="req">*</span>用户组名称</div>
              <input
                className="input"
                style={{ maxWidth: 420 }}
                placeholder="例如：投顾服务组"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            {/* 系统管理员新建/编辑用户组不需要「所属空间」选项（统一归属「系统」）；仅空间管理员可选所属空间 */}
            {!isPlatform && (
              <div className="form-row" style={{ borderBottom: '1px dashed #F2F4F7' }}>
                <div className="label">所属空间</div>
                <select
                  className="select"
                  style={{ maxWidth: 420 }}
                  value={form.creatorTenant || ''}
                  onChange={(e) => set('creatorTenant', e.target.value)}
                >
                  {!form.creatorTenant && (
                    <option value="">系统（不归属空间）</option>
                  )}
                  {ownedTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.brandName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="label">描述</div>
              <textarea
                className="input"
                style={{ maxWidth: 560 }}
                rows={2}
                placeholder="该用户组的用途说明，将展示在列表与详情中"
                value={form.desc}
                onChange={(e) => set('desc', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 成员配置 */}
        <div className="section">
          <div className="section-header">
            <span>成员配置</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' }}>
              已选部门 <strong style={{ color: '#E89E57' }}>{form.deptIds.length}</strong> 个
              · 成员共 <strong style={{ color: '#E89E57' }}>{members.length}</strong> 人
              （部门覆盖 {deptAutoCount} 人 + 指定用户 {manualCount} 人）
            </span>
          </div>
          <div className="section-body" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 按部门添加分组人员：下拉多选（与授权弹窗「按部门」交互一致） */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid #F2F4F7',
                background: '#FBFCFD', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Icon name="building" size={13} color="#E89E57" />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>按部门添加分组人员</span>
              </div>
              <div style={{ padding: 12 }}>
                <MultiSelectDropdown
                  label="按部门"
                  options={deptOptions}
                  selectedIds={form.deptIds}
                  onToggle={toggleDeptById}
                  placeholder="请选择部门"
                  searchPlaceholder="搜索部门名称 / 路径"
                  match={deptMatch}
                />
                <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                  ⓘ 下拉选择仅包含直属当前部门的用户，不会包含其下属二级部门用户；已选部门以标签展示，可点击 × 移除。
                </div>
              </div>
            </div>

            {/* 按用户添加分组人员：下拉多选（与授权弹窗「指定用户」交互一致） */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid #F2F4F7',
                background: '#FBFCFD', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Icon name="users" size={13} color="#E89E57" />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>按用户添加分组人员</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                  已指定 {manualCount} 人 · 全部用户可搜索
                </span>
              </div>
              <div style={{ padding: 12 }}>
                <MultiSelectDropdown
                  label="按用户"
                  options={userOptions}
                  selectedIds={form.userIds}
                  onToggle={toggleUserById}
                  placeholder="请选择用户"
                  searchPlaceholder="搜索用户姓名 / 部门"
                  match={userMatch}
                  isDisabled={(o) => memberMap.has(o.id) && !form.userIds.includes(o.id)}
                />
                <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                  💡 所有用户均可搜索；已被部门覆盖的用户显示为「已添加」，不可重复添加；已选用户以标签展示，可点击 × 移除。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 已加入用户组的用户 */}
        <div className="section">
          <div className="section-header">
            <span>已加入用户组的用户</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' }}>
              部门成员自动纳入，指定用户额外添加
            </span>
          </div>
          <div className="section-body" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Tag color="warning">已选部门 {form.deptIds.length} 个</Tag>
              <Tag color="info">部门成员 {deptAutoCount} 人</Tag>
              <Tag color="brand">指定用户 {manualCount} 人</Tag>
              <Tag color="success">成员合计 {members.length} 人</Tag>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                className="input"
                placeholder="搜索姓名 / 所属部门"
                value={memberKeyword}
                onChange={(e) => { setMemberKeyword(e.target.value); setMemberPage(1); }}
                style={{ maxWidth: 260 }}
              />
              <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
                {memberKeyword ? `匹配 ${filteredMembers.length} 人` : ''}
              </span>
            </div>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th width={90}>姓名</th>
                      <th>所属部门</th>
                      <th width={100}>来源</th>
                      <th width={80}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                          尚未配置成员，请在上方按部门配置或指定用户配置中添加
                        </td>
                      </tr>
                    ) : filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                          未匹配到用户
                        </td>
                      </tr>
                    ) : null}
                    {pagedMembers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</td>
                        <td style={{ fontSize: 12, color: '#6B7280' }}>{deptPath(u.deptId)}</td>
                        <td>
                          <Tag color={u.source === '指定用户' ? 'brand' : 'info'}>{u.source}</Tag>
                        </td>
                        <td>
                          <span
                            style={{ color: '#EF4444', cursor: 'pointer', fontSize: 13 }}
                            onClick={() => handleRemoveMember(u)}
                            title={u.source === '部门' ? '仅移除当前用户，不影响该部门其他用户' : '移出用户组'}
                          >移除</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {members.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <Pagination
                  page={safeMemberPage}
                  pageSize={memberPageSize}
                  total={filteredMembers.length}
                  onChange={onMemberPageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <div style={{
          padding: '14px 0', display: 'flex', justifyContent: 'flex-end', gap: 10
        }}>
          <button className="btn btn-default" onClick={() => navigate('/user-groups')}>取消</button>
          <button className="btn btn-primary" onClick={onSave}>
            <Icon name="check" size={14} />
            保存配置
          </button>
        </div>
      </div>

      {/* 移除成员确认：仅移除当前用户，不影响部门其他用户 */}
      <Confirm
        open={!!confirmRemove}
        title="移除成员确认"
        content={
          <div>
            {confirmRemove?.type === 'dept' ? (
              <>
                确定将 <strong style={{ color: '#E89E57' }}>{confirmRemove.name}</strong> 移出用户组吗？
                <div style={{
                  background: '#FFFBEB', border: '1px solid #FCD34D',
                  padding: 10, borderRadius: 6, fontSize: 12, color: '#92400E', marginTop: 12
                }}>
                  该用户由部门「{confirmRemove.deptName}」自动纳入，移除后仅影响当前用户，
                  该部门其他用户不受影响。
                </div>
              </>
            ) : (
              <>
                确定将 <strong style={{ color: '#E89E57' }}>{confirmRemove?.name}</strong> 移出用户组吗？
              </>
            )}
          </div>
        }
        danger
        onOk={onConfirmRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
