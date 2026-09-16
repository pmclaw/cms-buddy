import * as React from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'

import { ExpertCard } from '@/components/cards'
import CharacterAvatar from '@/components/character-avatar'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import { expertCategories, experts, smartAssistants } from '@/data/experts'
import { cn } from '@/lib/cn'
import { useDrawer } from '@/lib/drawer'
import { useTaskDraft } from '@/lib/task-draft'

export function ExpertsPage() {
  const navigate = useNavigate()
  const { openDrawer } = useDrawer()
  const { patch } = useTaskDraft()
  const [keyword, setKeyword] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)

  const list = experts.filter((expert) => {
    const hitKeyword =
      expert.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      expert.desc.toLowerCase().includes(keyword.trim().toLowerCase())
    const hitCategory = category ? expert.category === category : true
    return hitKeyword && hitCategory
  })

  return (
    <PhoneScreen>
      <ScreenHeader title="专家" onMenu={openDrawer} />

      <div className="shrink-0 px-4">
        {/* 智能助理入口：超过 3 个时默认展示三个半，可左右滑动 */}
        <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto pb-1">
          {smartAssistants.map((assistant) => (
            <button
              key={assistant.name}
              type="button"
              onClick={() => {
                patch({ expert: assistant.name })
                navigate('/')
              }}
              className="flex w-[98px] shrink-0 flex-col items-center gap-1.5"
            >
              <CharacterAvatar character={assistant.avatar} size={52} />
              <span className="text-ink text-[13px] leading-[20px]">
                {assistant.name}
              </span>
            </button>
          ))}
        </div>

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
          {[{ id: 'all', label: '全部' }, ...expertCategories].map((item) => {
            const active =
              item.id === 'all' ? category === null : category === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id === 'all' ? null : item.id)}
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

        <div className="mb-3" />
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
    </PhoneScreen>
  )
}
