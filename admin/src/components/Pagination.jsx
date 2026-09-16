import React from 'react';

export function Pagination({ page = 1, pageSize = 10, total = 0, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const renderPages = () => {
    const pages = [];
    const max = Math.min(totalPages, 7);
    for (let i = 1; i <= max; i++) pages.push(i);
    if (totalPages > 7) pages.push('...', totalPages);
    return pages;
  };

  return (
    <div className="pager">
      <div>共 <strong style={{ color: '#1F2937' }}>{total}</strong> 条 · 第 {start}-{end} 条</div>
      <div className="pages">
        <button className="page-btn" disabled={page === 1} onClick={() => onChange?.(page - 1)}>‹</button>
        {renderPages().map((p, i) =>
          typeof p === 'number' ? (
            <button
              key={i}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => onChange?.(p)}
            >{p}</button>
          ) : (
            <span key={i} className="page-btn" style={{ border: 'none', background: 'transparent' }}>···</span>
          )
        )}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onChange?.(page + 1)}>›</button>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select className="select" style={{ width: 110, height: 28 }} value={pageSize} onChange={(e) => onChange?.(1, Number(e.target.value))}>
          <option value={10}>10 条/页</option>
          <option value={20}>20 条/页</option>
          <option value={50}>50 条/页</option>
        </select>
      </div>
    </div>
  );
}
