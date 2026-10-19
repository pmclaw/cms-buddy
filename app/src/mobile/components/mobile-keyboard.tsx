import {
  ArrowBigUp,
  ChevronDown,
  Delete,
  Globe,
  Keyboard,
  Mic,
  Paintbrush,
  Smile,
  Sun,
} from 'lucide-react'

import { MOBILE_KEYBOARD_HEIGHT, useKeyboard } from '@/lib/keyboard'
import { cn } from '@/lib/cn'

const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const qwertyKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
const homeKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
const bottomKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']

const keyClass =
  'flex h-[45px] items-center justify-center rounded-[5px] bg-white text-[22px] leading-none shadow-[0_1px_0_rgba(0,0,0,0.28)]'
const specialKeyClass =
  'flex h-[45px] items-center justify-center rounded-[5px] bg-[#adb3bd] text-[16px] leading-none shadow-[0_1px_0_rgba(0,0,0,0.16)]'

/** 模拟 iOS 手机键盘：只负责唤起后的视觉与收起交互，输入仍由真实输入框接收 */
export default function MobileKeyboard() {
  const { open, hide } = useKeyboard()

  function close() {
    hide()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[90] select-none transition-transform duration-250 ease-out',
        open ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      )}
      style={{ height: MOBILE_KEYBOARD_HEIGHT }}
    >
      <div
        onMouseDown={(event) => event.preventDefault()}
        className="flex h-full flex-col border-t border-black/10 bg-[#d1d3d9] text-[#202124] shadow-[0_-1px_0_rgba(0,0,0,0.08)]"
      >
        <div className="flex h-[42px] shrink-0 items-center justify-between px-5 text-[#3f4249]">
          <Keyboard className="size-[24px]" strokeWidth={1.8} />
          <div className="flex items-center gap-10">
            <Mic className="size-[24px]" strokeWidth={1.8} />
            <Paintbrush className="size-[24px]" strokeWidth={1.8} />
            <Smile className="size-[24px]" strokeWidth={1.8} />
          </div>
          <button
            type="button"
            aria-label="收起键盘"
            onClick={close}
            className="active:bg-black/5 -mr-2 flex size-9 items-center justify-center rounded-full"
          >
            <ChevronDown className="size-[24px]" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between px-[5px]">
          <div className="flex gap-[5px]">
            {numberKeys.map((key) => (
              <span key={key} className={cn(keyClass, 'flex-1 text-[21px]')}>
                {key}
              </span>
            ))}
          </div>

          <div className="flex gap-[5px]">
            {qwertyKeys.map((key) => (
              <span key={key} className={cn(keyClass, 'flex-1')}>
                {key}
              </span>
            ))}
          </div>

          <div className="flex gap-[5px]">
            {homeKeys.map((key) => (
              <span key={key} className={cn(keyClass, 'flex-1')}>
                {key}
              </span>
            ))}
          </div>

          <div className="flex gap-[5px]">
            <span className={cn(specialKeyClass, 'w-[42px] shrink-0')}>
              <ArrowBigUp className="size-[24px]" fill="currentColor" strokeWidth={2} />
            </span>
            {bottomKeys.map((key) => (
              <span key={key} className={cn(keyClass, 'flex-1')}>
                {key}
              </span>
            ))}
            <span className={cn(specialKeyClass, 'w-[42px] shrink-0')}>
              <Delete className="size-[24px]" strokeWidth={1.8} />
            </span>
          </div>

          <div className="flex gap-[5px]">
            <span className={cn(specialKeyClass, 'w-[49px] shrink-0')}>符号</span>
            <span className={cn(specialKeyClass, 'w-[49px] shrink-0')}>英/中</span>
            <span className={cn(specialKeyClass, 'w-[37px] shrink-0')}>，</span>
            <span className={cn(keyClass, 'min-w-0 flex-1')}>
              <Mic className="size-[18px]" strokeWidth={1.8} />
            </span>
            <span className={cn(specialKeyClass, 'w-[49px] shrink-0')}>123</span>
            <span className={cn(specialKeyClass, 'w-[57px] shrink-0')}>换行</span>
          </div>
        </div>

        <div className="relative flex h-[32px] shrink-0 items-center justify-between px-8 text-[#3f4249]">
          <Globe className="size-[20px]" strokeWidth={1.7} />
          <Sun className="size-[20px]" strokeWidth={1.8} />
          <span className="absolute bottom-[5px] left-1/2 h-[4px] w-[116px] -translate-x-1/2 rounded-full bg-black/80" />
        </div>
      </div>
    </div>
  )
}
