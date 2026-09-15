import * as React from 'react'
import { Plus, RefreshCw, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router'

import { TaskCard } from '@/components/cards'
import { BottomSheet, ConfirmDialog } from '@/components/sheet'
import { OptionSheet } from '@/components/panels'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import { useToast } from '@/components/toast'
import { taskSortOptions, type AutomationTask, type TaskFilter } from '@/data/tasks'
import { useAutomation } from '@/lib/automation-store'

export function AutomationPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { tasks, remove, toggleStatus, runOnce } = useAutomation()

  const [keyword, setKeyword] = React.useState('')
  const [filter, setFilter] = React.useState<TaskFilter>('all')
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [menuTask, setMenuTask] = React.useState<AutomationTask | null>(null)
  const [deleting, setDeleting] = React.useState<AutomationTask | null>(null)

  const list = tasks.filter((task) => {
    const hitFilter = filter === 'all' ? true : task.status === filter
    return hitFilter && task.title.toLowerCase().includes(keyword.trim().toLowerCase())
  })

  const actions = menuTask
    ? [
        {
          label: '执行一次',
          onClick: () => {
            runOnce(menuTask.id)
            toast('已触发一次执行')
          },
        },
        {
          label: menuTask.status === 'running' ? '暂停' : '恢复运行',
          onClick: () => {
            toggleStatus(menuTask.id)
            toast(menuTask.status === 'running' ? '已暂停该任务' : '已恢复运行')
          },
        },
        { label: '编辑', onClick: () => navigate(`/automation/${menuTask.id}/edit`) },
        { label: '删除', danger: true, onClick: () => setDeleting(menuTask) },
      ]
    : []

  return (
    <PhoneScreen>
      <ScreenHeader
        title="自动化任务"
        showMenu={false}
        right={
          <button
            type="button"
            aria-label="刷新"
            onClick={() => toast('列表已刷新')}
            className="text-ink flex size-9 items-center justify-center"
          >
            <RefreshCw className="size-[19px]" strokeWidth={1.8} />
          </button>
        }
      />

      <div className="shrink-0 px-4">
        <div className="flex items-center gap-2">
          <label className="flex h-[40px] min-w-0 flex-1 items-center gap-2 rounded-[12px] bg-white px-3 ring-1 ring-[rgba(40,50,83,0.06)]">
            <Search className="text-sub size-[17px]" strokeWidth={1.8} />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索任务名称"
              className="text-ink placeholder:text-[#a6aab8] h-full flex-1 bg-transparent text-[15px] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="text-ink flex h-[40px] shrink-0 items-center gap-1 rounded-[12px] bg-white px-3 text-[13px] ring-1 ring-[rgba(40,50,83,0.06)]"
          >
            <SlidersHorizontal className="size-[15px]" strokeWidth={1.8} />
            {taskSortOptions.find((item) => item.id === filter)?.label ?? '所有任务'}
          </button>
        </div>

        <div className="mt-2.5 mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/automation/templates')}
            className="text-ink flex h-[34px] items-center gap-1.5 rounded-full bg-white px-3 text-[13px] ring-1 ring-[rgba(40,50,83,0.06)]"
          >
            <Sparkles className="size-[15px]" strokeWidth={1.8} />
            从模板创建
          </button>
          <button
            type="button"
            onClick={() => navigate('/automation/new')}
            className="bg-ink flex h-[34px] items-center gap-1.5 rounded-full px-3 text-[13px] text-white"
          >
            <Plus className="size-[15px]" strokeWidth={2.2} />
            创建任务
          </button>
        </div>
      </div>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2.5">
          {list.map((task) => (
            <TaskCard key={task.id} task={task} onMenu={() => setMenuTask(task)} />
          ))}
        </div>
        {list.length === 0 ? (
          <p className="text-sub py-20 text-center text-[13px]">
            没有符合条件的自动化任务
          </p>
        ) : null}
      </div>

      <TabBar active="automation" />

      <OptionSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="任务状态"
        options={taskSortOptions.map((item) => ({ id: item.id, label: item.label }))}
        value={filter}
        onSelect={(id) => setFilter(id as TaskFilter)}
      />

      <BottomSheet
        open={Boolean(menuTask)}
        onClose={() => setMenuTask(null)}
        title={menuTask?.title}
      >
        <div className="px-4 pb-6">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                const run = action.onClick
                setMenuTask(null)
                run()
              }}
              className={`active:bg-ink/5 flex h-[52px] w-full items-center border-b border-[rgba(40,50,83,0.06)] text-left text-[16px] last:border-0 ${
                action.danger ? 'text-danger' : 'text-ink'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="确定删除该自动化任务？"
        description="删除后任务将不可恢复。"
        confirmText="删除"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove(deleting.id)
          setDeleting(null)
          toast('任务已删除')
        }}
      />
    </PhoneScreen>
  )
}
