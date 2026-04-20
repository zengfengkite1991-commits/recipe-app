import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
// https://vite.dev/config/
export default defineConfig({
  // 使用相对路径，支持部署到任何位置
  // GitHub Pages: 如果仓库名是 recipe-app，改为 '/recipe-app/'
  // 自定义域名: 使用 '/'
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
