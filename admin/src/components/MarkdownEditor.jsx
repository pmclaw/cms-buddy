import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

export function MarkdownEditor({ value, onChange, height = 320, readOnly }) {
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, gap: 4 }}>
        <button
          className={`btn btn-sm ${mode === 'edit' ? 'btn-primary' : 'btn-default'}`}
          onClick={() => setMode('edit')}
          disabled={readOnly}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        >编辑</button>
        <button
          className={`btn btn-sm ${mode === 'preview' ? 'btn-primary' : 'btn-default'}`}
          onClick={() => setMode('preview')}
        >预览</button>
      </div>
      <div data-color-mode="light">
        <MDEditor
          value={value || ''}
          onChange={(v) => onChange?.(v || '')}
          height={height}
          preview={mode}
          extraCommands={[]}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
