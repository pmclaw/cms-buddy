import { characters, type CharacterKey } from '@/data/assets'
import { cn } from 'cn'

/**
 * 角色头像：圆形底色 + 人物图按设计稿窗口裁切（见 assets.ts 中的换算说明）。
 */
export default function CharacterAvatar({
  character,
  size = 20,
  className,
}: {
  character: CharacterKey
  size?: number
  className?: string
}) {
  const spec = characters[character]

  return (
    <span
      aria-hidden
      className={cn('relative block shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size, backgroundColor: spec.bg }}
    >
      <img
        alt=""
        src={spec.src}
        className="pointer-events-none absolute max-w-none object-cover"
        style={{
          width: spec.w * size,
          height: spec.h * size,
          left: spec.x * size,
          top: spec.y * size,
        }}
      />
    </span>
  )
}
