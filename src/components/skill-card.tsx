import { useNavigate } from 'react-router'

import FigmaIcon from '@/components/figma-icon'
import { cardIcons } from '@/data/assets'
import { skillCategoryLabel, type Skill } from '@/data/skills'

export default function SkillCard({ skill }: { skill: Skill }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/skills/${skill.id}`)}
      className="flex cursor-pointer flex-col gap-[10px] rounded-[8px] bg-white px-5 py-2.5 text-left ring-1 ring-[rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(40,50,83,0.08)]"
    >
      <div className="flex flex-col pt-2">
        <p className="text-ink truncate text-[16px] leading-[28px] font-semibold">
          {skill.name}
        </p>
        <p className="text-sub text-[11px] leading-[20px]">{skill.owner}</p>
      </div>

      <p className="text-ink/50 line-clamp-2 h-[42px] text-[12px] leading-[21px]">
        {skill.desc}
      </p>

      <div className="flex items-center justify-between py-2">
        <span className="text-brand rounded-[4px] border-[0.5px] border-[rgba(24,94,200,0.1)] bg-[rgba(24,94,200,0.05)] px-2 py-[2px] font-mono text-[11px] leading-[18px]">
          {skillCategoryLabel(skill.category)}
        </span>
        <span className="flex items-center gap-2">
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
      <FigmaIcon src={icon} size={16} />
      <span className="text-ink/40 text-[12px] leading-none">{value}</span>
    </span>
  )
}
