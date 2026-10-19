import * as React from 'react'

/** 模拟手机键盘高度（含底部 Home 指示条） */
export const MOBILE_KEYBOARD_HEIGHT = 354

type KeyboardContextValue = {
  open: boolean
  show: () => void
  hide: () => void
}

const KeyboardContext = React.createContext<KeyboardContextValue>({
  open: false,
  show: () => {},
  hide: () => {},
})

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const value = React.useMemo(
    () => ({ open, show: () => setOpen(true), hide: () => setOpen(false) }),
    [open]
  )

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>
}

export function useKeyboard() {
  return React.useContext(KeyboardContext)
}
