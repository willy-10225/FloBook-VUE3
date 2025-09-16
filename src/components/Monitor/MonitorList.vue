<template>
  <section class="monitor-matrix">
    <div class="table-container">
      <div
        v-for="(rows, groupName) in splitTables"
        :key="groupName"
        class="table-wrapper"
        style="height: 80vh; width: 260px"
      >
        <!-- 卡片顯示主要資訊 -->
        <v-card
          class="server-card"
          elevation="0"
          style="margin-top: 10px; height: 100px; display: flex"
        >
          <div class="server-header" style="display: flex; height: 100%">
            <div
              class="server-status"
              style="font-size: 40px; margin-right: 10px; display: flex"
            >
              <span
                v-if="getOverallStatus(rows) === 'green'"
                class="status-icon"
                >🟢</span
              >
              <span
                v-else-if="getOverallStatus(rows) === 'yellow'"
                class="status-icon"
                >🟡</span
              >
              <span
                v-else-if="getOverallStatus(rows) === 'red'"
                class="status-icon"
                >🔴</span
              >
              <span v-else-if="getOverallStatus(rows) === 'alert'">⚠️</span>
            </div>
            <div
              class="server-name"
              style="
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              {{ groupName }}
            </div>
          </div>
        </v-card>

        <!-- 表格顯示詳細資訊（Vuetify 3） -->
        <v-data-table
          :headers="headers"
          :items="rows"
          class="big-table-text"
          hide-default-footer
          item-key="no"
          style="min-width: 100%"
        >
          <!-- No -->
          <template #item.no="{ item }">
            <div class="text-center" style="width: 15px">{{ item.no }}</div>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <div class="text-center" style="width: 15px">
              <span v-if="item.status === 'green'" style="font-size: 22px"
                >🟢</span
              >
              <span v-else-if="item.status === 'yellow'" style="font-size: 22px"
                >🟡</span
              >
              <span v-else-if="item.status === 'red'" style="font-size: 22px"
                >🔴</span
              >
              <span v-else-if="item.status === 'alert'" style="font-size: 22px"
                >⚠️</span
              >
            </div>
          </template>

          <!-- IP + 自訂 Tooltip（保留你的外觀與行為） -->
          <template #item.ip="{ item }">
            <span
              class="ip-hover"
              @mousemove="moveTooltip($event, item)"
              @mouseleave="hideTooltip"
            >
              {{ item.ip.replace(/^192\.168/, "*") }}
            </span>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- 自訂 Tooltip（保留你的樣式與排版） -->
    <div
      class="tooltip"
      v-if="tooltip.visible"
      v-html="tooltip.content"
      :style="{ top: tooltip.top + 'px', left: tooltip.left + 'px' }"
    ></div>
  </section>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, onMounted, nextTick } from "vue"
import { apiGetList } from "@/assets/ts/api"
import { classdict, serverdict } from "@/assets/ts/classdict"

type LicenseLog = { Task?: number }

interface DiskData {
  Capacity: number | string
  Total_space: number | string
  Utilization: number // 0~1 或 0~100？下方以 0~1 * Total_space 用
}

interface CpuData {
  Number: number
  Utilization: number // 0~100
}

interface MemoryData {
  Size: number // MB
  Utilization: number // 0~100
}

interface Device {
  Id: string
  Ip: string
  CpuData: CpuData
  MemoryData: MemoryData
  DiskData: DiskData[]
  UserList: any[]
  LicenseLogList: LicenseLog[]
}

interface TableRow {
  no: number
  Device: string
  status: "green" | "yellow" | "red" | "alert"
  ip: string
  cpu: string
  disk: string
  MemoryData: string
  Users: number
  License: number
}

const props = defineProps<{ rawData: Device[] }>()

// 表頭（與原本欄寬/對齊一致）
const headers = ref([
  { title: "No", key: "no", align: "center" as const, width: 55 },
  { title: "Status", key: "status", align: "center" as const, width: 65 },
  { title: "IP", key: "ip", align: "center" as const },
])

// Tooltip 狀態（保留你的行為）
const tooltip = reactive({
  visible: false,
  top: 0,
  left: 0,
  content: "",
})

// IP 區間對應（預設值，會被 API 覆寫）
let someMapping = ref<Record<string, string>>({})

