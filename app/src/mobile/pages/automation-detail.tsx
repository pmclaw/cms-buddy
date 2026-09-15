import * as React from 'react'
import { ChevronRight, Clock } from 'lucide-react'
import { useParams } from 'react-router'

import RichText from '@/components/rich-text'
import { PhoneScreen, ScreenHeader } from '@/components/screen'
import { conversations, findConversation, type AnswerBlock } from '@/data/chat'
import { taskRecords } from '@/data/tasks'
import { useAutomation } from '@/lib/automation-store'
import { cn } from '@/lib/cn'

/** 自动化任务 → 执行记录对应的会话数据 */
export function executionRecordId(taskId: string) {
  const list = conversations.filter((item) => item.id.startsWith('task-'))
  const index = Number(taskId.replace(/\D/g, '')) || 0
  return list[index % list.length].id
}

/**
 * 自动化任务详情：把每一次执行结果按时间倒序上下平铺展开（布局对齐设计稿 16）。
 */
export function AutomationDetailPage() {
  const { id } = useParams()
  const { tasks } = useAutomation()
  const task = tasks.find((item) => item.id === id)

  const conversation = findConversation(executionRecordId(id ?? 't1'))
  const answer = conversation?.messages.find((message) => message.role === 'assistant')
  const blocks = answer && 'blocks' in answer ? answer.blocks : []
  const steps = answer && 'steps' in answer ? (answer.steps ?? []) : []

  // 任务卡片上的「N 次执行」与这里展示的条数保持一致
  const runs = Math.max(1, task?.runs ?? 1)
  const records = taskRecords.slice(0, Math.min(runs, taskRecords.length))

  const [openSteps, setOpenSteps] = React.useState<number | null>(null)

  return (
    <PhoneScreen>
      <ScreenHeader back showMenu={false} title="任务详情" />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex items-center gap-2.5 rounded-[14px] bg-white px-4 py-4">
          <Clock className="text-ink size-[22px] shrink-0" strokeWidth={1.7} />
          <span className="text-ink min-w-0 flex-1 truncate text-[19px] font-medium">
            {task?.title ?? '自动化任务'}
          </span>
        </div>

        {records.map((record, index) => (
          <article
            key={`${record.at}-${index}`}
            className="mt-3 rounded-[14px] bg-white px-4 py-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-ink text-[15px] font-medium">自动化</span>
              <span className="text-sub text-[15px]">{record.at}</span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-[8px] bg-[#f5f6f8] px-3 py-2.5">
              <span
                className={cn(
                  'size-[7px] shrink-0 rounded-full',
                  record.ok ? 'bg-[#2ec27e]' : 'bg-danger'
                )}
              />
              <span className="text-ink text-[15px]">
                {record.ok ? '执行成功' : '执行失败'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpenSteps(openSteps === index ? null : index)}
              className="mt-2 flex w-full items-center justify-between rounded-[8px] bg-[#f5f6f8] px-3 py-2.5"
            >
              <span className="text-sub text-[15px]">
                已完成 {steps.length} 个步骤
              </span>
              <span className="text-ink flex items-center text-[15px]">
                已完成
                <ChevronRight
                  className={cn(
                    'size-[16px] transition-transform',
                    openSteps === index && 'rotate-90'
                  )}
                  strokeWidth={1.8}
                />
              </span>
            </button>

            {openSteps === index ? (
              <ol className="mt-2 flex flex-col rounded-[8px] bg-[#f5f6f8] px-3 py-2.5">
                {steps.map((step, stepIndex) => (
                  <li
                    key={`${step.label}-${stepIndex}`}
                    className="border-b border-[rgba(40,50,83,0.06)] py-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-ink text-[13px]">{step.label}</span>
                      {step.badge ? (
                        <span className="text-sub rounded-[4px] bg-white px-1.5 py-[1px] font-mono text-[11px]">
                          {step.badge}
                        </span>
                      ) : null}
                      <span className="text-sub text-[11px]">{step.duration}</span>
                    </div>
                    <p className="text-ink/80 mt-1 text-[13px] leading-[21px]">
                      {step.title}
                    </p>
                  </li>
                ))}
              </ol>
            ) : null}

            <div className="mt-3">
              {blocks.map((block, blockIndex) => (
                <Block key={blockIndex} block={block} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </PhoneScreen>
  )
}

function Block({ block }: { block: AnswerBlock }) {
  if (block.kind === 'heading') {
    return (
      <h3 className="text-ink mt-4 text-[17px] leading-[26px] font-semibold first:mt-0">
        {block.text}
      </h3>
    )
  }

  if (block.kind === 'paragraph') {
    return (
      <p className="text-ink/85 mt-2 text-[15px] leading-[27px]">
        <RichText text={block.text} />
      </p>
    )
  }

  if (block.kind === 'bullets') {
    return (
      <ul className="mt-2 flex flex-col gap-1.5">
        {block.items.map((item, index) => (
          <li key={index} className="text-ink/85 flex gap-2 text-[15px] leading-[27px]">
            <span className="mt-[11px] size-[5px] shrink-0 rounded-full bg-[rgba(40,50,83,0.5)]" />
            <span>
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      {block.items.map((item, index) => (
        <div key={index} className="flex flex-col gap-1">
          <span className="text-sub flex items-center gap-2 text-[13px]">
            <span className="size-[5px] rounded-full bg-[rgba(40,50,83,0.5)]" />
            {item.at}
          </span>
          <p className="text-ink/85 text-[15px] leading-[27px]">
            <RichText text={item.text} />
          </p>
        </div>
      ))}
    </div>
  )
}
