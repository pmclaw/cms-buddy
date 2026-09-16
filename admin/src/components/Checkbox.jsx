import React from 'react';

export function Checkbox({ checked, onChange, disabled, children }) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}>
      <span
        className={`checkbox ${checked ? 'checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange?.(!checked);
        }}
      />
      {children}
    </label>
  );
}

export function Radio({ checked, onChange, disabled }) {
  return (
    <span
      className={`radio ${checked ? 'checked' : ''}`}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange?.();
      }}
    />
  );
}
