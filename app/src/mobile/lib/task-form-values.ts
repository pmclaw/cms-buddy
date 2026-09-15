import type { AutomationTask } from '@/data/tasks'

/** 自动化任务表单字段（与 PC 端 TaskFormValues 保持一致） */
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
