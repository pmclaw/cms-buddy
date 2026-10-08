import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { highDividendDetail as detail } from '@/data/skills'
import { cn } from 'cn'

/**
 * 技能使用说明正文。
 * 技能详情页与技能中心详情弹窗共用，保证两处内容一致。
 */
export default function SkillUsage() {
  const [expanded, setExpanded] = React.useState(false)
  const steps = expanded ? detail.steps : detail.steps.slice(0, 3)

  return (
    <>
      <span className="text-sub rounded-[4px] bg-[rgba(40,50,83,0.05)] px-1.5 py-[2px] text-[11px] leading-[18px]">
        来源：{detail.source}
      </span>

      <h3 className="text-ink mt-4 text-[22px] leading-[34px] font-bold">
        {detail.heading}
      </h3>

      <h4 className="text-ink mt-7 text-[17px] leading-[28px] font-semibold">
        {detail.definitionTitle}
      </h4>
      <p className="text-ink/85 mt-3 text-[14px] leading-[26px]">
        {detail.definition}
      </p>

      <div className="border-brand/40 mt-4 rounded-r-[6px] border-l-2 bg-[rgba(24,94,200,0.05)] px-4 py-3">
        <p className="text-ink text-[14px] leading-[26px]">{detail.callout}</p>
      </div>

      <h4 className="text-ink mt-7 text-[17px] leading-[28px] font-semibold">
        {detail.tableTitle}
      </h4>
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

      <h4 className="text-ink mt-7 text-[17px] leading-[28px] font-semibold">
        {detail.stepsTitle}
      </h4>
      <div className="mt-3 flex flex-col gap-1 rounded-[8px] bg-[#f7f8fa] px-4 py-4">
        {steps.map((step) => (
          <p key={step.label} className="text-[12px] leading-[24px] font-mono">
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
    </>
  )
}
