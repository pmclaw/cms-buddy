import { NavLink, useNavigate } from 'react-router'

import CharacterAvatar from '@/components/character-avatar'
import FigmaIcon from '@/components/figma-icon'
import { useToast } from '@/components/toast'
import { assets, navIcons } from '@/data/assets'
import {
  historyChats,
  historyCount,
  sidebarTaskCount,
  sidebarTasks,
} from '@/data/chat'
import { cn } from 'cn'

const navItems = [
  { to: '/', label: '新任务', icon: navIcons.newTask, end: true },
  { to: '/skills', label: '技能中心', icon: navIcons.skills },
  { to: '/experts', label: '专家助理', icon: navIcons.expert },
  { to: '/automation', label: '自动化任务', icon: navIcons.automation },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <aside className="border-r-[0.5px] border-[rgba(0,0,0,0.1)] bg-white">
      <div className="flex h-full w-[240px] flex-col overflow-hidden px-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex shrink-0 cursor-pointer items-center gap-2 py-3 pl-3 text-left"
        >
          <FigmaIcon src={assets.logo} size={32} alt="小招Buddy" />
          <span className="text-ink text-[16px] leading-[22px] font-semibold tracking-[0.2px]">
            小招Buddy
          </span>
        </button>

        <nav className="flex flex-col gap-[2px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-[10px] overflow-hidden rounded-[12px] px-[18px] py-[10px] transition-colors',
                  isActive
                    ? 'bg-[rgba(24,94,200,0.08)]'
                    : 'hover:bg-[rgba(40,50,83,0.04)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <FigmaIcon src={item.icon} size={20} />
                  <span
                    className={cn(
                      'text-[14px] leading-[22px] whitespace-nowrap',
                      isActive ? 'text-brand font-medium' : 'text-ink'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto pt-[10px] pb-4">
          <section>
            <div className="text-ink px-[10px] py-3 text-[14px] leading-[22px] font-medium">
              历史对话
            </div>
            <div className="flex flex-col">
              {historyChats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => navigate(`/buddy/${chat.conversationId}`)}
                  className="hover:bg-[rgba(40,50,83,0.04)] flex w-full cursor-pointer items-center gap-1 rounded-[12px] px-2 py-1.5 text-left"
                >
                  <CharacterAvatar character={chat.avatar} size={20} />
                  <span className="text-ink min-w-0 flex-1 truncate text-[12px] leading-[22px]">
                    {chat.title}
                  </span>
                  {chat.time ? (
                    <span className="text-sub shrink-0 text-[12px] leading-[22px]">
                      {chat.time}
                    </span>
                  ) : null}
                </button>
              ))}
              <button
                type="button"
                onClick={() => toast(`共 ${historyCount} 条历史对话`)}
                className="text-ink/50 hover:text-ink cursor-pointer px-2 py-1.5 text-left text-[12px] leading-[22px]"
              >
                查看更多（{historyCount}）
              </button>
            </div>
          </section>

          <section>
            <div className="text-ink px-[10px] py-3 text-[14px] leading-[22px] font-medium">
              自动化任务
            </div>
            <div className="flex flex-col">
              {sidebarTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => navigate(`/buddy/${task.conversationId}`)}
                  className="hover:bg-[rgba(40,50,83,0.04)] flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[12px] px-2 py-1.5 text-left"
                >
                  <span className="text-ink min-w-0 flex-1 truncate text-[12px] leading-[22px]">
                    {task.title}
                  </span>
                  <span className="text-sub shrink-0 text-[12px] leading-[22px]">
                    {task.time}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => toast(`共 ${sidebarTaskCount} 个自动化任务`)}
                className="text-ink/50 hover:text-ink cursor-pointer px-2 py-1.5 text-left text-[12px] leading-[22px]"
              >
                查看更多（{sidebarTaskCount}）
              </button>
            </div>
          </section>
        </div>
      </div>
    </aside>
  )
}
