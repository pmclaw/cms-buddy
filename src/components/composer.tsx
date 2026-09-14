import * as React from 'react'
import { ArrowUp, ChevronDown, CircleGauge, Paperclip, X } from 'lucide-react'

import { ExpertPicker, SkillPicker } from '@/components/pickers'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from 'cn'

const models = ['DeepSeek V4', 'DeepSeek V3', 'Qwen3-Max', 'GLM-4.6']

export type ComposerSubmit = {
  text: string
  skills: string[]
  expert: string | null
  model: string
  attachments: string[]
}

/**
 * 对话输入框（Figma：首页 / Buddy 页共用同一组件，两种尺寸）。
 */
export default function Composer({
  size = 'sm',
  placeholder = '想问Buddy什么问题呢',
  autoFocus,
  onAttach,
  onSend,
  className,
  value,
  onValueChange,
}: {
  size?: 'lg' | 'sm'
  placeholder?: string
  autoFocus?: boolean
  onAttach?: (name: string) => void
  onSend: (payload: ComposerSubmit) => void
  className?: string
  /** 受控文本（不传则内部自管理） */
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [innerText, setInnerText] = React.useState('')
  const [skills, setSkills] = React.useState<string[]>([])
  const [expert, setExpert] = React.useState<string | null>(null)
  const [model, setModel] = React.useState(models[0])
  const [attachments, setAttachments] = React.useState<string[]>([])

  const text = value ?? innerText
  const setText = React.useCallback(
    (next: string) => {
      if (value === undefined) setInnerText(next)
      onValueChange?.(next)
    },
    [onValueChange, value]
  )

  const canSend = text.trim().length > 0
  const large = size === 'lg'

  function submit() {
    if (!canSend) return
    onSend({ text: text.trim(), skills, expert, model, attachments })
    setText('')
    setSkills([])
    setAttachments([])
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  function toggleSkill(name: string) {
    setSkills((list) =>
      list.includes(name) ? list.filter((item) => item !== name) : [...list, name]
    )
  }

  function handleAttach() {
    const name = onAttach
      ? undefined
      : `Buddy运营看板2026_02_0${attachments.length + 3}.csv`
    if (name) setAttachments((list) => [...list, name])
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className={cn(
        'border-composer relative flex flex-col rounded-[12px] border bg-white',
        large ? 'min-h-[128px] p-4' : 'min-h-[96px] p-3',
        className
      )}
    >
      {attachments.length > 0 || skills.length > 0 ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {attachments.map((name) => (
            <span
              key={name}
              className="text-ink flex items-center gap-2 rounded-[6px] bg-[rgba(40,50,83,0.06)] px-2 py-1 text-[12px]"
            >
              {name}
              <button
                type="button"
                aria-label={`移除 ${name}`}
                onClick={() =>
                  setAttachments((list) => list.filter((item) => item !== name))
                }
                className="text-sub hover:text-ink cursor-pointer"
              >
                <X className="size-[12px]" strokeWidth={2} />
              </button>
            </span>
          ))}
          {skills.map((name) => (
            <span
              key={name}
              className="text-ink flex items-center gap-2 rounded-[6px] bg-[rgba(40,50,83,0.06)] px-2 py-1 text-[12px]"
            >
              {name}
              <button
                type="button"
                aria-label={`移除 ${name}`}
                onClick={() => toggleSkill(name)}
                className="text-sub hover:text-ink cursor-pointer"
              >
                <X className="size-[12px]" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <textarea
        value={text}
        autoFocus={autoFocus}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={large ? 2 : 1}
        className={cn(
          'text-ink placeholder:text-[#a6aab8] w-full flex-1 resize-none bg-transparent outline-none',
          large ? 'text-[16px] leading-[26px]' : 'text-[15px] leading-[24px]'
        )}
      />

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="上传附件"
            onClick={() => {
              handleAttach()
              onAttach?.('Buddy运营看板2026_02_03.csv')
            }}
            className="text-ink hover:text-brand cursor-pointer p-1"
          >
            <Paperclip className="size-[18px]" strokeWidth={1.7} />
          </button>
          <span className="h-[18px] w-px bg-[rgba(40,50,83,0.12)]" />
          <SkillPicker selected={skills} onToggle={toggleSkill} />
          <span className="text-ink/30 text-[13px]">|</span>
          <ExpertPicker selected={expert} onSelect={setExpert} />
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-ink flex cursor-pointer items-center gap-[6px] text-[13px] whitespace-nowrap">
              <CircleGauge className="size-[16px]" strokeWidth={1.7} />
              {model}
              <ChevronDown className="size-[14px] opacity-70" strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              {models.map((item) => (
                <DropdownMenuItem key={item} onSelect={() => setModel(item)}>
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="submit"
            aria-label="发送"
            disabled={!canSend}
            className={cn(
              'flex size-[32px] items-center justify-center rounded-[8px] transition-colors',
              canSend
                ? 'bg-ink text-white hover:bg-[#1c2440] cursor-pointer'
                : 'bg-[rgba(40,50,83,0.06)] text-[#a6aab8] cursor-not-allowed'
            )}
          >
            <ArrowUp className="size-[16px]" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </form>
  )
}
