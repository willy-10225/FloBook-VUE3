<template>
  <v-container fluid class="monitor-matrix">
    <!-- Header -->
    <v-row class="matrix-header" no-gutters>
      <v-col cols="12" md="3" class="header-cell" @click="sortMatrix('ip')"
        >Devices</v-col
      >
      <v-col cols="2" class="header-cell" @click="sortMatrix('CPU')"
        >CPU (Core)</v-col
      >
      <v-col cols="2" class="header-cell" @click="sortMatrix('RAM')"
        >RAM (GB)</v-col
      >
      <v-col cols="2" class="header-cell" @click="sortMatrix('Disk')"
        >Disk (GB)</v-col
      >
      <v-col cols="2" class="header-cell" @click="sortMatrix('Users')"
        >Users</v-col
      >
      <v-col cols="2" class="header-cell" @click="sortMatrix('Duty Licenses')"
        >Duty Licenses</v-col
      >
    </v-row>

    <!-- Rows -->
    <v-row
      v-for="(item, index) in matrixData"
      :key="item.ip || index"
      class="matrix-row"
      no-gutters
      @click="redirectToDetail(item.ip)"
      style="cursor: pointer"
    >
      <!-- Device Label -->
      <v-col cols="12" md="3" class="matrix-block label-block">
        <div v-html="item.label"></div>
      </v-col>

      <!-- CPU -->
      <v-col
        cols="2"
        :class="getBlockColor(item.cpu)"
        @mousemove="e => moveTooltip(e, item, 'cpu')"
        @mouseleave="hideTooltip"
      >
        {{ item.cpu }}
      </v-col>
      <span
        class="tooltip"
        v-show="tooltip.visible"
        :style="{
          position: 'absolute',
          top: tooltip.y + 'px',
          left: tooltip.x + 'px',
          zIndex: 9999,
        }"
      >
        <table class="tooltip-table" v-if="tooltip.users.length > 0">
          <tbody>
            <tr v-for="(i, index) in tooltip.users" :key="'cpu' + index">
              <td class="dot-cell">
                <v-icon size="10" :color="colorFromIndex(index)" class="me-2"
                  >mdi-circle</v-icon
                >
              </td>
              <td class="tooltip-ctd">{{ i.user }}</td>
              <td class="user-ram-cell">
                {{ i.value }}
              </td>
            </tr>
          </tbody>
        </table>
        <span v-else>{{ $t("common.no-data") }}</span>
      </span>
      <!-- RAM -->
      <v-col
        cols="2"
        :class="getBlockColor(item.ram)"
        @mousemove="e => moveTooltip(e, item, 'ram')"
        @mouseleave="hideTooltip"
      >
        {{ item.ram }}
      </v-col>

      <!-- Disk -->
      <v-col
        cols="2"
        :class="getBlockColor(item.disk)"
        @mousemove="e => moveTooltip(e, item, 'disk')"
        @mouseleave="hideTooltip"
      >
        {{ item.disk }}
      </v-col>

      <!-- Users -->
      <v-col
        cols="2"
        class="normal-block"
        @mousemove="e => moveTooltip(e, item, 'users')"
        @mouseleave="hideTooltip"
      >
        {{ item.userNum }}
      </v-col>

      <!-- Duty Licenses -->
      <v-col
        cols="2"
        class="unable-block"
        @mousemove="e => moveTooltip(e, item, 'licenses')"
        @mouseleave="hideTooltip"
      >
        {{ item.licenseNum }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  watch,
  ref,
  reactive,
  toRefs,
  computed,
} from "vue"
import { useStore } from "vuex"
import Color from "@/assets/ts/color-palette"
import { classdict, serverdict } from "@/assets/ts/classdict"
import { useRouter } from "vue-router"

interface UserCpuRam {
  user: string
  cpu: number
  ram: number
}

interface DiskData {
  Name: string
  Capacity: number
  Total_space: number
  Utilization?: number
}

interface DeviceData {
  Ip: string
  Id: string
  CpuData: {
    Number: number
    Utilization: number
  }
  MemoryData: {
    Size: number
    Utilization: number
  }
  DiskData: DiskData[]
  UserList: UserCpuRam[]
}

interface LicenseData {
  Ip: string
  LicenseList: {
    Feature: string
    Use: number
    Issued: number
  }[]
}

interface MatrixItem {
  ip: string
  cpu: string
  cpusort: number
  cpuDenominator: number
  ram: string
  ramsort: number
  ramDenominator: number
  disk: string
  disksort: number
  diskCapacity: string[]
  disklen: number
  diskUsespace: number[]
  diskTotalspace: number[]
  userNum: number
  userCPU: UserCpuRam[]
  userRAM: UserCpuRam[]
  label: string
  licenseNum?: number
  licenseList?: string[]
  FeatureList?: string[]
}
// 假設 userCPU 的型別如下，你可以依實際調整
// 假設 layout 在 store 裡

