import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import SkillUsage from '@/components/skill-usage'
import type { Skill } from '@/data/skills'

/**
 * 技能中心「查看详情」弹窗：规格与样式对齐专家助理弹窗。
 * 内容为：技能名称 + 试一试（未启用时显示「启用安装」开关）+ 能力描述 + 技能使用说明。
 */
export default function SkillDetailDialog({
  skill,
  installed,
  onTry,
  onEnable,
  onClose,
}: {
  skill: Skill
  installed: boolean
  onTry: () => void
  onEnable: () => void
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

            {installed ? (
              <button
                type="button"
                onClick={onTry}
                className="bg-ink mt-2 cursor-pointer rounded-[8px] px-4 py-2 text-[13px] text-white"
              >
                试一试
              </button>
            ) : (
              <label className="mt-2 flex cursor-pointer items-center gap-3">
                <Switch checked={false} onCheckedChange={onEnable} />
                <span className="text-ink text-[13px] leading-[22px]">启用安装</span>
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sub hover:text-ink cursor-pointer text-[18px] leading-none"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <p className="text-ink/80 mt-5 text-[13px] leading-[24px]">{skill.desc}</p>

        <h3 className="text-ink mt-6 text-[15px] leading-[26px] font-semibold">
          技能使用说明
        </h3>
        <div className="mt-3">
          <SkillUsage />
        </div>
      </DialogContent>
    </Dialog>
  )
}
