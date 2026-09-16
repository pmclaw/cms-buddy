// 用户组管理列表页：统计 / 筛选 / 表格 / 详情弹窗（部门清单 + 用户清单）/ 删除确认
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Icon, Empty, Confirm } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { orgUsers, orgDepartments } from '../../data/mock.js';
import { getDept, deptPath, groupMembers } from './utils.js';

export function UserGroupList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { userGroups, deleteUserGroup, tenants } = useStore();

  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState(null); // 详情弹窗目标
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return userGroups;
    return userGroups.filter((g) => (g.name + ' ' + (g.desc || '')).toLowerCase().includes(k));
  }, [userGroups, keyword]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 全平台覆盖统计
  const stats = useMemo(() => {
    const deptSet = new Set();
    const userSet = new Set();
    userGroups.forEach((g) => {
      (g.deptIds || []).forEach((d) => deptSet.add(d));
      groupMembers(g).forEach((u) => userSet.add(u.id));
    });
    return {
      total: userGroups.length,
      depts: deptSet.size,
      users: userSet.size,
    };
  }, [userGroups]);

  // 「所属空间」列：空间管理员创建的展示空间名称（brandName）；系统管理员创建的展示「系统」
  const renderOwnedCell = (creatorTenant) => {
    if (!creatorTenant) return <Tag color="default">系统</Tag>;
    const t = tenants.find((x) => x.id === creatorTenant);
    return <Tag color="info">{t ? t.brandName : '—'}</Tag>;
  };

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">用户组管理</h1>
            <div className="page-desc">
              用户组用于为 Skill 技能与专家助理管理模块配置用户权限组：可按多级组织架构选择部门，也可直接指定用户，成员范围灵活组合。
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => navigate('/user-groups/new')}>
              <Icon name="plus" size={14} />
              新建用户组
            </button>
          </div>
        </div>

        {/* 统计卡 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { label: '用户组总数', value: stats.total, color: '#E89E57' },
            { label: '覆盖部门', value: stats.depts, color: '#3B82F6' },
            { label: '覆盖用户', value: stats.users, color: '#10B981' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: s.color + '15', color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 600,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 筛选条 */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '12px 16px', borderBottom: '1px solid #F2F4F7', background: '#FBFCFD'
          }}>
            <input
              className="input"
              placeholder="搜索用户组名称 / 描述"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              style={{ maxWidth: 260 }}
            />
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>
              共 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 个用户组
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th width={160}>用户组名称</th>
                  <th>部门范围</th>
                  <th width={90}>用户数</th>
                  <th width={110}>所属空间</th>
                  <th>描述</th>
                  <th width={90}>更新人</th>
                  <th width={140}>更新时间</th>
                  <th width={90}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <Empty icon="👥" tip={keyword ? '未匹配到用户组' : '暂无用户组，点击右上角「新建用户组」创建'} />
                    </td>
                  </tr>
                )}
                {paged.map((g) => {
                  const members = groupMembers(g);
                  const depts = (g.deptIds || []).map((id) => getDept(id)).filter(Boolean);
                  return (
                    <tr key={g.id}>
                      <td>
                        <span
                          style={{ color: '#E89E57', fontWeight: 500, cursor: 'pointer' }}
                          onClick={() => setDetail(g)}
                        >{g.name}</span>
                      </td>
                      <td>
                        {depts.length === 0 ? (
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {depts.slice(0, 3).map((d) => (
                              <Tag key={d.id} color="warning" style={{ color: '#1F2937' }} title={deptPath(d.id)}>{d.name}</Tag>
                            ))}
                            {depts.length > 3 && (
                              <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>
                                +{depts.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 13, color: members.length > 0 ? '#E89E57' : '#9CA3AF',
                            fontWeight: members.length > 0 ? 500 : 400,
                            cursor: members.length > 0 ? 'pointer' : 'default',
                            textDecoration: members.length > 0 ? 'underline' : 'none',
                            textUnderlineOffset: 3,
                          }}
                          onClick={() => members.length > 0 && setDetail(g)}
                          title={members.length > 0 ? '点击查看用户清单' : ''}
                        >{members.length}</span>
                      </td>
                      <td>{renderOwnedCell(g.creatorTenant)}</td>
                      <td style={{ fontSize: 12, color: '#6B7280', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.desc || ''}>
                        {g.desc || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#6B7280' }}>{g.updater || g.creator || '—'}</td>
                      <td style={{ fontSize: 12, color: '#9CA3AF' }}>{g.updateTime}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span style={{ color: '#E89E57', cursor: 'pointer', fontSize: 13 }} onClick={() => navigate(`/user-groups/edit/${g.id}`)}>编辑</span>
                          <span style={{ color: '#EF4444', cursor: 'pointer', fontSize: 13 }} onClick={() => setConfirmDel(g)}>删除</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '10px 16px' }}>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
          </div>
        </div>
      </div>

      {/* 详情弹窗：基本信息 + 部门清单 + 用户清单 */}
      {detail && (
        <UserGroupDetailDialog group={detail} onClose={() => setDetail(null)} />
      )}

      <Confirm
        open={!!confirmDel}
        title="删除用户组确认"
        content={
          <div>
            确定要删除用户组 <strong style={{ color: '#E89E57' }}>{confirmDel?.name}</strong> 吗？
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              padding: 10, borderRadius: 6, fontSize: 12, color: '#B91C1C', marginTop: 12
            }}>
              ⚠️ 删除后引用该用户组的 Skill 技能与专家助理授权将失效，操作不可恢复。
            </div>
          </div>
        }
        danger
        onOk={() => {
          deleteUserGroup(confirmDel.id);
          toast.success(`已删除用户组「${confirmDel.name}」`);
          setConfirmDel(null);
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

// ========== 用户组详情弹窗 ==========
function UserGroupDetailDialog({ group, onClose }) {
  const [kw, setKw] = useState('');
  const [dlgPage, setDlgPage] = useState(1);
  const [dlgPageSize, setDlgPageSize] = useState(10);
  const members = groupMembers(group);
  const depts = (group.deptIds || []).map((id) => getDept(id)).filter(Boolean);

  const filteredMembers = members.filter((u) => {
    const k = kw.trim().toLowerCase();
    if (!k) return true;
    return (u.name + u.deptName).toLowerCase().includes(k);
  });

  // 用户清单分页
  const dlgTotalPages = Math.max(1, Math.ceil(filteredMembers.length / dlgPageSize));
  const safeDlgPage = Math.min(dlgPage, dlgTotalPages);
  const pagedMembers = filteredMembers.slice((safeDlgPage - 1) * dlgPageSize, safeDlgPage * dlgPageSize);
  const onDlgPageChange = (p, size) => {
    if (size) setDlgPageSize(size);
    setDlgPage(p);
  };

  return (
    <Modal
      open
      title="用户组详情"
      onClose={onClose}
      width="xwide"
      footer={<button className="btn btn-primary" onClick={onClose}>关闭</button>}
    >
      <div>
        {/* 基本信息 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          padding: '14px 16px', marginBottom: 12,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>{group.name}</span>
          <Tag color="brand">部门 {depts.length} 个</Tag>
          <Tag color="success">用户 {members.length} 人</Tag>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            更新人 {group.updater || group.creator || '—'} · 更新于 {group.updateTime}
          </span>
        </div>

        {group.desc && (
          <div style={{
            background: '#F8F9FB', padding: '10px 14px', borderRadius: 8,
            fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.6,
          }}>
            {group.desc}
          </div>
        )}

        {/* 用户清单 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <input
            className="input"
            placeholder="搜索姓名 / 部门"
            value={kw}
            onChange={(e) => { setKw(e.target.value); setDlgPage(1); }}
            style={{ maxWidth: 260 }}
          />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            共 {filteredMembers.length} 人 · （部门内用户 + 指定用户）
          </span>
        </div>
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th width={90}>姓名</th>
                  <th>所属部门</th>
                  <th width={80}>来源</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                      未匹配到用户
                    </td>
                  </tr>
                )}
                {pagedMembers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>{deptPath(u.deptId)}</td>
                    <td>
                      <Tag color={u.source === '指定用户' ? 'brand' : 'info'}>{u.source}</Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {filteredMembers.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <Pagination
              page={safeDlgPage}
              pageSize={dlgPageSize}
              total={filteredMembers.length}
              onChange={onDlgPageChange}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

// 供其他模块（如 Skill / 专家授权）便捷引用全平台部门数据
export { orgUsers, orgDepartments };
