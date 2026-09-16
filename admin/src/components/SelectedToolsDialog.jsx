// 已选工具查看弹窗：展示某 MCP 服务下已关联的全部工具
// 样式与布局参照 MCP 服务注册管理列表点击 MCP 服务名称的弹窗（MCPDetailDialog）：
// Modal(xwide) + 服务信息子头部 + 工具表格（工具名称/能力描述/参数列表）+ 分页
import React, { useState } from 'react';
import { Modal } from './Overlay.jsx';

export function SelectedToolsDialog({ mcp, selectedNames = [], onClose }) {
  const allTools = mcp.tools || [];
  // 从工具全量列表中过滤出已选工具（容错：名称不存在于 tools 时忽略）
  const tools = allTools.filter((t) => selectedNames.includes(t.name));
  const total = tools.length;

  // 分页（与 MCPDetailDialog 一致）
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [jumpTo, setJumpTo] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTools = tools.slice((safePage - 1) * pageSize, safePage * pageSize);

  const renderPagination = () => {
    if (total === 0) return null;
    const pages = [];
    const addPage = (p) => pages.push(
      <button
        key={p}
        onClick={() => setCurrentPage(p)}
        style={{
          minWidth: 32, height: 32, padding: '0 8px',
          border: '1px solid ' + (p === safePage ? '#E89E57' : '#E5E7EB'),
          background: p === safePage ? '#E89E57' : '#fff',
          color: p === safePage ? '#fff' : '#4B5563',
          borderRadius: 4, cursor: 'pointer', fontSize: 13,
        }}
      >{p}</button>
    );
    addPage(1);
    if (safePage > 3) pages.push(<span key="l-ell" style={{ padding: '0 4px', color: '#9CA3AF' }}>…</span>);
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) addPage(p);
    if (safePage < totalPages - 2) pages.push(<span key="r-ell" style={{ padding: '0 4px', color: '#9CA3AF' }}>…</span>);
    if (totalPages > 1) addPage(totalPages);

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', marginTop: 12,
        fontSize: 13, color: '#6B7280',
      }}>
        <div>
          共 <strong style={{ color: '#1F2937' }}>{total}</strong> 条数据
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>{pages}</div>
          {safePage < totalPages && (
            <button
              onClick={() => setCurrentPage(safePage + 1)}
              style={{
                minWidth: 32, height: 32, padding: '0 8px',
                border: '1px solid #E5E7EB', background: '#fff',
                color: '#4B5563', borderRadius: 4, cursor: 'pointer', fontSize: 13,
              }}
            >{'>'}</button>
          )}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            style={{ height: 32, padding: '0 8px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 13 }}
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>
          <span style={{ marginLeft: 8 }}>跳至</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpTo}
            onChange={(e) => setJumpTo(e.target.value)}
            style={{ width: 56, height: 32, padding: '0 8px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 13 }}
          />
          <span>页</span>
          <button
            onClick={() => {
              const p = Math.min(Math.max(1, Number(jumpTo) || 1), totalPages);
              setCurrentPage(p);
              setJumpTo('');
            }}
            style={{
              height: 32, padding: '0 12px', border: '1px solid #E89E57',
              background: '#fff', color: '#E89E57', borderRadius: 4,
              cursor: 'pointer', fontSize: 13,
            }}
          >确定</button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open
      title="已选工具列表"
      onClose={onClose}
      width="xwide"
      footer={
        <button className="btn btn-primary" onClick={onClose}>关闭</button>
      }
    >
      <div>
        {/* 子头部：服务信息 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 16px', marginBottom: 12,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>{mcp.name}</span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>共 {total} 个已选工具</span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              服务地址：<span style={{ fontFamily: 'monospace', color: '#374151' }}>{mcp.serviceUrl || '-'}</span>
            </span>
          </div>
        </div>

        {/* 工具列表 */}
        {total === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: '#9CA3AF',
            fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8,
            background: '#fff',
          }}>
            暂无已选工具
          </div>
        ) : (
          <div style={{
            border: '1px solid #E5E7EB', borderRadius: 8,
            background: '#fff', overflow: 'hidden',
          }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th width={170}>工具名称</th>
                    <th width={210}>能力描述</th>
                    <th>参数列表</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTools.map((tool, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#1F2937' }}>
                        {tool.name}
                      </td>
                      <td style={{ fontSize: 13, color: '#4B5563' }}>{tool.label}</td>
                      <td>
                        {(tool.params || []).length === 0 ? (
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>无参数</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {tool.params.map((p, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  fontSize: 12,
                                }}
                              >
                                <span style={{
                                  fontFamily: 'monospace', color: '#1F2937',
                                  minWidth: 100, fontWeight: 500,
                                }}>{p.name}</span>
                                <span style={{
                                  fontFamily: 'monospace', color: '#6B7280',
                                  minWidth: 56,
                                }}>{p.type}</span>
                                <span style={{
                                  color: p.required ? '#DC2626' : '#9CA3AF',
                                  minWidth: 32,
                                }}>{p.required ? '必填' : '可选'}</span>
                                <span style={{ color: '#4B5563', flex: 1 }}>{p.desc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </div>
        )}
      </div>
    </Modal>
  );
}
