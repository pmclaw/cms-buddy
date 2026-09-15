import * as React from 'react'
import { Check, ChevronLeft } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import FigmaIcon from '@/components/figma-icon'
import { ConfirmDialog } from '@/components/sheet'
import { PhoneScreen } from '@/components/screen'
import { useToast } from '@/components/toast'
import { assets } from '@/data/assets'
import { taskRecords, templates, weekdays } from '@/data/tasks'
import { useAutomation } from '@/lib/automation-store'
import { cn } from '@/lib/cn'
import { emptyTaskForm, type TaskFormValues } from '@/lib/task-form-values'

const frequencies = [
  { id: 'once', label: '单次定时' },
  { id: 'daily', label: '每日定时' },
  { id: 'weekly', label: '每周定时' },
  { id: 'monthly', label: '每月定时' },
  { id: 'interval', label: '间隔循环' },
] as const

const fieldClass =
  'text-ink placeholder:text-[#a6aab8] h-[44px] w-full rounded-[10px] border border-[#e6e6ef] bg-white px-3 text-[15px] outline-none'

/** 自动化任务创建 / 编辑（PC 端为弹窗，移动端改为整页） */
export function AutomationFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { tasks, save, remove, toggleStatus } = useAutomation()

  const editing = tasks.find((task) => task.id === id)
  const template = templates.find((item) => item.id === searchParams.get('template'))

  const [values, setValues] = React.useState<TaskFormValues>(() =>
    editing
      ? { ...editing }
      : template
        ? { ...emptyTaskForm, title: template.name, prompt: template.desc }
        : emptyTaskForm
  )
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  function patch(next: Partial<TaskFormValues>) {
    setValues((current) => ({ ...current, ...next }))
  }

  function toggleWeekday(day: string) {
    patch({
      weekdays: values.weekdays.includes(day)
        ? values.weekdays.filter((item) => item !== day)
        : [...values.weekdays, day],
    })
  }

  function toggleReceiver(name: string) {
    patch({
      receivers: values.receivers.includes(name)
        ? values.receivers.filter((item) => item !== name)
        : [...values.receivers, name],
    })
  }

  function submit() {
    save(values, editing?.id)
    toast(editing ? '任务已保存' : '任务创建成功')
    navigate('/automation')
  }

  return (
    <PhoneScreen>
      <header className="flex h-[56px] shrink-0 items-center justify-between px-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-ink flex h-9 items-center gap-0.5 text-[15px]"
        >
          <ChevronLeft className="size-[20px]" strokeWidth={1.8} />
          取消
        </button>
        <span className="text-ink text-[17px] font-medium">
          {editing ? '编辑任务' : '创建任务'}
        </span>
        <button
          type="button"
          onClick={submit}
          className="bg-ink flex h-9 items-center rounded-full px-4 text-[15px] text-white"
        >
          保存
        </button>
      </header>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-8">
        <Field label="任务名称" required>
          <input
            value={values.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="请输入任务名称"
            className={fieldClass}
          />
        </Field>

        <Field label="执行任务的技能">
          <div className="flex flex-col gap-2">
            {values.skills.map((skill, index) => (
              <select
                key={index}
                value={skill}
                onChange={(event) =>
                  patch({
                    skills: values.skills.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item
                    ) as TaskFormValues['skills'],
                  })
                }
                className={cn(fieldClass, 'appearance-none')}
              >
                {(index === 2
                  ? ['DeepSeek V4', 'DeepSeek V3', 'Qwen3-Max']
                  : index === 1
                    ? ['选择技能', 'Deep-research', '数据可视化', '市场趋势分析']
                    : ['技能', '专家', '工具']
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </Field>

        <Field label="任务要求/提示词" required>
          <textarea
            value={values.prompt}
            onChange={(event) => patch({ prompt: event.target.value })}
            placeholder="如：查询今日最新的盘前小结"
            className="text-ink placeholder:text-[#a6aab8] h-[120px] w-full resize-none rounded-[10px] border border-[#e6e6ef] bg-white px-3 py-2 text-[15px] leading-[24px] outline-none"
          />
        </Field>

        <Field label="执行时间" required>
          <select
            value={values.frequency}
            onChange={(event) =>
              patch({ frequency: event.target.value as TaskFormValues['frequency'] })
            }
            className={cn(fieldClass, 'appearance-none')}
          >
            {frequencies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {weekdays.map((day) => {
              const active = values.weekdays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={cn(
                    'h-[34px] rounded-[8px] border px-3 text-[13px]',
                    active
                      ? 'border-brand text-brand bg-[rgba(24,94,200,0.06)]'
                      : 'text-ink border-[#e6e6ef] bg-white'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <input
            value={values.time}
            onChange={(event) => patch({ time: event.target.value })}
            className={cn(fieldClass, 'mt-2.5 w-[120px]')}
          />
        </Field>

        <Field label="任务执行结果接收渠道" required>
          <div className="flex items-center gap-6">
            {[
              { name: '聚力', icon: assets.iconJuli },
              { name: '企业微信', icon: assets.iconWechatwork },
            ].map((channel) => {
              const active = values.receivers.includes(channel.name)
              return (
                <button
                  key={channel.name}
                  type="button"
                  onClick={() => toggleReceiver(channel.name)}
                  className="text-ink flex items-center gap-2 text-[15px]"
                >
                  <span
                    className={cn(
                      'flex size-[18px] items-center justify-center rounded-[5px] border',
                      active ? 'border-brand bg-brand' : 'border-[#c9c9d6] bg-white'
                    )}
                  >
                    {active ? (
                      <Check className="size-[13px] text-white" strokeWidth={3} />
                    ) : null}
                  </span>
                  <FigmaIcon src={channel.icon} size={18} />
                  {channel.name}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="任务执行结果回复模式" required>
          <div className="flex items-center gap-6">
            {[
              { id: 'card', label: '卡片式' },
              { id: 'full', label: '完整回复' },
            ].map((option) => {
              const active = values.messageMode === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    patch({ messageMode: option.id as TaskFormValues['messageMode'] })
                  }
                  className="text-ink flex items-center gap-2 text-[15px]"
                >
                  <span
                    className={cn(
                      'size-[18px] rounded-full border',
                      active ? 'border-brand border-[5px]' : 'border-[#c9c9d6] bg-white'
                    )}
                  />
                  {option.label}
                </button>
              )
            })}
          </div>
        </Field>

        {editing ? (
          <section className="mt-2">
            <p className="text-ink mb-2 text-[15px] font-medium">任务记录</p>
            <div className="rounded-[12px] bg-white px-3 ring-1 ring-[rgba(0,0,0,0.04)]">
              {taskRecords.map((record, index) => (
                <div
                  key={`${record.at}-${index}`}
                  className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.05)] py-2.5 last:border-0"
                >
                  <span className="text-ink min-w-0 flex-1 truncate text-[13px]">
                    {values.title || '每日热点推送-下午'}
                  </span>
                  <span className="text-sub text-[12px]">{record.at}</span>
                  <Check className="size-[14px] text-[#0f9d63]" strokeWidth={2.4} />
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (editing) toggleStatus(editing.id)
                  toast(editing?.status === 'running' ? '已暂停该任务' : '已恢复运行')
                }}
                className="text-ink h-[44px] flex-1 rounded-[12px] bg-white text-[15px] ring-1 ring-[rgba(40,50,83,0.08)]"
              >
                {editing.status === 'running' ? '暂停任务' : '恢复运行'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="text-danger h-[44px] flex-1 rounded-[12px] bg-white text-[15px] ring-1 ring-[rgba(217,45,32,0.2)]"
              >
                删除任务
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="确定删除该自动化任务？"
        description="删除后任务将不可恢复。"
        confirmText="删除"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (editing) remove(editing.id)
          setConfirmOpen(false)
          toast('任务已删除')
          navigate('/automation')
        }}
      />
    </PhoneScreen>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="mt-5">
      <p className="text-ink mb-2 text-[15px]">
        {required ? <span className="text-danger">*</span> : null}
        {label}
      </p>
      {children}
    </section>
  )
}
