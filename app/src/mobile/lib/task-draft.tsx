import * as React from 'react'

import { models } from '@/components/composer'

/** 任务输入框的草稿状态：跨页面共享（技能、专家、附件、模型、文本） */
export type TaskDraft = {
  text: string
  skills: string[]
  expert: string | null
  attachments: string[]
  model: string
}

const emptyDraft: TaskDraft = {
  text: '',
  skills: [],
  expert: null,
  attachments: [],
  model: models[0],
}

const TaskDraftContext = React.createContext<{
  draft: TaskDraft
  patch: (next: Partial<TaskDraft>) => void
  reset: () => void
}>({ draft: emptyDraft, patch: () => {}, reset: () => {} })

export function TaskDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<TaskDraft>(emptyDraft)

  const patch = React.useCallback((next: Partial<TaskDraft>) => {
    setDraft((current) => ({ ...current, ...next }))
  }, [])

  const reset = React.useCallback(() => setDraft(emptyDraft), [])

  return (
    <TaskDraftContext.Provider value={{ draft, patch, reset }}>
      {children}
    </TaskDraftContext.Provider>
  )
}

export function useTaskDraft() {
  return React.useContext(TaskDraftContext)
}
