import { MessageSquarePlus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'

import FigmaIcon from '@/components/figma-icon'
import { Drawer } from '@/components/sheet'
import { useToast } from '@/components/toast'
import { assets } from '@/data/assets'
import {
  historyChats,
  historyCount,
  sidebarTaskCount,
  sidebarTasks,
} from '@/data/chat'

/** 左上角「更多」抽屉：新建任务 + 历史对话 + 自动化任务（数据来自 PC 端） */
export function MoreDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const toast = useToast()

  function go(path: string) {
    onClose()
    navigate(path)
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-10">
        <div className="mb-6 flex shrink-0 items-center gap-2.5 px-1">
          <FigmaIcon src={assets.logo} size={32} alt="小招Buddy" />
          <span className="text-ink text-[18px] leading-[26px] font-semibold">
            小招Buddy
          </span>
        </div>

        <button
          type="button"
          onClick={() => go('/')}
          className="ring-ink/8 text-ink mb-4 flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-[14px] bg-white text-[16px] ring-1"
        >
          <MessageSquarePlus className="size-[20px]" strokeWidth={1.8} />
          新建任务
        </button>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto pb-6">
          <p className="text-sub py-2 text-[13px] font-medium">历史对话</p>
          {historyChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => go(`/task/${chat.conversationId}`)}
              className="active:bg-ink/5 flex h-[44px] w-full items-center gap-2 text-left"
            >
              <span className="text-ink min-w-0 flex-1 truncate text-[15px]">
                {chat.title}
              </span>
              {chat.processing ? (
                <span
                  title="处理中"
                  className="border-brand/25 border-t-brand size-[14px] shrink-0 animate-spin rounded-full border-[1.5px]"
                />
              ) : chat.time ? (
                <span className="text-sub shrink-0 text-[12px]">{chat.time}</span>
              ) : null}
            </button>
          ))}
          <button
            type="button"
            onClick={() => toast(`共 ${historyCount} 条历史对话`)}
            className="text-ink/45 active:text-ink/70 flex h-[40px] w-full items-center text-left text-[13px]"
          >
            查看更多（{historyCount}）
          </button>

          <div className="mt-4 flex items-center justify-between py-2">
            <p className="text-sub text-[13px] font-medium">自动化任务</p>
            <button
              type="button"
              aria-label="新建自动化任务"
              onClick={() => go('/automation/new')}
              className="text-sub flex size-6 items-center justify-center"
            >
              <Plus className="size-[18px]" strokeWidth={2} />
            </button>
          </div>
          {sidebarTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => go(`/task/${task.conversationId}`)}
              className="active:bg-ink/5 flex h-[44px] w-full items-center gap-2 text-left"
            >
              <span className="text-ink min-w-0 flex-1 truncate text-[15px]">
                {task.title}
              </span>
              <span className="text-sub shrink-0 text-[12px]">{task.time}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => toast(`共 ${sidebarTaskCount} 个自动化任务`)}
            className="text-ink/45 active:text-ink/70 flex h-[40px] w-full items-center text-left text-[13px]"
          >
            查看更多（{sidebarTaskCount}）
          </button>
        </div>
      </div>
    </Drawer>
  )
}
