import * as React from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'

import { SkillCard } from '@/components/cards'
import FigmaIcon from '@/components/figma-icon'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import { assets } from '@/data/assets'
import { skillCategories, skills } from '@/data/skills'
import { cn } from '@/lib/cn'
import { useDrawer } from '@/lib/drawer'

export function SkillsPage() {
  const navigate = useNavigate()
  const { openDrawer } = useDrawer()
  const [keyword, setKeyword] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<'all' | 'featured'>('all')

  const list = skills.filter((skill) => {
    const hitKeyword =
      skill.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      skill.desc.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      skill.owner.toLowerCase().includes(keyword.trim().toLowerCase())
    const hitTab = tab === 'all' ? true : Boolean(skill.featured)
    const hitCategory = category ? skill.category === category : true
    return hitKeyword && hitTab && hitCategory
  })

  return (
    <PhoneScreen>
      <ScreenHeader title="技能中心" onMenu={openDrawer} />

      <div className="shrink-0 px-4">
        <label className="flex h-[40px] items-center gap-2 rounded-[12px] bg-white px-3 ring-1 ring-[rgba(40,50,83,0.06)]">
          <Search className="text-sub size-[17px]" strokeWidth={1.8} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索技能"
            className="text-ink placeholder:text-[#a6aab8] h-full flex-1 bg-transparent text-[15px] outline-none"
          />
        </label>

        <div className="mt-3 flex items-center gap-5">
          {(
            [
              { id: 'all' as const, label: '全部' },
              { id: 'featured' as const, label: '官方精选' },
            ]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'text-[15px]',
                tab === item.id ? 'text-brand font-medium' : 'text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {skillCategories.map((item) => {
            const active = category === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(active ? null : item.id)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap',
                  active
                    ? 'text-brand bg-[rgba(24,94,200,0.08)]'
                    : 'text-sub bg-[rgba(40,50,83,0.05)]'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-4">
        {list.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {list.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onClick={() => navigate(`/skills/${skill.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <FigmaIcon src={assets.emptyState} size={130} height="auto" />
            <p className="text-sub mt-4 text-center text-[13px] leading-[22px]">
              没有找到与「{keyword || '技能'}」匹配的技能
              <br />
              试试其他关键词吧~
            </p>
          </div>
        )}
      </div>

      <TabBar active="skill" />
    </PhoneScreen>
  )
}
