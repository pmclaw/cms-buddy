import * as React from 'react'
import { X } from 'lucide-react'

import CharacterAvatar from '@/components/character-avatar'
import Composer from '@/components/composer'
import {
  ExpertPickerSheet,
  ModelSheet,
  PlusPanel,
  SkillPickerSheet,
} from '@/components/panels'
import { useToast } from '@/components/toast'
import type { SmartAssistant } from '@/data/experts'
import { TaskDraftProvider } from '@/lib/task-draft'

/**
 * 智能助理 chatbot 弹层：覆盖在专家列表之上的浮层，
 * 只包含 IP 形象 + 欢迎语/标语 + 完整输入框，右上角关闭返回列表。
 */
export default function AssistantChatbot({
  assistant,
  onClose,
}: {
  assistant: SmartAssistant
  onClose: () => void
}) {
  const toast = useToast()
  const [plusOpen, setPlusOpen] = React.useState(false)
  const [skillOpen, setSkillOpen] = React.useState(false)
  const [expertOpen, setExpertOpen] = React.useState(false)
  const [modelOpen, setModelOpen] = React.useState(false)

  return (
    <div className="bg-page absolute top-[46px] right-0 bottom-0 left-0 z-50 flex flex-col">
      <div className="flex h-[52px] shrink-0 items-center justify-end px-4">
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="text-ink active:bg-ink/5 flex size-10 items-center justify-center rounded-full"
        >
          <X className="size-[24px]" strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-6">
        <CharacterAvatar character={assistant.avatar} size={140} className="mx-auto" />
        <div className="relative z-10 -mt-4 rounded-[18px] bg-white px-6 py-5 text-center shadow-[0_10px_30px_rgba(40,50,83,0.08)]">
          <p className="text-ink text-[20px] leading-[30px] font-semibold">
            {assistant.title}
          </p>
          <p className="text-sub mt-2 text-[14px] leading-[22px]">
            {assistant.slogan}
          </p>
        </div>
      </div>

      {/* chatbot 有独立的输入框草稿，不与任务页相互影响 */}
      <TaskDraftProvider>
        <Composer
          placeholder={assistant.placeholder}
          onSend={() => toast('已发送')}
          onOpenPlus={() => setPlusOpen(true)}
          onOpenModel={() => setModelOpen(true)}
        />

        <PlusPanel
          open={plusOpen}
          onClose={() => setPlusOpen(false)}
          onOpenSkillPicker={() => setSkillOpen(true)}
          onOpenExpertPicker={() => setExpertOpen(true)}
        />
        <SkillPickerSheet open={skillOpen} onClose={() => setSkillOpen(false)} />
        <ExpertPickerSheet open={expertOpen} onClose={() => setExpertOpen(false)} />
        <ModelSheet open={modelOpen} onClose={() => setModelOpen(false)} />
      </TaskDraftProvider>
    </div>
  )
}
