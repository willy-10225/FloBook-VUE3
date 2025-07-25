import { createI18n } from "vue-i18n"
import en_us from "@/assets/languages/en-us.json"
import zh_tw from "@/assets/languages/zh-tw.json"
import zh_cn from "@/assets/languages/zh-cn.json"

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "zh-tw",
  fallbackLocale: "zh-tw",
  messages: {
    "en-us": en_us,
    "zh-cn": zh_cn,
    "zh-tw": zh_tw,
  },
  escapeParameterHtml: false, // ✅ 關鍵設定
})

export default i18n
