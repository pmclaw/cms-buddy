import AppShell from '@/components/app-shell'

/**
 * 应用外壳（App Shell）。
 *
 * 全局结构来自 Figma「侧边栏 + 内容区」：左侧 240px 固定侧栏，
 * 右侧为各页面自己的滚动容器（页面内自带顶栏与操作区）。
 */
export default function RootLayout() {
  return <AppShell />
}
