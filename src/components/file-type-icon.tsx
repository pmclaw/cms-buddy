/**
 * 附件文件名前的「文件格式」图标。
 * 造型与配色对齐客户提供的 PDF 图标截图：彩色圆角底 + 白色纸张（带折角）+ 格式图形。
 */

type FileKind = 'pdf' | 'doc' | 'sheet' | 'slide' | 'image' | 'archive' | 'text'

const kindColors: Record<FileKind, string> = {
  pdf: '#f55858',
  doc: '#2e7cf6',
  sheet: '#22a06b',
  slide: '#f2994a',
  image: '#9b6bf2',
  archive: '#e0a93a',
  text: '#8a93a5',
}

const extensionKinds: Record<string, FileKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  xls: 'sheet',
  xlsx: 'sheet',
  csv: 'sheet',
  ppt: 'slide',
  pptx: 'slide',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  bmp: 'image',
  svg: 'image',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  txt: 'text',
  md: 'text',
}

function glyphFor(kind: FileKind) {
  if (kind === 'pdf') return <path d="M16.5 12.6l4.1 7.1h-8.2z" />
  if (kind === 'sheet') {
    return (
      <>
        <rect x="13" y="13" width="3" height="3" rx="0.6" />
        <rect x="16.9" y="13" width="3" height="3" rx="0.6" />
        <rect x="13" y="16.9" width="3" height="3" rx="0.6" />
        <rect x="16.9" y="16.9" width="3" height="3" rx="0.6" />
      </>
    )
  }
  if (kind === 'slide') return <path d="M14.7 12.9l5.2 3.5-5.2 3.5z" />
  if (kind === 'image') {
    return (
      <>
        <circle cx="14.7" cy="14.4" r="1.3" />
        <path d="M12.9 20.7l3-3.8 2.1 2.5 1.5-1.7 2.6 3z" />
      </>
    )
  }
  if (kind === 'archive') {
    return (
      <>
        <rect x="13.4" y="12.8" width="6.2" height="2.6" rx="0.6" />
        <rect x="13.4" y="16.4" width="6.2" height="2.6" rx="0.6" />
      </>
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
  /** 文件名，按扩展名判断格式 */
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
      <g fill={kindColors[kind]}>{glyphFor(kind)}</g>
    </svg>
  )
}
