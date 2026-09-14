import { Search } from 'lucide-react'

import { cn } from 'cn'

/** 设计稿里的圆角搜索框（顶栏右侧 / 侧栏顶部共用）。 */
export default function SearchInput({
  value,
  onValueChange,
  placeholder = '搜索',
  className,
  inputClassName,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}) {
  return (
    <label
      className={cn(
        'flex h-[40px] items-center gap-2 rounded-full bg-white px-4 text-[14px] ring-1 ring-[rgba(40,50,83,0.08)] transition focus-within:ring-[rgba(24,94,200,0.45)]',
        className
      )}
    >
      <Search className="text-sub size-[16px] shrink-0" strokeWidth={1.8} />
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'text-ink placeholder:text-[#a6aab8] h-full min-w-0 flex-1 bg-transparent outline-none',
          inputClassName
        )}
      />
    </label>
  )
}
