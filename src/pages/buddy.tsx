import * as React from 'react'
import { useParams, useSearchParams } from 'react-router'

import AnswerBlocks from '@/components/answer-blocks'
import Composer from '@/components/composer'
import FigmaIcon from '@/components/figma-icon'
import ThinkingTimeline from '@/components/thinking-timeline'
import { useToast } from '@/components/toast'
import { assets } from '@/data/assets'
import {
  conversations,
  findConversation,
  longTimeline,
  type AnswerBlock,
  type ChatMessage,
} from '@/data/chat'

/** 输入任意问题时，用一套通用回答骨架即时生成回复（前端演示数据）。 */
function buildAnswer(question: string): AnswerBlock[] {
  return [
    { kind: 'heading', text: '一、核心结论' },
    {
      kind: 'paragraph',
      text: `针对「${question}」，我先把它拆成可执行的三步：确认口径 → 拉取数据 → 输出结论。下面是本次分析的要点。`,
    },
    {
      kind: 'bullets',
      items: [
        '**数据口径**：以最近 3 个完整周期为基准，剔除异常波动样本。',
        '**关键发现**：主力指标环比改善，但结构性差异明显，需要分板块看。',
        '**结论建议**：优先关注趋势连续改善的板块，回避单点脉冲式机会。',
      ],
    },
    { kind: 'heading', text: '二、明细数据' },
    {
      kind: 'paragraph',
      text:
        '相关指标明细已汇总完成，可按需导出为看板；如需更细的下钻维度（地区、渠道、产品线），告诉我口径即可继续拆解。',
    },
  ]
}

/**
 * 回答详情页：首页提交问题、侧栏历史对话、侧栏自动化任务共用同一个页面。
 * - `/buddy/:id` 渲染历史会话 / 任务结果
 * - `/buddy?q=...` 渲染刚提交的问题，并逐条播放「任务处理过程」
 *
 * 不同会话之间切换时按 key 重新挂载，避免 React 复用实例导致内容串台。
 */
export default function BuddyPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const question = searchParams.get('q')

  return (
    <ConversationDetail key={`${id ?? ''}|${question ?? ''}`} id={id} question={question} />
  )
}

function ConversationDetail({
  id,
  question,
}: {
  id: string | undefined
  question: string | null
}) {
  const toast = useToast()

  // 带 ?q= 进来时视为「新提出的一轮问题」，独立成一条会话，不并入历史记录
  const base = React.useMemo(
    () =>
      question
        ? { id: 'new', title: question, messages: [] as ChatMessage[] }
        : (findConversation(id) ?? conversations[0]),
    [id, question]
  )

  const [messages, setMessages] = React.useState<ChatMessage[]>(base.messages)
  const [streamingId, setStreamingId] = React.useState<string | null>(null)
  const [revealCount, setRevealCount] = React.useState(0)
  const [answerVisible, setAnswerVisible] = React.useState(true)
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({})
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const bootstrapped = React.useRef(false)

  const ask = React.useCallback((text: string) => {
    const stamp = Date.now()
    setMessages((list) => [
      ...list,
      { id: `u-${stamp}`, role: 'user', text },
      {
        id: `a-${stamp}`,
        role: 'assistant',
        thinkingLabel: '任务处理过程',
        duration: '6s.280ms',
        steps: longTimeline,
        blocks: buildAnswer(text),
        disclaimer: true,
      },
    ])
    setStreamingId(`a-${stamp}`)
    setRevealCount(0)
    setAnswerVisible(false)
  }, [])

  // 首页等入口带过来的提问：进入页面后自动开始「思考 → 回答」
  React.useEffect(() => {
    if (!question || bootstrapped.current) return
    bootstrapped.current = true
    ask(question)
  }, [ask, question])

  React.useEffect(() => {
    if (!streamingId) return
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setRevealCount(index)
      if (index >= longTimeline.length) {
        window.clearInterval(timer)
        window.setTimeout(() => setAnswerVisible(true), 320)
      }
    }, 220)
    return () => window.clearInterval(timer)
  }, [streamingId])

  React.useEffect(() => {
    if (!streamingId) return
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [revealCount, answerVisible, messages.length, streamingId])

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex h-[80px] shrink-0 items-center justify-end">
        <button
          type="button"
          onClick={() => toast('已收到你的反馈入口点击')}
          className="mr-[33px] flex cursor-pointer items-center gap-2 rounded-full bg-[#f5f6f8] py-2 pr-4 pl-3 transition-colors hover:bg-[#eceef2]"
        >
          <FigmaIcon src={assets.iconFeedback} size={20} />
          <span className="text-ink text-[14px] leading-[22px]">我要反馈</span>
        </button>
      </header>

      <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[874px] flex-col gap-5 px-6 pb-8">
          {messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end pt-2">
                  <p className="text-ink max-w-[70%] rounded-[12px] bg-[rgba(40,50,83,0.06)] px-4 py-2.5 text-[15px] leading-[24px]">
                    {message.text}
                  </p>
                </div>
              )
            }

            const streaming = message.id === streamingId
            const steps = message.steps
            const open = openMap[message.id] ?? Boolean(steps)

            return (
              <div key={message.id} className="flex flex-col">
                <ThinkingTimeline
                  label={message.thinkingLabel}
                  duration={message.duration}
                  steps={steps ?? []}
                  open={open && Boolean(steps)}
                  visibleCount={streaming ? revealCount : undefined}
                  onToggle={() =>
                    setOpenMap((map) => ({ ...map, [message.id]: !open }))
                  }
                />
                {streaming && !answerVisible ? (
                  <div className="text-sub mt-2 flex items-center gap-2 text-[13px]">
                    <span className="bg-brand/60 size-[6px] animate-pulse rounded-full" />
                    正在生成回答…
                  </div>
                ) : (
                  <div className="animate-in fade-in-0 mt-1">
                    <AnswerBlocks
                      blocks={message.blocks}
                      disclaimer={message.disclaimer}
                    />
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 bg-white px-6 pt-4 pb-6">
        <Composer
          size="sm"
          className="mx-auto w-full max-w-[874px]"
          onSend={(payload) => ask(payload.text)}
        />
      </div>
    </div>
  )
}
