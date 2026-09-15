import { MoreHorizontal, Play } from 'lucide-react'

import CharacterAvatar from '@/components/character-avatar'
import FigmaIcon from '@/components/figma-icon'
import { cardIcons } from '@/data/assets'
import { skillCategoryLabel, type Skill } from '@/data/skills'
import type { Expert } from '@/data/experts'
import type { AutomationTask } from '@/data/tasks'
import { cn } from '@/lib/cn'

/** 技能卡片（内容对齐 PC 端技能中心） */
export function SkillCard({
  skill,
  onClick,
}: {
  skill: Skill
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-[14px] bg-white px-4 py-3.5 text-left ring-1 ring-[rgba(0,0,0,0.04)] active:bg-[#fafbfd]"
    >
      <div className="flex flex-col">
        <span className="text-ink truncate text-[16px] leading-[24px] font-semibold">
          {skill.name}
        </span>
        <span className="text-sub text-[12px] leading-[18px]">{skill.owner}</span>
      </div>
      <p className="text-ink/60 line-clamp-2 text-[12px] leading-[19px]">{skill.desc}</p>
      <div className="flex items-center justify-between">
        <span className="text-brand rounded-[4px] bg-[rgba(24,94,200,0.06)] px-2 py-[2px] text-[11px] leading-[16px]">
          {skillCategoryLabel(skill.category)}
        </span>
        <span className="flex items-center gap-2.5">
          <Stat icon={cardIcons.star} value={skill.rating} />
          <Stat icon={cardIcons.bookmark} value={String(skill.bookmarks)} />
          <Stat icon={cardIcons.download} value={String(skill.downloads)} />
        </span>
      </div>
    </button>
  )
}

function Stat({ icon, value }: { icon: string; value: string }) {
  return (
    <span className="flex items-center gap-1">
      <FigmaIcon src={icon} size={13} />
      <span className="text-ink/40 text-[11px] leading-none">{value}</span>
    </span>
  )
}

/** 专家卡片（布局对齐设计稿 06：两列网格） */
export function ExpertCard({
  expert,
  onClick,
}: {
  expert: Expert
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-[14px] bg-white px-3.5 py-3.5 text-left ring-1 ring-[rgba(0,0,0,0.04)] active:bg-[#fafbfd]"
    >
      <div className="flex items-center gap-2">
        <CharacterAvatar character={expert.avatar} size={38} />
        <span className="text-ink min-w-0 flex-1 truncate text-[15px] leading-[22px] font-medium">
          {expert.name}
        </span>
      </div>
      <p className="text-ink/60 line-clamp-2 min-h-[38px] text-[12px] leading-[19px]">
        {expert.desc}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {expert.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[2px] text-[11px] leading-[16px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}

/** 自动化任务卡片（内容对齐 PC 端自动化任务列表） */
export function TaskCard({
  task,
  onMenu,
}: {
  task: AutomationTask
  onMenu: () => void
}) {
  return (
    <article className="flex flex-col gap-2 rounded-[14px] bg-white px-4 py-3.5 ring-1 ring-[rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex items-center gap-1 rounded-[4px] px-1.5 py-[2px] text-[11px] leading-[16px]',
            task.status === 'running'
              ? 'text-brand bg-[rgba(24,94,200,0.08)]'
              : 'text-sub bg-[rgba(40,50,83,0.06)]'
          )}
        >
          <Play className="size-[9px] fill-current" strokeWidth={2} />
          {task.status === 'running' ? '运行中' : '已完成'}
        </span>
        <h3 className="text-ink min-w-0 flex-1 truncate text-[15px] leading-[22px] font-medium">
          {task.title}
        </h3>
        <button
          type="button"
          aria-label="更多操作"
          onClick={onMenu}
          className="text-sub -mr-1 flex size-7 items-center justify-center"
        >
          <MoreHorizontal className="size-[18px]" strokeWidth={1.8} />
        </button>
      </div>

      <p className="text-ink/60 line-clamp-2 text-[12px] leading-[19px]">{task.desc}</p>

      <div className="text-sub flex flex-col gap-1 text-[11px] leading-[17px]">
        <Meta label="运行计划" value={task.schedule} />
        <Meta label="创建时间" value={task.createdAt} />
        <Meta label="推送渠道" value={task.channel} />
        <Meta
          label="执行情况"
          value={`已运行 ${task.runs} 次 · 上次 ${task.lastRun}`}
        />
      </div>
    </article>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span>
      {label} <span className="text-ink/70">{value}</span>
    </span>
  )
}
