import * as React from 'react'
import {
  Camera,
  Check,
  ChevronRight,
  FolderUp,
  Image,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'

import CharacterAvatar from '@/components/character-avatar'
import { BottomSheet } from '@/components/sheet'
import { models } from '@/components/composer'
import { experts } from '@/data/experts'
import { skills } from '@/data/skills'
import { cn } from '@/lib/cn'
import { useTaskDraft } from '@/lib/task-draft'

/** 输入框「+」面板：附件来源 + PC 端已有的能力入口 */
export function PlusPanel({
  open,
  onClose,
  onOpenSkillPicker,
  onOpenExpertPicker,
}: {
  open: boolean
  onClose: () => void
  onOpenSkillPicker: () => void
  onOpenExpertPicker: () => void
}) {
  const { draft, patch } = useTaskDraft()

  const sources = [
    { label: '拍照', icon: Camera },
    { label: '图片', icon: Image },
    { label: '手机文件', icon: FolderUp },
  ]

  const rows = [
    {
      label: '添加技能',
      icon: Sparkles,
      onClick: () => {
        onClose()
        onOpenSkillPicker()
      },
    },
    {
      label: '召唤专家',
      icon: Users,
      onClick: () => {
        onClose()
        onOpenExpertPicker()
      },
    },
  ]

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pt-1 pb-5">
        <div className="grid grid-cols-3 gap-2.5">
          {sources.map((source) => (
            <button
              key={source.label}
              type="button"
              onClick={() => {
                patch({ attachments: [...draft.attachments, `${source.label}_素材`] })
                onClose()
              }}
              className="flex flex-col items-center gap-2 rounded-[14px] bg-[#f5f6f8] py-3.5"
            >
              <source.icon className="text-ink size-[26px]" strokeWidth={1.7} />
              <span className="text-ink text-[13px]">{source.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col">
          {rows.map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={row.onClick}
              className="active:bg-ink/5 flex h-[52px] items-center gap-3 rounded-[10px] px-1"
            >
              <row.icon className="text-ink size-[20px]" strokeWidth={1.8} />
              <span className="text-ink flex-1 text-left text-[16px]">{row.label}</span>
              <ChevronRight className="text-ink/30 size-[18px]" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}

/** 技能选择（多选），对齐设计稿 09/10 */
export function SkillPickerSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { draft, patch } = useTaskDraft()
  const [keyword, setKeyword] = React.useState('')

  const list = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      skill.desc.toLowerCase().includes(keyword.trim().toLowerCase())
  )

  function toggle(name: string) {
    patch({
      skills: draft.skills.includes(name)
        ? draft.skills.filter((item) => item !== name)
        : [...draft.skills, name],
    })
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="选择技能" className="h-[76%]">
      <div className="px-4 pb-6">
        <label className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#f5f6f8] px-3">
          <Search className="text-sub size-[17px]" strokeWidth={1.8} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索技能"
            className="text-ink placeholder:text-[#a6aab8] h-full flex-1 bg-transparent text-[15px] outline-none"
          />
        </label>

        <div className="mt-3 flex flex-col">
          {list.map((skill) => {
            const active = draft.skills.includes(skill.name)
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggle(skill.name)}
                className="active:bg-ink/5 flex items-start gap-3 border-b border-[rgba(40,50,83,0.06)] py-3 text-left last:border-0"
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[16px] leading-[24px] font-medium',
                      active ? 'text-brand' : 'text-ink'
                    )}
                  >
                    {skill.name}
                  </span>
                  <span className="text-sub line-clamp-2 text-[13px] leading-[20px]">
                    {skill.desc}
                  </span>
                </span>
                {active ? (
                  <Check className="text-brand mt-1 size-[18px]" strokeWidth={2.4} />
                ) : null}
              </button>
            )
          })}
          {list.length === 0 ? (
            <p className="text-sub py-10 text-center text-[13px]">没有匹配的技能</p>
          ) : null}
        </div>
      </div>
    </BottomSheet>
  )
}

/** 召唤专家（单选），对齐设计稿 08 */
export function ExpertPickerSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { draft, patch } = useTaskDraft()
  const [keyword, setKeyword] = React.useState('')

  const list = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      expert.desc.toLowerCase().includes(keyword.trim().toLowerCase())
  )

  return (
    <BottomSheet open={open} onClose={onClose} title="召唤专家" className="h-[76%]">
      <div className="px-4 pb-6">
        <label className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#f5f6f8] px-3">
          <Search className="text-sub size-[17px]" strokeWidth={1.8} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索专家"
            className="text-ink placeholder:text-[#a6aab8] h-full flex-1 bg-transparent text-[15px] outline-none"
          />
        </label>

        <div className="mt-3 flex flex-col">
          {list.map((expert) => {
            const active = draft.expert === expert.name
            return (
              <button
                key={expert.id}
                type="button"
                onClick={() => patch({ expert: active ? null : expert.name })}
                className="active:bg-ink/5 flex items-start gap-3 border-b border-[rgba(40,50,83,0.06)] py-3 text-left last:border-0"
              >
                <CharacterAvatar character={expert.avatar} size={36} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[16px] leading-[24px] font-medium',
                      active ? 'text-brand' : 'text-ink'
                    )}
                  >
                    {expert.name}
                  </span>
                  <span className="text-sub line-clamp-2 text-[13px] leading-[20px]">
                    {expert.desc}
                  </span>
                </span>
                {active ? (
                  <Check className="text-brand mt-2 size-[18px]" strokeWidth={2.4} />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}

/** 模型选择 */
export function ModelSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { draft, patch } = useTaskDraft()

  return (
    <BottomSheet open={open} onClose={onClose} title="选择模型">
      <div className="px-4 pb-6">
        {models.map((model) => (
          <button
            key={model}
            type="button"
            onClick={() => {
              patch({ model })
              onClose()
            }}
            className="active:bg-ink/5 flex h-[52px] w-full items-center gap-3 border-b border-[rgba(40,50,83,0.06)] text-left last:border-0"
          >
            <span className="text-ink flex-1 text-[16px]">{model}</span>
            {draft.model === model ? (
              <Check className="text-brand size-[18px]" strokeWidth={2.4} />
            ) : null}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

/** 通用单选列表弹层（专家页排序、任务筛选等复用） */
export function OptionSheet({
  open,
  onClose,
  title,
  options,
  value,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  title: string
  options: Array<{ id: string; label: string }>
  value: string
  onSelect: (id: string) => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="px-4 pb-6">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              onSelect(option.id)
              onClose()
            }}
            className="active:bg-ink/5 flex h-[52px] w-full items-center gap-3 border-b border-[rgba(40,50,83,0.06)] text-left last:border-0"
          >
            <span className="text-ink flex-1 text-[16px]">{option.label}</span>
            {value === option.id ? (
              <Check className="text-brand size-[18px]" strokeWidth={2.4} />
            ) : null}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
