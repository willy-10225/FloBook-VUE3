/**
 * Share sessionStorage across browser tabs
 */
export function cloneSessionStorage(): void {
  console.log("run session-sharing.ts")
  // 如果目前 tab 的 sessionStorage 是空的，就請求其他 tab 傳資料過來
  if (!window.sessionStorage.length) {
    window.localStorage.setItem("getSessionStorageData", Date.now().toString())
  }

  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key === "getSessionStorageData") {
      // 傳送 sessionStorage 給其他 tab
      const data = JSON.stringify(sessionStorage)
      localStorage.setItem("sessionStorageData", data)
      localStorage.removeItem("sessionStorageData")
      localStorage.removeItem("getSessionStorageData")
    }

    if (
      event.key === "sessionStorageData" &&
      !sessionStorage.length &&
      event.newValue
    ) {
      // 接收到來自其他 tab 的 sessionStorage，並寫入本地 tab 的 sessionStorage
      const data: Record<string, string> = JSON.parse(event.newValue)
      for (const [key, value] of Object.entries(data)) {
        sessionStorage.setItem(key, value)
      }
    }

    if (event.key === "logout") {
      // 登出指令：清除 sessionStorage 並重新載入頁面
      sessionStorage.clear()
      location.reload()
    }
  })
}
