import * as React from 'react'
import { ArrowUp, ChevronDown, CircleGauge, Plus, X } from 'lucide-react'

import CharacterAvatar from '@/components/character-avatar'
import { experts, smartAssistants } from '@/data/experts'
import { cn } from '@/lib/cn'
import { useTaskDraft } from '@/lib/task-draft'

/** 与 PC 端一致的模型列表 */
export const models = ['DeepSeek V4', 'DeepSeek V3', 'Qwen3-Max', 'GLM-4.6']

/**
 * 移动端输入框。
 * 相比 PC 端去掉了语音入口，保留：附件/技能/专家 chip、多行输入、
 * 模型选择、加号面板、发送。
 */
export default function Composer({
  onSend,
  onOpenPlus,
  onOpenModel,
  placeholder = '想问Buddy什么问题呢',
}: {
  onSend: (text: string) => void
  onOpenPlus: () => void
  onOpenModel: () => void
  placeholder?: string
}) {
  const { draft, patch } = useTaskDraft()
  const areaRef = React.useRef<HTMLTextAreaElement>(null)

  const canSend = draft.text.trim().length > 0

  // 跟随内容自动增高
  React.useEffect(() => {
    const area = areaRef.current
    if (!area) return
    area.style.height = 'auto'
    area.style.height = `${Math.min(area.scrollHeight, 132)}px`
  }, [draft.text])

  // 召唤的可能是专家列表里的专家，也可能是智能助理入口里的助理
  const summoned =
    experts.find((item) => item.name === draft.expert) ??
    smartAssistants.find((item) => item.name === draft.expert)

  function submit() {
    if (!canSend) return
    onSend(draft.text.trim())
    // 发送后清空文本与附件/技能（与 PC 端一致，保留模型与召唤的专家）
    patch({ text: '', skills: [], attachments: [] })
  }

  return (
    <div className="shrink-0 px-4 pt-2 pb-3">
      <div className="flex flex-col rounded-[24px] bg-white px-4 py-3 shadow-[0_8px_28px_rgba(40,50,83,0.12)]">
        {draft.attachments.length > 0 ||
        draft.skills.length > 0 ||
        summoned ? (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {draft.attachments.map((name) => (
              <span
                key={name}
                className="text-ink flex items-center gap-1.5 rounded-[8px] bg-[rgba(40,50,83,0.06)] px-2 py-1 text-[13px]"
              >
                {name}
                <button
                  type="button"
                  aria-label={`移除 ${name}`}
                  onClick={() =>
                    patch({
                      attachments: draft.attachments.filter((item) => item !== name),
                    })
                  }
                >
                  <X className="text-sub size-[13px]" strokeWidth={2} />
                </button>
              </span>
            ))}

            {draft.skills.map((name) => (
              <span
                key={name}
                className="text-ink flex items-center gap-1.5 rounded-[8px] bg-[rgba(40,50,83,0.06)] px-2 py-1 text-[13px]"
              >
                {name}
                <button
                  type="button"
                  aria-label={`移除 ${name}`}
                  onClick={() =>
                    patch({ skills: draft.skills.filter((item) => item !== name) })
                  }
                >
                  <X className="text-sub size-[13px]" strokeWidth={2} />
                </button>
              </span>
            ))}

            {summoned ? (
              <span className="text-ink flex items-center gap-1.5 rounded-[8px] bg-[rgba(40,50,83,0.06)] py-1 pr-2 pl-1.5 text-[13px]">
                <CharacterAvatar character={summoned.avatar} size={20} />
                {summoned.name}
                <button
                  type="button"
                  aria-label={`移除 ${summoned.name}`}
                  onClick={() => patch({ expert: null })}
                >
                  <X className="text-sub size-[13px]" strokeWidth={2} />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}

        <textarea
          ref={areaRef}
          rows={1}
          value={draft.text}
          onChange={(event) => patch({ text: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder={placeholder}
          className="text-ink placeholder:text-[#a6aab8] w-full resize-none bg-transparent text-[16px] leading-[26px] outline-none"
        />

        <div className="mt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenModel}
            className="text-ink flex items-center gap-1 text-[15px]"
          >
            <CircleGauge className="size-[18px]" strokeWidth={1.7} />
            {draft.model}
            <ChevronDown className="size-[15px] opacity-70" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="更多功能"
              onClick={onOpenPlus}
              className="text-ink flex size-9 items-center justify-center"
            >
              <Plus className="size-[24px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="发送"
              disabled={!canSend}
              onClick={submit}
              className={cn(
                'flex size-9 items-center justify-center rounded-full transition-colors',
                canSend ? 'bg-ink text-white' : 'bg-[#e8e9ee] text-white'
              )}
            >
              <ArrowUp className="size-[19px]" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
