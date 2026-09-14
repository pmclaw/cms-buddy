import * as React from 'react'
import {
  AlignLeft,
  ChevronLeft,
  CircleAlert,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  PlayCircle,
  Plus,
  RotateCw,
  Trash2,
} from 'lucide-react'

import SearchInput from '@/components/search-input'
import TaskForm, {
  emptyTaskForm,
  type TaskFormValues,
} from '@/components/task-form'
import { useToast } from '@/components/toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  initialTasks,
  taskSortOptions,
  templates,
  type AutomationTask,
  type TaskFilter,
} from '@/data/tasks'
import { cn } from 'cn'

export default function AutomationPage() {
  const toast = useToast()
  const [tasks, setTasks] = React.useState<AutomationTask[]>(initialTasks)
  const [view, setView] = React.useState<'list' | 'templates'>('list')
  const [filter, setFilter] = React.useState<TaskFilter>('all')
  const [keyword, setKeyword] = React.useState('')
  const [editing, setEditing] = React.useState<AutomationTask | null>(null)
  const [creating, setCreating] = React.useState<TaskFormValues | null>(null)
  const [deleting, setDeleting] = React.useState<AutomationTask | null>(null)

  const list = tasks.filter((task) => {
    const matchFilter = filter === 'all' ? true : task.status === filter
    const matchKeyword = task.title
      .toLowerCase()
      .includes(keyword.trim().toLowerCase())
    return matchFilter && matchKeyword
  })

  function toggleStatus(task: AutomationTask) {
    const next = task.status === 'running' ? 'done' : 'running'
    setTasks((items) =>
      items.map((item) => (item.id === task.id ? { ...item, status: next } : item))
    )
    toast(next === 'running' ? '已恢复运行' : '已暂停该任务')
  }

  function runOnce(task: AutomationTask) {
    setTasks((items) =>
      items.map((item) =>
        item.id === task.id
          ? {
              ...item,
              runs: item.runs + 1,
              lastRun: '刚刚',
              status: 'running' as const,
            }
          : item
      )
    )
    toast('已触发一次执行')
  }

  function saveTask(values: TaskFormValues) {
    if (editing) {
      setTasks((items) =>
        items.map((item) => (item.id === editing.id ? { ...item, ...values } : item))
      )
      toast('任务已保存')
    } else {
      const created: AutomationTask = {
        id: `t-${Date.now()}`,
        status: 'running',
        desc: values.prompt || '推送当天热点资讯',
        createdAt: '2026-03-14',
        schedule: `每周一至周五，${values.time}推送`,
        channel: values.receivers[0] ?? '聚力',
        runs: 0,
        lastRun: '—',
        ...values,
      }
      setTasks((items) => [created, ...items])
      toast('任务创建成功')
    }
    setEditing(null)
    setCreating(null)
    setView('list')
  }

  return (
    <div className="scrollbar-slim flex h-full flex-col overflow-y-auto bg-page">
      {view === 'list' ? (
        <>
          <header className="flex h-[80px] shrink-0 items-center justify-between px-8">
            <h1 className="text-ink text-[22px] leading-[32px] font-bold">
              自动化任务
            </h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="刷新"
                onClick={() => toast('列表已刷新')}
                className="text-ink hover:bg-[#f2f2f7] cursor-pointer rounded-full p-2"
              >
                <RotateCw className="size-[18px]" strokeWidth={1.8} />
              </button>
              <Select
                value={filter}
                onValueChange={(next) => setFilter(next as TaskFilter)}
              >
                <SelectTrigger className="h-[36px] w-[132px] rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskSortOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SearchInput
                value={keyword}
                onValueChange={setKeyword}
                placeholder="搜索任务名称"
                className="h-[36px] w-[220px] text-[13px]"
                inputClassName="text-[13px]"
              />
              <button
                type="button"
                onClick={() => setView('templates')}
                className="text-ink flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] ring-1 ring-[rgba(40,50,83,0.08)]"
              >
                <AlignLeft className="size-[15px]" strokeWidth={1.8} />
                从模板创建
              </button>
              <button
                type="button"
                onClick={() => setCreating({ ...emptyTaskForm })}
                className="bg-ink flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] text-white"
              >
                <Plus className="size-[15px]" strokeWidth={2} />
                创建任务
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-8 pb-8">
            {list.map((task) => (
              <article
                key={task.id}
                className="rounded-[12px] bg-white px-5 py-4 ring-1 ring-[rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded-[4px] px-1.5 py-[2px] text-[12px] leading-[18px]',
                      task.status === 'running'
                        ? 'text-brand bg-[rgba(24,94,200,0.08)]'
                        : 'text-sub bg-[rgba(40,50,83,0.06)]'
                    )}
                  >
                    {task.status === 'running' ? (
                      <Play className="size-[10px] fill-current" strokeWidth={2} />
                    ) : (
                      <Play className="size-[10px] opacity-50" strokeWidth={2} />
                    )}
                    {task.status === 'running' ? '运行中' : '已完成'}
                  </span>
                  <h3 className="text-ink min-w-0 flex-1 truncate text-[16px] leading-[26px] font-medium">
                    {task.title}
                  </h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="更多操作"
                      className="text-sub hover:bg-[#f2f2f7] cursor-pointer rounded-[6px] p-1"
                    >
                      <MoreHorizontal className="size-[16px]" strokeWidth={1.8} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[132px]">
                      <DropdownMenuItem onSelect={() => runOnce(task)}>
                        <PlayCircle className="size-[14px]" strokeWidth={1.8} />
                        执行一次
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toggleStatus(task)}>
                        <Pause className="size-[14px]" strokeWidth={1.8} />
                        {task.status === 'running' ? '暂停' : '恢复'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setEditing(task)}>
                        <Pencil className="size-[14px]" strokeWidth={1.8} />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setDeleting(task)}
                        className="text-danger"
                      >
                        <Trash2 className="size-[14px]" strokeWidth={1.8} />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-ink/70 mt-2 truncate text-[13px] leading-[22px]">
                  {task.desc}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-6 text-[12px] leading-[22px]">
                  <Meta label="创建时间" value={task.createdAt} />
                  <Meta label="运行计划" value={task.schedule} />
                  <Meta label="推送渠道" value={task.channel} />
                  <span className="text-sub ml-auto flex items-center gap-6">
                    <span>
                      已运行{' '}
                      <span className="text-ink font-medium">{task.runs}</span> 次
                    </span>
                    <span>
                      上次执行完成时间{' '}
                      <span className="text-ink">{task.lastRun}</span>
                    </span>
                  </span>
                </div>
              </article>
            ))}

            {list.length === 0 ? (
              <p className="text-sub py-24 text-center text-[13px]">
                没有符合条件的自动化任务
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <header className="flex h-[80px] shrink-0 items-center gap-2 px-8">
            <button
              type="button"
              onClick={() => setView('list')}
              className="text-ink-2 hover:text-brand flex cursor-pointer items-center gap-1 text-[14px]"
            >
              <ChevronLeft className="size-[16px]" strokeWidth={1.8} />
              自动化任务
            </button>
            <span className="text-sub text-[14px]">/</span>
            <span className="text-ink text-[16px] font-medium">从模板添加</span>
          </header>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 px-8 pb-8">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() =>
                  setCreating({ ...emptyTaskForm, title: template.name, prompt: template.desc })
                }
                className="hover:border-brand/60 flex cursor-pointer flex-col gap-3 rounded-[8px] border border-transparent bg-white px-5 py-4 text-left ring-1 ring-[rgba(0,0,0,0.05)] transition-colors"
              >
                <span className="text-ink truncate text-[15px] font-medium">
                  {template.name}
                </span>
                <span className="text-ink/65 line-clamp-2 min-h-[38px] text-[12px] leading-[19px]">
                  {template.desc}
                </span>
                <span className="text-sub text-right text-[12px]">
                  🔥 {template.uses}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <TaskForm
        key={editing?.id ?? creating?.title ?? 'blank'}
        open={Boolean(editing) || Boolean(creating)}
        task={editing}
        initial={creating}
        onClose={() => {
          setEditing(null)
          setCreating(null)
        }}
        onSave={saveTask}
        onDelete={() => {
          setDeleting(editing)
          setEditing(null)
        }}
        onToggleStatus={() => {
          if (editing) toggleStatus(editing)
        }}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="w-[min(360px,calc(100vw-48px))] items-center px-8 py-7 text-center">
          <CircleAlert className="text-danger mx-auto size-[26px]" strokeWidth={1.8} />
          <DialogTitle className="mt-3 text-center text-[16px]">
            确定删除该自动化任务？
          </DialogTitle>
          <DialogDescription className="mt-2 text-center">
            删除后任务将不可恢复。
          </DialogDescription>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="text-ink cursor-pointer rounded-[8px] border border-[#e6e6ef] bg-white px-5 py-2 text-[13px]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                setTasks((items) => items.filter((item) => item.id !== deleting?.id))
                setDeleting(null)
                toast('任务已删除')
              }}
              className="bg-danger cursor-pointer rounded-[8px] px-5 py-2 text-[13px] text-white"
            >
              删除
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-sub">
      {label} <span className="text-ink/80">{value}</span>
    </span>
  )
}
