import React from 'react';

export function Modal({ open, title, children, footer, onClose, width = 'normal' }) {
  if (!open) return null;
  const isCustom = typeof width === 'number';
  const widthClass = isCustom ? '' : width === 'wide' ? 'wide' : width === 'xwide' ? 'xwide' : '';
  return (
    <div className="modal-mask" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${widthClass}`} style={isCustom ? { width } : undefined}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, title, children, footer, onClose, width = 720 }) {
  if (!open) return null;
  return (
    <div className="drawer-mask" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer" style={{ width }}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <button className="close" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
