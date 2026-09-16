import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子路径部署：CI 注入 BASE_PATH=/cms-buddy/admin/；本地与云端沙箱默认 '/'
  base: process.env.BASE_PATH || '/',
  server: {
    port: 5180,
    strictPort: true,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
});
