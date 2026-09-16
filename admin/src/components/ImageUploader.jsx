import React, { useRef } from 'react';

export function ImageUploader({ value, onChange, label, hint, height = 120, ratio, shape = 'rect', readOnly }) {
  const inputRef = useRef(null);
  const pick = () => !readOnly && inputRef.current?.click();
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const borderRadius = shape === 'circle' ? '50%' : shape === 'avatar' ? '8px' : '6px';

  return (
    <div>
      {label && <div className="label">{label}</div>}
      <div
        className={`uploader ${value ? 'has-image' : ''}`}
        style={{
          height: value ? 'auto' : height,
          minHeight: value ? 120 : height,
          borderRadius,
          aspectRatio: ratio || 'auto',
          width: shape === 'avatar' ? 120 : shape === 'circle' ? 120 : 'auto',
          margin: shape === 'circle' || shape === 'avatar' ? '0 auto' : 0,
          cursor: readOnly ? 'default' : 'pointer',
        }}
        onClick={pick}
      >
        {value ? (
          <>
            <img src={value} alt="预览" style={{ borderRadius, maxHeight: 220 }} />
            {!readOnly && (
              <div className="upload-mask" style={{ borderRadius }}>
                <button className="btn btn-default btn-sm" onClick={(e) => { e.stopPropagation(); pick(); }}>更换</button>
                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); onChange?.(''); }}>移除</button>
              </div>
            )}
          </>
        ) : readOnly ? (
          <div className="upload-placeholder" style={{ cursor: 'default' }}>
            <div className="upload-icon" style={{ opacity: 0.3 }}>+</div>
            <div style={{ opacity: 0.5 }}>暂无图片</div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">+</div>
            <div>点击上传图片</div>
            {hint && <div style={{ marginTop: 4, fontSize: 12 }}>{hint}</div>}
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} disabled={readOnly} />
      </div>
    </div>
  );
}
