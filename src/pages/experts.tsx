import * as React from 'react'
import { useNavigate, useParams } from 'react-router'

import zhaoxiaoguHead from '@/assets/smart-assistants/zhaoxiaogu-head.png'
import zhaoxiaoguSession from '@/assets/smart-assistants/zhaoxiaogu-session.png'
import zhaoxiaojuHead from '@/assets/smart-assistants/zhaoxiaoju-head.png'
import zhaoxiaojuSession from '@/assets/smart-assistants/zhaoxiaoju-session.png'
import zhaoxiaoshuHead from '@/assets/smart-assistants/zhaoxiaoshu-head.png'
import zhaoxiaoshuSession from '@/assets/smart-assistants/zhaoxiaoshu-session.png'
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
  experts,
  type Expert,
} from '@/data/experts'
import { cn } from 'cn'

const smartAssistants = [
  {
    id: 'zhaoxiaogu',
    name: '招小顾',
    description: '营销服务 投顾辅助',
    accent: '#c8524c',
    tint: '#fdf3f2',
    avatar: zhaoxiaoguHead,
    session: zhaoxiaoguSession,
    displayWidth: 1028,
  },
  {
    id: 'zhaoxiaoju',
    name: '招小聚',
    description: '行政服务 办公辅助',
    accent: '#6f4d9b',
    tint: '#f6f2fa',
    avatar: zhaoxiaojuHead,
    session: zhaoxiaojuSession,
    displayWidth: 852,
  },
  {
    id: 'zhaoxiaoshu',
    name: '招小数',
    description: '数据分析 智能问数',
    accent: '#c8524c',
    tint: '#fdf3f2',
    avatar: zhaoxiaoshuHead,
    session: zhaoxiaoshuSession,
    displayWidth: 1200,
  },
] as const

export default function ExpertsPage() {
  const navigate = useNavigate()
  const { assistantId } = useParams()
  const [keyword, setKeyword] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)
  const [active, setActive] = React.useState<Expert | null>(null)

  const selectedAssistant = smartAssistants.find(
    (assistant) => assistant.id === assistantId
  )

  const list = experts.filter((expert) => {
    const matchKeyword =
      expert.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      expert.desc.toLowerCase().includes(keyword.trim().toLowerCase())
    const matchCategory = category ? expert.category === category : true
    return matchKeyword && matchCategory
  })

  return (
    <div className="scrollbar-slim flex h-full flex-col overflow-y-auto bg-page">
      <header className="grid h-[80px] shrink-0 grid-cols-[minmax(88px,1fr)_auto_minmax(88px,1fr)] items-center px-8">
        <h1 className="text-ink text-[22px] leading-[32px] font-bold">专家助理</h1>
        <nav
          aria-label="独立助理入口"
          className="flex items-center gap-1 rounded-full bg-[#f7f8fc] p-1"
        >
          {smartAssistants.map((assistant) => {
            const isActive = assistantId === assistant.id
            return (
              <button
                key={assistant.id}
                type="button"
                aria-pressed={isActive}
                title={
                  isActive
                    ? `返回专家助理列表`
                    : `打开${assistant.name}独立助理`
                }
                onClick={() =>
                  navigate(
                    isActive ? '/experts' : `/experts/${assistant.id}`
                  )
                }
                className={cn(
                  'flex h-12 w-[176px] cursor-pointer items-center justify-between gap-2 rounded-full border px-3 text-left transition-colors',
                  isActive
                    ? 'shadow-[0_4px_14px_rgba(40,50,83,0.08)]'
                    : 'border-transparent hover:bg-white'
                )}
                style={
                  isActive
                    ? {
                        borderColor: assistant.accent,
                        backgroundColor: assistant.tint,
                        color: assistant.accent,
                      }
                    : undefined
                }
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] leading-[21px] font-semibold">
                    {assistant.name}
                  </span>
                  <span className="block truncate text-[10px] leading-[16px] opacity-60">
                    {assistant.description}
                  </span>
                </span>
                <img
                  src={assistant.avatar}
                  alt=""
                  draggable={false}
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                />
              </button>
            )
          })}
        </nav>
        <span aria-hidden />
      </header>

      {selectedAssistant ? (
        <section
          aria-label={`${selectedAssistant.name}独立助理会话`}
          className="min-h-0 flex-1 px-8 pt-6 pb-8"
        >
          <img
            src={selectedAssistant.session}
            alt={`${selectedAssistant.name}独立助理会话`}
            draggable={false}
            className="mx-auto block h-auto max-w-full select-none"
            style={{ width: selectedAssistant.displayWidth }}
          />
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 px-8 pt-6 pb-3">
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

            <SearchInput
              value={keyword}
              onValueChange={setKeyword}
              placeholder="搜索专家助理"
              className="ml-auto h-[34px] w-[290px] px-3 text-[12px]"
            />
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
                </button>
              ))}
            </div>
          </div>
        </>
      )}

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
                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        `/buddy?q=${encodeURIComponent(
                          `结合${active.name}技能，帮我做一次完整分析`
                        )}`
                      )
                    }}
                    className="bg-ink mt-2 cursor-pointer rounded-[8px] px-4 py-2 text-[13px] text-white"
                  >
                    召唤专家
                  </button>
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

            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
