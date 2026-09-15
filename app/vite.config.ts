import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 部署到 GitHub Pages 子路径时由构建流程注入，本地开发保持根路径
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        // 展示页（手机外壳）
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        // 移动端本体，可直接用真机打开
        mobile: fileURLToPath(new URL('./mobile.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      // 移动端代码统一放在 src/mobile 下，这里让 @ 直接指向它，
      // 与 PC 端的 import 习惯保持一致（@/components、@/data、@/assets）。
      '@': fileURLToPath(new URL('./src/mobile', import.meta.url)),
    },
  },
})
