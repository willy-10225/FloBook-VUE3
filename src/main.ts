// src/main.ts
import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import i18n from "@/assets/ts/i18n" // 請確認 i18n 設定 Vue 3 版本
import directive from "@/directive/index"
import { cloneSessionStorage } from "./session-sharing"

import "vuetify/styles"
import { createVuetify } from "vuetify"
import { aliases, mdi } from "vuetify/iconsets/mdi"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

console.log("run MAIN.TS")
import VueShortkey from "vue3-shortkey"

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)

app.use(vuetify)
app.use(VueShortkey)
app.use(store)
app.use(router)
app.use(i18n)

// 全局自定義指令註冊
Object.entries(directive).forEach(([name, fn]) => {
  app.directive(name, fn)
})

// 全局函數示範 (可在組件內用 this.$formatDate())
app.config.globalProperties.$formatDate = function (date: Date) {
  const YY = date.getFullYear()
  const MM = (date.getMonth() + 1).toString().padStart(2, "0")
  const DD = date.getDate().toString().padStart(2, "0")
  const hh = date.getHours().toString().padStart(2, "0")
  const mm = date.getMinutes().toString().padStart(2, "0")
  const ss = date.getSeconds().toString().padStart(2, "0")
  return `${YY}/${MM}/${DD} ${hh}:${mm}:${ss}`
}

app.config.globalProperties.$isToday = function (date: Date) {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

// 生產環境禁用 Vue Devtools（避免型別錯誤）
if (process.env.NODE_ENV === "production") {
  // @ts-expect-error - devtools 屬性在 AppConfig 中未定義，但實際可用
  app.config.devtools = false
}

// 若仍支援 IE11，修正 hashchange 路由問題（可刪除）
if ("MSInputMethodContext" in window && "documentMode" in document) {
  window.addEventListener("hashchange", () => {
    const target = window.location.hash
    if (target) {
      router.push(target.substring(1))
    }
  })
}

// 掛載到 DOM
app.mount("#app")
