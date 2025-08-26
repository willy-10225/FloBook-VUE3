import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import i18n from "@/assets/ts/i18n" // ✅ 你的 i18n.ts
import directive from "@/directive/index"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
import { LineChart, BarChart, PieChart } from "echarts/charts"

import "vuetify/styles"
import { createVuetify } from "vuetify"
import { aliases, mdi } from "vuetify/iconsets/mdi"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import "@mdi/font/css/materialdesignicons.css"
import * as echarts from "echarts/core"
import VueShortkey from "vue3-shortkey"

echarts.use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  BarChart,
  PieChart,
])

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
app.use(ElementPlus)
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
app.config.globalProperties.$echarts = echarts

// 生產環境禁用 Vue Devtools（避免型別錯誤）
if (import.meta.env.NODE_ENV === "production") {
  // @ts-expect-error - devtools 屬性在 AppConfig 中未定義，但實際可用
  app.config.devtools = false
}

// 掛載到 DOM
app.mount("#app")
