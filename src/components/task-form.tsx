import * as React from 'react'
import { Check, Clock, Pause, Pencil, Trash2 } from 'lucide-react'

import FigmaIcon from '@/components/figma-icon'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { assets } from '@/data/assets'
import {
  taskRecords,
  weekdays,
  type AutomationTask,
} from '@/data/tasks'
import { cn } from 'cn'

export type TaskFormValues = Pick<
  AutomationTask,
  | 'title'
  | 'skills'
  | 'prompt'
  | 'frequency'
  | 'weekdays'
  | 'time'
  | 'receivers'
  | 'messageMode'
>

export const emptyTaskForm: TaskFormValues = {
  title: '',
  skills: ['技能', '选择技能', 'DeepSeek V4'],
  prompt: '',
  frequency: 'weekly',
  weekdays: ['周一', '周五'],
  time: '9:00',
  receivers: ['聚力'],
  messageMode: 'card',
}

const frequencies = [
  { id: 'once', label: '单次定时' },
  { id: 'daily', label: '每日定时' },
  { id: 'weekly', label: '每周定时' },
  { id: 'monthly', label: '每月定时' },
  { id: 'interval', label: '间隔循环' },
] as const

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <span className="text-ink mb-2 block text-[13px] leading-[22px]">
      {required ? <span className="text-danger mr-[2px]">*</span> : null}
      {children}
    </span>
  )
}

const inputClass =
  'text-ink placeholder:text-[#a6aab8] h-[38px] w-full rounded-[8px] border border-[#e6e6ef] bg-white px-3 text-[13px] outline-none focus:border-brand'

