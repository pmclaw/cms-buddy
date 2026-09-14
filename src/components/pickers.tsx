import * as React from 'react'
import { Check, ChevronDown, Gem, Search } from 'lucide-react'

import CharacterAvatar from '@/components/character-avatar'
import FigmaIcon from '@/components/figma-icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { navIcons } from '@/data/assets'
import { experts } from '@/data/experts'
import { skills } from '@/data/skills'
import { cn } from 'cn'

const triggerClass =
  'text-ink flex cursor-pointer items-center gap-[6px] text-[13px] leading-[20px] whitespace-nowrap'

function PopoverSearch({
  value,
  onValueChange,
  placeholder,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="mb-1 flex h-[34px] items-center gap-2 rounded-[8px] bg-[#f5f6f8] px-3">
      <Search className="text-sub size-[14px] shrink-0" strokeWidth={1.8} />
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="text-ink placeholder:text-[#a6aab8] h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none"
      />
    </label>
  )
}

/** 输入框里的「技能」选择器：可多选，选中项会变成输入框上方的 chip。 */
export function SkillPicker({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (name: string) => void
}) {
  const [keyword, setKeyword] = React.useState('')

  const list = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      skill.desc.toLowerCase().includes(keyword.trim().toLowerCase())
  )

  return (
    <Popover>
      <PopoverTrigger className={triggerClass}>
        <Gem className="size-[16px]" strokeWidth={1.7} />
        技能
        <ChevronDown className="size-[14px] opacity-70" strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-[336px] p-2">
        <PopoverSearch
          value={keyword}
          onValueChange={setKeyword}
          placeholder="搜索技能"
        />
        <div className="scrollbar-slim max-h-[264px] overflow-y-auto">
          {list.map((skill) => {
            const active = selected.includes(skill.name)
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => onToggle(skill.name)}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-2 rounded-[8px] px-2 py-1.5 text-left',
                  active ? 'bg-[rgba(24,94,200,0.06)]' : 'hover:bg-[#f5f6f8]'
                )}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[13px] leading-[20px] font-medium',
                      active ? 'text-brand' : 'text-ink'
                    )}
                  >
                    {skill.name}
                  </span>
                  <span className="text-sub line-clamp-2 block text-[12px] leading-[18px]">
                    {skill.desc}
                  </span>
                </span>
                {active ? (
                  <Check className="text-brand mt-[3px] size-[14px]" strokeWidth={2.4} />
                ) : null}
              </button>
            )
          })}
          {list.length === 0 ? (
            <p className="text-sub px-2 py-6 text-center text-[12px]">
              没有匹配的技能
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** 输入框里的「专家」选择器：单选。 */
export function ExpertPicker({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (name: string | null) => void
}) {
  const [keyword, setKeyword] = React.useState('')

  const list = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      expert.desc.toLowerCase().includes(keyword.trim().toLowerCase())
  )

  return (
    <Popover>
      <PopoverTrigger className={triggerClass}>
        <FigmaIcon src={navIcons.expert} size={16} />
        {selected ?? '专家'}
        <ChevronDown className="size-[14px] opacity-70" strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-[336px] p-2">
        <PopoverSearch
          value={keyword}
          onValueChange={setKeyword}
          placeholder="搜索专家"
        />
        <div className="scrollbar-slim max-h-[264px] overflow-y-auto">
          {list.map((expert) => {
            const active = selected === expert.name
            return (
              <button
                key={expert.id}
                type="button"
                onClick={() => onSelect(active ? null : expert.name)}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-2 rounded-[8px] px-2 py-1.5 text-left',
                  active ? 'bg-[rgba(24,94,200,0.06)]' : 'hover:bg-[#f5f6f8]'
                )}
              >
                <CharacterAvatar
                  character={expert.avatar}
                  size={22}
                  className="mt-[1px]"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[13px] leading-[20px] font-medium',
                      active ? 'text-brand' : 'text-ink'
                    )}
                  >
                    {expert.name}
                  </span>
                  <span className="text-sub line-clamp-2 block text-[12px] leading-[18px]">
                    {expert.desc}
                  </span>
                </span>
                {active ? (
                  <Check className="text-brand mt-[3px] size-[14px]" strokeWidth={2.4} />
                ) : null}
              </button>
            )
          })}
          {list.length === 0 ? (
            <p className="text-sub px-2 py-6 text-center text-[12px]">
              没有匹配的专家
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
