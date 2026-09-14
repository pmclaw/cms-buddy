import * as React from 'react'
import { useNavigate } from 'react-router'

import CharacterAvatar from '@/components/character-avatar'
import SearchInput from '@/components/search-input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  expertCategories,
  expertExamples,
  expertSorts,
  experts,
  type Expert,
  type ExpertSort,
} from '@/data/experts'
import { cn } from 'cn'

export default function ExpertsPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = React.useState('')
  const [sort, setSort] = React.useState<ExpertSort>('all')
  const [category, setCategory] = React.useState<string | null>(null)
  const [active, setActive] = React.useState<Expert | null>(null)

  const list = experts
    .filter((expert) => {
      const matchKeyword =
        expert.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        expert.desc.toLowerCase().includes(keyword.trim().toLowerCase())
      const matchCategory = category ? expert.category === category : true
      return matchKeyword && matchCategory
    })
    .sort((a, b) => {
      if (sort === 'likes') return b.likes - a.likes
      if (sort === 'uses' || sort === 'users') return b.uses - a.uses
      return 0
    })

  return (
    <div className="scrollbar-slim flex h-full flex-col overflow-y-auto bg-page">
      <header className="flex h-[80px] shrink-0 items-center justify-between px-8">
        <h1 className="text-ink text-[22px] leading-[32px] font-bold">专家助理</h1>
        <SearchInput
          value={keyword}
          onValueChange={setKeyword}
          placeholder="搜索专家助理"
          className="w-[290px]"
        />
      </header>

      <div className="flex flex-wrap items-center gap-2 px-8 pb-3">
        {expertCategories.map((item) => {
          const isActive = category === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(isActive ? null : item.id)}
              className={cn(
                'cursor-pointer rounded-[8px] border px-3 py-1.5 text-[12px] leading-[20px] transition-colors',
                isActive
                  ? 'border-brand bg-[rgba(24,94,200,0.05)] text-brand'
                  : 'text-ink-2 border-line bg-white hover:border-[#b9b9c9]'
              )}
            >
              {item.label}
            </button>
          )
        })}

        <div className="ml-auto flex items-center gap-5">
          {expertSorts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSort(item.id)}
              className={cn(
                'cursor-pointer text-[13px] leading-[22px] transition-colors',
                sort === item.id ? 'text-brand' : 'text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-8 pb-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-2.5">
          {list.map((expert) => (
            <button
              key={expert.id}
              type="button"
              onClick={() => setActive(expert)}
              className="group flex cursor-pointer flex-col gap-2 rounded-[8px] bg-white px-5 py-4 text-left ring-1 ring-[rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(40,50,83,0.08)]"
            >
              <div className="flex items-center gap-3">
                <CharacterAvatar character={expert.avatar} size={40} />
                <span className="text-ink min-w-0 flex-1 truncate text-[16px] leading-[26px] font-medium">
                  {expert.name}
                </span>
                <span className="bg-ink hidden rounded-full px-3 py-1 text-[11px] whitespace-nowrap text-white group-hover:inline-block">
                  立即召唤
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {expert.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[1px] text-[11px] leading-[18px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-ink/70 line-clamp-2 min-h-[38px] text-[12px] leading-[19px]">
                {expert.desc}
              </p>

              <div className="flex items-center justify-end gap-4 pt-1">
                <span className="text-sub text-[12px]">🔥 {expert.uses}</span>
                <span className="text-sub text-[12px]">📄 {expert.likes}</span>
                <span className="text-sub text-[12px]">⬇ {expert.downloads}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="w-[min(560px,calc(100vw-48px))] p-7">
          {active ? (
            <>
              <div className="flex items-start gap-4">
                <CharacterAvatar character={active.avatar} size={48} />
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-[20px] leading-[30px]">
                    {active.name}
                  </DialogTitle>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sub text-[12px]">🔥 {active.uses}</span>
                    <span className="text-sub text-[12px]">📄 {active.likes}</span>
                    <span className="text-sub text-[12px]">⬇ {active.downloads}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="text-sub hover:text-ink cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <p className="text-ink/80 mt-5 text-[13px] leading-[24px]">
                {active.desc}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {active.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-2 py-[2px] text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="text-ink mt-6 text-[15px] leading-[26px] font-semibold">
                典型场景提问与问题示例
              </h3>
              <ol className="mt-3 flex flex-col gap-2">
                {expertExamples.map((example, index) => (
                  <li
                    key={example}
                    className="text-ink/80 flex gap-2 text-[13px] leading-[24px]"
                  >
                    <span className="text-sub">{index + 1}.</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="text-ink cursor-pointer rounded-[8px] border border-[#e6e6ef] bg-white px-4 py-2 text-[13px]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate(
                      `/buddy?q=${encodeURIComponent(
                        `结合${active.name}技能，帮我做一次完整分析`
                      )}`
                    )
                  }}
                  className="bg-ink cursor-pointer rounded-[8px] px-4 py-2 text-[13px] text-white"
                >
                  立即召唤
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
