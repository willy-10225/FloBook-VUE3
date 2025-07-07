<template>
  <v-container>
    <LogoHead />
    <br />
    <br />
    <v-row justify="center">
      <v-col cols="2">
        <router-link
          :to="
            versionOption.beta
              ? { name: 'Track' }
              : { name: 'Knowledge Database' }
          "
        >
          <div id="icon-knowledge" class="link-icon" />
          <span>Track</span>
        </router-link>
        <router-link to="/">
          <div id="icon-booking" class="link-icon" @click="commingSoon"></div>
          <span>Booking</span>
        </router-link>
      </v-col>
      <v-col cols="2">
        <router-link to="/Monitor/Index">
          <div id="icon-monitor" class="link-icon" />
          <span>Monitor</span>
        </router-link>
      </v-col>
      <router-link :to="{ name: 'Job Manager' }">
        <div id="icon-solve" class="link-icon" />
        <span>Solve</span>
      </router-link>
    </v-row>
    <v-dialog v-model="showDialog" width="360">
      <v-card class="pa-4 text-center" color="primary">
        <span class="white--text">Coming soon...</span>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { ref } from "vue" // 從 Vue 匯入 ref，用來定義響應式變數
import { useStore } from "vuex" // 匯入 Vuex 的 useStore，用來取得 store 實例
import LogoHead from "@/components/layout/LogoHead.vue"
import { apiMonitorList } from "@/assets/ts/api" // 匯入自定義的 API 方法，取得監控清單

const store = useStore() // 取得全局 Vuex store，用來存取資料與派發 action
const versionOption = store.getters.versionOption
// 從 store 中取得版本選項（例如是否為 beta 版）
const showDialog = ref(false)
// 定義一個響應式變數 showDialog，控制 Dialog 是否顯示，預設為 false
const commingSoon = () => {
  showDialog.value = true // 當此函式被呼叫時，開啟 Dialog
}

const updateHardwareMonitor = async () => {
  // 定義一個非同步函式，負責更新硬體監控資料
  try {
    const res = await apiMonitorList()
    // 向後端 API 發送請求，取得硬體監控清單資料

    if (res.data != null) {
      // 如果回傳資料不是 null，表示有取得到資料

      const check = JSON.parse(sessionStorage.getItem("deviceIpList") || "null")
      // 從 sessionStorage 中抓 deviceIpList，沒有的話給 null

      if (!check) {
        // 如果尚未存過 deviceIpList，才進行儲存動作

        const ipList = res.data.map(item => ({
          // 把取得的每個項目轉換成只包含 ip 和 id 的格式
          ip: item.Ip,
          id: item.Id,
        }))

        store.dispatch("setDeviceIpList", ipList)
        // 呼叫 Vuex 的 action，設定設備 IP 列表到全局狀態中
      }

      store.dispatch("changeLoadingState", false)
      // 資料載入完成後，通知 Vuex 關閉 loading 狀態
    }
  } catch (err) {
    console.error(err)
    // 若請求過程中發生錯誤，印出錯誤訊息方便除錯
  }
}
</script>
<style scoped>
#icon-knowledge {
  background-image: url("/img/Home/icon-knowledge.png");
}
#icon-track {
  background-image: url("/img/Home/icon-track.png");
}
#icon-booking {
  background-image: url("/img/Home/icon-booking.png");
}
#icon-monitor {
  background-image: url("/img/Home/icon-monitor.png");
}
#icon-solve {
  background-image: url("/img/Home/icon-solve.png");
}
.link-icon {
  width: 130px;
  height: 130px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 20px auto 10px;
  border-radius: 10px;
}
</style>
