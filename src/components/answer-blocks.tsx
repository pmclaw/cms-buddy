import { Copy, ThumbsDown, ThumbsUp } from 'lucide-react'

import RichText from '@/components/rich-text'
import { useToast } from '@/components/toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AnswerBlock } from '@/data/chat'

const DISCLAIMER =
  '此回答内容由 AI 生成，仅用于客户内部使用，不可用于外部客户服务，请仔细甄别后使用'

/** 附件图标（云 + 向下箭头），fill 改成 currentColor 以跟随按钮文字色。 */
function DownloadCloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M833.841473 336.403925c-29.237791-149.914232-160.920736-263.309448-321.841473-263.309448S219.452762 186.489692 190.158527 336.403925C80.48859 365.641715 0 468.030427 0 585.038033c0 142.633006 113.395216 256.028222 255.971778 256.028222h36.57546v-73.15092h-36.57546c-102.388711 0-182.877301-80.432146-182.877301-182.877302 0-102.388711 80.432146-182.877301 182.877301-182.877301 0-142.633006 113.395216-255.971778 255.971778-255.971778 142.633006 0 256.028222 113.395216 256.028222 255.971778 102.388711 0 182.877301 80.432146 182.877301 182.877301 0 102.388711-80.432146 182.877301-182.877301 182.877302h-36.57546v73.15092h36.57546c142.633006 0 255.971778-113.395216 255.971778-256.028222 0.056444-117.007607-80.432146-219.396318-190.102083-248.634108z"
      />
      <path
        fill="currentColor"
        d="M599.769816 782.53423l-43.856686 40.244295V511.943556c0-21.956565-18.28773-36.57546-36.575461-36.57546-21.956565 0-36.57546 18.28773-36.57546 36.57546v310.834969l-43.91313-40.244295c-14.618895-14.618895-40.244295-14.618895-54.86319 0-14.618895 14.618895-14.618895 36.57546 0 51.194356l109.726381 106.057546c3.668835 3.668835 7.337669 7.337669 10.950061 7.337669 14.618895 7.337669 29.237791 3.668835 40.244295-7.337669l106.057546-106.057546c14.618895-14.618895 14.618895-36.57546 0-51.194356-10.950061-14.618895-36.57546-14.618895-51.194356 0z"
      />
    </svg>
  )
}

/** 把回答整理成 Markdown 文本（`**加粗**` 原样保留）。 */
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

/** 打印视图里的行内富文本：仅把 `**加粗**` 转成 <strong>。 */
function toInlineHtml(text: string) {
  return text
    .replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] as string)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

/** PDF 走浏览器打印：把回答排成一份干净文档，交给「另存为 PDF」。 */
function openPdfView(title: string, blocks: AnswerBlock[], disclaimer?: boolean) {
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

  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  frame.srcdoc = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 48px 56px; color: #283253; font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif; font-size: 14px; line-height: 26px; }
      h1 { margin: 0 0 6px; font-size: 20px; line-height: 30px; }
      .meta { margin: 0 0 24px; padding-bottom: 14px; border-bottom: 1px solid #e6e8ee; color: #657386; font-size: 12px; line-height: 20px; }
      h2 { margin: 26px 0 6px; font-size: 16px; line-height: 26px; }
      p { margin: 10px 0 0; }
      ul { margin: 10px 0 0; padding-left: 20px; }
      li { margin: 4px 0; }
      .at { display: block; color: #657386; font-size: 12px; }
      .disclaimer { margin-top: 24px; color: #657386; font-size: 12px; }
      @page { margin: 14mm; }
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">由 小招Buddy 生成 · ${new Date().toLocaleString('zh-CN')}</p>
    ${body}
    ${disclaimer ? `<p class="disclaimer">${DISCLAIMER}</p>` : ''}
  </body></html>`

  frame.onload = () => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    window.setTimeout(() => frame.remove(), 1000)
  }
  document.body.appendChild(frame)
}

/** 生成文件名：去掉路径/系统不允许的字符。 */
function toFileName(title: string) {
  const cleaned = title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.slice(0, 60) || '小招Buddy回答'
}

function downloadText(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

export default function AnswerBlocks({
  blocks,
  disclaimer,
  title = '小招Buddy回答',
}: {
  blocks: AnswerBlock[]
  disclaimer?: boolean
  /** 用于导出文件名与 PDF 标题 */
  title?: string
}) {
  const toast = useToast()
  const fileName = toFileName(title)

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
        <p className="text-sub mt-6 text-[12px] leading-[22px]">{DISCLAIMER}</p>
      ) : null}

      <div className="mt-3 flex items-center gap-5">
        <button
          type="button"
          aria-label="复制"
          title="复制"
          onClick={() => {
            void navigator.clipboard
              .writeText(toMarkdown(title, blocks, disclaimer))
              .then(
                () => toast('已复制回答内容'),
                () => toast('复制失败，请手动选择文本')
              )
          }}
          className="text-sub hover:text-ink cursor-pointer transition-colors"
        >
          <Copy className="size-[16px]" strokeWidth={1.7} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="下载"
              title="下载"
              className="text-sub hover:text-ink data-[state=open]:text-ink cursor-pointer transition-colors"
            >
              <DownloadCloudIcon className="size-[16px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[136px]">
            <DropdownMenuItem
              className="px-3 py-2 text-[14px]"
              onSelect={() =>
                downloadText(
                  `${fileName}.md`,
                  toMarkdown(title, blocks, disclaimer),
                  'text/markdown;charset=utf-8'
                )
              }
            >
              Markdown 格式
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-3 py-2 text-[14px]"
              onSelect={() => openPdfView(title, blocks, disclaimer)}
            >
              PDF 格式
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="h-[14px] w-px bg-[rgba(40,50,83,0.16)]" />

        <button
          type="button"
          aria-label="有帮助"
          title="有帮助"
          onClick={() => toast('有帮助：已记录')}
          className="text-sub hover:text-ink cursor-pointer transition-colors"
        >
          <ThumbsUp className="size-[16px]" strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="没帮助"
          title="没帮助"
          onClick={() => toast('没帮助：已记录')}
          className="text-sub hover:text-ink cursor-pointer transition-colors"
        >
          <ThumbsDown className="size-[16px]" strokeWidth={1.7} />
        </button>
      </div>
    </div>
  )
}
