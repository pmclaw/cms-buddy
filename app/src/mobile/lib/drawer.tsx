import * as React from 'react'

import { MoreDrawer } from '@/components/more-drawer'

const DrawerContext = React.createContext<{ openDrawer: () => void }>({
  openDrawer: () => {},
})

/** 抽屉状态由各处头部按钮共享，抽屉本身只渲染一次 */
export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const value = React.useMemo(() => ({ openDrawer: () => setOpen(true) }), [])

  return (
    <DrawerContext.Provider value={value}>
      {children}
      <MoreDrawer open={open} onClose={() => setOpen(false)} />
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  return React.useContext(DrawerContext)
}
