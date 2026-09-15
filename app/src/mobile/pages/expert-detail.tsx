import { ArrowUpRight, Share2, Sparkles, UserRoundCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import CharacterAvatar from '@/components/character-avatar'
import { PhoneScreen, ScreenHeader } from '@/components/screen'
import { useToast } from '@/components/toast'
import { expertExamples, experts } from '@/data/experts'
import { useTaskDraft } from '@/lib/task-draft'

export function ExpertDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { patch } = useTaskDraft()

  const expert = experts.find((item) => item.id === id) ?? experts[0]

  function summon() {
    patch({ expert: expert.name })
    toast(`已召唤 ${expert.name}`)
    navigate('/')
  }

  return (
    <PhoneScreen>
      <ScreenHeader back showMenu={false} title="专家详情" />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col items-center pt-2">
          <CharacterAvatar character={expert.avatar} size={96} />
          <h1 className="text-ink mt-4 text-center text-[20px] leading-[28px] font-bold">
            {expert.name}
          </h1>
          <div className="text-sub mt-2 flex items-center gap-4 text-[12px]">
            <span>🔥 {expert.uses}</span>
            <span>📄 {expert.likes}</span>
            <span>⬇ {expert.downloads}</span>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-ink flex items-center gap-2 text-[16px] font-medium">
            <Sparkles className="size-[18px]" strokeWidth={1.8} />
            能力介绍
          </h2>
          <p className="text-ink/80 mt-3 text-[14px] leading-[26px]">{expert.desc}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-ink flex items-center gap-2 text-[16px] font-medium">
            <UserRoundCheck className="size-[18px]" strokeWidth={1.8} />
            擅长领域
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {expert.tags.map((tag) => (
              <span
                key={tag}
                className="text-ink rounded-[8px] bg-[rgba(40,50,83,0.06)] px-3 py-1.5 text-[13px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-ink flex items-center gap-2 text-[16px] font-medium">
            <Sparkles className="size-[18px]" strokeWidth={1.8} />
            试试这样问我
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {expertExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  patch({ expert: expert.name, text: example })
                  navigate('/')
                }}
                className="flex items-start gap-3 rounded-[14px] bg-white px-4 py-3.5 text-left ring-1 ring-[rgba(0,0,0,0.04)] active:bg-[#fafbfd]"
              >
                <span className="text-ink/80 flex-1 text-[14px] leading-[24px]">
                  {example}
                </span>
                <ArrowUpRight className="text-sub mt-1 size-[18px]" strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className="bg-page shrink-0 px-4 pt-2 pb-5">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => toast('已复制分享链接')}
            className="text-ink flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-white text-[16px] ring-1 ring-[rgba(40,50,83,0.08)]"
          >
            <Share2 className="size-[20px]" strokeWidth={1.8} />
            分享
          </button>
          <button
            type="button"
            onClick={summon}
            className="bg-ink flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] text-[16px] text-white"
          >
            <Sparkles className="size-[20px]" strokeWidth={1.8} />
            召唤
          </button>
        </div>
      </footer>
    </PhoneScreen>
  )
}
