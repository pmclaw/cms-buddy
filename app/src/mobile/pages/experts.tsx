import * as React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router'

import { ExpertCard } from '@/components/cards'
import { OptionSheet } from '@/components/panels'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import {
  expertCategories,
  expertSorts,
  experts,
  type ExpertSort,
} from '@/data/experts'
import { cn } from '@/lib/cn'

export function ExpertsPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<ExpertSort>('all')
  const [sortOpen, setSortOpen] = React.useState(false)

  const list = experts
    .filter((expert) => {
      const hitKeyword =
        expert.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        expert.desc.toLowerCase().includes(keyword.trim().toLowerCase())
      const hitCategory = category ? expert.category === category : true
      return hitKeyword && hitCategory
    })
    .sort((a, b) => {
      if (sort === 'likes') return b.likes - a.likes
      if (sort === 'uses' || sort === 'users') return b.uses - a.uses
      return 0
    })

  const sortLabel =
    expertSorts.find((item) => item.id === sort)?.label ?? '全部'

  return (
    <PhoneScreen>
      <ScreenHeader title="专家" showMenu={false} />

      <div className="shrink-0 px-4">
        <label className="flex h-[40px] items-center gap-2 rounded-[12px] bg-white px-3 ring-1 ring-[rgba(40,50,83,0.06)]">
          <Search className="text-sub size-[17px]" strokeWidth={1.8} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索专家助理"
            className="text-ink placeholder:text-[#a6aab8] h-full flex-1 bg-transparent text-[15px] outline-none"
          />
        </label>

        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {expertCategories.map((item) => {
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

        <div className="mt-2 mb-3 flex items-center justify-between">
          <span className="text-sub text-[12px]">共 {list.length} 位专家</span>
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className="text-ink flex items-center gap-1 text-[13px]"
          >
            <SlidersHorizontal className="size-[15px]" strokeWidth={1.8} />
            排序：{sortLabel}
          </button>
        </div>
      </div>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {list.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onClick={() => navigate(`/experts/${expert.id}`)}
            />
          ))}
        </div>
      </div>

      <TabBar active="expert" />

      <OptionSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="排序方式"
        options={expertSorts.map((item) => ({ id: item.id, label: item.label }))}
        value={sort}
        onSelect={(id) => setSort(id as ExpertSort)}
      />
    </PhoneScreen>
  )
}
