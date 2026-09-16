import React, { useEffect, useMemo, useRef, useState } from 'react';

// 可输入可检索下拉（Combobox）：
// - 输入时自动检索过滤下拉项，可点击选择已有选项
// - 允许自定义输入；输入值不在选项中时，保存后由调用方写入字典
export function SelectCombobox({ value, onChange, options = [], placeholder, disabled, style }) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const ref = useRef(null);

  const filtered = useMemo(() => {
    const k = (kw || '').trim().toLowerCase();
    if (!k) return options;
    return options.filter((o) => String(o).toLowerCase().includes(k));
  }, [options, kw]);

  // 点击外部收起
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <input
        className="input"
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => { setKw(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => { setKw(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, marginTop: 4,
          maxHeight: 220, overflow: 'auto', boxShadow: '0 6px 18px -8px rgba(0,0,0,0.18)',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 12, color: '#9CA3AF' }}>
              无匹配选项，当前输入将作为新选项保存
            </div>
          ) : (
            filtered.map((o) => (
              <div
                key={o}
                style={{
                  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
                  color: '#4B5563', background: o === value ? '#FBF1E5' : 'transparent',
                }}
                onMouseDown={(e) => { e.preventDefault(); onChange(o); setOpen(false); setKw(''); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F8FA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = o === value ? '#FBF1E5' : 'transparent'; }}
              >
                {o}
                {o === value && <span style={{ color: '#E89E57', marginLeft: 6 }}>✓</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