interface UserCpu {
  user: string
  cpu?: number
  ram?: number
  value: string
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  users: UserCpu[]
}

export default defineComponent({
  name: "MonitorMatrix2",
  props: {
    rawData: {
      type: Array as PropType<DeviceData[]>,
      required: true,
    },
    rawLicensesList: {
      type: Array as PropType<LicenseData[]>,
      required: false,
    },
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    // tooltip 狀態用 reactive
    const tooltip = reactive<TooltipState>({
      visible: false,
      x: 0,
      y: 0,
      users: [] as { user: string; value: string }[],
    })
    const sortOrder = ref<"asc" | "dsc">("asc")
    const sortBy = ref<string>("")
    const matrixData = ref<MatrixItem[]>([
      {
        ip: "",
        cpu: "Loading...",
        cpusort: 0,
        cpuDenominator: 0,
        ram: "Loading...",
        ramsort: 0,
        ramDenominator: 0,
        disk: "Loading...",
        disksort: 0,
        diskCapacity: [],
        disklen: 0,
        diskUsespace: [],
        diskTotalspace: [],
        userNum: 0,
        userCPU: [],
        userRAM: [],
        label: "Loading...",
      },
    ])

    const layout = computed(() => store.getters.layout)
    const flobookLicense = computed(() => store.getters.flobookLicense)
    const dataLoading = computed(
      () => store.getters["common/dataLoading"] || "Loading..."
    )

    function moveTooltip(e: MouseEvent, items: MatrixItem, type: string) {
      console.log("moveTooltip", items)
      const margin = 10
      const tooltipWidth = 220
      const tooltipHeight = 160

      let x = e.clientX
      let y = e.clientY + window.scrollY + 10

      if (x + tooltipWidth + margin > window.innerWidth) {
        x = window.innerWidth - tooltipWidth - margin
      }
      if (x < margin) x = margin

      if (y + tooltipHeight > window.innerHeight + window.scrollY) {
        y = e.clientY + window.scrollY - tooltipHeight - 10
        if (y < window.scrollY + margin) y = window.scrollY + margin
      }
      if (type === "cpu") {
        tooltip.users = items.userCPU.map((e, i) => {
          return {
            user: e.user,
            value:
              Math.round((e.cpu / 100) * items.cpuDenominator).toString() +
              " Core",
          }
        })
      } else if (type === "ram") {
        tooltip.users = items.userRAM.map((e, i) => {
          return {
            user: e.user,
            value:
              Math.round((e.ram / 100) * items.ramDenominator).toString() +
              " GB",
          }
        })
      } else if (type === "disk") {
        tooltip.users = items.diskCapacity.map((e, i) => {
          return {
            user: e,
            value:
              items.diskUsespace[i].toString() +
              "/" +
              items.diskTotalspace[i].toString() +
              " (GB)",
          }
        })
      } else if (type === "users") {
        tooltip.users = items.userCPU.map((e, i) => {
          return {
            user: e.user,
            value: e.cpu > 0 ? "running" : "idle",
          }
        })
      } else if (type === "licenses") {
        tooltip.users = (items?.FeatureList ?? []).map((e, i) => {
          return {
            user: e,
            value: items?.licenseList?.[i] ?? "N/A",
            cpu: undefined, // 可選填，或填 0
            ram: undefined, // 可選填，或填 0
          }
        })
      }

      tooltip.x = x
      tooltip.y = y - 90
      tooltip.visible = true
    }

    function hideTooltip() {
      tooltip.visible = false
    }
    // Helper function to round number to decimals
    function round(value: number, decimals: number): number {
      const factor = Math.pow(10, decimals)
      return Math.round(value * factor) / factor
    }

    // Update matrixData based on rawData and rawLicensesList
    function updateMatrix() {
      if (!props.rawData) return

      const newData = props.rawData.map(device => {
        try {
          const diskTemp = device.DiskData.reduce(
            (acc, x) => ({
              used: acc.used + (x.Total_space - x.Capacity),
              total: acc.total + x.Total_space,
            }),
            { used: 0, total: 0 }
          )

          let labelStr = device.Id
          if (serverdict[device.Id]) {
            labelStr = serverdict[device.Id][0] + "<br>" + device.Id
          } else if (classdict[device.Id]) {
            labelStr = classdict[device.Id][1] + "<br>" + device.Id
          }

          return {
            ip: device.Ip,
            label: labelStr.replace("192.168", "*"),
            cpuDenominator: device.CpuData.Number,
            cpu:
              Math.round(
                (device.CpuData.Number * device.CpuData.Utilization) / 100
              ) +
              " / " +
              device.CpuData.Number,
            cpusort: Math.round(device.CpuData.Utilization),
            ramDenominator: Math.round(device.MemoryData.Size / 1024),
            ram:
              Math.round(
                (device.MemoryData.Size * device.MemoryData.Utilization) /
                  102400
              ) +
              " / " +
              Math.round(device.MemoryData.Size / 1024),
            ramsort: Math.round(device.MemoryData.Utilization),
            disk:
              Math.round(diskTemp.used) + " / " + Math.round(diskTemp.total),
            disksort:
              diskTemp.total > 0
                ? Math.round((diskTemp.used / diskTemp.total) * 100)
                : 0,
            diskCapacity: device.DiskData.map(x => x.Name + ":"),
            disklen: device.DiskData.length,
            diskUsespace: device.DiskData.map(x =>
              round(x.Total_space - x.Capacity, 0)
            ),
            diskTotalspace: device.DiskData.map(x => round(x.Total_space, 0)),
            userNum: device.UserList.length,
            userCPU: device.UserList.map(x => ({
              user: x.user,
              cpu: round(x.cpu || 0, 2),
            })).sort((a, b) => {
              if (a.user === "System") return -1
              if (b.user === "System") return 1
              return (b.cpu || 0) - (a.cpu || 0)
            }),
            userRAM: device.UserList.map(x => ({
              user: x.user,
              ram: round(x.ram || 0, 2),
            })).sort((a, b) => {
              if (a.user === "System") return -1
              if (b.user === "System") return 1
              return (b.ram || 0) - (a.ram || 0)
            }),
          } as MatrixItem
        } catch (error) {
          return {
            ip: device.Ip,
            label: device.Id,
            cpuDenominator: 0,
            cpu: "0",
            cpusort: 0,
            ramDenominator: 0,
            ram: "0",
            ramsort: 0,
            disk: "0",
            disksort: 0,
            diskCapacity: device.DiskData.map(
              x => x.Name + ":" + round(x.Capacity, 0)
            ),
            disklen: 0,
            diskUsespace: [],
            diskTotalspace: device.DiskData.map(x => round(x.Total_space, 0)),
            userNum: 0,
            userCPU: [],
            userRAM: [],
          }
        }
      })
      matrixData.value = newData

      if (props.rawLicensesList) {
        const licenseData = props.rawLicensesList.map(device => {
          const filtered = device.LicenseList.filter(item => item.Use > 0)
          return {
            ip: device.Ip,
            licenseNum: filtered.reduce((acc, x) => acc + x.Use, 0),
            licenseList: filtered.map(x => `${x.Use}/${x.Issued}`),
            FeatureList: filtered.map(x => x.Feature),
          }
        })

        // Merge license info into matrixData
        licenseData.forEach(licenseItem => {
          const target = matrixData.value.find(
            item => item.ip === licenseItem.ip
          )
          if (target) {
            Object.assign(target, licenseItem)
          }
        })
      }

      restrictDeviceNumber()
      if (sortBy.value) sortMatrix(sortBy.value)
    }

    // Color class generator based on value string like "30 / 100"
    function getBlockColor(value: string) {
      if (typeof value !== "string" || !value.includes("/")) {
        return "normal-block"
      }
      const parts = value.split("/")
      if (parts.length !== 2) {
        return "normal-block"
      }
      const numerator = parseFloat(parts[0].trim())
      const denominator = parseFloat(parts[1].trim())
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        return "normal-block"
      }
      const percent = (numerator / denominator) * 100
      if (percent > 0 && percent <= 40) return "normal-block"
      if (percent > 40 && percent <= 70) return "warn-block"
      if (percent > 70) return "error-block"
      return "unable-block"
    }

    // Color string from index for dot icon
    function colorFromIndex(index: number): string {
      return Color[index % Color.length] || "grey"
    }

    // Navigation to detail page
    function redirectToDetail(ip: string) {
      router.push({ name: "MonitorDetail", params: { ip } })
    }

    // Sorting function
    function sortMatrix(option: string) {
      if (sortBy.value === option) {
        // toggle sort order
        sortOrder.value = sortOrder.value === "asc" ? "dsc" : "asc"
      } else {
        sortBy.value = option
        sortOrder.value = "asc"
      }

      const order = sortOrder.value === "asc" ? 1 : -1

      matrixData.value.sort((a, b) => {
        switch (option) {
          case "CPU":
            return (a.cpusort - b.cpusort) * order
          case "RAM":
            return (a.ramsort - b.ramsort) * order
          case "Disk":
            return (a.disksort - b.disksort) * order
          case "Users":
            return (a.userNum - b.userNum) * order
          case "Duty Licenses":
            return ((a.licenseNum || 0) - (b.licenseNum || 0)) * order
          default:
            const aLabel = a.label.replace("TC", "1").replace("TP", "0")
            const bLabel = b.label.replace("TC", "1").replace("TP", "0")
            if (aLabel > bLabel) return 1 * order
            if (aLabel < bLabel) return -1 * order
            return 0
        }
      })
    }

    // Limit device number based on license
    function restrictDeviceNumber() {
      if (flobookLicense.value?.HasMonitor) {
        const license = flobookLicense.value.MonitorData
        const totalDevices = license.SC + license.SU + license.PC + license.PU
        if (matrixData.value.length > totalDevices) {
          matrixData.value.splice(totalDevices)
        }
      } else if (flobookLicense.value?.HasLight) {
        // no limit or very high limit
      }
    }

    // Watchers
    watch(
      () => props.rawData,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          updateMatrix()
        }
      },
      { deep: true, immediate: true }
    )

    watch(
      () => props.rawLicensesList,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          updateMatrix()
        }
      },
      { immediate: true }
    )

    return {
      matrixData,
      sortOrder,
      sortBy,
      dataLoading,
      layout,
      flobookLicense,
      tooltip,
      moveTooltip,
      hideTooltip,
      getBlockColor,
      redirectToDetail,
      sortMatrix,
      colorFromIndex,
    }
  },
})
</script>

