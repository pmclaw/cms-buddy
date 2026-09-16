import React, { useEffect, useRef, useState } from 'react';

// MCP 工具折叠容器：默认展示一行，超出后点击"展开/收起"查看全部
export function ToolCollapse({ children, collapsedHeight = 36, expandLabel = '展开全部', collapseLabel = '收起' }) {
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setOverflow(el.scrollHeight > collapsedHeight + 6);
    }
  }, [children, collapsedHeight]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          overflow: 'hidden',
          maxHeight: expanded ? undefined : collapsedHeight,
          transition: 'max-height 0.2s ease',
        }}
      >
        {children}
      </div>
      {overflow && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 8, padding: 0, background: 'none', border: 'none',
            color: '#E89E57', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {expanded ? collapseLabel : expandLabel}
          <span style={{ fontSize: 10 }}>{expanded ? '▲' : '▼'}</span>
        </button>
      )}
    </div>
  );
}