/** 依 IP 分群並整理表格資料（保留你的規則與顏色門檻/字串格式） */
const splitTables = computed<Record<string, TableRow[]>>(() => {
  if (!Array.isArray(props.rawData)) return {}

  const categorizedData: Record<string, TableRow[]> = {}

  const sortedData = [...props.rawData].sort((a, b) => {
    const ipA = a.Ip.split(".").map(Number)
    const ipB = b.Ip.split(".").map(Number)
    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) return ipA[i] - ipB[i]
    }
    return 0
  })
  categorizedData["server"] = []
  sortedData.forEach(device => {
    const ip = String(device.Ip)
    const group = getLocation(ip)

    if (!categorizedData[group]) categorizedData[group] = []

    // 磁碟：用 Total_space * Utilization 求使用量總和 / 總空間
    const capacitySum = Math.round(
      device.DiskData.reduce((acc, x) => {
        const total = Number(x.Total_space) || 0
        const util = Number(x.Utilization) // 可能是 0~1 或 0~100，若後端是 0~100 可自行調整 /100
        const ratio = util > 1 ? util / 100 : util
        return acc + total * ratio
      }, 0)
    )
    const totalSum = device.DiskData.reduce(
      (sum, d) => sum + (Number(d.Total_space) || 0),
      0
    )

    const maxValue = Math.max(
      (device.CpuData?.Utilization || 0) / 100,
      totalSum ? capacitySum / totalSum : 0,
      (device.MemoryData?.Utilization || 0) / 100
    )

    let color: TableRow["status"] = "green"
    if (maxValue > 0.7) color = "red"
    else if (maxValue > 0.4) color = "yellow"

    const deviceName =
      (serverdict as any)[device.Id]?.[0] ||
      (classdict as any)[device.Id]?.[1] ||
      device.Id

    const diskText = (() => {
      const total = device.DiskData.reduce(
        (acc, disk) => {
          acc.capacity += parseInt(String(disk.Capacity || 0))
          acc.total_space += parseInt(String(disk.Total_space || 0))
          return acc
        },
        { capacity: 0, total_space: 0 }
      )
      return ` ${total.capacity} / ${total.total_space}`
    })()

    categorizedData[group].push({
      no: categorizedData[group].length + 1,
      Device: deviceName,
      status: color,
      ip,
      cpu: `${Math.round(
        ((device.CpuData?.Number || 0) * (device.CpuData?.Utilization || 0)) /
          100
      )} / ${device.CpuData?.Number || 0}`,
      disk: diskText,
      MemoryData: `${Math.round(
        ((device.MemoryData?.Size || 0) *
          (device.MemoryData?.Utilization || 0)) /
          102400
      )} / ${Math.round((device.MemoryData?.Size || 0) / 1024)}`,
      Users: device.UserList?.length || 0,
      License:
        device.LicenseLogList?.reduce(
          (acc: number, log: LicenseLog) => acc + (log.Task || 0),
          0
        ) || 0,
    })
  })

  return categorizedData
})

function getOverallStatus(tableChunk: TableRow[]): TableRow["status"] {
  if (!tableChunk?.length) return "green"
  if (tableChunk.some(i => i.status === "red")) return "red"
  if (tableChunk.some(i => i.status === "yellow")) return "yellow"
  return "green"
}

function getLocation(ip: string): string {
  const iplast = parseInt(ip.split(".").pop() || "0")
  for (const key in someMapping.value) {
    if (key.includes("~")) {
      const keyhead = key.split(".").slice(0, 3).join(".") + "."
      if (ip.startsWith(keyhead)) {
        const [start, end] = key.split("~")
        const s = parseInt(start.split(".").pop() || "0")
        const e = parseInt(end.split(".").pop() || "0")
        if (iplast >= s && iplast <= e) return someMapping.value[key]
      }
    } else {
      if (ip.startsWith(key)) return someMapping.value[key]
    }
  }
  return "Unknown"
}

