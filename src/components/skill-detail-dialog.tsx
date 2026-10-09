import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
// 技能使用说明的示例问法与专家助理保持一致
import { expertExamples } from '@/data/experts'
import type { Skill } from '@/data/skills'
import { cn } from 'cn'

/**
 * 技能中心「查看详情」弹窗：规格与样式对齐专家助理弹窗。
 * 内容为：技能名称 + 试一试 + 能力描述 + 技能使用说明（示例问法）；
 * 右上角为「启用 / 禁用」开关与关闭按钮。
 */
export default function SkillDetailDialog({
  skill,
  installed,
  onTry,
  onToggleInstalled,
  onClose,
}: {
  skill: Skill
  installed: boolean
  onTry: () => void
  onToggleInstalled: (installed: boolean) => void
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(560px,calc(100vw-48px))] max-h-[86svh] overflow-y-auto p-7">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[20px] leading-[30px]">
              {skill.name}
            </DialogTitle>
            <button
              type="button"
              disabled={!installed}
              onClick={onTry}
              className={cn(
                'mt-2 rounded-[8px] px-4 py-2 text-[13px]',
                installed
                  ? 'bg-ink cursor-pointer text-white'
                  : 'cursor-not-allowed bg-[rgba(40,50,83,0.08)] text-[#a6aab8]'
              )}
            >
              试一试
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-1">
            <Switch checked={installed} onCheckedChange={onToggleInstalled} />
            <button
              type="button"
              onClick={onClose}
              className="text-sub hover:text-ink ml-1 cursor-pointer text-[18px] leading-none"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="text-ink/80 mt-5 text-[13px] leading-[24px]">{skill.desc}</p>

        <h3 className="text-ink mt-6 text-[15px] leading-[26px] font-semibold">
          技能使用说明
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
      </DialogContent>
    </Dialog>
  )
}
