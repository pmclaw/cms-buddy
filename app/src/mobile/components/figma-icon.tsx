import { cn } from '@/lib/cn'

/** 渲染从 Figma 导出的图标资源，宽高显式写死，避免被撑成原始尺寸。 */
export default function FigmaIcon({
  src,
  size = 20,
  height,
  className,
  alt = '',
}: {
  src: string
  size?: number
  /** 非正方形素材（例如首页吉祥物）可单独指定高度，传 'auto' 保持比例 */
  height?: number | 'auto'
  className?: string
  alt?: string
}) {
  return (
    <img
      alt={alt}
      src={src}
      width={size}
      height={height === 'auto' ? undefined : (height ?? size)}
      className={cn('shrink-0', className)}
      style={{
        width: size,
        height: height === 'auto' ? 'auto' : (height ?? size),
      }}
    />
  )
}