export default function TaskForm({
  open,
  task,
  initial,
  onClose,
  onSave,
  onDelete,
  onToggleStatus,
}: {
  open: boolean
  /** 传入已有任务即为「编辑」，否则为「创建」 */
  task: AutomationTask | null
  /** 创建时的初始值（例如来自模板） */
  initial?: TaskFormValues | null
  onClose: () => void
  onSave: (values: TaskFormValues) => void
  onDelete?: () => void
  onToggleStatus?: () => void
}) {
  const editing = Boolean(task)
  const [values, setValues] = React.useState<TaskFormValues>(
    task ? { ...task } : (initial ?? emptyTaskForm)
  )

  function patch(next: Partial<TaskFormValues>) {
    setValues((current) => ({ ...current, ...next }))
  }

  function toggleWeekday(day: string) {
    setValues((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((item) => item !== day)
        : [...current.weekdays, day],
    }))
  }

  function toggleReceiver(name: string) {
    setValues((current) => ({
      ...current,
      receivers: current.receivers.includes(name)
        ? current.receivers.filter((item) => item !== name)
        : [...current.receivers, name],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          'gap-0 p-0',
          editing
            ? 'w-[min(1050px,calc(100vw-48px))]'
            : 'w-[min(720px,calc(100vw-48px))]'
        )}
      >
        <header className="flex items-center gap-2 px-7 pt-6 pb-4">
          <Pencil className="text-ink size-[16px]" strokeWidth={1.8} />
          <DialogTitle className="text-[14px] font-normal">
            <span className="text-sub">自动化任务 / </span>
            {values.title || '新建任务'}
          </DialogTitle>

          {editing ? (
            <span className="ml-2 flex items-center gap-1">
              <button
                type="button"
                aria-label={task?.status === 'running' ? '暂停' : '启用'}
                onClick={onToggleStatus}
                className="text-ink hover:bg-[#f2f2f7] cursor-pointer rounded-[6px] p-1.5"
              >
                <Pause className="size-[15px]" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="删除"
                onClick={onDelete}
                className="text-ink hover:bg-[#f2f2f7] cursor-pointer rounded-[6px] p-1.5"
              >
                <Trash2 className="size-[15px]" strokeWidth={1.8} />
              </button>
            </span>
          ) : null}

          <span className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-ink cursor-pointer rounded-full border border-[#e6e6ef] bg-white px-5 py-[7px] text-[13px]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => onSave(values)}
              className="bg-ink cursor-pointer rounded-full px-5 py-[7px] text-[13px] text-white"
            >
              保存
            </button>
          </span>
        </header>

        <div className="scrollbar-slim flex min-h-0 flex-1 gap-8 overflow-y-auto px-7 pt-2 pb-7">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <label className="block">
              <FieldLabel required>任务名称</FieldLabel>
              <input
                value={values.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder="请输入任务名称"
                className={inputClass}
              />
            </label>

            <div>
              <FieldLabel>执行任务的技能</FieldLabel>
              <div className="flex flex-wrap items-center gap-3">
                {(['技能', '选择技能', 'DeepSeek V4'] as const).map((value, index) => (
                  <Select
                    key={value}
                    value={value}
                    onValueChange={(next) =>
                      patch({
                        skills: values.skills.map((item, itemIndex) =>
                          itemIndex === index ? next : item
                        ) as TaskFormValues['skills'],
                      })
                    }
                  >
                    <SelectTrigger className="h-[38px] w-[150px] flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(index === 2
                        ? ['DeepSeek V4', 'DeepSeek V3', 'Qwen3-Max']
                        : index === 1
                          ? ['选择技能', 'Deep-research', '数据可视化', '市场趋势分析']
                          : ['技能', '专家', '工具']
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
            </div>

            <label className="block">
              <FieldLabel required>任务要求/提示词</FieldLabel>
              <textarea
                value={values.prompt}
                onChange={(event) => patch({ prompt: event.target.value })}
                placeholder="如：查询今日最新的盘前小结"
                className="text-ink placeholder:text-[#a6aab8] h-[150px] w-full resize-none rounded-[8px] border border-[#e6e6ef] bg-white px-3 py-2 text-[13px] leading-[22px] outline-none focus:border-brand"
              />
            </label>

            <div>
              <FieldLabel required>执行时间</FieldLabel>
              <div className="flex flex-wrap items-center gap-2.5">
                <Select
                  value={values.frequency}
                  onValueChange={(next) =>
                    patch({ frequency: next as TaskFormValues['frequency'] })
                  }
                >
                  <SelectTrigger className="h-[34px] w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {weekdays.map((day) => {
                  const active = values.weekdays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      className={cn(
                        'h-[34px] cursor-pointer rounded-[8px] border px-3 text-[12px] transition-colors',
                        active
                          ? 'border-brand bg-[rgba(24,94,200,0.06)] text-brand'
                          : 'text-ink border-[#e6e6ef] bg-white'
                      )}
                    >
                      {day}
                    </button>
                  )
                })}

                <span className="flex h-[34px] items-center gap-2 rounded-[8px] border border-[#e6e6ef] bg-white px-3">
                  <input
                    value={values.time}
                    onChange={(event) => patch({ time: event.target.value })}
                    className="text-ink w-[46px] text-[13px] outline-none"
                  />
                  <Clock className="text-sub size-[14px]" strokeWidth={1.7} />
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-10">
              <div>
                <FieldLabel required>任务执行结果接收渠道</FieldLabel>
                <div className="flex items-center gap-6">
                  {[
                    { name: '聚力', icon: assets.iconJuli },
                    { name: '企业微信', icon: assets.iconWechatwork },
                  ].map((channel) => (
                    <label
                      key={channel.name}
                      className="text-ink flex cursor-pointer items-center gap-2 text-[13px]"
                    >
                      <Checkbox
                        checked={values.receivers.includes(channel.name)}
                        onCheckedChange={() => toggleReceiver(channel.name)}
                      />
                      <FigmaIcon src={channel.icon} size={18} />
                      {channel.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel required>任务执行结果回复模式</FieldLabel>
                <RadioGroup
                  value={values.messageMode}
                  onValueChange={(next) =>
                    patch({ messageMode: next as TaskFormValues['messageMode'] })
                  }
                  className="flex items-center gap-6"
                >
                  {[
                    { id: 'card', label: '卡片式' },
                    { id: 'full', label: '完整回复' },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="text-ink flex cursor-pointer items-center gap-2 text-[13px]"
                    >
                      <RadioGroupItem value={option.id} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          {editing ? (
            <aside className="w-[220px] shrink-0">
              <p className="text-ink mb-3 text-[13px] leading-[22px] font-medium">
                任务记录
              </p>
              <div className="flex flex-col">
                {taskRecords.map((record, index) => (
                  <div
                    key={`${record.at}-${index}`}
                    className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.05)] py-2.5"
                  >
                    <span className="text-ink min-w-0 flex-1 truncate text-[12px]">
                      {values.title || '每日热点推送-下午'}
                    </span>
                    <span className="text-sub text-[12px]">{record.at}</span>
                    <Check className="size-[13px] text-[#0f9d63]" strokeWidth={2.4} />
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
