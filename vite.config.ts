import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 這裡指定 @ 指到 src
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://61.219.187.38:100/", // 你的 API server
        changeOrigin: true, // 讓 host header 跟 target 一樣
        // rewrite: path => path.replace(/^\/api/, ""), // 可選：如果後端 /api 已經有，就不要 rewrite
      },
    },
  },
})
