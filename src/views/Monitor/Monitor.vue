<template>
  <div class="monitor-container">
    <v-tabs v-model="tabNo" color="yellow" background-color="transparent" grow>
      <v-tab :value="0">{{ $t("monitor.matrix") }}</v-tab>
      <v-tab :value="1">{{ $t("monitor.User-matrix") }}</v-tab>
      <v-tab :value="2">{{ $t("monitor.gauge") }}</v-tab>
      <v-tab :value="3">{{ $t("monitor.List") }}</v-tab>

      <v-spacer></v-spacer>

      <v-btn class="ma-2" color="primary" @click="dialog = true">
        {{ $t("monitor.Filter") }}
      </v-btn>
      <v-btn class="ma-2" color="primary" @click="OverAllowedListLink">
        {{ $t("monitor.unnormaluse-list") }}
      </v-btn>
    </v-tabs>

    <v-window v-model="tabNo">
      <v-window-item :value="0">
        <MonitorMatrix2
          :rawData="filteredData"
          :rawLicensesList="rawLicensesList"
        />
      </v-window-item>
      <v-window-item :value="1">
        <MonitorMatrix
          :rawData="filteredData"
          :rawLicensesList="rawLicensesList"
        />
      </v-window-item>
      <v-window-item :value="2">
        <div v-for="(item, index) in rawData" :key="'mg' + index">
          <MonitorGauge :gauge="item" :i="index" />
        </div>
      </v-window-item>
      <v-window-item :value="3">
        <MonitorList :rawData="filteredData" />
      </v-window-item>
    </v-window>

    <v-dialog v-model="dialog" width="360">
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
              :items="['=', '>', '<', '>=', '<=', 'Not', 'Include']"
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
          <v-btn color="primary" @click="addCondition">
            + {{ $t("monitor.AddCondition") }}
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">{{ $t("monitor.Close") }}</v-btn>
          <v-btn color="primary" @click="applyFilter">
            {{ $t("monitor.Apply") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
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

const router = useRouter()
const store = useStore()

let hardwareMonitorTimer: number | undefined
let licenseMonitorTimer: number | undefined

const hardwareMonitorTimerPeriod = 2000
const licenseMonitorTimerPeriod = 10000

function getData(item: any, field: Condition["field"]) {
  switch (field) {
    case "CPU":
      if (item.CpuData.Number > 0) {
        return (
          Math.round((item.CpuData.Number * item.CpuData.Utilization) / 100) /
          item.CpuData.Number
        )
      }
      return 0

    case "RAM":
      if (item.MemoryData.Size > 0) {
        return (
          Math.round(
            (item.MemoryData.Size * item.MemoryData.Utilization) / 102400
          ) / Math.round(item.MemoryData.Size / 1024)
        )
      }
      return 0

    case "Disk": {
      const diskTemp = item.DiskData.reduce(
        (acc: { used: number; total: number }, x: any) => ({
          used: acc.used + x.Total_space - x.Capacity,
          total: acc.total + x.Total_space,
        }),
        { used: 0, total: 0 }
      )
      if (diskTemp.total > 0) {
        return Math.round(diskTemp.used) / Math.round(diskTemp.total)
      }
      return 0
    }

    case "Users":
      return item.UserList.length || 0

    default:
      console.warn(`Unknown field: ${field}`)
      return 0
  }
}

function checkCondition(item: any, conds: Condition[]) {
  return conds.every(({ field, operator, value }) => {
    const dataValue = getData(item, field)
    switch (operator) {
      case "=":
        return dataValue == value
      case ">":
        return dataValue > value
      case "<":
        return dataValue < value
      case ">=":
        return dataValue >= value
      case "<=":
        return dataValue <= value
      case "Not":
        return dataValue != value
      case "Include":
        return String(dataValue).includes(String(value))
      default:
        return true
    }
  })
}

function applyFilter() {
  filteredData.value = rawData.value.filter(item =>
    checkCondition(item, conditions.value)
  )
  dialog.value = false
}

function addCondition() {
  conditions.value.push({ field: "CPU", operator: "=", value: 0 })
}

function removeCondition(index: number) {
  conditions.value.splice(index, 1)
}

async function updateHardwareMonitor() {
  try {
    const res = await apiMonitorList()
    if (res.data) {
      rawData.value = res.data
      applyFilter()
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
    console.error(e)
  }
}

async function updateLicenseMonitor() {
  try {
    const res = await apiGetLicensesByIps()
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
  } catch (e) {
    console.error(e)
  }
}

function OverAllowedListLink() {
  router.push({ name: "Over Allowed List" })
}

onMounted(() => {
  store.dispatch("changeLoadingState", true)

  hardwareMonitorTimer = window.setInterval(
    updateHardwareMonitor,
    hardwareMonitorTimerPeriod
  )
  licenseMonitorTimer = window.setInterval(
    updateLicenseMonitor,
    licenseMonitorTimerPeriod
  )
})

onBeforeUnmount(() => {
  if (hardwareMonitorTimer) clearInterval(hardwareMonitorTimer)
  if (licenseMonitorTimer) clearInterval(licenseMonitorTimer)
})
</script>

<style scoped>
.monitor-container {
  width: 100%;
  margin: 0;
  padding: 0;
}
.monitor-tab {
  font-size: 20px;
}
/* 你可根據需求增加其它樣式 */
</style>
