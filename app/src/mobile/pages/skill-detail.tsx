import { useNavigate, useParams } from 'react-router'

import { PhoneScreen, ScreenHeader } from '@/components/screen'
import { expertExamples } from '@/data/experts'
import { findSkill, skills } from '@/data/skills'
import { useTaskDraft } from '@/lib/task-draft'

export function SkillDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { draft, patch } = useTaskDraft()
  const skill = findSkill(id ?? '') ?? skills[0]

  return (
    <PhoneScreen>
      <ScreenHeader back showMenu={false} title="技能详情" />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <h1 className="text-ink text-[22px] leading-[32px] font-bold">{skill.name}</h1>
        <p className="text-ink/70 mt-3 text-[13px] leading-[22px]">{skill.desc}</p>

        <div className="mt-4 flex gap-4">
          <span className="text-brand border-brand border-b-2 pb-1 text-[15px] font-medium">
            使用说明
          </span>
        </div>

        <article className="mt-4 rounded-[14px] bg-white px-4 py-5 ring-1 ring-[rgba(0,0,0,0.04)]">
          <ol className="flex flex-col gap-2.5">
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
        </article>
      </div>

      <footer className="bg-page shrink-0 px-4 pt-2 pb-5">
        <button
          type="button"
          onClick={() => {
            patch({
              skills: draft.skills.includes(skill.name)
                ? draft.skills
                : [...draft.skills, skill.name],
            })
            navigate('/')
          }}
          className="bg-ink flex h-[48px] w-full items-center justify-center rounded-[14px] text-[16px] text-white"
        >
          试一试
        </button>
      </footer>
    </PhoneScreen>
  )
}
