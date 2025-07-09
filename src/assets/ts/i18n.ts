import { createI18n } from "vue-i18n"
import en_us from "@/assets/languages/en-us.json"
import zh_tw from "@/assets/languages/zh-tw.json"
import zh_cn from "@/assets/languages/zh-cn.json"

const savedLang = localStorage.getItem("lang") || "zh-tw"

const i18n = createI18n({
  legacy: false, // Composition API 模式
  locale: savedLang,
  fallbackLocale: "en-us",
  messages: {
    "en-us": en_us,
    "zh-tw": zh_tw,
    "zh-cn": zh_cn,
  },
  globalInjection: true,
})

export default i18n
