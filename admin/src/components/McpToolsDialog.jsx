import React, { useState } from 'react';
import { Modal } from './Overlay.jsx';
import { Checkbox } from './Checkbox.jsx';
import { Icon } from './Common.jsx';

const PAGE_SIZE = 20;

// MCP 工具关联弹窗：工具列表分页，勾选（表头全选），已选工具排前，确定提交
// showGlobalColumn 时额外展示「是否全局工具」列（勾选即设为全局工具，平台运行时自动加载）
// globalOnly 时进入「设置全局工具」模式：隐藏行首工具勾选列，仅通过「是否全局工具」列操作（勾选即自动纳入本空间关联）
export function McpToolsDialog({ mcp, selected = [], globalTools = [], showGlobalColumn = false, globalOnly = false, onClose, onSubmit }) {
  const [draft, setDraft] = useState(selected);            // 关联工具集合
  const [draftGlobal, setDraftGlobal] = useState(globalTools); // 全局工具集合
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [keyword, setKeyword] = useState('');
  const tools = mcp.tools || [];
  const showGlobal = showGlobalColumn || globalOnly; // 设置全局工具模式必显全局列

  // 关键词过滤（工具名称 / 能力描述），未输入时保持全量
  const kw = keyword.trim().toLowerCase();
  const filteredTools = kw
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(kw) ||
          (t.label || '').toLowerCase().includes(kw)
      )
    : tools;

  // 已选工具排前
  const sorted = [...filteredTools].sort((a, b) => {
    const ai = draft.includes(a.name) ? 0 : 1;
    const bi = draft.includes(b.name) ? 0 : 1;
    return ai - bi;
  });

  const totalPage = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allChecked = filteredTools.length > 0 && filteredTools.every((t) => draft.includes(t.name));
  const toggleAll = () => {
    const names = filteredTools.map((t) => t.name);
    if (allChecked) {
      // 取消全选：仅移除当前（可见/过滤后）工具，同时清空其全局标记（全局工具必须从属于已勾选工具）
      setDraft((d) => d.filter((x) => !names.includes(x)));
      setDraftGlobal((g) => g.filter((x) => !names.includes(x)));
    } else {
      setDraft((d) => [...new Set([...d, ...names])]);
    }
  };
  // 勾选/取消工具；取消勾选时自动清除该工具的全局标记
  const toggle = (name) => {
    if (draft.includes(name)) {
      setDraft((d) => d.filter((x) => x !== name));
      setDraftGlobal((g) => g.filter((x) => x !== name));
    } else {
      setDraft((d) => [...d, name]);
    }
  };
  const toggleGlobal = (name) => {
    const on = !draftGlobal.includes(name);
    setDraftGlobal((d) => (on ? [...d, name] : d.filter((x) => x !== name)));
    // 全局模式下勾选全局即自动纳入本空间关联集合（取消仅取消全局标记，已有关联保留）
    if (globalOnly && on) {
      setDraft((d) => (d.includes(name) ? d : [...d, name]));
    }
  };

  return (
    <Modal
      open
      title={globalOnly ? `设置全局工具 - ${mcp.name}` : `关联工具 - ${mcp.name}`}
      onClose={onClose}
      width="xwide"
      footer={
        <>
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={() => onSubmit(draft, draftGlobal)}>确定</button>
        </>
      }
    >
      <div>
        {/* 服务信息 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '12px 16px', marginBottom: 12,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{mcp.name}</span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>共 {tools.length} 个工具</span>
          {globalOnly ? (
            <span style={{ fontSize: 13, color: '#E89E57' }}>全局 {draftGlobal.length} 个</span>
          ) : (
            <>
              <span style={{ fontSize: 13, color: '#E89E57' }}>已选 {draft.length} 个</span>
              {showGlobal && (
                <span style={{ fontSize: 13, color: '#B87136' }}>全局 {draftGlobal.length} 个</span>
              )}
            </>
          )}
        </div>

        {/* 工具搜索 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={14}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              className="input"
              placeholder="搜索工具名称 / 能力描述"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              style={{ paddingLeft: 30, maxWidth: 320 }}
            />
          </div>
          {kw ? (
            <span style={{ fontSize: 12, color: '#E89E57' }}>命中 {filteredTools.length} 个工具</span>
          ) : (
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>输入关键词可快速筛选工具</span>
          )}
        </div>

        {tools.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: '#9CA3AF',
            fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff',
          }}>
            暂无工具数据
          </div>
        ) : filteredTools.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: '#9CA3AF',
            fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff',
          }}>
            未找到匹配「{keyword.trim()}」的工具
          </div>
        ) : (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {!globalOnly && (
                      <th width={46}>
                        <Checkbox checked={allChecked} onChange={() => toggleAll()} />
                      </th>
                    )}
                    <th width={220}>工具名称</th>
                    {showGlobal && <th width={140}>是否全局工具</th>}
                    <th>能力描述</th>
                    <th width={70}>详情</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tool) => {
                    const c = draft.includes(tool.name);
                    const g = draftGlobal.includes(tool.name);
                    const expanded = expandedRow === tool.name;
                    return (
                      <tr key={tool.name}>
                        {!globalOnly && (
                          <td>
                            <Checkbox checked={c} onChange={() => toggle(tool.name)} />
                          </td>
                        )}
                        <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#1F2937' }}>
                          {tool.name}
                        </td>
                        {showGlobal && (
                          <td style={{ textAlign: 'center' }}>
                            {/* 非全局模式：仅勾选的工具可设置全局，未勾选默认非全局且不可操作 */}
                            <Checkbox
                              checked={globalOnly ? g : (c && g)}
                              disabled={!globalOnly && !c}
                              onChange={() => toggleGlobal(tool.name)}
                            />
                          </td>
                        )}
                        <td style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
                          <div style={{
                            ...(expanded ? {} : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
                          }}>
                            {tool.label}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {tool.label ? (
                            <button
                              type="button"
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                color: '#E89E57', cursor: 'pointer', fontSize: 12,
                              }}
                              onClick={() => setExpandedRow(expanded ? null : tool.name)}
                            >{expanded ? '收起' : '详情'}</button>
                          ) : <span style={{ color: '#D1D5DB' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPage > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', borderTop: '1px solid #F2F4F7', fontSize: 13, color: '#6B7280',
              }}>
                <div>
                  共 <strong style={{ color: '#1F2937' }}>{sorted.length}</strong> 条数据
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {Array.from({ length: totalPage }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{
                        minWidth: 32, height: 32, padding: '0 8px',
                        border: '1px solid ' + (safePage === i + 1 ? '#E89E57' : '#E5E7EB'),
                        background: safePage === i + 1 ? '#E89E57' : '#fff',
                        color: safePage === i + 1 ? '#fff' : '#4B5563',
                        borderRadius: 4, cursor: 'pointer', fontSize: 13,
                      }}
                    >{i + 1}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
