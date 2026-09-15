import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router'

import FigmaIcon from '@/components/figma-icon'
import { BottomSheet, ConfirmDialog } from '@/components/sheet'
import { useToast } from '@/components/toast'
import { assets } from '@/data/assets'
import { taskRecords, templates, weekdays, type AutomationTask } from '@/data/tasks'
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
  'text-ink placeholder:text-[#a6aab8] h-[52px] w-full rounded-[12px] bg-[#f5f6f8] px-4 text-[16px] outline-none'

/** 创建 / 编辑自动化任务：底部弹层（布局对齐设计稿 14/15） */
export function TaskFormSheet({
  task,
  templateId,
  onClose,
}: {
  task: AutomationTask | null
  templateId: string | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const { save, remove, toggleStatus } = useAutomation()

  const editing = Boolean(task)
  const template = templates.find((item) => item.id === templateId)

  const [values, setValues] = React.useState<TaskFormValues>(() =>
    task
      ? { ...task }
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
    save(values, task?.id)
    toast(editing ? '任务已保存' : '任务创建成功')
    onClose()
  }

  return (
    <>
      <BottomSheet open onClose={onClose} hideHeader className="h-[88%]">
        <div className="flex h-full flex-col">
          <header className="flex shrink-0 items-center justify-between px-4 pt-5 pb-4">
            <h2 className="text-ink text-[22px] leading-[30px] font-semibold">
              {editing ? '编辑任务' : '创建任务'}
            </h2>
            {editing ? null : (
              <button
                type="button"
                onClick={() => navigate('/automation/templates')}
                className="text-brand ring-brand/40 flex h-[36px] items-center gap-1.5 rounded-[10px] px-3 text-[14px] ring-1"
              >
                <Sparkles className="size-[16px]" strokeWidth={1.8} />
                从模板创建
              </button>
            )}
          </header>

          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <Field label="任务名称">
              <input
                value={values.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder="请输入任务标题"
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

            <Field label="任务要求/提示词">
              <textarea
                value={values.prompt}
                onChange={(event) => patch({ prompt: event.target.value })}
                placeholder="请输入提示词，描述任务要做什么"
                className="text-ink placeholder:text-[#a6aab8] h-[120px] w-full resize-none rounded-[12px] bg-[#f5f6f8] px-4 py-3 text-[16px] leading-[24px] outline-none"
              />
            </Field>

            <Field label="执行频率">
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
            </Field>

            <Field label="执行时间">
              <div className="rounded-[12px] bg-[#f5f6f8] px-4 pt-3 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sub text-[15px]">执行时间</span>
                  <input
                    value={values.time}
                    onChange={(event) => patch({ time: event.target.value })}
                    className="text-ink h-[36px] w-[92px] rounded-[8px] bg-white px-3 text-center text-[15px] outline-none"
                  />
                </div>
                <div className="my-3 border-t border-dashed border-[rgba(40,50,83,0.15)]" />
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => {
                    const active = values.weekdays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={cn(
                          'size-[38px] rounded-full text-[13px]',
                          active
                            ? 'bg-brand text-white'
                            : 'text-ink ring-1 ring-[rgba(40,50,83,0.08)] ring-inset'
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </Field>

            <Field label="任务执行结果接收渠道">
              <div className="flex items-center gap-6 rounded-[12px] bg-[#f5f6f8] px-4 py-3.5">
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
                          active ? 'border-brand bg-brand' : 'border-[#c9c9d6]'
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

            <Field label="任务执行结果回复模式">
              <div className="flex items-center gap-6 rounded-[12px] bg-[#f5f6f8] px-4 py-3.5">
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
                          active ? 'border-brand border-[5px]' : 'border-[#c9c9d6]',
                        )}
                      />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </Field>

            {editing ? (
              <Field label="任务记录">
                <div className="rounded-[12px] bg-[#f5f6f8] px-4">
                  {taskRecords.map((record, index) => (
                    <div
                      key={`${record.at}-${index}`}
                      className="flex items-center gap-2 border-b border-[rgba(40,50,83,0.08)] py-2.5 last:border-0"
                    >
                      <span className="text-ink min-w-0 flex-1 truncate text-[14px]">
                        {values.title || '每日热点推送-下午'}
                      </span>
                      <span className="text-sub text-[12px]">{record.at}</span>
                      <Check className="size-[14px] text-[#0f9d63]" strokeWidth={2.4} />
                    </div>
                  ))}
                </div>
              </Field>
            ) : null}
          </div>

          <footer className="flex shrink-0 gap-3 px-4 pt-2 pb-5">
            <button
              type="button"
              onClick={onClose}
              className="text-ink h-[50px] flex-1 rounded-[14px] bg-[#f2f2f7] text-[16px]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={submit}
              className="bg-brand h-[50px] flex-1 rounded-[14px] text-[16px] text-white"
            >
              {editing ? '保存' : '创建'}
            </button>
          </footer>

          {editing ? (
            <div className="flex shrink-0 gap-3 px-4 pb-5">
              <button
                type="button"
                onClick={() => {
                  toggleStatus(task!.id)
                  toast(task!.status === 'running' ? '已暂停该任务' : '已恢复运行')
                }}
                className="text-ink h-[44px] flex-1 rounded-[12px] bg-white text-[15px] ring-1 ring-[rgba(40,50,83,0.08)]"
              >
                {task!.status === 'running' ? '暂停任务' : '恢复运行'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="text-danger h-[44px] flex-1 rounded-[12px] bg-white text-[15px] ring-1 ring-[rgba(217,45,32,0.2)]"
              >
                删除任务
              </button>
            </div>
          ) : null}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmOpen}
        title="确定删除该自动化任务？"
        description="删除后任务将不可恢复。"
        confirmText="删除"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (task) remove(task.id)
          setConfirmOpen(false)
          toast('任务已删除')
          onClose()
        }}
      />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <p className="text-sub mb-2 text-[15px]">{label}</p>
      {children}
    </section>
  )
}
