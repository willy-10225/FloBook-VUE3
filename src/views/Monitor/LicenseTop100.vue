<template>
  <v-container class="detail-container" fluid>
    <v-card flat>
      <v-card-title>
        {{ $t("monitor.licenseTop100") }}
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="licenseLogList"
        v-model:sort-by="sortBy"
        density="compact"
        class="ansys-table"
      >
        <!-- 功能名稱多行顯示 -->
        <template #item.ModuleName="{ item }">
          <div v-html="item.ModuleName" />
        </template>

        <!-- 使用時間格式化 -->
        <template #item.spentTime="{ item }">
          {{ formatTimeSpent(item.spentTime) }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import { apiGetLicenseTop100 } from "@/assets/ts/api"
import type { DataTableHeader } from "vuetify"

// 型別定義
interface LicenseItem {
  Rowid: number
  UserName: string
  Host: string
  ModuleName: string
  StartTime: string
  EndTime: string
  spentTime: number
}

type SortItem = {
  key: string
  order?: "asc" | "desc"
}

const store = useStore()
const licenseLogList = ref<LicenseItem[]>([])

// 排序狀態 (Vuetify3 v-model:sort-by)
const sortBy = ref<SortItem[]>([{ key: "Rowid", order: "asc" }])

// DataTable 欄位定義
const headers: DataTableHeader<LicenseItem>[] = [
  { title: "No.", key: "Rowid", sortable: true, align: "center" },
  { title: "User Name", key: "UserName", sortable: true, align: "center" },
  { title: "Device Name", key: "Host", sortable: true, align: "center" },
  { title: "Feature Name", key: "ModuleName", sortable: true, align: "center" },
  { title: "Start Time", key: "StartTime", sortable: true, align: "center" },
  { title: "End Time", key: "EndTime", sortable: true, align: "center" },
  { title: "Time Used", key: "spentTime", sortable: true, align: "center" },
]

let timerId: number | undefined

// 抓取資料
async function fetchData() {
  store.dispatch("changeLoadingState", true)
  try {
    const res = await apiGetLicenseTop100()
    const arr = res.data.map((item: any, idx: number) => ({
      Rowid: idx + 1,
      UserName: item.UserName,
      Host: item.Host,
      ModuleName: item.Product.split(",").join("<br>"),
      StartTime: item.StartTime,
      EndTime: item.EndTime,
      spentTime:
        new Date(item.EndTime).getTime() - new Date(item.StartTime).getTime(),
    }))
    licenseLogList.value = arr
  } finally {
    store.dispatch("changeLoadingState", false)
  }
}

// 格式化時間 (ms → h m)
function formatTimeSpent(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

onMounted(() => {
  fetchData()
  timerId = window.setInterval(fetchData, 300_000) // 每 5 分鐘刷新
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})
</script>
<style scoped lang="less">
/* 針對這個 table 的 root class（你有用 class="ansys-table"） */
.ansys-table {
  width: 100%;

  /* 資料列交替顏色 */
  :deep(tbody tr:nth-child(odd)) {
    background-color: #1b3a66 !important; /* 深藍 */
  }
  :deep(tbody tr:nth-child(even)) {
    background-color: #111418 !important; /* 深黑/深灰 */
  }

  /* 表頭 */
  :deep(.v-data-table__th) {
    background-color: #0d2d52 !important;
    color: #ffffff !important;
    font-weight: 700;
    vertical-align: middle;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  /* 儲存格文字顏色、內距 */
  :deep(tbody td) {
    color: #ffffff !important;
    padding: 0 8px !important;
    font-size: 13px;
    line-height: 1.4;
    vertical-align: middle;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02) !important;
  }

  /* 更窄字體 */
  :deep(.v-data-table__td),
  :deep(.v-data-table__th) {
    font-size: 10px;
  }
}

/* 讓 card 背景透明、標題白色 */
.v-card {
  background-color: transparent !important;
}
.v-card-title {
  color: #fff !important;
}

/* 其餘容器 */
.detail-container {
  padding: 20px;
}
</style>
