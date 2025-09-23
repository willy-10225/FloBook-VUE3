import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "src/build"), // 用絕對路徑試試
  },
  server: {
    proxy: {
      "/api": {
        target: "http://61.219.187.38:100/",
        changeOrigin: true,
      },
    },
  },
})
