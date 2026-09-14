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

/** 「任务处理过程 / 已完成思考」折叠头 + 步骤清单。 */
export default function ThinkingTimeline({
  label,
  duration,
  steps,
  open,
  onToggle,
  visibleCount,
}: {
  label: string
  duration: string
  steps: TimelineStep[]
  open: boolean
  onToggle: () => void
  visibleCount?: number
}) {
  const count = visibleCount ?? steps.length

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 py-1 text-left"
      >
        <span className="text-ink text-[15px] leading-[24px] font-semibold">
          {label}
        </span>
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
      </button>

      {open ? (
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
    </div>
  )
}
