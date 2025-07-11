<template>
  <v-container fluid class="monitor-matrix">
    <v-row class="table-container" no-gutters>
      <v-col
        v-for="(tableChunk, location) in splitTables"
        :key="location"
        cols="12"
        md="4"
        lg="3"
        class="table-wrapper"
      >
        <!-- 卡片顯示主要資訊 -->
        <v-card class="server-card">
          <v-card-text class="server-header">
            <div class="server-status">
              <span v-if="getOverallStatus(tableChunk) === 'green'">🟢</span>
              <span v-else-if="getOverallStatus(tableChunk) === 'yellow'"
                >🟡</span
              >
              <span v-else-if="getOverallStatus(tableChunk) === 'red'">🔴</span>
              <span v-else>⚠️</span>
            </div>
            <div class="server-name">{{ location }}</div>
          </v-card-text>
        </v-card>

        <!-- 表格顯示詳細資訊 -->
        <v-data-table
          :items="tableChunk"
          class="elevation-1 white--text"
          hide-default-footer
          :headers="headers"
          item-value="no"
          density="compact"
        >
          <template #item.status="{ item }">
            <span v-if="item.status === 'green'">🟢</span>
            <span v-else-if="item.status === 'yellow'">🟡</span>
            <span v-else-if="item.status === 'red'">🔴</span>
            <span v-else-if="item.status === 'alert'">⚠️</span>
          </template>

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
      </v-col>
    </v-row>
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="tooltipStyle"
      v-html="tooltip.content"
    ></div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
import { apiGetList } from "@/assets/ts/api"
import { classdict, serverdict } from "@/assets/ts/classdict"
import type { CSSProperties } from "vue"

const tooltip = ref({
  visible: false,
  top: 0,
  left: 0,
  content: "",
})

const tooltipStyle = computed<CSSProperties>(() => ({
  top: `${tooltip.value.top}px`,
  left: `${tooltip.value.left}px`,
  position: "fixed",
  display: tooltip.value.visible ? "block" : "none",
  padding: "8px 12px",
  border: "1px solid",
  borderRadius: "5px",
  boxShadow: "0 2px 6px",
  zIndex: "9999",
  pointerEvents: "none",
  whiteSpace: "pre-line",
  fontSize: "14px",
  lineHeight: "1.5",
}))
export interface RawDeviceData {
  ip: string
  cpu: string
  ram: string
  gpu: string
  username: string
  updateTime: string
  [key: string]: any // 為了容錯，可保留索引簽名
}
export type StatusType = "green" | "yellow" | "red" | "alert"

export interface TableRow {
  no: number
  Device: string
  status: StatusType
  ip: string
  cpu: string
  disk: string
  MemoryData: string
  Users: number
  License: number
}

const props = defineProps<{ rawData: RawDeviceData[] }>()
const router = useRouter()

const someMapping = ref<Record<string, string>>({})

const headers = [
  { text: "No", value: "no" },
  { text: "Status", value: "status" },
  { text: "IP", value: "ip" },
]

const getLocation = (ip: string): string => {
  const ipLast = parseInt(ip.split(".").pop() || "0")
  for (const key in someMapping.value) {
    if (key.includes("~")) {
      const keyHead = key.split(".").slice(0, 3).join(".") + "."
      if (ip.startsWith(keyHead)) {
        const [start, end] = key.split("~")
        const startLast = parseInt(start.split(".").pop() || "0")
        const endLast = parseInt(end.split(".").pop() || "0")
        if (ipLast >= startLast && ipLast <= endLast)
          return someMapping.value[key]
      }
    } else if (ip.startsWith(key)) return someMapping.value[key]
  }
  return "Unknown"
}

