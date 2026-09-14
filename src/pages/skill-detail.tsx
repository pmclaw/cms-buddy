import * as React from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
} from 'lucide-react'
import { Link, useParams } from 'react-router'

import CharacterAvatar from '@/components/character-avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { findSkill, highDividendDetail as detail, skills } from '@/data/skills'
import { cn } from 'cn'

export default function SkillDetailPage() {
  const { id } = useParams()
  const skill = findSkill(id ?? '') ?? skills[0]
  const [expanded, setExpanded] = React.useState(false)

  const steps = expanded ? detail.steps : detail.steps.slice(0, 3)

  return (
    <div className="scrollbar-slim h-full overflow-y-auto bg-page">
      <div className="mx-auto w-full max-w-[1260px] px-8 py-6">
        <Link
          to="/skills"
          className="text-ink-2 inline-flex items-center gap-1 text-[13px] leading-[22px] hover:text-brand"
        >
          <ChevronLeft className="size-[16px]" strokeWidth={1.8} />
          技能中心
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-ink text-[26px] leading-[36px] font-bold">
            {skill.name}
          </h1>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-ink flex items-center gap-2 rounded-[8px] bg-[rgba(40,50,83,0.05)] px-2.5 py-1 text-[12px]">
            <CharacterAvatar character={skill.avatar} size={16} />
            归属 {skill.owner}
          </span>
        </div>

        <p className="text-ink/75 mt-4 max-w-[880px] text-[13px] leading-[24px]">
          {skill.desc}
        </p>

        <Tabs defaultValue="overview" className="mt-5">
          <TabsList className="gap-8">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="files">文件</TabsTrigger>
            <TabsTrigger value="versions">版本</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
              <article className="rounded-[12px] bg-white px-8 py-7 ring-1 ring-[rgba(0,0,0,0.05)]">
                <span className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[2px] text-[11px] leading-[18px]">
                  来源：{detail.source}
                </span>

                <h2 className="text-ink mt-4 text-[24px] leading-[36px] font-bold">
                  {detail.heading}
                </h2>

                <h3 className="text-ink mt-8 text-[18px] leading-[30px] font-semibold">
                  {detail.definitionTitle}
                </h3>
                <p className="text-ink/85 mt-3 text-[14px] leading-[26px]">
                  {detail.definition}
                </p>

                <div className="border-brand/40 mt-4 rounded-r-[6px] border-l-2 bg-[rgba(24,94,200,0.05)] px-4 py-3">
                  <p className="text-ink text-[14px] leading-[26px]">{detail.callout}</p>
                </div>

                <h3 className="text-ink mt-8 text-[18px] leading-[30px] font-semibold">
                  {detail.tableTitle}
                </h3>
                <div className="mt-3 overflow-hidden rounded-[8px] ring-1 ring-[rgba(0,0,0,0.06)]">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#f7f8fa]">
                        {['维度', '分值', '权重', '核心概念', '子项'].map((head) => (
                          <th
                            key={head}
                            className="text-ink px-4 py-3 text-[13px] leading-[22px] font-medium"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.table.map((row) => (
                        <tr
                          key={row.dimension}
                          className="border-t border-[rgba(0,0,0,0.06)] align-top"
                        >
                          <td className="text-ink px-4 py-3 text-[13px] leading-[22px]">
                            {row.dimension}
                          </td>
                          <td className="text-ink px-4 py-3 text-[13px] leading-[22px] whitespace-nowrap">
                            {row.score}
                          </td>
                          <td className="text-ink px-4 py-3 text-[13px] leading-[22px] whitespace-nowrap">
                            {row.weight}
                          </td>
                          <td className="text-ink px-4 py-3 text-[13px] leading-[22px]">
                            {row.concept}
                          </td>
                          <td className="text-ink/70 px-4 py-3 text-[13px] leading-[22px]">
                            {row.items}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-[13px] leading-[24px]">
                  <span className="text-sub">{detail.thresholdTitle}：</span>
                  <span className="text-ink/85">{detail.threshold}</span>
                </p>

                <h3 className="text-ink mt-8 text-[18px] leading-[30px] font-semibold">
                  {detail.stepsTitle}
                </h3>
                <div className="mt-3 flex flex-col gap-1 rounded-[8px] bg-[#f7f8fa] px-4 py-4">
                  {steps.map((step) => (
                    <p
                      key={step.label}
                      className="text-[12px] leading-[24px] font-mono"
                    >
                      <span className="text-brand font-semibold">{step.label}</span>{' '}
                      <span className="text-ink/85">{step.text}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="text-ink flex cursor-pointer items-center gap-1 rounded-full bg-white px-5 py-1.5 text-[13px] shadow-[0_6px_20px_rgba(40,50,83,0.12)] ring-1 ring-[rgba(0,0,0,0.05)]"
                  >
                    <ChevronDown
                      className={cn(
                        'size-[14px] transition-transform',
                        expanded ? 'rotate-180' : ''
                      )}
                      strokeWidth={1.8}
                    />
                    {expanded ? '收起全文' : '展开全文'}
                  </button>
                </div>
              </article>

              <aside className="flex flex-col gap-4">
                <div className="rounded-[12px] bg-white px-4 py-3 ring-1 ring-[rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-ink flex items-center gap-2 text-[13px] font-medium">
                      <Folder className="size-[15px] text-sub" strokeWidth={1.7} />
                      文件预览
                    </span>
                    <span className="text-sub flex items-center gap-1 text-[12px]">
                      {detail.files.count}
                      <ChevronDown className="size-[14px]" strokeWidth={1.8} />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {detail.files.folders.map((folder) => (
                      <span
                        key={folder}
                        className="text-ink/80 flex items-center gap-2 text-[12px] leading-[22px]"
                      >
                        <ChevronRight className="size-[12px] text-sub" strokeWidth={2} />
                        <Folder className="size-[14px] text-[#e0b34a]" strokeWidth={1.7} />
                        {folder}
                      </span>
                    ))}
                    {detail.files.items.map((file) => (
                      <span
                        key={file.name}
                        className="text-ink/80 flex items-center gap-2 text-[12px] leading-[22px]"
                      >
                        <FileText className="text-sub size-[14px]" strokeWidth={1.7} />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-sub">{file.size}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-[12px] bg-white px-4 py-4 ring-1 ring-[rgba(0,0,0,0.05)]">
                  {detail.meta.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sub text-[12px] leading-[22px]">
                        {item.label}
                      </span>
                      {item.tone === 'tag' ? (
                        <span className="rounded-full bg-[rgba(0,180,120,0.12)] px-2 py-[2px] text-[11px] text-[#0f9d63]">
                          {item.value}
                        </span>
                      ) : (
                        <span className="text-ink text-[12px] leading-[22px]">
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <div className="rounded-[12px] bg-white p-6 ring-1 ring-[rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-3">
                {[
                  ...detail.files.folders.map((folder) => ({
                    name: `${folder}/`,
                    size: '—',
                  })),
                  ...detail.files.items,
                ].map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 border-b border-[rgba(0,0,0,0.05)] pb-3 last:border-0"
                  >
                    <FileText className="text-sub size-[16px]" strokeWidth={1.7} />
                    <span className="text-ink flex-1 text-[13px]">{file.name}</span>
                    <span className="text-sub text-[12px]">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <div className="rounded-[12px] bg-white p-6 ring-1 ring-[rgba(0,0,0,0.05)]">
              {[
                { version: detail.meta[0].value, at: '2026-07-14 07:08', note: '三维框架 + 多 agent 编排' },
                { version: 'v20260620.0315', at: '2026-06-20 03:15', note: '补充港股标的池' },
                { version: 'v20260502.1902', at: '2026-05-02 19:02', note: '首次发布' },
              ].map((item) => (
                <div
                  key={item.version}
                  className="flex items-center gap-4 border-b border-[rgba(0,0,0,0.05)] py-3 last:border-0"
                >
                  <span className="text-brand rounded-[4px] border-[0.5px] border-[rgba(24,94,200,0.1)] bg-[rgba(24,94,200,0.05)] px-2 py-[2px] font-mono text-[11px]">
                    {item.version}
                  </span>
                  <span className="text-ink flex-1 text-[13px]">{item.note}</span>
                  <span className="text-sub text-[12px]">{item.at}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
