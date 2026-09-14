import * as React from 'react'
import { useNavigate } from 'react-router'

import Composer, { type ComposerSubmit } from '@/components/composer'
import FigmaIcon from '@/components/figma-icon'
import { useToast } from '@/components/toast'
import { assets } from '@/data/assets'
import { suggestedPrompts } from '@/data/chat'
import { cn } from 'cn'

const chipRows = [
  suggestedPrompts.slice(0, 4),
  suggestedPrompts.slice(4, 7),
  suggestedPrompts.slice(7),
]

export default function HomePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [draft, setDraft] = React.useState('')

  function submit(payload: ComposerSubmit) {
    navigate(`/buddy?q=${encodeURIComponent(payload.text)}`)
  }

  return (
    <div className="bg-dot-grid scrollbar-slim relative flex h-full flex-col overflow-y-auto bg-[#fcfcfc]">
      <button
        type="button"
        onClick={() => toast('已收到你的反馈入口点击')}
        className="absolute top-[26px] right-[33px] flex cursor-pointer items-center gap-2 rounded-full bg-[#f5f6f8] py-2 pr-4 pl-3 transition-colors hover:bg-[#eceef2]"
      >
        <FigmaIcon src={assets.iconFeedback} size={20} />
        <span className="text-ink text-[14px] leading-[22px]">我要反馈</span>
      </button>

      <div className="flex min-h-full flex-1 flex-col items-center justify-center px-8 pt-16 pb-12">
        <FigmaIcon src={assets.heroMascot} size={160} height="auto" />

        <h1 className="text-ink mt-6 text-[34px] leading-[46px] font-bold tracking-[0.5px]">
          聚心念之力，成方寸之功
        </h1>
        <p className="text-ink/70 mt-2 text-[16px] leading-[26px]">
          念头随风而来，算力为你而留，让所有无形的创意，长成看得见的结果。
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          {chipRows.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center justify-center gap-3">
              {row.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className={cn(
                    'text-ink cursor-pointer rounded-full bg-[rgba(40,50,83,0.1)] px-4 py-2 text-[15px] leading-[22px] transition-colors',
                    'hover:bg-[rgba(40,50,83,0.16)]'
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ))}
        </div>

        <Composer
          size="lg"
          className="mt-16 w-full max-w-[900px]"
          value={draft}
          onValueChange={setDraft}
          onSend={submit}
        />
      </div>
    </div>
  )
}
