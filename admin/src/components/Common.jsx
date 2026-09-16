import React from 'react';

export function StepIndicator({ steps, current }) {
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`step ${i === current ? 'active' : i < current ? 'done' : ''}`}>
            <span className="num">{i < current ? '✓' : i + 1}</span>
            <span>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Empty({ icon = '📭', tip = '暂无数据' }) {
  return (
    <div className="empty">
      <div className="empty-icon" style={{ fontSize: 56 }}>{icon}</div>
      <div>{tip}</div>
    </div>
  );
}

export function Confirm({ open, title, content, onOk, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body" style={{ color: '#4B5563' }}>{content}</div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onCancel}>取消</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onOk}>确定</button>
        </div>
      </div>
    </div>
  );
}

export function Section({ title, extra, children, bodyStyle }) {
  return (
    <div className="section">
      {title && (
        <div className="section-header">
          <span>{title}</span>
          {extra}
        </div>
      )}
      <div className="section-body" style={bodyStyle}>{children}</div>
    </div>
  );
}

export function Icon({ name, size = 14, color = 'currentColor', style }) {
  // Simple inline svg icons
  const paths = {
    search: <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>,
    plus: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>,
    edit: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>,
    trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    eye: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke={color} strokeWidth="1.6" fill="none"/>,
    check: <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.8" fill="none"/></>,
    copy: <rect x="9" y="9" width="11" height="11" rx="2" stroke={color} strokeWidth="1.6" fill="none"/>,
    chevronDown: <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    chevronRight: <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    user: <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.6" fill="none"/>,
    building: <path d="M3 21V7l9-4 9 4v14M9 21V12h6v9" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    layers: <path d="M12 2L2 7l10 5 10-5-10-5Zm0 13L2 10m10 5l10-5M2 15l10 5 10-5" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    settings: <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" fill="none"/>,
    doc: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5h-2v-2l2.5-2.5Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    bot: <rect x="4" y="8" width="16" height="12" rx="2" stroke={color} strokeWidth="1.6" fill="none"/>,
    monitor: <rect x="2" y="4" width="20" height="14" rx="2" stroke={color} strokeWidth="1.6" fill="none"/>,
    chart: <path d="M3 21V9m6 12V3m6 18v-9m6 9V7" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>,
    shield: <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    refresh: <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M21 4v5h-5M3 20v-5h5" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    spark: <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    close: <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>,
    more: <><circle cx="5" cy="12" r="1.6" fill={color}/><circle cx="12" cy="12" r="1.6" fill={color}/><circle cx="19" cy="12" r="1.6" fill={color}/></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {paths[name] || null}
    </svg>
  );
}

export function Tabs({ items, active, onChange }) {
  return (
    <div className="tab-nav">
      {items.map((item) => (
        <div
          key={item.key}
          className={`tab ${active === item.key ? 'active' : ''}`}
          onClick={() => onChange?.(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function StatusTag({ status }) {
  const map = {
    '已启用': 'success',
    '已停用': 'default',
    '已上架': 'success',
    '已下架': 'default',
    '已上线': 'success',
    '已下线': 'default',
  };
  const dotMap = { '已启用': 'on', '已停用': 'off', '已上架': 'on', '已下架': 'off', '已上线': 'on', '已下线': 'off' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13, color: '#4B5563' }}>
      <span className={`status-dot ${dotMap[status] || 'off'}`} />
      {status}
    </span>
  );
}
