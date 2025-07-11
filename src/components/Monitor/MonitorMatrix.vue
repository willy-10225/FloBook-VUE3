<template>
  <v-container fluid class="monitor-container">
    <!-- 矩陣視圖 -->
    <template v-if="currentView === 'matrix'">
      <v-row class="matrix-header">
        <v-col cols="1"></v-col>
        <v-col cols="3" @click="sortMatrix('Users')">Users</v-col>
        <v-col cols="3">IP</v-col>
        <v-col cols="2" @click="sortMatrix('CPU')">CPU (Core)</v-col>
        <v-col cols="3" @click="sortMatrix('RAM')">RAM (GB)</v-col>
      </v-row>

      <v-row
        v-for="(item, index) in matrixData"
        :key="'device' + index"
        class="matrix-row"
        @click="redirectToDetail(item.user)"
      >
        <v-col cols="1" @click.stop>
          <v-checkbox
            v-model="selectedusers"
            :value="item.user"
            :label="''"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="3" v-html="item.user" class="matrix-block" />
        <v-col cols="3" v-html="item.Ip" class="matrix-block" />
        <v-col cols="2" :class="getBlockColor(item.cpu)" class="matrix-block">
          {{ item.cpu }}
        </v-col>
        <v-col cols="3" :class="getBlockColor(item.ram)" class="matrix-block">
          {{ item.ram }}
        </v-col>
      </v-row>
    </template>

    <!-- 圖表視圖 -->
    <template v-else>
      <v-btn
        class="mb-4"
        variant="outlined"
        color="primary"
        rounded
        @click="goBackToMatrix"
      >
        <v-icon start>mdi-arrow-left-circle</v-icon>Back
      </v-btn>

      <div v-if="selectedusers.length">
        <div v-for="selecteduser in selectedusers" :key="selecteduser">
          <h3>Details for User: {{ selecteduser }}</h3>

          <v-row class="matrix-header">
            <v-col cols="4">IP</v-col>
            <v-col cols="4">CPU (Core)</v-col>
            <v-col cols="4">RAM (GB)</v-col>
          </v-row>

          <v-row
            v-for="(ip, idx) in groupedData[selecteduser]?.IpList || []"
            :key="'sub' + idx"
          >
            <v-col cols="4" class="matrix-block" v-html="ip" />
            <v-col
              cols="4"
              class="matrix-block"
              :class="
                getBlockColor(
                  `${groupedData[selecteduser].cpuList[idx]} / ${groupedData[selecteduser].cpuNumber[idx]}`
                )
              "
            >
              {{ groupedData[selecteduser].cpuList[idx] }} /
              {{ groupedData[selecteduser].cpuNumber[idx] }}
            </v-col>
            <v-col
              cols="4"
              class="matrix-block"
              :class="
                getBlockColor(
                  `${groupedData[selecteduser].ramList[idx]} / ${groupedData[selecteduser].ramTotal[idx]}`
                )
              "
            >
              {{ groupedData[selecteduser].ramList[idx] }} /
              {{ groupedData[selecteduser].ramTotal[idx] }}
            </v-col>
          </v-row>
        </div>
      </div>

      <div v-else>
        <p>Please select a user to view details.</p>
      </div>
    </template>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, watch, computed, defineProps } from "vue"
import { useStore } from "vuex"

interface Device {
  Ip: string
  CpuData: { Number: number; Utilization: number }
  MemoryData: { Size: number }
  UserList: { user: string; cpu: number; ram: number }[]
}

interface GroupedDataItem {
  IpList: string[]
  cpuList: number[]
  ramList: number[]
  cpuNumber: number[]
  ramTotal: number[]
}

interface MatrixDataItem {
  user: string
  Ip: string
  cpu: number
  ram: number
}

const props = defineProps<{
  rawData: Device[]
  rawLicensesList: any
}>()

const store = useStore()
const currentView = ref<"matrix" | "chart">("matrix")
const sortOrder = ref<"asc" | "dsc">("asc")
const sortBy = ref("")
const groupedData = ref<Record<string, GroupedDataItem>>({})
const matrixData = ref<MatrixDataItem[]>([])
const selectedusers = ref<string[]>([])

const userInfo = computed(() => store.getters.userInfo)

watch(
  () => props.rawData,
  () => updateMatrix(),
  { deep: true }
)

watch(
  () => props.rawLicensesList,
  () => updateMatrix()
)

function updateMatrix() {
  groupedData.value = {}

  for (const device of props.rawData) {
    for (const userItem of device.UserList) {
      if (userItem.user === "System") continue
      const user = userItem.user
      if (!groupedData.value[user]) {
        groupedData.value[user] = {
          IpList: [],
          cpuList: [],
          ramList: [],
          cpuNumber: [],
          ramTotal: [],
        }
      }

      if (!groupedData.value[user].IpList.includes(device.Ip)) {
        groupedData.value[user].IpList.push(device.Ip)
      }

      const cpuUsage = Math.round(
        (userItem.cpu * device.CpuData.Utilization) / 100
      )
      const ramUsage = Math.round(
        (userItem.ram * device.MemoryData.Size) / 102400
      )

      groupedData.value[user].cpuList.push(cpuUsage)
      groupedData.value[user].ramList.push(ramUsage)
      groupedData.value[user].cpuNumber.push(device.CpuData.Number)
      groupedData.value[user].ramTotal.push(
        Math.round(device.MemoryData.Size / 1024)
      )
    }
  }

  matrixData.value = Object.entries(groupedData.value)
    .map(([user, group]) => ({
      user,
      Ip: group.IpList.join("<br>"),
      cpu: group.cpuList.reduce((sum, val) => sum + val, 0),
      ram: group.ramList.reduce((sum, val) => sum + val, 0),
    }))
    .sort((a, b) => {
      const aMatch = a.user.includes(userInfo.value.account)
      const bMatch = b.user.includes(userInfo.value.account)
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return b.cpu - a.cpu || b.ram - a.ram
    })

  sortMatrix(sortBy.value)
}

function redirectToDetail(user: string) {
  if (!selectedusers.value.length) {
    selectedusers.value = [user]
  }
  currentView.value = "chart"
}

function goBackToMatrix() {
  currentView.value = "matrix"
}

function sortMatrix(option: string) {
  if (!option) return
  sortOrder.value = sortOrder.value === "asc" ? "dsc" : "asc"
  sortBy.value = option

  matrixData.value.sort((a, b) => {
    const asc = sortOrder.value === "asc"
    if (option === "CPU") return asc ? a.cpu - b.cpu : b.cpu - a.cpu
    if (option === "RAM") return asc ? a.ram - b.ram : b.ram - a.ram
    if (option === "Users")
      return asc ? a.user.localeCompare(b.user) : b.user.localeCompare(a.user)
    return 0
  })
}

function getBlockColor(value: string | number) {
  if (typeof value === "number") return ""

  const [num, denom] = value.split("/").map(s => parseFloat(s))
  if (!denom || isNaN(num) || isNaN(denom)) return "unable"

  const percent = (num / denom) * 100
  if (percent <= 40) return "normal"
  if (percent <= 70) return "warn"
  return "error"
}
</script>

<style scoped>
.matrix-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
}
.matrix-row {
  align-items: center;
  margin-bottom: 4px;
}
.matrix-block {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  font-size: 18px;
  font-family: sans-serif, "微軟正黑體";
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.normal {
  background-color: #4abd71 !important;
}
.warn {
  background-color: #ffd564 !important;
}
.error {
  background-color: #f15e75 !important;
}
.unable {
  background-color: gray !important;
}
</style>
