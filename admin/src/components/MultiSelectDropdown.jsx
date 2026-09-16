// 下拉多选组件（关键词搜索 + 多选 + 已选 Tag 可删除 + 选项禁用）
// 用于授权弹窗（按用户组/按部门/指定用户）与用户组编辑页（按部门添加分组人员/按用户添加分组人员）
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Common.jsx';
import { Checkbox } from './Checkbox.jsx';

export function MultiSelectDropdown({
  label,
  options,
  selectedIds,
  onToggle,
  placeholder,
  searchPlaceholder,
  match,
  isDisabled,
}) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const [pos, setPos] = useState(null);
  const boxRef = useRef(null);
  const panelRef = useRef(null);

  const openPanel = () => {
    const r = boxRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 16;
    const below = spaceBelow > 240;
    setPos({
      top: below ? r.bottom + 6 : Math.max(8, r.top - 250 - 6),
      left: r.left,
      width: r.width,
    });
    setOpen(true);
    setKw('');
  };

  // 展开期间：点击面板外部 / 滚动 / 缩放 时关闭
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDocDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const filtered = options.filter((o) => match(o, kw));

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* 触发器：渠道名 + 已选 Tag + 数量 + 箭头 */}
      <div
        onClick={openPanel}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid ' + (open ? '#E89E57' : '#E5E7EB'),
          borderRadius: 6, padding: '6px 10px', minHeight: 36,
          cursor: 'pointer', background: '#fff',
          boxShadow: open ? '0 0 0 2px rgba(232,158,87,0.15)' : 'none',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', flexShrink: 0 }}>{label}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, minWidth: 0 }}>
          {selectedIds.length === 0 ? (
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{placeholder}</span>
          ) : (
            selectedIds.map((id) => {
              const opt = options.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <span
                  key={id}
                  title="点击移除"
                  onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: '#B87136', background: '#FBF1E5',
                    border: '1px solid #F3D9BC', borderRadius: 4,
                    padding: '1px 8px', cursor: 'pointer', maxWidth: 160,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {opt.name}
                  <span style={{ fontSize: 11, color: '#B87136', flexShrink: 0 }}>×</span>
                </span>
              );
            })
          )}
        </div>
        {selectedIds.length > 0 && (
          <span style={{ fontSize: 11, color: '#B87136', flexShrink: 0 }}>已选 {selectedIds.length}</span>
        )}
        <Icon name="chevronDown" size={12} style={{ flexShrink: 0, color: '#9CA3AF', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </div>

      {/* 下拉面板：fixed 定位避免被弹窗滚动区裁剪 */}
      {open && pos && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed', top: pos.top, left: pos.left, width: pos.width,
            zIndex: 1200, background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.14)',
            padding: 10, boxSizing: 'border-box',
          }}
        >
          <input
            autoFocus
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%', padding: '6px 10px', border: '1px solid #E5E7EB',
              borderRadius: 6, fontSize: 13, outline: 'none',
              boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>未匹配到选项</div>
            ) : (
              filtered.map((o) => {
                const checked = selectedIds.includes(o.id);
                const disabled = !!(isDisabled && isDisabled(o));
                return (
                  <label
                    key={o.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13,
                      background: checked && !disabled ? '#FFF9F2' : 'transparent',
                    }}
                  >
                    <Checkbox
                      checked={checked || disabled}
                      disabled={disabled}
                      onChange={() => onToggle(o.id)}
                    />
                    <span style={{ fontWeight: checked ? 500 : 400, color: disabled ? '#9CA3AF' : '#1F2937', flexShrink: 0 }}>{o.name}</span>
                    {disabled ? (
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#B8C0CC', flexShrink: 0 }}>已添加</span>
                    ) : (
                      <span style={{
                        marginLeft: 'auto', fontSize: 11, color: '#9CA3AF', textAlign: 'right',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%',
                      }}>{o.sub}</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
