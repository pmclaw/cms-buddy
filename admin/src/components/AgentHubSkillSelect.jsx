// 「通过AgentHub创建」技能选择器：可搜索的下拉列表。
// - 未输入关键词：默认展示最新的 defaultCount 个 Agenthub 同步技能
// - 输入关键词：在全部 Agenthub 技能中检索（匹配 技能名称 / 编码 / 描述）
// - 选项仅展示技能名称，选中后由调用方回填技能表单字段
// - 已选中时可通过输入框右侧「×」或 Backspace 清除，回到默认状态
import React, { useEffect, useMemo, useRef, useState } from 'react';

export function AgentHubSkillSelect({
  value,
  options = [],
  onChange,
  onClear,
  disabled,
  placeholder = '请选择 Agenthub 同步的技能',
  defaultCount = 6,
}) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const ref = useRef(null);

  const searching = !!kw.trim();
  const showClear = !disabled && !!value;
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

  // 清除已选技能（回到默认状态）
  const clear = () => {
    if (disabled) return;
    if (onClear) onClear();
    setKw('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    // 未输入关键词时按 Backspace 清除已选项
    if (e.key === 'Backspace' && !kw && value && !disabled) {
      e.preventDefault();
      clear();
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          value={open ? kw : (value ? value.name : '')}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => { setKw(e.target.value); setOpen(true); }}
          onFocus={() => { setKw(''); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          style={showClear ? { paddingRight: 30 } : undefined}
        />
        {showClear && (
          <span
            title="清除已选技能"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); clear(); }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#B87136'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, lineHeight: '16px', textAlign: 'center',
              fontSize: 14, color: '#9CA3AF', cursor: 'pointer', userSelect: 'none',
            }}
          >×</span>
        )}
      </div>
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
                    padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                    color: active ? '#B87136' : '#1F2937',
                    background: active ? '#FBF1E5' : 'transparent',
                    borderBottom: '1px solid #F7F8FA',
                  }}
                >
                  {s.name}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
