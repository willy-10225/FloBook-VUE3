<template>
  <v-container fluid class="monitor-matrix pa-4">
    <!-- Header -->
    <v-row class="matrix-header" no-gutters>
      <v-col cols="12" md="3" class="header-cell" @click="sortMatrix('ip')">
        Devices
      </v-col>
      <v-col cols="2" class="header-cell" @click="sortMatrix('CPU')">
        CPU (Core)
      </v-col>
      <v-col cols="2" class="header-cell" @click="sortMatrix('RAM')">
        RAM (GB)
      </v-col>
      <v-col cols="2" class="header-cell" @click="sortMatrix('Disk')">
        Disk (GB)
      </v-col>
      <v-col cols="1" class="header-cell" @click="sortMatrix('Users')">
        Users
      </v-col>
      <v-col cols="2" class="header-cell" @click="sortMatrix('Duty Licenses')">
        Duty Licenses
      </v-col>
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
      <v-col cols="2" :class="getBlockColor(item.cpu)">
        <v-tooltip location="bottom" open-on-hover :close-delay="100">
          <template #activator="{ props }">
            <div v-bind="props">
              {{ item.cpu }}
            </div>
          </template>

          <template #default>
            <template v-if="item.userCPU.length > 0">
              <v-simple-table dense>
                <tbody>
                  <tr v-for="(user, i) in item.userCPU" :key="'cpu-user-' + i">
                    <td>
                      <v-icon size="10" :color="colorFromIndex(i)" class="me-2"
                        >mdi-circle</v-icon
                      >
                    </td>
                    <td>{{ user.user }}</td>
                    <td>
                      {{
                        Math.round((user.cpu ?? 0 / 100) * item.cpuDenominator)
                      }}
                      Core
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </template>
            <span v-else>No Data</span>
          </template>
        </v-tooltip>
      </v-col>

      <!-- RAM -->
      <v-col cols="2" :class="getBlockColor(item.ram)">
        <v-tooltip location="bottom" open-on-hover :close-delay="100">
          <template #activator="{ props }">
            <div v-bind="props">{{ item.ram }}</div>
          </template>

          <template #default>
            <template v-if="item.userRAM.length > 0">
              <v-simple-table dense>
                <tbody>
                  <tr v-for="(user, i) in item.userRAM" :key="'ram-user-' + i">
                    <td>
                      <v-icon size="10" :color="colorFromIndex(i)" class="me-2"
                        >mdi-circle</v-icon
                      >
                    </td>
                    <td>{{ user.user }}</td>
                    <td>
                      {{
                        Math.round((user.ram ?? 0 / 100) * item.ramDenominator)
                      }}
                      GB
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </template>
            <span v-else>No Data</span>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Disk -->
      <v-col cols="2" :class="getBlockColor(item.disk)">
        <v-tooltip location="bottom" open-on-hover :close-delay="100">
          <template #activator="{ props }">
            <div v-bind="props">{{ item.disk }}</div>
          </template>

          <template #default>
            <template v-if="item.disklen > 0">
              <v-simple-table dense>
                <tbody>
                  <tr v-for="(name, i) in item.diskCapacity" :key="'disk-' + i">
                    <td>
                      <v-icon size="10" :color="colorFromIndex(i)" class="me-2"
                        >mdi-circle</v-icon
                      >
                    </td>
                    <td>{{ name }}</td>
                    <td>
                      {{ item.diskUsespace[i] }}/{{ item.diskTotalspace[i] }}
                      (GB)
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </template>
            <span v-else>No Data</span>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Users -->
      <v-col cols="1" class="normal-block">
        <v-tooltip location="bottom" open-on-hover :close-delay="100">
          <template #activator="{ props }">
            <div v-bind="props">{{ item.userNum }}</div>
          </template>

          <template #default>
            <template v-if="item.userNum > 0">
              <v-simple-table dense>
                <tbody>
                  <tr v-for="(user, i) in item.userCPU" :key="'user-' + i">
                    <td>
                      <v-icon size="10" :color="colorFromIndex(i)" class="me-2"
                        >mdi-circle</v-icon
                      >
                    </td>
                    <td>{{ user.user }}</td>
                    <td>
                      <span v-if="user.cpu ?? 0 > 0">running</span>
                      <span v-else>idle</span>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </template>
            <span v-else>No Data</span>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Duty Licenses -->
      <v-col cols="2" class="unable-block">
        <v-tooltip location="bottom" open-on-hover :close-delay="100">
          <template #activator="{ props }">
            <div v-bind="props">{{ item.licenseNum }}</div>
          </template>

          <template #default>
            <template v-if="item.licenseNum ?? 0 > 0">
              <v-simple-table dense>
                <tbody>
                  <tr
                    v-for="(feature, i) in item.FeatureList"
                    :key="'license-' + i"
                  >
                    <td>
                      <v-icon size="10" :color="colorFromIndex(i)" class="me-2"
                        >mdi-circle</v-icon
                      >
                    </td>
                    <td>{{ feature }}:</td>
                    <td>{{ (item.licenseList ?? [])[i] }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </template>
            <span v-else>No Data</span>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, computed } from "vue"
import { useStore } from "vuex"
import Color from "@/assets/ts/color-palette"
import { classdict, serverdict } from "@/assets/ts/classdict"
import { useRouter } from "vue-router"

interface UserCpuRam {
  user: string
  cpu?: number
  ram?: number
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
      router.push({ name: "Monitor Detail", params: { ip } })
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
      getBlockColor,
      redirectToDetail,
      sortMatrix,
      colorFromIndex,
    }
  },
})
</script>

<style scoped>
.monitor-matrix {
  padding: 16px;
  background-color: #f5f5f5;
}

.table-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.table-wrapper {
  min-width: 250px;
  max-width: 300px;
}

.server-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.server-card:hover {
  transform: scale(1.02);
}

.server-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.data-cell {
  background-color: #ffffff;
  padding: 6px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.normal-block {
  background-color: #e0f7fa;
}

.warn-block {
  background-color: #fff3e0;
}

.error-block {
  background-color: #ffebee;
}

.unable-block {
  background-color: #eeeeee;
  color: #999999;
}

.license-section {
  margin-top: 12px;
}

.license-badge {
  display: inline-block;
  margin: 2px 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  border-radius: 8px;
  color: white;
  background-color: #42a5f5;
}
</style>
