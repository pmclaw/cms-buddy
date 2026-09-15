import * as React from 'react'

type Toast = { id: number; text: string }

const ToastContext = React.createContext<(text: string) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const push = React.useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, text }])
    window.setTimeout(() => {
      setToasts((list) => list.filter((item) => item.id !== id))
    }, 2400)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="text-ink animate-in fade-in-0 slide-in-from-bottom-2 rounded-[10px] bg-white px-4 py-2 text-[13px] shadow-[0_12px_36px_rgba(40,50,83,0.18)] ring-1 ring-[rgba(40,50,83,0.08)]"
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}
