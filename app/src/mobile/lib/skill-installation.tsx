import * as React from 'react'

const defaultInstalledIds = new Set(['market-trend'])

const SkillInstallationContext = React.createContext<{
  installedIds: ReadonlySet<string>
  install: (id: string) => void
  uninstall: (id: string) => void
}>({
  installedIds: defaultInstalledIds,
  install: () => {},
  uninstall: () => {},
})

export function SkillInstallationProvider({ children }: { children: React.ReactNode }) {
  const [installedIds, setInstalledIds] = React.useState<ReadonlySet<string>>(
    () => new Set(defaultInstalledIds)
  )

  const install = React.useCallback((id: string) => {
    setInstalledIds((current) => new Set(current).add(id))
  }, [])

  const uninstall = React.useCallback((id: string) => {
    setInstalledIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }, [])

  return (
    <SkillInstallationContext.Provider value={{ installedIds, install, uninstall }}>
      {children}
    </SkillInstallationContext.Provider>
  )
}

export function useSkillInstallation() {
  return React.useContext(SkillInstallationContext)
}
