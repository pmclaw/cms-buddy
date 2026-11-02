import { ChartNoAxesColumnIncreasing, Users } from 'lucide-react'

import type { Skill } from '@/data/skills'
import { cn } from '@/lib/cn'

export function SkillMetrics({
  skill,
  size = 'small',
}: {
  skill: Skill
  size?: 'small' | 'large'
}) {
  const isLarge = size === 'large'

  return (
    <span
      className={cn('flex items-center', isLarge ? 'gap-5' : 'gap-3')}
      aria-label={`使用用户数 ${skill.users}，技能调用次数 ${skill.calls}`}
    >
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <Users
          className={cn('text-ink/35', isLarge ? 'size-[17px]' : 'size-[13px]')}
          strokeWidth={2}
        />
        <span
          className={cn(
            'text-ink/40 leading-none',
            isLarge ? 'text-[14px]' : 'text-[11px]'
          )}
        >
          {skill.users}
        </span>
      </span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <ChartNoAxesColumnIncreasing
          className={cn('text-ink/35', isLarge ? 'size-[17px]' : 'size-[13px]')}
          strokeWidth={2}
        />
        <span
          className={cn(
            'text-ink/40 leading-none',
            isLarge ? 'text-[14px]' : 'text-[11px]'
          )}
        >
          {skill.calls}
        </span>
      </span>
    </span>
  )
}