<style scoped>
.custom-tooltip-table {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  padding: 4px;
}

.custom-tooltip-table tr {
  line-height: 1.1;
  height: 22px;
}

.custom-tooltip-table td {
  padding: 2px 4px !important;
  vertical-align: middle;
}

.icon-small {
  font-size: 14px;
  margin-right: 2px;
}

.text-small {
  font-size: 12px;
}
.custom-tooltip {
  position: absolute;
  padding: 10px;
  pointer-events: none; /* 讓滑鼠事件穿透，不阻擋 */
  max-width: 300px;
}
.v-col {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.tooltip-ctd {
  text-align: left;
  padding-right: 10px; /* 增加右侧内边距 */
}
.monitor-matrix {
  margin: 20px;
  display: block;
}
.matrix-header {
  display: flex;
  overflow: hidden;
}
.matrix-header div {
  flex: 1;
  padding-bottom: 10px;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.matrix-header div:first-child {
  flex: 1;
  max-width: 200px;
}
.matrix-row {
  flex: 1;
  display: flex;
  height: 130px;
  overflow: hidden;
}
.matrix-block {
  font-size: clamp(0.8rem, 2.5vw, 1rem); /* 自適應文字大小 */
}
.matrix-block:first-child {
  max-width: 200px;
  height: 130px;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif, "微軟正黑體";
  font-size: 20px;
  cursor: pointer;
  user-select: none;
}
.matrix-block:not(:first-child) {
  height: 130px;
  flex: 1;
  background: gray;
  border: 1px rgba(117, 117, 117, 0.1) solid;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif, "微軟正黑體";
  font-weight: bold;
  font-size: 26px;
  color: #333;
  opacity: 0.95;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.matrix-block:not(:first-child):hover {
  opacity: 1;
}
.tooltip {
  position: absolute;
  border-radius: 6px;
  padding: 6px;
  min-width: 100px;
  background: #333;
  text-align: center;
  font-weight: normal;
  font-size: 16px;
  color: white;
  opacity: 0.8;
  z-index: 999;
  pointer-events: none;
}

.list-wrap {
  height: 24px;
  text-align: left;
  white-space: nowrap;
}
.matrix-block:not(:first-child):hover .tooltip {
  display: inline-block;
}
.dot {
  display: inline-block;
  margin-right: 5px;
  border-radius: 10px;
  width: 10px;
  height: 10px;
  background-color: #a93a3a;
}
.normal-block {
  background-color: #0bae55;
  color: black;
  font-family: sans-serif, "微軟正黑體";
  font-weight: bold;
  font-size: 26px;
}
.warn-block {
  background-color: #ccaa00;
  color: black;
  font-family: sans-serif, "微軟正黑體";
  font-weight: bold;
  font-size: 26px;
}
.error-block {
  background-color: #cc3333;
  color: black;
  font-family: sans-serif, "微軟正黑體";
  font-weight: bold;
  font-size: 26px;
}
.unable-block {
  background-color: #999999;
  color: black;
  font-family: sans-serif, "微軟正黑體";
  font-weight: bold;
  font-size: 26px;
}
</style>
