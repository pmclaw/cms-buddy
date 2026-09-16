import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// 指标口径说明 Tooltip：鼠标悬停小 i 图标显示提示框
// 浮层通过 Portal 渲染到 body 顶层（zIndex 9999），不受任何祖先 overflow/zIndex 影响，保证不被遮挡
// 提示框样式：浅灰底、圆角、灰色边框、9px 字号
export function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left + r.width / 2, top: r.bottom });
    setShow(true);
  };

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4, verticalAlign: 'middle', cursor: 'help' }}
      onMouseEnter={open}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
        border: '1px solid #A1A1AA', color: '#A1A1AA',
        fontSize: 9, fontStyle: 'italic', fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      }}>i</span>
      {children}
      {show && pos && createPortal(
        <span style={{
          position: 'fixed', left: pos.left, top: pos.top + 6, transform: 'translateX(-50%)',
          zIndex: 9999, minWidth: 120, maxWidth: 210,
          background: '#F4F4F5', border: '1px solid #D4D4D8', borderRadius: 6,
          padding: '6px 8px', fontSize: 9, lineHeight: 1.6,
          color: '#52525B', textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', pointerEvents: 'none',
          boxShadow: '0 4px 12px -6px rgba(0,0,0,0.15)',
        }}>
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}
