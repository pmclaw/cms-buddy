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
import { cn } from 'cn'

const iconMap: Record<StepIcon, typeof Brain> = {
  think: Brain,
  plan: ListChecks,
  skill: Workflow,
  tool: Clock,
  subtask: GitBranch,
  custom: PencilRuler,
  parse: Search,
}

/**
 * 「任务处理过程 / 已完成思考」折叠头 + 步骤清单。
 * 末尾的「思考过程」子节点：执行中始终展开，用固定高度容器流式输出思考文本；
 * 回答完成后自动收起，点击可再次展开。
 */
export default function ThinkingTimeline({
  label,
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
  label: string
  duration: string
  steps: TimelineStep[]
  open: boolean
  onToggle: () => void
  visibleCount?: number
  /** 任务执行中：思考过程强制展开并显示执行状态 */
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
  // 默认：执行中展开、结束后收起；用户点过之后以用户选择为准
  const [thinkingOpen, setThinkingOpen] = React.useState<boolean | null>(null)
  const thinkingExpanded = thinkingOpen ?? streaming
  const thinkingBoxRef = React.useRef<HTMLDivElement>(null)
  const shownThinking =
    thinkingChars === undefined ? thinking : thinking?.slice(0, thinkingChars)

  // 流式输出时把思考容器滚到底部，保证最新思考可见
  React.useEffect(() => {
    const box = thinkingBoxRef.current
    if (box) box.scrollTop = box.scrollHeight
  }, [shownThinking])

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={streaming}
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 py-1 text-left',
          streaming ? 'cursor-default' : 'cursor-pointer'
        )}
      >
        <span className="text-ink text-[15px] leading-[24px] font-semibold">
          {label}
        </span>
        {streaming ? (
          <>
            <span className="border-brand/25 border-t-brand size-[14px] shrink-0 animate-spin rounded-full border-[1.5px] motion-reduce:animate-none" />
            <span className="text-sub text-[13px] leading-[22px]">
              思考中 · 已用时 {elapsed}
            </span>
          </>
        ) : (
          <>
            <span className="text-sub text-[13px] leading-[22px]">
              总耗时 <span className="text-ink/80">{duration}</span>
            </span>
            <ChevronDown
              className={cn(
                'text-sub ml-auto size-[16px] transition-transform',
                open ? '' : '-rotate-90'
              )}
              strokeWidth={1.8}
            />
          </>
        )}
      </button>

      {expanded ? (
        <ol className="mt-3 flex flex-col">
          {steps.slice(0, count).map((step, index) => {
            const Icon = iconMap[step.icon]
            const last = index === Math.min(count, steps.length) - 1
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
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}

      {expanded && thinking ? (
        <div className="pl-7">
          <button
            type="button"
            onClick={() => setThinkingOpen(!thinkingExpanded)}
            className="flex cursor-pointer items-center gap-2 py-1"
          >
            <ChevronDown
              className={cn(
                'text-sub size-[14px] transition-transform',
                thinkingExpanded ? '' : '-rotate-90'
              )}
              strokeWidth={1.8}
            />
            <span className="text-ink text-[12px] leading-[20px]">思考过程</span>
            {streaming ? (
              <span className="text-sub text-[11px] leading-[20px]">
                正在输出…
              </span>
            ) : null}
          </button>

          {thinkingExpanded ? (
            <div
              ref={thinkingBoxRef}
              className="scrollbar-slim mt-1 h-[160px] overflow-y-auto rounded-[8px] bg-[#f7f8fa] px-3 py-2"
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
      ) : null}
    </div>
  )
}
