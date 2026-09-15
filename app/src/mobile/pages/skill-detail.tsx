import * as React from 'react'
import {
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import CharacterAvatar from '@/components/character-avatar'
import { PhoneScreen, ScreenHeader } from '@/components/screen'
import { findSkill, highDividendDetail as detail, skills } from '@/data/skills'
import { cn } from '@/lib/cn'
import { useTaskDraft } from '@/lib/task-draft'

const tabs = [
  { id: 'overview', label: '概览' },
  { id: 'files', label: '文件' },
  { id: 'versions', label: '版本' },
] as const

export function SkillDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { draft, patch } = useTaskDraft()
  const skill = findSkill(id ?? '') ?? skills[0]
  const [tab, setTab] = React.useState<(typeof tabs)[number]['id']>('overview')
  const [expanded, setExpanded] = React.useState(false)

  const steps = expanded ? detail.steps : detail.steps.slice(0, 3)

  return (
    <PhoneScreen>
      <ScreenHeader back showMenu={false} title="技能详情" />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <h1 className="text-ink text-[22px] leading-[32px] font-bold">{skill.name}</h1>
        <span className="text-ink mt-2.5 inline-flex items-center gap-2 rounded-[10px] bg-[rgba(40,50,83,0.06)] px-2.5 py-1 text-[12px]">
          <CharacterAvatar character={skill.avatar} size={16} />
          {skill.owner}
        </span>
        <p className="text-ink/70 mt-3 text-[13px] leading-[22px]">{skill.desc}</p>

        <div className="scrollbar-none mt-4 flex gap-4 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'shrink-0 pb-1 text-[15px]',
                tab === item.id
                  ? 'text-brand border-brand border-b-2 font-medium'
                  : 'text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'overview' ? (
          <article className="mt-4 rounded-[14px] bg-white px-4 py-5 ring-1 ring-[rgba(0,0,0,0.04)]">
            <span className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[2px] text-[11px]">
              来源：{detail.source}
            </span>

            <h2 className="text-ink mt-3 text-[20px] leading-[30px] font-bold">
              {detail.heading}
            </h2>

            <h3 className="text-ink mt-6 text-[16px] font-semibold">
              {detail.definitionTitle}
            </h3>
            <p className="text-ink/85 mt-2 text-[14px] leading-[26px]">
              {detail.definition}
            </p>

            <div className="border-brand/40 mt-3 rounded-r-[6px] border-l-2 bg-[rgba(24,94,200,0.05)] px-3 py-2.5">
              <p className="text-ink text-[14px] leading-[26px]">{detail.callout}</p>
            </div>

            <h3 className="text-ink mt-6 text-[16px] font-semibold">
              {detail.tableTitle}
            </h3>
            <div className="scrollbar-none mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    {['维度', '分值', '权重', '核心概念', '子项'].map((head) => (
                      <th
                        key={head}
                        className="text-ink px-3 py-2.5 text-[13px] font-medium whitespace-nowrap"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.table.map((row) => (
                    <tr key={row.dimension} className="border-t border-[rgba(0,0,0,0.06)]">
                      <td className="text-ink px-3 py-2.5 text-[13px] whitespace-nowrap">
                        {row.dimension}
                      </td>
                      <td className="text-ink px-3 py-2.5 text-[13px] whitespace-nowrap">
                        {row.score}
                      </td>
                      <td className="text-ink px-3 py-2.5 text-[13px] whitespace-nowrap">
                        {row.weight}
                      </td>
                      <td className="text-ink px-3 py-2.5 text-[13px]">{row.concept}</td>
                      <td className="text-ink/70 px-3 py-2.5 text-[13px]">{row.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[13px] leading-[24px]">
              <span className="text-sub">{detail.thresholdTitle}：</span>
              <span className="text-ink/85">{detail.threshold}</span>
            </p>

            <h3 className="text-ink mt-6 text-[16px] font-semibold">
              {detail.stepsTitle}
            </h3>
            <div className="mt-3 flex flex-col gap-1 rounded-[10px] bg-[#f7f8fa] px-3 py-3">
              {steps.map((step) => (
                <p key={step.label} className="font-mono text-[12px] leading-[22px]">
                  <span className="text-brand font-semibold">{step.label}</span>{' '}
                  <span className="text-ink/85">{step.text}</span>
                </p>
              ))}
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="text-ink flex items-center gap-1 rounded-full bg-white px-5 py-1.5 text-[13px] shadow-[0_6px_20px_rgba(40,50,83,0.12)]"
              >
                <ChevronDown
                  className={cn('size-[14px] transition-transform', expanded && 'rotate-180')}
                  strokeWidth={1.8}
                />
                {expanded ? '收起全文' : '展开全文'}
              </button>
            </div>
          </article>
        ) : null}

        {tab === 'files' ? (
          <div className="mt-4 rounded-[14px] bg-white px-4 py-4 ring-1 ring-[rgba(0,0,0,0.04)]">
            {detail.files.folders.map((folder) => (
              <div
                key={folder}
                className="text-ink flex items-center gap-2 border-b border-[rgba(0,0,0,0.05)] py-2.5 text-[14px] last:border-0"
              >
                <FolderOpen className="size-[16px] text-[#e0b34a]" strokeWidth={1.7} />
                {folder}
              </div>
            ))}
            {detail.files.items.map((file) => (
              <div
                key={file.name}
                className="text-ink flex items-center gap-2 border-b border-[rgba(0,0,0,0.05)] py-2.5 text-[14px] last:border-0"
              >
                <FileText className="text-sub size-[16px]" strokeWidth={1.7} />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-sub text-[12px]">{file.size}</span>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'versions' ? (
          <div className="mt-4 rounded-[14px] bg-white px-4 py-2 ring-1 ring-[rgba(0,0,0,0.04)]">
            {[
              { version: detail.meta[0].value, at: '2026-07-14 07:08', note: '三维框架 + 多 agent 编排' },
              { version: 'v20260620.0315', at: '2026-06-20 03:15', note: '补充港股标的池' },
              { version: 'v20260502.1902', at: '2026-05-02 19:02', note: '首次发布' },
            ].map((item) => (
              <div
                key={item.version}
                className="flex flex-col gap-1 border-b border-[rgba(0,0,0,0.05)] py-3 last:border-0"
              >
                <span className="text-brand font-mono text-[12px]">{item.version}</span>
                <span className="text-ink text-[14px]">{item.note}</span>
                <span className="text-sub text-[12px]">{item.at}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 rounded-[14px] bg-white px-4 py-4 ring-1 ring-[rgba(0,0,0,0.04)]">
          {detail.meta.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sub text-[13px]">{item.label}</span>
              {item.tone === 'tag' ? (
                <span className="rounded-full bg-[rgba(0,180,120,0.12)] px-2 py-[2px] text-[11px] text-[#0f9d63]">
                  {item.value}
                </span>
              ) : (
                <span className="text-ink text-[13px]">{item.value}</span>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 border-t border-[rgba(0,0,0,0.05)] pt-3">
            <Folder className="text-sub size-[15px]" strokeWidth={1.7} />
            <span className="text-sub text-[12px]">文件预览 {detail.files.count} 项</span>
          </div>
        </div>
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
