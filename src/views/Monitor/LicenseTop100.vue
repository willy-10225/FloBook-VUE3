<template>
  <v-container class="detail-container" fluid>
    <v-card flat>
      <v-card-title>
        {{ $t("monitor.licenseTop100") }}
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="licenseLogList"
        :sort-by="sortBy"
        :sort-desc="sortDesc"
        @update:sort-by="onSortBy"
        @update:sort-desc="onSortDesc"
        dense
        class="ansys-table"
      >
        <template #item.ModuleName="{ item }">
          <div v-html="item.ModuleName" />
        </template>
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
import { apiMonitorList, apiGetLicenseTop100 } from "@/assets/ts/api"

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
  order?: boolean | "asc" | "desc"
}

const store = useStore()
const licenseLogList = ref<LicenseItem[]>([])
const sortBy = ref<SortItem[]>([{ key: "Rowid", order: "asc" }])
const sortDesc = ref<boolean[]>([false])

// Vuetify DataTable 欄位定義
const headers = [
  { text: "No.", value: "Rowid", sortable: true },
  { text: "使用者", value: "UserName", sortable: true },
  { text: "裝置", value: "Host", sortable: true },
  { text: "功能", value: "ModuleName", sortable: true },
  { text: "開始時間", value: "StartTime", sortable: true },
  { text: "結束時間", value: "EndTime", sortable: true },
  { text: "使用時間", value: "spentTime", sortable: true },
]

let timerId: number | undefined

// 取得資料並初始化
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

// 排序事件處理
function onSortBy(val: SortItem[]) {
  sortBy.value = val
}
function onSortDesc(val: boolean[]) {
  sortDesc.value = val
}

// 格式化使用時間
function formatTimeSpent(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

onMounted(() => {
  fetchData()
  timerId = window.setInterval(fetchData, 300_000)
})
onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<style scoped lang="less">
.detail-container {
  padding: 20px;
}
.ansys-table {
  font-size: small;
}
</style>
