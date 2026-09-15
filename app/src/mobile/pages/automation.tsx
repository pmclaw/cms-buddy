import * as React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'

import { TaskCard } from '@/components/cards'
import { TaskFormSheet } from '@/pages/automation-form'
import { BottomSheet, ConfirmDialog } from '@/components/sheet'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import { useToast } from '@/components/toast'
import { conversations } from '@/data/chat'
import type { AutomationTask } from '@/data/tasks'
import { useAutomation } from '@/lib/automation-store'
import { useDrawer } from '@/lib/drawer'
import { cn } from '@/lib/cn'

export function AutomationPage() {
  const location = useLocation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { openDrawer } = useDrawer()
  const { tasks, remove, toggleStatus, runOnce } = useAutomation()

  const [menuTask, setMenuTask] = React.useState<AutomationTask | null>(null)
  const [deleting, setDeleting] = React.useState<AutomationTask | null>(null)

  // 创建 / 编辑以弹层形式覆盖在列表之上（对齐设计稿 14/15）
  const isCreate = location.pathname === '/automation/new'
  const isEdit = location.pathname.endsWith('/edit')
  const editingTask = isEdit ? (tasks.find((item) => item.id === id) ?? null) : null

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
        title="自动化"
        onMenu={openDrawer}
        onNewTask={() => navigate('/')}
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

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-28">
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMenu={() => setMenuTask(task)}
              onOpenRecord={() => navigate(`/task/${executionRecordId(task.id)}`)}
            />
          ))}
        </div>
      </div>

      {/* 新建任务入口 */}
      <button
        type="button"
        aria-label="创建任务"
        onClick={() => navigate('/automation/new')}
        className="bg-brand absolute right-4 bottom-[78px] flex size-[56px] items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(24,94,200,0.32)]"
      >
        <Plus className="size-[26px]" strokeWidth={2.2} />
      </button>

      <TabBar active="automation" />

      {/* 任务操作面板（对齐设计稿 12：标题 + 操作行 + 取消） */}
      <BottomSheet
        open={Boolean(menuTask)}
        onClose={() => setMenuTask(null)}
        hideHeader
        className="pb-3"
      >
        <div className="text-sub flex h-[58px] items-center justify-center px-6 text-[17px]">
          <span className="truncate">{menuTask?.title}</span>
        </div>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              const run = action.onClick
              setMenuTask(null)
              run()
            }}
            className={cn(
              'flex h-[58px] w-full items-center justify-center border-t border-[rgba(40,50,83,0.07)] text-[17px]',
              action.danger ? 'text-danger' : 'text-ink'
            )}
          >
            {action.label}
          </button>
        ))}
        <div className="bg-page h-[8px]" />
        <button
          type="button"
          onClick={() => setMenuTask(null)}
          className="text-ink flex h-[58px] w-full items-center justify-center text-[17px] font-medium"
        >
          取消
        </button>
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

      {isCreate || isEdit ? (
        <TaskFormSheet
          task={editingTask}
          templateId={searchParams.get('template')}
          onClose={() => navigate('/automation')}
        />
      ) : null}
    </PhoneScreen>
  )
}

/** 自动化任务列表里的任务对应到执行记录（会话数据） */
function executionRecordId(taskId: string) {
  const list = conversations.filter((item) => item.id.startsWith('task-'))
  const index = Number(taskId.replace(/\D/g, '')) || 0
  return list[index % list.length].id
}
