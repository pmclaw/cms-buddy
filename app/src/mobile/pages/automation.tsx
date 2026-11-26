import * as React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'

import { TaskCard } from '@/components/cards'
import { TaskFormSheet } from '@/pages/automation-form'
import { BottomSheet, ConfirmDialog } from '@/components/sheet'
import { PhoneScreen, ScreenHeader, TabBar } from '@/components/screen'
import { useToast } from '@/components/toast'
import {
  automationExecutionRecords,
  templates,
  type AutomationTask,
} from '@/data/tasks'
import { useAutomation } from '@/lib/automation-store'
import { useDrawer } from '@/lib/drawer'
import { cn } from '@/lib/cn'
import { useTaskDraft } from '@/lib/task-draft'

const automationTabs = [
  { id: 'mine', label: '我的', path: '/automation' },
  { id: 'templates', label: '任务模板', path: '/automation/templates' },
  { id: 'records', label: '执行记录', path: '/automation/records' },
] as const

export function AutomationPage() {
  const location = useLocation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { openDrawer } = useDrawer()
  const { tasks, remove, toggleStatus, runOnce } = useAutomation()
  const { reset: resetTaskDraft, patch: patchTaskDraft } = useTaskDraft()

  const [addMenuOpen, setAddMenuOpen] = React.useState(false)
  const [menuTask, setMenuTask] = React.useState<AutomationTask | null>(null)
  const [deleting, setDeleting] = React.useState<AutomationTask | null>(null)

  // 创建 / 编辑以弹层形式覆盖在列表之上（对齐设计稿 14/15）
  const isCreate = location.pathname === '/automation/new'
  const isEdit = location.pathname.endsWith('/edit')
  const isTemplates = location.pathname === '/automation/templates'
  const isRecords = location.pathname === '/automation/records'
  const isMain = !isTemplates && !isRecords
  const activeTab = isTemplates ? 'templates' : isRecords ? 'records' : 'mine'
  const editingTask = isEdit ? (tasks.find((item) => item.id === id) ?? null) : null
  const executionRows = automationExecutionRecords.flatMap((record) => {
    const task = tasks.find((item) => item.id === record.taskId)
    return task ? [{ ...record, task }] : []
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
        title="自动化"
        onMenu={openDrawer}
        right={isMain ? (
          <button
            type="button"
            aria-label="刷新"
            onClick={() => toast('列表已刷新')}
            className="text-ink flex size-9 items-center justify-center"
          >
            <RefreshCw className="size-[19px]" strokeWidth={1.8} />
          </button>
        ) : undefined}
      />

      <nav
        aria-label="自动化视图"
        className="flex items-center justify-center gap-5 px-4 pb-2"
      >
        {automationTabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(tab.path)}
              className={cn(
                'cursor-pointer border-b-2 pb-1 text-[15px] leading-[22px]',
                active
                  ? 'text-brand border-brand font-medium'
                  : 'text-sub border-transparent'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-28">
        {isTemplates ? (
          <div className="grid grid-cols-2 gap-2.5">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => navigate(`/automation/new?template=${template.id}`)}
                className="flex flex-col gap-2 rounded-[14px] bg-white px-3.5 py-3.5 text-left ring-1 ring-[rgba(0,0,0,0.04)] active:bg-[#fafbfd]"
              >
                <span className="text-ink text-[15px] leading-[22px] font-medium">
                  {template.name}
                </span>
                <span className="text-ink/60 line-clamp-3 text-[12px] leading-[19px]">
                  {template.desc}
                </span>
                <span className="text-sub text-right text-[11px]">
                  🔥 {template.uses}
                </span>
              </button>
            ))}
          </div>
        ) : isRecords ? (
          <div className="overflow-hidden rounded-[14px] bg-white">
            {executionRows.map((record) => {
              const running = record.status === 'running'
              return (
                <button
                  key={record.id}
                  type="button"
                  aria-label={`${record.task.title}，${record.at}，${running ? '执行中' : '执行成功'}`}
                  onClick={() => navigate(`/automation/${record.taskId}/detail`)}
                  className="active:bg-ink/5 flex h-16 w-full items-center gap-3 border-b border-[rgba(40,50,83,0.05)] px-4 text-left last:border-0"
                >
                  <span className="text-ink min-w-0 flex-1 truncate text-[13px] leading-[20px] font-medium">
                    {record.task.title}
                  </span>
                  <span className="text-sub flex shrink-0 items-center gap-1.5 text-[10px] leading-[14px] tabular-nums">
                    {record.at}
                    <span
                      aria-hidden
                      className={cn(
                        'size-[5px] rounded-full',
                        running ? 'bg-brand' : 'bg-[#28c76f]'
                      )}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMenu={() => setMenuTask(task)}
                onOpenRecord={() => navigate(`/automation/${task.id}/detail`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 新建任务入口 */}
      {isMain ? (
        <button
          type="button"
          aria-label="创建任务"
          onClick={() => setAddMenuOpen(true)}
          className="bg-ink absolute right-4 bottom-[78px] flex size-[56px] items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(40,50,83,0.28)]"
        >
          <Plus className="size-[26px]" strokeWidth={2.2} />
        </button>
      ) : null}

      <TabBar active="automation" />

      {/* 新建任务方式选择 */}
      <BottomSheet
        open={addMenuOpen}
        onClose={() => setAddMenuOpen(false)}
        hideHeader
        className="bg-page pb-3"
      >
        <div className="px-3 pt-3">
          <div className="overflow-hidden rounded-[14px] bg-white">
            <button
              type="button"
              onClick={() => {
                setAddMenuOpen(false)
                navigate('/automation/new')
              }}
              className="text-ink flex h-[58px] w-full items-center justify-center border-b border-[rgba(40,50,83,0.07)] text-[17px]"
            >
              自定义添加
            </button>
            <button
              type="button"
              onClick={() => {
                setAddMenuOpen(false)
                resetTaskDraft()
                patchTaskDraft({ skills: ['创建自动化任务'] })
                navigate('/')
              }}
              className="text-ink flex h-[58px] w-full items-center justify-center text-[17px]"
            >
              以对话方式添加
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAddMenuOpen(false)}
            className="text-ink mt-2 flex h-[58px] w-full items-center justify-center rounded-[14px] bg-white text-[17px] font-medium"
          >
            取消
          </button>
        </div>
      </BottomSheet>

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
