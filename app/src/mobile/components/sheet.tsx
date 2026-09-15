import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/cn'

/** 底部半屏弹层（对齐设计稿的「半抽屉」） */
export function BottomSheet({
  open,
  onClose,
  title,
  hideHeader,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  /** 隐藏默认的标题栏与关闭按钮（动作面板等自定义头部场景） */
  hideHeader?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-40 overflow-hidden',
        !open && 'pointer-events-none'
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[rgba(20,24,40,0.38)] transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <section
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[82%] flex-col overflow-hidden rounded-t-[20px] bg-white transition-transform duration-250 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
          className
        )}
      >
        {hideHeader ? null : (
          <div className="relative flex h-[56px] shrink-0 items-center justify-center">
            <span className="bg-ink/15 absolute top-[8px] left-1/2 h-[4px] w-[36px] -translate-x-1/2 rounded-full" />
            <h2 className="text-ink max-w-[calc(100%-88px)] truncate text-[16px] font-medium">
              {title}
            </h2>
            <button
              type="button"
              aria-label="关闭"
              onClick={onClose}
              className="text-sub absolute top-[12px] right-4 flex size-8 items-center justify-center"
            >
              <X className="size-[18px]" strokeWidth={1.8} />
            </button>
          </div>
        )}
        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  )
}

/** 左侧半屏抽屉（任务列表 / 更多） */
export function Drawer({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-40 overflow-hidden',
        !open && 'pointer-events-none'
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[rgba(20,24,40,0.4)] transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <section
        className={cn(
          'absolute inset-y-0 left-0 flex w-[86%] flex-col overflow-hidden rounded-r-[20px] bg-white transition-transform duration-250 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {children}
      </section>
    </div>
  )
}

/** 居中确认弹窗 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确定',
  danger,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-10">
      <div onClick={onCancel} className="absolute inset-0 bg-[rgba(20,24,40,0.4)]" />
      <div className="relative w-full rounded-[16px] bg-white px-6 py-6 text-center">
        <h3 className="text-ink text-[16px] font-medium">{title}</h3>
        {description ? (
          <p className="text-sub mt-2 text-[13px] leading-[20px]">{description}</p>
        ) : null}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-ink flex h-[42px] flex-1 items-center justify-center rounded-[10px] bg-[#f2f2f7] text-[15px]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'flex h-[42px] flex-1 items-center justify-center rounded-[10px] text-[15px] text-white',
              danger ? 'bg-danger' : 'bg-ink'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
