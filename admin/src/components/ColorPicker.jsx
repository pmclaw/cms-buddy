import React, { useState } from 'react';

export function ColorPicker({ value, onChange, options = [], label }) {
  const [showMore, setShowMore] = useState(false);
  return (
    <div>
      {label && <div style={{ marginBottom: 6, fontSize: 13, color: '#6B7280' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <div
            key={opt.value}
            className={`color-swatch ${value === opt.value ? 'selected' : ''}`}
            style={{ background: opt.value }}
            title={opt.name}
            onClick={() => onChange?.(opt.value)}
          />
        ))}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="color"
            value={value || '#E89E57'}
            onChange={(e) => onChange?.(e.target.value)}
            style={{
              width: 32, height: 32, padding: 0, border: 'none', background: 'transparent',
              cursor: 'pointer', borderRadius: 6, overflow: 'hidden'
            }}
          />
          <input
            className="input"
            style={{ width: 110, height: 30 }}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="#E89E57"
          />
        </div>
      </div>
    </div>
  );
}
