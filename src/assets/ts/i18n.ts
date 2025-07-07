// src/i18n.ts
import { createI18n } from "vue-i18n"
import store from "@/store/index"
import en_us from "@/assets/languages/en-us.json"
import zh_tw from "@/assets/languages/zh-tw.json"
import zh_cn from "@/assets/languages/zh-cn.json"

// 預設語言設定，從 localStorage 或 fallback
const savedLang = localStorage.getItem("lang") || "zh-tw"

// Vuex action 改為直接呼叫 dispatch (假設 store 已經支援 changeLanguage)
store.dispatch("changeLanguage", savedLang)

const i18n = createI18n({
  legacy: false, // Composition API 模式
  locale: store.getters.lang || savedLang, // 取得 Vuex 中的語言，沒有則用 savedLang
  fallbackLocale: "en-us",
  messages: {
    "en-us": en_us,
    "zh-tw": zh_tw,
    "zh-cn": zh_cn,
  },
  globalInjection: true, // 可用 this.$t()，但 Composition API 推薦用 useI18n()
})

export default i18n
