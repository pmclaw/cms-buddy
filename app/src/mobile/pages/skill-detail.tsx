import { Plus, Sparkles, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import { PhoneScreen, ScreenHeader } from '@/components/screen'
import { expertExamples } from '@/data/experts'
import { findSkill, skills } from '@/data/skills'
import { useSkillInstallation } from '@/lib/skill-installation'
import { useTaskDraft } from '@/lib/task-draft'

export function SkillDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { draft, patch } = useTaskDraft()
  const { installedIds, install, uninstall } = useSkillInstallation()
  const skill = findSkill(id ?? '') ?? skills[0]
  const installed = installedIds.has(skill.id)

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
        {installed ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => uninstall(skill.id)}
              className="text-ink border-ink/15 flex h-[48px] items-center justify-center gap-1.5 rounded-[14px] border bg-white text-[16px] active:opacity-70"
            >
              <X className="size-[19px]" strokeWidth={2} />
              卸载技能
            </button>
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
              className="bg-ink flex h-[48px] items-center justify-center gap-1.5 rounded-[14px] text-[16px] text-white active:opacity-80"
            >
              <Sparkles className="size-[19px]" strokeWidth={1.9} />
              试一试
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => install(skill.id)}
            className="bg-ink flex h-[48px] w-full items-center justify-center gap-1.5 rounded-[14px] text-[16px] text-white active:opacity-80"
          >
            <Plus className="size-[20px]" strokeWidth={2} />
            安装技能
          </button>
        )}
      </footer>
    </PhoneScreen>
  )
}
