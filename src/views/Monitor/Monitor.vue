<template>
  <div class="monitor-container">
    <v-tabs v-model="tabNo" color="primary" grow>
      <v-tab>{{ $t("monitor.matrix") }}</v-tab>
      <v-tab>{{ $t("monitor.User-matrix") }}</v-tab>
      <v-tab>{{ $t("monitor.gauge") }}</v-tab>
      <v-tab>{{ $t("monitor.List") }}</v-tab>

      <v-btn class="Over-Allowed-List-button" @click="opendialog">
        {{ $t("monitor.Filter") }}
      </v-btn>
      <v-btn class="Over-Allowed-List-button" @click="OverAllowedListLink">
        {{ $t("monitor.unnormaluse-list") }}
      </v-btn>
    </v-tabs>

    <v-window v-model="tabNo" class="mt-4">
      <v-window-item :value="0">
        <MonitorMatrix
          :rawData="filteredData"
          :rawLicensesList="rawLicensesList"
        />
      </v-window-item>
      <v-window-item :value="1">
        <UserMonitorMatrix
          :rawData="filteredData"
          :rawLicensesList="rawLicensesList"
        />
      </v-window-item>
      <v-window-item :value="2">
        <MonitorGauge
          v-for="(item, index) in rawData"
          :key="'mg' + index"
          :gauge="item"
          :i="index"
        />
      </v-window-item>
      <v-window-item :value="3">
        <MonitorList :rawData="filteredData" />
      </v-window-item>
    </v-window>

    <!-- Dialog -->
    <div v-if="dialog" class="dialog-container">
      <div id="dialog-content"></div>
      <br />
      <v-btn class="dialog-button" @click="addDialog">+</v-btn>
      <v-btn class="dialog-button" @click="filterdata">{{
        $t("monitor.Filter")
      }}</v-btn>
      <v-btn class="dialog-button" @click="closeDialog">close</v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import MonitorGauge from "@/components/Monitor/MonitorGauge.vue"
import MonitorMatrix2 from "@/components/Monitor/MonitorMatrix_2.vue"
import MonitorMatrix from "@/components/Monitor/MonitorMatrix.vue"
import MonitorList from "@/components/Monitor/MonitorList.vue"
import { apiMonitorList, apiGetLicensesByIps } from "@/assets/ts/api"

interface Condition {
  field: string
  operator: string
  value: number
}

const tabNo = ref<number>(0)
const rawData = ref<any[]>([])
const rawLicensesList = ref<any[]>([])
const filteredData = ref<any[]>([])
const conditions = ref<Condition[]>([])
const dialog = ref(false)
const store = useStore()
const router = useRouter()

let hardwareMonitorTimer: number
let licenseMonitorTimer: number
const hardwareMonitorTimerPeriod = 2000
const licenseMonitorTimerPeriod = 10000

onMounted(() => {
  store.dispatch("changeLoadingState", true)
  updateHardwareMonitor()
  updateLicenseMonitor()
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
  clearInterval(hardwareMonitorTimer)
  clearInterval(licenseMonitorTimer)
})

function getData(item: any, field: string): number {
  switch (field) {
    case "CPU":
      return item.CpuData.Number > 0
        ? (item.CpuData.Number * item.CpuData.Utilization) /
            100 /
            item.CpuData.Number
        : 0
    case "RAM":
      return item.MemoryData.Size > 0
        ? (item.MemoryData.Size * item.MemoryData.Utilization) /
            102400 /
            (item.MemoryData.Size / 1024)
        : 0
    case "Disk": {
      const diskTemp = item.DiskData.reduce(
        (acc: any, x: any) => ({
          used: acc.used + x.Total_space - x.Capacity,
          total: acc.total + x.Total_space,
        }),
        { used: 0, total: 0 }
      )
      return diskTemp.total > 0 ? diskTemp.used / diskTemp.total : 0
    }
    case "Users":
      return item.UserList?.length || 0
    default:
      console.warn(`Unknown field: ${field}`)
      return 0
  }
}

