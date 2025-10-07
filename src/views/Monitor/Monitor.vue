<template>
  <div class="monitor-container">
    <div class="monitor-header d-flex align-center justify-space-between">
      <v-tabs
        v-model="tabNo"
        color="yellow"
        background-color="transparent"
        grow
      >
        <v-tab :value="0">{{ $t("monitor.matrix") }}</v-tab>
        <v-tab :value="1">{{ $t("monitor.User-matrix") }}</v-tab>
        <v-tab :value="2">{{ $t("monitor.gauge") }}</v-tab>
        <v-tab :value="3">{{ $t("monitor.List") }}</v-tab>
      </v-tabs>

      <!-- ✅ 移出來但維持同一橫列 -->
      <div class="d-flex">
        <v-btn class="ma-2" color="primary" @click="dialog = true">
          {{ $t("monitor.Filter") }}
        </v-btn>
        <v-btn class="ma-2" color="primary" @click="OverAllowedListLink">
          {{ $t("monitor.unnormaluse-list") }}
        </v-btn>
      </div>
    </div>

    <!-- 添加key來強制重新渲染，防止組件狀態衝突 -->
    <v-window v-model="tabNo" :key="`window-${windowKey}`">
      <v-window-item :value="0" :key="`item-0-${windowKey}`">
        <MonitorMatrix2
          v-if="!isUnmounting && tabNo === 0"
          :rawData="filteredData"
          :rawLicensesList="rawLicensesList"
        />
      </v-window-item>

      <v-window-item :value="1" :key="`item-1-${windowKey}`">
        <MonitorMatrix
          v-if="!isUnmounting && tabNo === 1"
          :rawData="filteredData"
          :rawLicensesList="rawLicensesList"
        />
      </v-window-item>

      <v-window-item :value="2" :key="`item-2-${windowKey}`">
        <div v-if="!isUnmounting && tabNo === 2" class="gauge-container">
          <MonitorGauge
            v-for="(item, index) in rawData"
            :key="`mg-${item.Ip}-${index}-${windowKey}`"
            :gauge="item"
            :i="index"
          />
        </div>
      </v-window-item>

      <v-window-item :value="3" :key="`item-3-${windowKey}`">
        <MonitorList
          v-if="!isUnmounting && tabNo === 3"
          :rawData="filteredData"
        />
      </v-window-item>
    </v-window>
    <Teleport to="body">
      <v-dialog v-model="dialog" width="360" persistent>
        <v-card>
          <v-card-title>{{ $t("monitor.Filter") }}</v-card-title>
          <v-card-text>
            <div
              v-for="(cond, index) in conditions"
              :key="index"
              class="d-flex align-center mb-3"
            >
              <v-select
                v-model="cond.field"
                :items="['CPU', 'RAM', 'Disk', 'Users']"
                label="Field"
                dense
                outlined
                style="width: 100px"
              />
              <v-select
                v-model="cond.operator"
                :items="['<', '>', '=', '>=', '<=', 'Not', 'Include']"
                label="Operator"
                dense
                outlined
                style="width: 100px; margin-left: 8px"
              />
              <v-text-field
                v-model="cond.value"
                type="number"
                label="Value (%)"
                dense
                outlined
                style="width: 100px; margin-left: 8px"
              />
              <v-btn
                icon
                color="red"
                @click="removeCondition(index)"
                style="margin-left: 8px"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="addCondition"> + </v-btn>
            <v-btn text @click="dialog = false">
              {{ $t("account.close") }}
            </v-btn>
            <v-btn color="primary" @click="applyFilter">
              {{ $t("monitor.Filter") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, Teleport } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"

import MonitorGauge from "@/components/Monitor/MonitorGauge.vue"
import MonitorMatrix2 from "@/components/Monitor/MonitorMatrix_2.vue"
import MonitorMatrix from "@/components/Monitor/MonitorMatrix.vue"
import MonitorList from "@/components/Monitor/MonitorList.vue"

import { apiMonitorList, apiGetLicensesByIps } from "@/assets/ts/api"

interface Condition {
  field: "CPU" | "RAM" | "Disk" | "Users"
  operator: "=" | ">" | "<" | ">=" | "<=" | "Not" | "Include"
  value: number
}

const tabNo = ref(0)
const rawData = ref<any[]>([])
const rawLicensesList = ref<any[]>([])
const filteredData = ref<any[]>([])
const conditions = ref<Condition[]>([])
const dialog = ref(false)
const priority = new Map([
  ["192.168.33.112", 0],
  ["192.168.33.113", 1],
  ["192.168.33.114", 2],
  ["192.168.33.115", 3],
  ["192.168.33.116", 4],
  ["192.168.168.112", 5],
  ["192.168.168.113", 6],
])
// 添加狀態管理
const windowKey = ref(0)
const isUnmounting = ref(false)

const router = useRouter()
const store = useStore()

let hardwareMonitorTimer: number | undefined
let licenseMonitorTimer: number | undefined

const hardwareMonitorTimerPeriod = 2000
const licenseMonitorTimerPeriod = 10000

// 監聽標籤切換，強制重新渲染防止狀態衝突
watch(tabNo, async () => {
  if (isUnmounting.value) return

  try {
    // 增加windowKey來強制重新渲染VWindow
    windowKey.value++
    await nextTick()
  } catch (error) {
    console.warn("Tab change error:", error)
  }
})

function getData(item: any, field: Condition["field"]) {
  try {
    switch (field) {
      case "CPU":
        if (item?.CpuData?.Number > 0) {
          return (
            Math.round((item.CpuData.Number * item.CpuData.Utilization) / 100) /
            item.CpuData.Number
          )
        }
        return 0

      case "RAM":
        if (item?.MemoryData?.Size > 0) {
          return (
            Math.round(
              (item.MemoryData.Size * item.MemoryData.Utilization) / 102400
            ) / Math.round(item.MemoryData.Size / 1024)
          )
        }
        return 0

      case "Disk": {
        if (!item?.DiskData || !Array.isArray(item.DiskData)) return 0

        const diskTemp = item.DiskData.reduce(
          (acc: { used: number; total: number }, x: any) => {
            if (
              x &&
              typeof x.Total_space === "number" &&
              typeof x.Capacity === "number"
            ) {
              return {
                used: acc.used + x.Total_space - x.Capacity,
                total: acc.total + x.Total_space,
              }
            }
            return acc
          },
          { used: 0, total: 0 }
        )
        if (diskTemp.total > 0) {
          return Math.round(diskTemp.used) / Math.round(diskTemp.total)
        }
        return 0
      }

      case "Users":
        return item?.UserList?.length || 0

      default:
        console.warn(`Unknown field: ${field}`)
        return 0
    }
  } catch (error) {
    console.warn(`Error getting data for field ${field}:`, error)
    return 0
  }
}

function checkCondition(item: any, conds: Condition[]) {
  try {
    return conds.every(({ field, operator, value }) => {
      const dataValue = getData(item, field)
      switch (operator) {
        case "=":
          return dataValue == value
        case ">":
          return dataValue > value / 100
        case "<":
          return dataValue < value / 100
        case ">=":
          return dataValue >= value / 100
        case "<=":
          return dataValue <= value / 100
        case "Not":
          return dataValue != value / 100
        case "Include":
          return String(dataValue).includes(String(value / 100))
        default:
          return true
      }
    })
  } catch (error) {
    console.warn("Error checking condition:", error)
    return true
  }
}

function applyFilter() {
  if (isUnmounting.value) return

  try {
    const wasDialogOpen = dialog.value
    filteredData.value = rawData.value.filter(item =>
      checkCondition(item, conditions.value)
    )
    if (wasDialogOpen) {
      nextTick(() => {
        dialog.value = true
      })
    } else {
      dialog.value = false
    }
  } catch (error) {
    console.error("Error applying filter:", error)
  }
}

function addCondition() {
  if (isUnmounting.value) return
  conditions.value.push({ field: "CPU", operator: "=", value: 0 })
}

function removeCondition(index: number) {
  if (isUnmounting.value) return
  conditions.value.splice(index, 1)
}

async function updateHardwareMonitor() {
  if (isUnmounting.value) return

  try {
    // 保存 dialog 狀態
    const wasDialogOpen = dialog.value
    const res = await apiMonitorList()
    if (res.data && !isUnmounting.value) {
      // 排序
      rawData.value = res.data.sort((a, b) => {
        const ia = priority.get(a.Ip)
        const ib = priority.get(b.Ip)
        if (ia !== undefined && ib !== undefined) return ia - ib
        if (ia !== undefined) return -1
        if (ib !== undefined) return 1

        return 0 // 兩個都不在 priority，保持原順序 (或額外加排序規則)
      })

      // 只有在 dialog 關閉時才自動應用篩選
      if (!wasDialogOpen) {
        applyFilter()
      } else {
        filteredData.value = rawData.value.filter(item =>
          checkCondition(item, conditions.value)
        )
      }

      store.dispatch(
        "setDeviceIpList",
        res.data.map((item: any) => ({
          ip: item.Ip,
          id: item.Id,
        }))
      )
      store.dispatch("changeLoadingState", false)
    }
  } catch (e) {
    if (!isUnmounting.value) {
      console.error(e)
    }
  }
}

async function updateLicenseMonitor() {
  if (isUnmounting.value) return

  try {
    const res = await apiGetLicensesByIps()
    if (!isUnmounting.value) {
      rawLicensesList.value = res.data.map((item: any) => ({
        Ip: item.ip,
        LicenseList: item.licenses,
      }))
      const check = JSON.parse(sessionStorage.getItem("deviceIpList") || "null")
      if (
        check &&
        !check.some((item: any) => item.hasOwnProperty("totalLicense"))
      ) {
        store.dispatch(
          "setDeviceIpList",
          rawData.value.map((item: any) => {
            const temp = res.data.find((d: any) => d.ip === item.Ip)
            return {
              ip: item.Ip,
              id: item.Id,
              totalLicense: temp
                ? temp.licenses.reduce(
                    (acc: number, obj: any) => acc + obj.Issued,
                    0
                  )
                : null,
              licenses: temp ? temp.licenses : [],
            }
          })
        )
      }
    }
  } catch (e) {
    if (!isUnmounting.value) {
      console.error(e)
    }
  }
}

function OverAllowedListLink() {
  if (isUnmounting.value) return
  router.push({ name: "Over Allowed List" })
}

onMounted(async () => {
  try {
    store.dispatch("changeLoadingState", true)

    hardwareMonitorTimer = window.setInterval(
      updateHardwareMonitor,
      hardwareMonitorTimerPeriod
    )
    licenseMonitorTimer = window.setInterval(
      updateLicenseMonitor,
      licenseMonitorTimerPeriod
    )

    // 初始加載數據
    await updateHardwareMonitor()
    await updateLicenseMonitor()
  } catch (error) {
    console.error("Mount error:", error)
  }
})

onBeforeUnmount(() => {
  isUnmounting.value = true

  // 清理定時器
  if (hardwareMonitorTimer) {
    clearInterval(hardwareMonitorTimer)
    licenseMonitorTimer = undefined
  }
  if (licenseMonitorTimer) {
    clearInterval(licenseMonitorTimer)
    licenseMonitorTimer = undefined
  }
})
</script>

<style scoped>
.v-tab,
.v-btn {
  text-transform: none !important;
}
.monitor-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.gauge-container {
  width: 100%;
}

.monitor-tab {
  font-size: 20px;
}
</style>
