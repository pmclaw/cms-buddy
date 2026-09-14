import * as React from 'react'

import FigmaIcon from '@/components/figma-icon'
import SearchInput from '@/components/search-input'
import SkillCard from '@/components/skill-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { assets } from '@/data/assets'
import { skillCategories, skills } from '@/data/skills'
import { cn } from 'cn'

export default function SkillsPage() {
  const [keyword, setKeyword] = React.useState('')
  const [tab, setTab] = React.useState('all')
  const [category, setCategory] = React.useState<string | null>(null)

  const list = skills.filter((skill) => {
    const matchKeyword =
      skill.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      skill.desc.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      skill.owner.toLowerCase().includes(keyword.trim().toLowerCase())
    const matchTab = tab === 'all' ? true : Boolean(skill.featured)
    const matchCategory = category ? skill.category === category : true
    return matchKeyword && matchTab && matchCategory
  })

  return (
    <div className="scrollbar-slim flex h-full flex-col overflow-y-auto bg-page">
      <header className="flex h-[80px] shrink-0 items-center justify-between px-8">
        <h1 className="text-ink text-[22px] leading-[32px] font-bold">技能中心</h1>
        <SearchInput
          value={keyword}
          onValueChange={setKeyword}
          placeholder="搜索技能"
          className="w-[290px]"
        />
      </header>

      <div className="px-8 pb-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="featured">官方精选</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-8 pt-1 pb-5">
        {skillCategories.map((item) => {
          const active = category === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(active ? null : item.id)}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-[8px] border px-3 py-1.5 text-[12px] leading-[20px] transition-colors',
                active
                  ? 'border-brand bg-[rgba(24,94,200,0.05)] text-brand'
                  : 'text-ink-2 border-line hover:border-[#b9b9c9]'
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 px-8 pb-8">
        {list.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-2.5">
            {list.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="flex h-[520px] flex-col items-center justify-center">
            <FigmaIcon src={assets.emptyState} size={153} className="h-auto" />
            <p className="text-sub mt-6 text-center text-[13px] leading-[24px]">
              没有找到与「{keyword || '技能'}」匹配的技能
              <br />
              试试其他关键词吧~
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