// Tooltip 行為（保留你原本的自訂 HTML 表格）
function moveTooltip(event: MouseEvent, row: TableRow) {
  const offset = 10
  tooltip.top = -9999
  tooltip.left = -9999
  tooltip.visible = true

  nextTick(() => {
    const tooltipEl = document.querySelector(".tooltip") as HTMLElement | null
    const tooltipHeight = (tooltipEl && tooltipEl.offsetHeight) || 150
    const windowHeight = window.innerHeight

    const shouldDisplayAbove =
      event.clientY + tooltipHeight + offset > windowHeight
    tooltip.top = shouldDisplayAbove
      ? event.clientY - tooltipHeight - offset
      : event.clientY + offset
    tooltip.left = event.clientX + offset
    tooltip.content = `
      <table class="listtooltip-table">
        <tr><td class="tooltd1">IP</td><td class="tooltd2">:</td><td class="tooltd3">${row.ip}</td></tr>
        <tr><td class="tooltd1">Device</td><td class="tooltd2">:</td><td class="tooltd3">${row.Device}</td></tr>
        <tr><td class="tooltd1">CPU</td><td class="tooltd2">:</td><td class="tooltd3">${row.cpu}</td></tr>
        <tr><td class="tooltd1">RAM</td><td class="tooltd2">:</td><td class="tooltd3">${row.MemoryData}</td></tr>
        <tr><td class="tooltd1">Disk</td><td class="tooltd2">:</td><td class="tooltd3">${row.disk}</td></tr>
        <tr><td class="tooltd1">Users</td><td class="tooltd2">:</td><td class="tooltd3">${row.Users}</td></tr>
        <tr><td class="tooltd1">License</td><td class="tooltd2">:</td><td class="tooltd3">${row.License}</td></tr>
      </table>
    `
  })
}
function hideTooltip() {
  tooltip.visible = false
}

// 取回 IP 對應名稱（容錯：支援回傳陣列或 axios response）
onMounted(async () => {
  try {
    const res = await apiGetList()
    console.log()
    const list: Array<{ ip: string; name: string }> = Array.isArray(res.data)
      ? res.data
      : []
    if (list.length) {
      someMapping.value = Object.fromEntries(
        list.map(({ ip, name }) => [ip, name])
      )
    }
  } catch (err) {
    // 這裡不阻塞畫面；若 CORS/網路錯誤，維持預設 someMapping
    console.error("API apiGetList error:", err)
  }
})
</script>
<style>
.listtooltip-table {
  width: 100%;
  table-layout: fixed; /* 這一行非常關鍵 */
  border-collapse: collapse;
  margin: 20px 0px 20px 0px;
}

.listtooltip-table td {
  color: white;
}
.tooltd1 {
  padding-left: 30px !important;
  width: 85px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltd2 {
  width: 50px; /* 冒號欄位寬度固定 */
  text-align: center;
}

.tooltd3 {
  text-align: left;
  white-space: normal;
  word-break: break-word;
}
</style>
<style scoped>
.tooltip {
  max-width: 280px;
  position: fixed;
  pointer-events: none;
  background-color: #222a35;
  color: #fff;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  white-space: normal;
  font-size: 14px;
  line-height: 1.5;
}

.status-icon {
  text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.9);
}
.server-name {
  text-align: left;
}
.server-card {
  background-color: #3b3b3b;
  color: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;

  /* 新增這兩行 */
  border: none;
  box-shadow: none;
}
.server-header {
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: flex-start; /* 讓內容靠左排列 */
  gap: 5px; /* 減少間距 */
}

.table-container {
  display: flex;
  flex-wrap: wrap; /* 新增這行讓區塊換行 */
  justify-content: flex-start;
  gap: 20px;
  padding: 10px;
  overflow-y: auto;
}

.table-wrapper {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 10px; /* 間隔值依需求調整 */
  height: auto !important; /* 移除固定高度 */
}

/* 左圓角 */
:deep(.v-table__wrapper thead th:first-child) {
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
}

/* 右圓角 */
:deep(.v-table__wrapper thead th:last-child) {
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
}
/* 控制表頭文字高度與 padding */
:deep(.v-table__wrapper thead th) {
  height: 28px !important; /* 整行高度 */
  padding-top: 4px !important; /* 上下 padding 小一點 */
  padding-bottom: 4px !important;
  line-height: 1.2 !important; /* 文字行高 */
  font-size: 14px !important; /* 文字大小 */
}
:deep(.v-table__wrapper tbody td) {
  height: 28px !important; /* 整行高度 */
  line-height: 1.2 !important; /* 文字行高 */
  font-size: 14px !important; /* 文字大小 */
}
:deep(.v-table__wrapper th),
:deep(.v-table__wrapper td) {
  border: none !important; /* 去除表線 */
}

:deep(.v-table__wrapper thead) {
  background-color: #666; /* 確保背景顏色 */
  height: 10px;
}

:deep(.v-table) {
  background-color: transparent !important;
  color: white !important;
}
</style>
