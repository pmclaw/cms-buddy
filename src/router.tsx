import { createBrowserRouter } from 'react-router'

import RouteError from '@/components/route-error'
import RootLayout from '@/layouts/root-layout'

/** 纯客户端渲染，不需要水合占位，显式声明以消除 react-router 的开发期提示。 */
const HydrateFallback = () => null

/** 部署到子路径时（GitHub Pages 的 /cms-buddy/），路由要按同一前缀匹配 */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

/**
 * 路由表。
 *
 * 新增 Figma 页面时，在 children 里加一条即可。各页面用 `lazy` 按需加载，
 * 避免多页面应用首屏把全部页面打进同一个 chunk。
 */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: RootLayout,
      ErrorBoundary: RouteError,
      children: [
        {
          index: true,
          HydrateFallback,
          lazy: async () => ({ Component: (await import('@/pages/home')).default }),
        },
        {
          path: 'buddy',
          HydrateFallback,
          lazy: async () => ({ Component: (await import('@/pages/buddy')).default }),
        },
        {
          path: 'buddy/:id',
          HydrateFallback,
          lazy: async () => ({ Component: (await import('@/pages/buddy')).default }),
        },
        {
          path: 'skills',
          HydrateFallback,
          lazy: async () => ({ Component: (await import('@/pages/skills')).default }),
        },
        {
          path: 'skills/:id',
          HydrateFallback,
          lazy: async () => ({
            Component: (await import('@/pages/skill-detail')).default,
          }),
        },
        {
          path: 'experts',
          HydrateFallback,
          lazy: async () => ({ Component: (await import('@/pages/experts')).default }),
        },
        {
          path: 'automation',
          HydrateFallback,
          lazy: async () => ({
            Component: (await import('@/pages/automation')).default,
          }),
        },
        {
          path: '*',
          HydrateFallback,
          lazy: async () => ({
            Component: (await import('@/pages/not-found')).default,
          }),
        },
      ],
    },
  ],
  // 根路径部署时不传 basename，保持默认行为
  basename ? { basename } : undefined
)
