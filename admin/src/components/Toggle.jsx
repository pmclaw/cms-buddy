import React from 'react';

export function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="toggle" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange?.(e.target.checked)}
      />
      <span className="slider" />
    </label>
  );
}
