import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

/**
 * 思考过程折叠头：任务回答页与自动化执行详情共用，保证两处展示一致。
 * 执行中展示思考状态；完成后展示「任务处理过程  总耗时 X」与折叠箭头。
 */
export default function ThinkingHeader({
  duration,
  open,
  onToggle,
  streaming = false,
  elapsed,
}: {
  duration: string
  open: boolean
  onToggle: () => void
  streaming?: boolean
  elapsed?: string
}) {
  return (
    <button
      type="button"
      disabled={streaming}
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-3 py-1 text-left',
        streaming ? 'cursor-default' : 'cursor-pointer'
      )}
    >
      <span className="text-ink text-[17px] leading-[26px] font-semibold">
        任务处理过程
      </span>
      {streaming ? (
        <>
          <span className="border-brand/25 border-t-brand size-[14px] shrink-0 animate-spin rounded-full border-[1.5px] motion-reduce:animate-none" />
          <span className="text-sub text-[14px] leading-[22px]">
            思考中 · 已用时 {elapsed}
          </span>
        </>
      ) : (
        <>
          <span className="text-sub text-[14px]">
            总耗时 <span className="text-ink/80">{duration}</span>
          </span>
          <ChevronDown
            className={cn(
              'text-sub ml-auto size-[18px] shrink-0 transition-transform',
              open ? '' : '-rotate-90'
            )}
            strokeWidth={1.8}
          />
        </>
      )}
    </button>
  )
}
