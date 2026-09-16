import React from 'react';

export function Tag({ children, color = 'default', style, title }) {
  return (
    <span className={`tag ${color !== 'default' ? 'tag-' + color : ''}`} style={style} title={title}>
      {children}
    </span>
  );
}