function checkCondition(item: any, conditions: Condition[]) {
  return conditions.every(({ field, operator, value }) => {
    const dataValue = getData(item, field)
    switch (operator) {
      case "=":
        return dataValue === value
      case ">":
        return dataValue > value
      case "<":
        return dataValue < value
      case ">=":
        return dataValue >= value
      case "<=":
        return dataValue <= value
      case "Not":
        return dataValue !== value
      case "Include":
        return String(dataValue).includes(String(value))
      default:
        return true
    }
  })
}

function updateHardwareMonitor() {
  apiMonitorList()
    .then(res => {
      if (res.data) {
        rawData.value = res.data
        filteredData.value = res.data.filter(item =>
          checkCondition(item, conditions.value)
        )
        store.dispatch(
          "setDeviceIpList",
          res.data.map((item: any) => ({ ip: item.Ip, id: item.Id }))
        )
        store.dispatch("changeLoadingState", false)
      }
    })
    .catch(console.error)
}

function updateLicenseMonitor() {
  apiGetLicensesByIps()
    .then(res => {
      rawLicensesList.value = res.data.map((item: any) => ({
        Ip: item.ip,
        LicenseList: item.licenses,
      }))

      const check = JSON.parse(sessionStorage.getItem("deviceIpList") || "[]")
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
    })
    .catch(console.error)
}

function filterdata() {
  const dialogContent = document.getElementById("dialog-content")!
  const fields = dialogContent.querySelectorAll<HTMLSelectElement>(".field")
  const operators =
    dialogContent.querySelectorAll<HTMLSelectElement>(".operator")
  const values = dialogContent.querySelectorAll<HTMLInputElement>(".value")

  conditions.value = Array.from(fields).map((field, i) => ({
    field: field.value,
    operator: operators[i].value,
    value: parseFloat(values[i].value) / 100 || 0,
  }))

  filteredData.value = rawData.value.filter(item =>
    checkCondition(item, conditions.value)
  )
}

function addDialog(field = "CPU", operator = "=", value = "") {
  const dialogContent = document.getElementById("dialog-content")!
  const row = document.createElement("div")
  row.classList.add("row")
  row.innerHTML = `
    <select class="field">
      <option value="CPU" ${field === "CPU" ? "selected" : ""}>CPU</option>
      <option value="RAM" ${field === "RAM" ? "selected" : ""}>RAM</option>
      <option value="Disk" ${field === "Disk" ? "selected" : ""}>Disk</option>
      <option value="Users" ${
        field === "Users" ? "selected" : ""
      }>Users</option>
    </select>
    <select class="operator">
      <option value="=">=</option>
      <option value=">">></option>
      <option value="<"><</option>
      <option value=">=">>=</option>
      <option value="<="><=</option>
      <option value="Not">Not</option>
      <option value="Include">Include</option>
    </select>
    <input type="text" class="value" value="${value}" /> <span>%</span>
    <button>X</button>
  `
  row
    .querySelector("button")!
    .addEventListener("click", () => dialogContent.removeChild(row))
  dialogContent.appendChild(row)
}

function opendialog() {
  dialog.value = true
  const dialogContent = document.getElementById("dialog-content")!
  dialogContent.innerHTML = ""
  conditions.value.forEach(c =>
    addDialog(c.field, c.operator, (c.value * 100).toString())
  )
}

function closeDialog() {
  dialog.value = false
}

function OverAllowedListLink() {
  router.push({ name: "Over Allowed List" })
}
</script>

<style scoped>
.dialog-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.dialog-button {
  margin: 5px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}
.monitor-container {
  padding: 0;
  width: 100%;
}
.Over-Allowed-List-button {
  margin-left: auto;
  margin-right: 10px;
  color: white;
  font-size: large;
  background-color: rgba(49, 99, 142, 0.6);
  border-radius: 20px;
  padding: 4px 14px;
  border: 1px solid #aaa;
}
</style>
