import { Bookmark, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'

import RichText from '@/components/rich-text'
import { useToast } from '@/components/toast'
import type { AnswerBlock } from '@/data/chat'

export default function AnswerBlocks({
  blocks,
  disclaimer,
}: {
  blocks: AnswerBlock[]
  disclaimer?: boolean
}) {
  const toast = useToast()

  const actions = [
    { icon: ThumbsUp, label: '有帮助' },
    { icon: ThumbsDown, label: '没帮助' },
    { icon: Copy, label: '复制' },
    { icon: RotateCcw, label: '重新生成' },
    { icon: Bookmark, label: '收藏' },
  ]

  return (
    <div className="flex flex-col">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h3
              key={index}
              className="text-ink mt-6 text-[16px] leading-[28px] font-semibold first:mt-4"
            >
              {block.text}
            </h3>
          )
        }

        if (block.kind === 'paragraph') {
          return (
            <p key={index} className="text-ink/85 mt-3 text-[14px] leading-[26px]">
              <RichText text={block.text} />
            </p>
          )
        }

        if (block.kind === 'bullets') {
          return (
            <ul key={index} className="mt-3 flex flex-col gap-2">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="text-ink/85 flex gap-2 text-[14px] leading-[26px]"
                >
                  <span className="mt-[10px] size-[4px] shrink-0 rounded-full bg-[rgba(40,50,83,0.5)]" />
                  <span>
                    <RichText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <div key={index} className="mt-3 flex flex-col gap-3">
            {block.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex flex-col gap-1">
                <span className="text-sub flex items-center gap-2 text-[12px] leading-[20px]">
                  <span className="size-[4px] rounded-full bg-[rgba(40,50,83,0.5)]" />
                  {item.at}
                </span>
                <p className="text-ink/85 text-[14px] leading-[26px]">
                  <RichText text={item.text} />
                </p>
              </div>
            ))}
          </div>
        )
      })}

      {disclaimer ? (
        <p className="text-sub mt-6 text-[12px] leading-[22px]">
          此回答内容由 AI
          生成，仅用于客户内部使用，不可用于外部客户服务，请仔细甄别后使用
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-5">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={() => toast(`${action.label}：已记录`)}
            className="text-sub hover:text-ink cursor-pointer transition-colors"
          >
            <action.icon className="size-[16px]" strokeWidth={1.7} />
          </button>
        ))}
      </div>
    </div>
  )
}
