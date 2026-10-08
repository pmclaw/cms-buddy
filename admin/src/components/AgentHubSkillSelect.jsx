// 「通过AgentHub创建」技能选择器：可搜索的下拉列表。
// - 未输入关键词：默认展示最新的 defaultCount 个 Agenthub 同步技能
// - 输入关键词：在全部 Agenthub 技能中检索（匹配 技能名称 / 编码 / 描述）
// - 选项为技能对象本身，选中后由调用方回填技能表单字段
import React, { useEffect, useMemo, useRef, useState } from 'react';

export function AgentHubSkillSelect({
  value,
  options = [],
  onChange,
  disabled,
  placeholder = '请选择 Agenthub 同步的技能',
  defaultCount = 6,
}) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const ref = useRef(null);

  const searching = !!kw.trim();
  const list = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return options.slice(0, defaultCount);
    return options.filter((s) =>
      [s.name, s.code, s.desc].some((v) => String(v || '').toLowerCase().includes(k))
    );
  }, [options, kw, defaultCount]);

  // 点击外部收起
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (s) => {
    if (onChange) onChange(s);
    setOpen(false);
    setKw('');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        className="input"
        value={open ? kw : (value ? value.name : '')}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => { setKw(e.target.value); setOpen(true); }}
        onFocus={() => { setKw(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, marginTop: 4,
          maxHeight: 264, overflow: 'auto', boxShadow: '0 6px 18px -8px rgba(0,0,0,0.18)',
        }}>
          <div style={{
            padding: '6px 12px', fontSize: 12, color: '#9CA3AF',
            background: '#FBFCFD', borderBottom: '1px solid #F2F4F7',
            position: 'sticky', top: 0,
          }}>
            {searching
              ? `检索到 ${list.length} 个 Agenthub 技能`
              : `Agenthub 同步最新 ${list.length} 个技能`}
          </div>
          {list.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 12, color: '#9CA3AF' }}>
              无匹配的 Agenthub 技能
            </div>
          ) : (
            list.map((s) => {
              const active = !!value && value.id === s.id;
              return (
                <div
                  key={s.id}
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F8FA'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = active ? '#FBF1E5' : 'transparent'; }}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    background: active ? '#FBF1E5' : 'transparent',
                    borderBottom: '1px solid #F7F8FA',
                  }}
                >
                  <div style={{ fontSize: 13, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{s.name}</span>
                    {s.version && (
                      <span style={{
                        fontSize: 11, color: '#B87136', background: '#FBF1E5',
                        border: '1px solid #F7E3CC', borderRadius: 4, padding: '0 4px',
                      }}>{s.version}</span>
                    )}
                    {active && <span style={{ color: '#E89E57' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {[s.category, s.businessOwner, `更新 ${s.updateTime || '—'}`].filter(Boolean).join(' · ')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
