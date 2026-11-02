import {
  Bookmark,
  Copy,
  ExternalLink,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'

import FileTypeIcon from '@/components/file-type-icon'
import RichText from '@/components/rich-text'
import { useToast } from '@/components/toast'
import type { AnswerBlock } from '@/data/chat'

const DISCLAIMER =
  '此回答内容由 AI 生成，仅用于客户内部使用，不可用于外部客户服务，请仔细甄别后使用'

function toMarkdown(title: string, blocks: AnswerBlock[], disclaimer?: boolean) {
  const lines: string[] = [`# ${title}`, '']

  blocks.forEach((block) => {
    if (block.kind === 'heading') {
      lines.push(`## ${block.text}`, '')
    } else if (block.kind === 'paragraph') {
      lines.push(block.text, '')
    } else if (block.kind === 'bullets') {
      lines.push(...block.items.map((item) => `- ${item}`), '')
    } else {
      lines.push(...block.items.map((item) => `- ${item.at} ${item.text}`), '')
    }
  })

  if (disclaimer) lines.push(`> ${DISCLAIMER}`)

  return lines.join('\n')
}

function toInlineHtml(text: string) {
  return text
    .replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] as string)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function buildReportHtml(title: string, blocks: AnswerBlock[], disclaimer?: boolean) {
  const body = blocks
    .map((block) => {
      if (block.kind === 'heading') return `<h2>${toInlineHtml(block.text)}</h2>`
      if (block.kind === 'paragraph') return `<p>${toInlineHtml(block.text)}</p>`
      if (block.kind === 'bullets') {
        return `<ul>${block.items.map((item) => `<li>${toInlineHtml(item)}</li>`).join('')}</ul>`
      }
      return `<ul>${block.items
        .map((item) => `<li><span class="at">${item.at}</span>${toInlineHtml(item.text)}</li>`)
        .join('')}</ul>`
    })
    .join('\n')

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px 22px; color: #283253; font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif; font-size: 15px; line-height: 27px; }
      h1 { margin: 0 0 6px; font-size: 21px; line-height: 31px; }
      .meta { margin: 0 0 24px; padding-bottom: 14px; border-bottom: 1px solid #e6e8ee; color: #657386; font-size: 12px; line-height: 20px; }
      h2 { margin: 26px 0 6px; font-size: 17px; line-height: 27px; }
      p { margin: 10px 0 0; }
      ul { margin: 10px 0 0; padding-left: 20px; }
      li { margin: 5px 0; }
      .at { display: block; color: #657386; font-size: 12px; }
      .disclaimer { margin-top: 24px; color: #657386; font-size: 12px; }
      @media (min-width: 720px) {
        body { padding: 48px 56px; font-size: 14px; line-height: 26px; }
        h1 { font-size: 20px; line-height: 30px; }
        h2 { font-size: 16px; line-height: 26px; }
      }
      @page { margin: 14mm; }
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">由 小招Buddy 生成 · ${new Date().toLocaleString('zh-CN')}</p>
    ${body}
    ${disclaimer ? `<p class="disclaimer">${DISCLAIMER}</p>` : ''}
  </body></html>`
}

function toFileName(title: string) {
  const cleaned = title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.slice(0, 60) || '小招Buddy回答'
}

type GeneratedFile = {
  name: string
  size: string
  content: string
  type: string
}

function buildGeneratedFiles(
  title: string,
  blocks: AnswerBlock[],
  disclaimer?: boolean
): GeneratedFile[] {
  const fileName = toFileName(title)
  return [
    {
      name: `${fileName}.html`,
      content: buildReportHtml(title, blocks, disclaimer),
      type: 'text/html;charset=utf-8',
    },
    {
      name: `${fileName}.md`,
      content: toMarkdown(title, blocks, disclaimer),
      type: 'text/plain;charset=utf-8',
    },
  ].map((file) => ({
    ...file,
    size: `${(new Blob([file.content]).size / 1024).toFixed(1)} KB`,
  }))
}

function openFileInNewTab(file: GeneratedFile) {
  const url = URL.createObjectURL(new Blob([file.content], { type: file.type }))
  window.open(url, '_blank', 'noopener')
}

export default function AnswerBlocks({
  blocks,
  disclaimer,
  title = '小招Buddy回答',
}: {
  blocks: AnswerBlock[]
  disclaimer?: boolean
  title?: string
}) {
  const toast = useToast()
  const generatedFiles = buildGeneratedFiles(title, blocks, disclaimer)

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

      <div className="mt-4 flex flex-col gap-2.5">
        {generatedFiles.map((file) => (
          <button
            key={file.name}
            type="button"
            aria-label={`浏览 ${file.name}`}
            onClick={() => openFileInNewTab(file)}
            className="flex w-full items-center gap-3 rounded-[14px] bg-[rgba(40,50,83,0.05)] py-3 pr-3.5 pl-4 text-left transition-colors active:bg-[rgba(40,50,83,0.08)]"
          >
            <FileTypeIcon name={file.name} size={36} className="shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="text-ink block truncate text-[14px] leading-[21px] font-medium">
                {file.name}
              </span>
              <span className="text-sub block text-[12px] leading-[18px]">{file.size}</span>
            </span>
            <ExternalLink
              className="text-sub size-[18px] shrink-0"
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {disclaimer ? (
        <p className="text-sub mt-6 text-[12px] leading-[22px]">{DISCLAIMER}</p>
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
