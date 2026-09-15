import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import AnswerBlocks from '@/components/answer-blocks'
import Composer from '@/components/composer'
import FigmaIcon from '@/components/figma-icon'
import {
  ExpertPickerSheet,
  ModelSheet,
  PlusPanel,
  SkillPickerSheet,
} from '@/components/panels'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import ThinkingTimeline from '@/components/thinking-timeline'
import { assets } from '@/data/assets'
import {
  findConversation,
  longTimeline,
  suggestedPrompts,
  type AnswerBlock,
  type ChatMessage,
  type Conversation,
} from '@/data/chat'
import { useDrawer } from '@/lib/drawer'

/** 输入任意问题时生成的回答骨架（与 PC 端逻辑一致） */
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

export function TaskPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { openDrawer } = useDrawer()
  const question = searchParams.get('q')

  const [plusOpen, setPlusOpen] = React.useState(false)
  const [skillOpen, setSkillOpen] = React.useState(false)
  const [expertOpen, setExpertOpen] = React.useState(false)
  const [modelOpen, setModelOpen] = React.useState(false)

  /** 新提问：进入页面后逐条播放任务处理过程，再输出回答 */
  const conversation: Conversation | null = React.useMemo(() => {
    if (question) {
      return {
        id: `new-${question}`,
        title: question,
        messages: [
          { id: 'u-new', role: 'user', text: question },
          {
            id: 'a-new',
            role: 'assistant',
            thinkingLabel: '任务处理过程',
            duration: '6s.280ms',
            steps: longTimeline,
            blocks: buildAnswer(question),
            disclaimer: true,
          },
        ],
      }
    }
    return id ? (findConversation(id) ?? null) : null
  }, [id, question])

  const [revealCount, setRevealCount] = React.useState(question ? 0 : Infinity)
  const [answerVisible, setAnswerVisible] = React.useState(!question)
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({})
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!question) return
    setRevealCount(0)
    setAnswerVisible(false)
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setRevealCount(index)
      if (index >= longTimeline.length) {
        window.clearInterval(timer)
        window.setTimeout(() => setAnswerVisible(true), 300)
      }
    }, 180)
    return () => window.clearInterval(timer)
  }, [question])

  React.useEffect(() => {
    if (!question) return
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [question, revealCount, answerVisible])

  function send(text: string) {
    navigate(`/task/new?q=${encodeURIComponent(text)}`)
  }

  return (
    <PhoneScreen tone={conversation ? 'grey' : 'plain'}>
      <ScreenHeader
        title="小招Buddy"
        onMenu={openDrawer}
        onNewTask={conversation ? () => navigate('/') : undefined}
      />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
        {conversation ? (
          <div className="flex flex-col gap-4 px-4 pt-2 pb-6">
            <p className="text-sub text-center text-[12px]">内容由 AI 生成</p>
            {conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                streaming={Boolean(question) && message.role === 'assistant'}
                revealCount={revealCount}
                answerVisible={answerVisible}
                openMap={openMap}
                setOpenMap={setOpenMap}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex min-h-full flex-col items-center justify-center px-6">
            <FigmaIcon src={assets.heroMascot} size={164} height="auto" />
            <h1 className="text-ink mt-5 text-[26px] leading-[38px] font-bold">
              聚心念之力，成方寸之功
            </h1>
            <p className="text-ink/60 mt-2 text-center text-[13px] leading-[21px]">
              念头随风而来，算力为你而留，让所有无形的创意，长成看得见的结果。
            </p>

            <div className="scrollbar-none mt-8 -mb-2 flex w-full gap-2 overflow-x-auto pb-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => navigate(`/task/new?q=${encodeURIComponent(prompt)}`)}
                  className="text-ink shrink-0 rounded-full bg-[rgba(40,50,83,0.08)] px-4 py-2 text-[13px] whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Composer
        onSend={send}
        onOpenPlus={() => setPlusOpen(true)}
        onOpenModel={() => setModelOpen(true)}
      />
      <TabBar active="task" tone={conversation ? 'grey' : 'plain'} />

      <PlusPanel
        open={plusOpen}
        onClose={() => setPlusOpen(false)}
        onOpenSkillPicker={() => setSkillOpen(true)}
        onOpenExpertPicker={() => setExpertOpen(true)}
      />
      <SkillPickerSheet open={skillOpen} onClose={() => setSkillOpen(false)} />
      <ExpertPickerSheet open={expertOpen} onClose={() => setExpertOpen(false)} />
      <ModelSheet open={modelOpen} onClose={() => setModelOpen(false)} />
    </PhoneScreen>
  )
}

function MessageBubble({
  message,
  streaming,
  revealCount,
  answerVisible,
  openMap,
  setOpenMap,
}: {
  message: ChatMessage
  streaming: boolean
  revealCount: number
  answerVisible: boolean
  openMap: Record<string, boolean>
  setOpenMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="text-ink max-w-[78%] rounded-[14px] bg-[rgba(40,50,83,0.07)] px-3.5 py-2.5 text-[15px] leading-[24px]">
          {message.text}
        </p>
      </div>
    )
  }

  const steps = message.steps
  const open = openMap[message.id] ?? Boolean(steps)

  return (
    <div className="flex flex-col">
      <ThinkingTimeline
        duration={message.duration}
        steps={steps ?? []}
        open={open && Boolean(steps)}
        visibleCount={streaming ? revealCount : undefined}
        onToggle={() => setOpenMap((map) => ({ ...map, [message.id]: !open }))}
      />
      {streaming && !answerVisible ? (
        <div className="text-sub mt-2 flex items-center gap-2 text-[13px]">
          <span className="bg-brand/60 size-[6px] animate-pulse rounded-full" />
          正在生成回答…
        </div>
      ) : (
        <AnswerBlocks blocks={message.blocks} disclaimer={message.disclaimer} />
      )}
    </div>
  )
}