const splitTables = computed<Record<string, TableRow[]>>(() => {
  if (!Array.isArray(props.rawData)) return {}
  const sortedData = [...props.rawData].sort((a, b) => {
    const ipA = a.Ip.split(".").map(Number)
    const ipB = b.Ip.split(".").map(Number)
    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) return ipA[i] - ipB[i]
    }
    return 0
  })

  const categorizedData: Record<string, TableRow[]> = { server: [] }

  for (const device of sortedData) {
    const ip = device.Ip
    const location = getLocation(ip)

    if (!categorizedData[location]) categorizedData[location] = []

    const capacitySum = Math.round(
      device.DiskData.reduce((acc, x) => acc + x.Total_space * x.Utilization, 0)
    )
    const totalSum = device.DiskData.reduce((sum, d) => sum + d.Total_space, 0)

    const maxValue = Math.max(
      device.CpuData.Utilization / 100,
      capacitySum / totalSum,
      device.MemoryData.Utilization / 100
    )

    const color = maxValue > 0.7 ? "red" : maxValue > 0.4 ? "yellow" : "green"

    const deviceName =
      serverdict[device.Id]?.[0] || classdict[device.Id]?.[1] || device.Id

    categorizedData[location].push({
      no: categorizedData[location].length + 1,
      Device: deviceName,
      status: color,
      ip,
      cpu: `${Math.round(
        (device.CpuData.Number * device.CpuData.Utilization) / 100
      )} / ${device.CpuData.Number}`,
      disk: `${device.DiskData.reduce(
        (a, d) => a + d.Capacity,
        0
      )} / ${device.DiskData.reduce((a, d) => a + d.Total_space, 0)}`,
      MemoryData: `${Math.round(
        (device.MemoryData.Size * device.MemoryData.Utilization) / 102400
      )} / ${Math.round(device.MemoryData.Size / 1024)}`,
      Users: device.UserList.length,
      License: device.LicenseLogList.reduce(
        (acc, log) => acc + (log.Task || 0),
        0
      ),
    })
  }
  return categorizedData
})

const moveTooltip = (event: MouseEvent, row: TableRow) => {
  const offset = 10
  tooltip.value.visible = true
  nextTick(() => {
    const tooltipHeight = 150
    const windowHeight = window.innerHeight
    const shouldDisplayAbove =
      event.clientY + tooltipHeight + offset > windowHeight
    tooltip.value.top = shouldDisplayAbove
      ? event.clientY - tooltipHeight - offset
      : event.clientY + offset
    tooltip.value.left = event.clientX + offset
    tooltip.value.content = `
      <table class="listtooltip-table">
        <tr><td class="tooltd1">IP</td><td class="tooltd2">:</td><td class="tooltd3">${row.ip}</td></tr>
        <tr><td class="tooltd1">Device</td><td class="tooltd2">:</td><td class="tooltd3">${row.Device}</td></tr>
        <tr><td class="tooltd1">CPU</td><td class="tooltd2">:</td><td class="tooltd3">${row.cpu}</td></tr>
        <tr><td class="tooltd1">RAM</td><td class="tooltd2">:</td><td class="tooltd3">${row.MemoryData}</td></tr>
        <tr><td class="tooltd1">Disk</td><td class="tooltd2">:</td><td class="tooltd3">${row.disk}</td></tr>
        <tr><td class="tooltd1">Users</td><td class="tooltd2">:</td><td class="tooltd3">${row.Users}</td></tr>
        <tr><td class="tooltd1">License</td><td class="tooltd2">:</td><td class="tooltd3">${row.License}</td></tr>
      </table>`
  })
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

const getOverallStatus = (chunk: TableRow[]) => {
  if (!chunk.length) return "green"
  if (chunk.some(item => item.status === "red")) return "red"
  if (chunk.some(item => item.status === "yellow")) return "yellow"
  return "green"
}

apiGetList()
  .then(response => {
    if (response.data) {
      someMapping.value = Object.fromEntries(
        response.data.map(({ ip, name }: any) => [ip, name])
      )
    }
  })
  .catch(console.error)
</script>

<style scoped>
.monitor-matrix {
  background-color: #1e1e1e;
  color: white;
}
.server-card {
  background-color: #3b3b3b;
  color: white;
  margin-bottom: 10px;
}
.server-status {
  font-size: 40px;
  margin-right: 10px;
  display: flex;
  align-items: center;
}
.server-name {
  font-size: 18px;
  display: flex;
  align-items: center;
}
.tooltip {
  max-width: 300px;
  background-color: #222a35;
  color: #fff;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  white-space: normal;
  font-size: 14px;
  line-height: 1.5;
}
</style>
