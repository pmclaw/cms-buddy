/**
 * 生成文件的格式图标，保持与 PC 端一致的彩色圆角底和格式标识。
 */

type FileKind = 'html' | 'md' | 'text'

const kindColors: Record<FileKind, string> = {
  html: '#e8590c',
  md: '#0891b2',
  text: '#8a93a5',
}

const extensionKinds: Record<string, FileKind> = {
  html: 'html',
  htm: 'html',
  md: 'md',
  markdown: 'md',
  txt: 'text',
}

function glyphFor(kind: FileKind, color: string) {
  if (kind === 'html') {
    return (
      <path
        d="M15.7 13.3l-3.2 3.2 3.2 3.2M17.3 13.3l3.2 3.2-3.2 3.2"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }

  return (
    <>
      <rect x="13" y="13" width="7" height="1.3" rx="0.65" />
      <rect x="13" y="16.2" width="7" height="1.3" rx="0.65" />
      <rect x="13" y="19.4" width="4.6" height="1.3" rx="0.65" />
    </>
  )
}

export default function FileTypeIcon({
  name,
  size = 16,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  const kind = extensionKinds[extension] ?? 'text'

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill={kindColors[kind]} />
      <path
        d="M12 6h5.5L22 10.5V25a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
        fill="#fff"
      />
      <path d="M17.5 6L22 10.5h-3.5a1 1 0 0 1-1-1z" fill="#fff" fillOpacity="0.4" />
      <g fill={kindColors[kind]}>{glyphFor(kind, kindColors[kind])}</g>
    </svg>
  )
}
