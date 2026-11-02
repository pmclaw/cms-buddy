import * as React from 'react'
import {
  Brain,
  ChevronDown,
  Clock,
  GitBranch,
  ListChecks,
  PencilRuler,
  Search,
  Workflow,
} from 'lucide-react'

import type { StepIcon, TimelineStep } from '@/data/chat'
import ThinkingHeader from '@/components/thinking-header'
import { cn } from '@/lib/cn'

const iconMap: Record<StepIcon, typeof Brain> = {
  think: Brain,
  plan: ListChecks,
  skill: Workflow,
  tool: Clock,
  subtask: GitBranch,
  custom: PencilRuler,
  parse: Search,
}

/** 「任务处理过程 / 已完成思考」折叠头 + 步骤清单。 */
export default function ThinkingTimeline({
  duration,
  steps,
  open,
  onToggle,
  visibleCount,
  streaming = false,
  elapsed,
  thinking,
  thinkingChars,
}: {
  duration: string
  steps: TimelineStep[]
  open: boolean
  onToggle: () => void
  visibleCount?: number
  /** 任务执行中：处理过程展开并展示流式思考内容 */
  streaming?: boolean
  /** 执行中展示的已用时，例如 3.2s */
  elapsed?: string
  /** 思考过程全文，没有则不展示该子节点 */
  thinking?: string
  /** 思考过程已输出的字数（流式中） */
  thinkingChars?: number
}) {
  const count = visibleCount ?? steps.length
  const expanded = streaming || open
  // 执行中默认展开，结束后默认收起；用户手动切换后保留其选择
  const [thinkingOpen, setThinkingOpen] = React.useState<boolean | null>(null)
  const thinkingExpanded = thinkingOpen ?? streaming
  const thinkingBoxRef = React.useRef<HTMLDivElement>(null)
  const shownThinking =
    thinkingChars === undefined ? thinking : thinking?.slice(0, thinkingChars)
  // 思考容器跟随当前最新步骤
  const activeIndex = Math.min(count, steps.length) - 1

  React.useEffect(() => {
    const box = thinkingBoxRef.current
    if (box) box.scrollTop = box.scrollHeight
  }, [shownThinking])

  return (
    <div className="w-full">
      <ThinkingHeader
        duration={duration}
        open={open}
        onToggle={onToggle}
        streaming={streaming}
        elapsed={elapsed}
      />

      {expanded ? (
        <ol className="mt-3 flex flex-col">
          {steps.slice(0, count).map((step, index) => {
            const Icon = iconMap[step.icon]
            const last = index === Math.min(count, steps.length) - 1
            const withThinking = index === activeIndex && Boolean(thinking)
            return (
              <li
                key={`${step.label}-${index}`}
                className="animate-in fade-in-0 flex gap-3"
              >
                <span className="relative flex w-[16px] shrink-0 justify-center pt-[3px]">
                  <Icon className="size-[14px] text-[#7d879c]" strokeWidth={1.6} />
                  {!last ? (
                    <span className="absolute top-[20px] -bottom-2 w-px bg-[rgba(40,50,83,0.12)]" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-ink text-[12px] leading-[20px]">
                      {step.label}
                    </span>
                    {withThinking ? (
                      <button
                        type="button"
                        aria-label={thinkingExpanded ? '收起思考过程' : '展开思考过程'}
                        onClick={() => setThinkingOpen(!thinkingExpanded)}
                        className="text-sub -ml-1 cursor-pointer p-0.5"
                      >
                        <ChevronDown
                          className={cn(
                            'size-[14px] transition-transform',
                            thinkingExpanded ? 'rotate-180' : ''
                          )}
                          strokeWidth={1.8}
                        />
                      </button>
                    ) : null}
                    {step.badge ? (
                      <span className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[1px] font-mono text-[11px] leading-[18px]">
                        {step.badge}
                      </span>
                    ) : null}
                    <span className="text-sub text-[11px] leading-[20px]">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-ink mt-1 text-[14px] leading-[24px]">
                    {step.title}
                    {step.chip ? (
                      <span className="text-sub ml-2 rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[1px] text-[11px]">
                        {step.chip}
                      </span>
                    ) : null}
                  </p>
                  {withThinking && thinkingExpanded ? (
                    <div
                      ref={thinkingBoxRef}
                      className="scrollbar-none mt-2 h-[160px] overflow-y-auto rounded-[8px] bg-[#f7f8fa] px-3 py-2"
                    >
                      <p className="text-ink/80 text-[13px] leading-[22px] whitespace-pre-wrap">
                        {shownThinking}
                        {streaming ? (
                          <span className="bg-ink/70 ml-0.5 inline-block h-[13px] w-[2px] animate-pulse align-[-2px] motion-reduce:animate-none" />
                        ) : null}
                      </p>
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
    </div>
  )
}
