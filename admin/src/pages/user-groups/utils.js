// 用户组管理共享工具：部门树查找 / 路径 / 成员聚合
import { orgDepartments, orgUsers } from '../../data/mock.js';
import { flattenDepartments } from './OrgTree.jsx';

const deptMap = new Map(flattenDepartments(orgDepartments).map((d) => [d.id, d]));

export function getDept(id) {
  return deptMap.get(id);
}

export function deptPath(id) {
  const d = deptMap.get(id);
  return d ? d.path.join(' / ') : id;
}

export function usersOfDept(deptId) {
  return orgUsers.filter((u) => u.deptId === deptId);
}

// 用户组成员 = （部门用户 - 排除名单） ∪ 直接指定用户，返回带来源标记的列表（部门 / 指定用户）
export function groupMembers(g) {
  const excluded = new Set(g.excludedUserIds || []);
  const map = new Map();
  (g.deptIds || []).forEach((did) =>
    usersOfDept(did).forEach((u) => {
      if (!excluded.has(u.id)) map.set(u.id, { ...u, source: '部门' });
    })
  );
  (g.userIds || []).forEach((uid) => {
    const u = orgUsers.find((x) => x.id === uid);
    if (u && !map.has(u.id)) map.set(u.id, { ...u, source: '指定用户' });
  });
  return Array.from(map.values());
}
