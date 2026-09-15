import * as React from 'react'
import { ChevronLeft, Menu } from 'lucide-react'
import { useNavigate } from 'react-router'

import FigmaIcon from '@/components/figma-icon'
import StatusBar from '@/components/status-bar'
import { navIcons } from '@/data/assets'
import { cn } from '@/lib/cn'

/** 每个移动端页面共用的外框：状态栏 + 内容列 */
export function PhoneScreen({
  children,
  className,
  tone = 'grey',
}: {
  children: React.ReactNode
  className?: string
  /** grey：列表页浅灰底；plain：任务页点阵白底（与 PC 首页一致） */
  tone?: 'grey' | 'plain'
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col',
        tone === 'plain' ? 'bg-dot-grid bg-[#fcfcfc]' : 'bg-page',
        className
      )}
    >
      <StatusBar />
      {children}
    </div>
  )
}

/**
 * 顶部栏。
 * - 默认：左侧更多图标，中间标题 + 副标题，右侧胶囊（对齐设计稿）
 * - back：左侧返回箭头
 */
export function ScreenHeader({
  title,
  subtitle,
  onMenu,
  showMenu = true,
  back,
  right,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  onMenu?: () => void
  showMenu?: boolean
  back?: boolean
  right?: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <header className="relative flex h-[68px] shrink-0 items-center px-4">
      <div className="flex w-[96px] justify-start">
        {back ? (
          <button
            type="button"
            aria-label="返回"
            onClick={() => navigate(-1)}
            className="active:bg-ink/5 -ml-1 flex size-10 items-center justify-center rounded-full"
          >
            <ChevronLeft className="size-[24px]" strokeWidth={1.8} />
          </button>
        ) : showMenu ? (
          <button
            type="button"
            aria-label="更多"
            onClick={onMenu}
            className="active:bg-ink/5 -ml-1 flex size-10 items-center justify-center rounded-full"
          >
            <Menu className="size-[22px]" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 text-center">
        <div className="text-ink truncate px-1 text-[17px] leading-[24px] font-medium">
          {title}
        </div>
        {subtitle ? (
          <div className="text-sub mt-[2px] flex items-center justify-center gap-1 text-[12px] leading-[18px]">
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex w-[96px] justify-end">
        {right}
      </div>
    </header>
  )
}

export type TabKey = 'task' | 'expert' | 'skill' | 'automation'

/** 底部宫格导航：任务 / 专家 / 技能 / 自动化 */
export function TabBar({
  active,
  tone = 'grey',
}: {
  active: TabKey
  tone?: 'grey' | 'plain'
}) {
  const navigate = useNavigate()
  // 图标沿用 PC 端侧边栏导出的 Figma 资源
  const items = [
    { key: 'task' as const, label: '任务', to: '/', icon: navIcons.newTask },
    { key: 'expert' as const, label: '专家', to: '/experts', icon: navIcons.expert },
    { key: 'skill' as const, label: '技能', to: '/skills', icon: navIcons.skills },
    {
      key: 'automation' as const,
      label: '自动化',
      to: '/automation',
      icon: navIcons.automation,
    },
  ]

  return (
    <nav
      className={cn(
        'safe-bottom shrink-0 border-t border-[rgba(40,50,83,0.06)] backdrop-blur',
        tone === 'plain' ? 'bg-[#fcfcfc]/95' : 'bg-page/95'
      )}
    >
      <div className="flex h-[58px] items-stretch">
        {items.map((item) => {
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.to)}
              className="flex flex-1 flex-col items-center justify-center gap-[3px]"
            >
              <FigmaIcon
                src={item.icon}
                size={23}
                className={isActive ? 'opacity-100' : 'opacity-40'}
              />
              <span
                className={cn(
                  'text-[11px] leading-[14px]',
                  isActive ? 'text-ink font-medium' : 'text-sub'
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
