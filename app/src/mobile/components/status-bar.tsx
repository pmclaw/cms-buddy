import * as React from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'

/** 模拟手机状态栏（时间 + 信号/wifi/电量） */
export default function StatusBar() {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const time = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`

  return (
    <div className="text-ink flex h-[46px] shrink-0 items-end justify-between px-7 pb-[6px] text-[15px] font-semibold">
      <span className="w-[74px] tabular-nums">{time}</span>
      <span className="flex w-[74px] items-center justify-end gap-1.5">
        <Signal className="size-[15px]" strokeWidth={2.4} />
        <Wifi className="size-[15px]" strokeWidth={2.4} />
        <BatteryFull className="size-[18px]" strokeWidth={2} />
      </span>
    </div>
  )
}
