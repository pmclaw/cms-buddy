// 多级树形组织架构组件：展开/收起、关键字搜索（自动展开匹配路径）、勾选仅作用于当前节点（不含子部门）
import React, { useEffect, useState } from 'react';
import { Icon } from '../../components/Common.jsx';
import { Checkbox } from '../../components/Checkbox.jsx';
import { Tag } from '../../components/Tag.jsx';

// 按关键字过滤树：匹配节点或其子树命中则保留，保证祖先链完整
function filterTree(nodes, kw) {
  if (!kw) return nodes;
  return nodes
    .map((n) => ({ ...n, children: n.children ? filterTree(n.children, kw) : undefined }))
    .filter((n) => n.name.toLowerCase().includes(kw) || (n.children && n.children.length > 0));
}

// 收集所有匹配节点的祖先 id（用于搜索时自动展开）
function collectAncestors(nodes, kw, ancestors = [], out = new Set()) {
  nodes.forEach((n) => {
    if (n.name.toLowerCase().includes(kw)) ancestors.forEach((a) => out.add(a));
    if (n.children) collectAncestors(n.children, kw, [...ancestors, n.id], out);
  });
  return out;
}

// 扁平化部门树（供外部快速查找部门路径等）
export function flattenDepartments(nodes, path = []) {
  let out = [];
  nodes.forEach((n) => {
    out.push({ ...n, path: [...path, n.name] });
    if (n.children) out = out.concat(flattenDepartments(n.children, [...path, n.name]));
  });
  return out;
}

export function OrgTree({ data, selected = [], onToggle, keyword = '' }) {
  const [expanded, setExpanded] = useState(() => new Set(['D001', 'D010', 'D020']));

  // 搜索时自动展开匹配路径
  useEffect(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return;
    const toOpen = collectAncestors(data, kw);
    if (toOpen.size > 0) setExpanded((prev) => new Set([...prev, ...toOpen]));
  }, [keyword, data]);

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node, depth) => {
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = expanded.has(node.id);
    const isChecked = selected.includes(node.id);

    return (
      <div key={node.id}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 8px', paddingLeft: 8 + depth * 20,
            borderRadius: 6, cursor: 'default', fontSize: 13,
            color: '#1F2937', background: isChecked ? '#FFF9F2' : 'transparent',
          }}
          onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = '#F8F9FB'; }}
          onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = 'transparent'; }}
        >
          {hasChildren ? (
            <span
              onClick={() => toggleExpand(node.id)}
              style={{ display: 'flex', cursor: 'pointer', color: '#9CA3AF' }}
            >
              <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={12} />
            </span>
          ) : (
            <span style={{ width: 12, display: 'inline-block' }} />
          )}
          <Checkbox checked={isChecked} onChange={() => onToggle(node)} />
          <span style={{ fontWeight: hasChildren ? 500 : 400 }}>{node.name}</span>
          {hasChildren && (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              {node.children.length}
            </span>
          )}
          {isChecked && <Tag color="brand" style={{ fontSize: 11, padding: '1px 8px' }}>已选</Tag>}
        </div>
        {hasChildren && isOpen && (
          <div>{node.children.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  const filtered = filterTree(data, keyword.trim().toLowerCase());
  if (filtered.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        未匹配到相关部门
      </div>
    );
  }
  return <div>{filtered.map((n) => renderNode(n, 0))}</div>;
}
