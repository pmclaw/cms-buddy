import * as React from 'react'

import { initialTasks, type AutomationTask } from '@/data/tasks'
import type { TaskFormValues } from '@/lib/task-form-values'

type AutomationContextValue = {
  tasks: AutomationTask[]
  save: (values: TaskFormValues, id?: string) => void
  remove: (id: string) => void
  toggleStatus: (id: string) => void
  runOnce: (id: string) => void
}

const AutomationContext = React.createContext<AutomationContextValue>({
  tasks: [],
  save: () => {},
  remove: () => {},
  toggleStatus: () => {},
  runOnce: () => {},
})

/** 自动化任务共享状态：列表页与表单页共用（PC 端由单个页面托管） */
export function AutomationProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<AutomationTask[]>(initialTasks)

  const save = React.useCallback((values: TaskFormValues, id?: string) => {
    setTasks((items) => {
      if (id) {
        return items.map((item) => (item.id === id ? { ...item, ...values } : item))
      }
      const created: AutomationTask = {
        id: `t-${Date.now()}`,
        status: 'running',
        desc: values.prompt || '推送当天热点资讯',
        createdAt: '2026-09-15',
        schedule: `每周一至周五，${values.time}推送`,
        channel: values.receivers[0] ?? '聚力',
        runs: 0,
        lastRun: '—',
        ...values,
      }
      return [created, ...items]
    })
  }, [])

  const remove = React.useCallback((id: string) => {
    setTasks((items) => items.filter((item) => item.id !== id))
  }, [])

  const toggleStatus = React.useCallback((id: string) => {
    setTasks((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'running' ? 'done' : 'running' }
          : item
      )
    )
  }, [])

  const runOnce = React.useCallback((id: string) => {
    setTasks((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, runs: item.runs + 1, lastRun: '刚刚', status: 'running' }
          : item
      )
    )
  }, [])

  return (
    <AutomationContext.Provider value={{ tasks, save, remove, toggleStatus, runOnce }}>
      {children}
    </AutomationContext.Provider>
  )
}

export function useAutomation() {
  return React.useContext(AutomationContext)
}
