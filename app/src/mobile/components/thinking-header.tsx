import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'

/**
 * 思考过程折叠头：任务回答页与自动化执行详情共用，保证两处展示一致。
 * 折叠时展示「任务处理过程  总耗时 X  ›」
 */
export default function ThinkingHeader({
  duration,
  open,
  onToggle,
}: {
  duration: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 py-1 text-left"
    >
      <span className="text-ink text-[17px] leading-[26px] font-semibold">
        任务处理过程
      </span>
      <span className="text-sub text-[14px]">
        总耗时 <span className="text-ink/80">{duration}</span>
      </span>
      <ChevronRight
        className={cn(
          'text-sub ml-auto size-[18px] shrink-0 transition-transform',
          open && 'rotate-90'
        )}
        strokeWidth={1.8}
      />
    </button>
  )
}
