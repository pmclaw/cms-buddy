import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import SkillUsage from '@/components/skill-usage'
import type { Skill } from '@/data/skills'

/**
 * 技能中心「查看详情」弹窗：技能名称 + 试一试（未启用时显示启用安装开关）
 * + 能力描述 + 技能使用说明。
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
      <DialogContent className="w-[min(720px,calc(100vw-48px))] p-0">
        <div className="scrollbar-slim max-h-[86svh] overflow-y-auto px-9 py-8">
          <DialogTitle className="text-[24px] leading-[34px] font-bold">
            {skill.name}
          </DialogTitle>

          <div className="mt-4">
            {installed ? (
              <button
                type="button"
                onClick={onTry}
                className="bg-ink cursor-pointer rounded-full px-6 py-2.5 text-[15px] leading-[22px] text-white transition-colors hover:bg-[#1c2440]"
              >
                试一试
              </button>
            ) : (
              <label className="flex cursor-pointer items-center gap-3">
                <Switch checked={false} onCheckedChange={onEnable} />
                <span className="text-ink text-[15px] leading-[22px]">启用安装</span>
              </label>
            )}
          </div>

          <div className="mt-7 border-t border-[rgba(40,50,83,0.08)]" />

          <p className="text-ink/85 mt-7 text-[15px] leading-[28px]">{skill.desc}</p>

          <h3 className="text-ink mt-8 text-[17px] leading-[28px] font-semibold">
            技能使用说明
          </h3>
          <div className="mt-4">
            <SkillUsage />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
