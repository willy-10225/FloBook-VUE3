<template>
  <div ref="detailContainer" class="detail-container">
    <div class="d-flex justify-end" style="height: 300px">
      <div class="flex-grow-1">
        <VChart ref="detailGauge" :options="gaugeOption" class="w-100 h-100" />
      </div>
      <div class="flex-grow-1">
        <div class="table-title d-flex align-center justify-between">
          <span class="block-title">{{ $t("monitor.realtime-hardware") }}</span>
          <VBtn @click="hardwareHistoryLink" variant="outlined" size="small">
            {{ $t("monitor.history-hardware") }}
          </VBtn>
        </div>

        <VSelect
          v-if="deviceIpVeil"
          v-model="deviceIp"
          :items="deviceIpList"
          item-title="id"
          item-value="ip"
          label="Select Device IP"
          @update:modelValue="changeDeviceIp"
          class="ip-selector"
          dense
          outlined
        />

        <VTable class="infotable" dense>
          <tbody>
            <tr>
              <th class="infoleft">{{ $t("monitor.device-ip") }}</th>
              <td>{{ hardwareInfo.ipText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.cpu-total") }}</td>
              <td>{{ hardwareInfo.cpuText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.cpu-residual") }}</td>
              <td>{{ hardwareInfo.remainingCpuText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.ram-total") }}</td>
              <td>{{ hardwareInfo.ramText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.ram-residual") }}</td>
              <td>{{ hardwareInfo.remainingRamText }}</td>
            </tr>
            <tr :title="hardwareInfo.diskTitle">
              <td class="infoleft">{{ $t("monitor.disk-total") }}</td>
              <td>{{ hardwareInfo.totalDiskText }}</td>
            </tr>
            <tr :title="hardwareInfo.diskTitle">
              <td class="infoleft">{{ $t("monitor.disk-residual") }}</td>
              <td>{{ hardwareInfo.remainingDiskText }}</td>
            </tr>
          </tbody>
        </VTable>
      </div>
    </div>

    <br />

    <VChart ref="UserBarChart" :options="barOption" class="w-100" />

    <br />

    <div class="license-section d-flex flex-column">
      <VTabs
        v-model="activeTab"
        color="primary"
        indicator-color="yellow"
        class="mb-4"
        grow
      >
        <VTabsItem>ANSYS</VTabsItem>
      </VTabs>

      <transition name="slide-fade" mode="out-in">
        <div v-if="activeTab === 0">
          <div class="tab-content-title">
            {{ $t("monitor.realtime-licenses") }}
          </div>

          <VChart
            ref="almChart1"
            :options="almOption"
            class="w-100"
            style="height: 300px"
            auto-resize
          />

          <div class="button-line d-flex gap-2 my-2">
            <VBtn icon @click="showFirst"><VIcon>mdi-page-first</VIcon></VBtn>
            <VBtn icon @click="showBefore"
              ><VIcon>mdi-page-previous</VIcon></VBtn
            >
            <VBtn icon @click="showNext"><VIcon>mdi-page-next</VIcon></VBtn>
            <VBtn icon @click="showLast"><VIcon>mdi-page-last</VIcon></VBtn>
          </div>

          <div class="flex-grow-1">
            <div class="table-title d-flex justify-between align-center mb-2">
              <span class="block-title">{{
                $t("monitor.realtime-licenses-detail")
              }}</span>

              <div class="group d-flex align-center gap-2">
                <h6>{{ $t("monitor.group") }}:</h6>
                <VSelect
                  v-model="groupname"
                  :items="grouplist"
                  label="Group"
                  dense
                  outlined
                  @update:modelValue="changelicense"
                  class="group-selector"
                />
              </div>

              <div>
                <label>{{ $t("monitor.group-totaltime") }}:</label>
                <label id="ansystotaltime">0</label>
              </div>

              <VBtn
                class="history-button"
                variant="outlined"
                size="small"
                @click="licenseHistoryTop100"
              >
                {{ $t("monitor.history-licenses-top100") }}
              </VBtn>

              <VBtn
                class="history-button"
                variant="outlined"
                size="small"
                @click="licenseHistoryLink"
              >
                {{ $t("monitor.history-licenses") }}
              </VBtn>
            </div>

            <VTable dense class="ansys-table">
              <thead>
                <tr>
                  <th>
                    <span
                      style="cursor: pointer"
                      @click="sortLicenseLogList('User Name', $event)"
                    >
                      {{ $t("monitor.user-name") }}
                    </span>
                  </th>
                  <th>{{ $t("monitor.group") }}</th>
                  <th>
                    <span
                      style="cursor: pointer"
                      @click="sortLicenseLogList('Device Name', $event)"
                    >
                      {{ $t("monitor.device-name") }}
                    </span>
                  </th>
                  <th>
                    <span
                      style="cursor: pointer"
                      @click="sortLicenseLogList('Feature Name', $event)"
                    >
                      {{ $t("monitor.feature-name") }}
                    </span>
                  </th>
                  <th>
                    <span
                      style="cursor: pointer"
                      @click="sortLicenseLogList('Start Time', $event)"
                    >
                      {{ $t("monitor.start-time") }}
                    </span>
                  </th>
                  <th>
                    <span
                      style="cursor: pointer"
                      @click="sortLicenseLogList('Time Used', $event)"
                    >
                      {{ $t("monitor.used-time") }}
                    </span>
                  </th>
                  <th style="cursor: not-allowed">
                    {{ $t("monitor.termination") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in licenseLogList" :key="item.Handle">
                  <td>{{ item.UserName }}</td>
                  <td>{{ groupprintdict(item.UserName) }}</td>
                  <td>{{ item.Host }}</td>
                  <td>{{ item.ModuleName }}</td>
                  <td>{{ item.StartTime }}</td>
                  <td>
                    {{
                      $t("monitor.format-time", getActiveTime(item.StartTime))
                    }}
                  </td>
                  <td>
                    <VBtn
                      v-if="item.terminating"
                      small
                      disabled
                      variant="tonal"
                    >
                      Terminating
                    </VBtn>
                    <VBtn
                      v-else
                      small
                      color="error"
                      :disabled="!enableTerminateButton(item.StartTime)"
                      @click="openTerminateAlert(item)"
                    >
                      Terminate
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </div>
        </div>
      </transition>
    </div>

    <ConfirmDialog
      :title="'Are you sure to terminate the usage of this license?'"
      :openAlert="showTerminateConfirm"
      :safeOption="$t('common.cancel')"
      :dangerOption="$t('common.confirm')"
      confirmColor="primary"
      @closeConfirmDialog="terminateLicense"
    />

    <QiProgress :progress="terminatingProgress" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import ECharts from "vue-echarts"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import QiProgress from "@/components/common/QiProgress.vue"
import {
  apiMonitorDetail,
  apiGetLicensesListByIp,
  apiTerminateLicense,
  apiMonitorList,
  apiAdminConfig,
  TerminateLicensePayload,
} from "@/assets/ts/api"
import type { EChartsOption, YAXisComponentOption } from "echarts"

interface HardwareInfo {
  ipText: string
  cpuText: string
  remainingCpuText: string
  ram: string
  ramText: string
  remainingRamText: string
  totalDiskText: string
  remainingDiskText: string
  diskTitle: string
}
// props
defineProps<{
  ip: string
  group: Record<string, any>
}>()

const store = useStore()
const { t } = useI18n()
const router = useRouter()

// 你的 reactive 数据
let almTooltipData: {
  Feature: string
  Use: number
  Issued: number
}[] = []
const licenseLogList = ref<any[]>([])
const AlllicenseLogList = ref<any[]>([])
const groupdict = reactive<Record<string, any>>({})
const grouplist = ref<string[]>([])
const deviceIp = ref("")
const deviceIpVeil = ref(false)
const deviceIpList = ref<{ id: string; ip: string }[]>([])
const activeTab = ref(0)
const showTerminateConfirm = ref(false)
const selectedLicense = ref<Record<string, any>>({})
const terminationDisableMinute = 5
const sortOrder = ref<"asc" | "desc">("asc")

type SortOption =
  | "Start Time"
  | "End Time"
  | "License"
  | "User"
  | "User Name"
  | "Device Name"
  | "Feature Name"
  | ""
const sortBy = ref<SortOption>("Start Time")

const groups = ref<any[]>([])
const groupname = ref("ALL")
const timer = ref<number | null>(null)
const almData = reactive({
  dataY: [] as string[],
  dataS0: [] as number[],
  dataS1: [] as number[],
  almPagePointer: 0,
  almModulesPerPage: 15,
})
const terminatingProgress = reactive({
  show: false,
  title: "Terminating...",
  done: 1,
  total: 2,
})

const hardwareInfo = reactive<HardwareInfo>({
  ipText: t("common.data-loading"),
  cpuText: t("common.data-loading"),
  remainingCpuText: t("common.data-loading"),
  ram: t("common.data-loading"),
  ramText: t("common.data-loading"),
  remainingRamText: t("common.data-loading"),
  totalDiskText: t("common.data-loading"),
  remainingDiskText: t("common.data-loading"),
  diskTitle: t("common.data-loading"),
})

// computed 等同于 Vue 2 里的 computed
const layout = computed(() => store.getters.layout)
const userInfo = computed(() => store.getters.userInfo)

const gaugeOption: EChartsOption = {
  backgroundColor: "#1b1b1b",
  tooltip: {
    formatter: "{a} <br/>{c}(%)",
  },
  toolbox: {
    show: false,
  },
  series: [
    {
      name: "CPU",
      type: "gauge",
      min: 0,
      max: 100,
      splitNumber: 10,
      radius: "80%",
      axisLine: {
        lineStyle: {
          color: [
            [0.2, "lime"],
            [0.8, "#1e90ff"],
            [1, "#ff4500"],
          ],
          width: 3,
        },
      },
      axisLabel: {
        color: "#fff",
        fontWeight: "bolder",
      },
      axisTick: {
        length: 15,
        lineStyle: {
          color: "auto",
        },
      },
      splitLine: {
        length: 25,
        lineStyle: {
          width: 3,
          color: "#fff",
        },
      },
      pointer: {
        itemStyle: {
          color: "#fff",
          shadowColor: "#fff",
          shadowBlur: 5,
        },
      },
      title: {
        offsetCenter: [0, "-40%"],
        color: "#fff",
        fontSize: 20,
        fontStyle: "italic",
        fontWeight: "bolder",
      },
      detail: {
        offsetCenter: [0, "50%"],
        formatter: "{value}%",
        valueAnimation: true,
        color: "#fff",
        fontWeight: "bolder",
      },
      data: [{ value: 0, name: "CPU" }],
    },
    {
      name: "RAM",
      type: "gauge",
      center: ["19%", "55%"],
      radius: "65%",
      min: 0,
      max: 100,
      startAngle: 230,
      endAngle: 55,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          color: [
            [0.2, "lime"],
            [0.8, "#1e90ff"],
            [1, "#ff4500"],
          ],
          width: 2,
        },
      },
      axisLabel: {
        color: "#fff",
        fontWeight: "normal",
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: "auto",
        },
      },
      splitLine: {
        length: 20,
        lineStyle: {
          width: 3,
          color: "#fff",
        },
      },
      pointer: {
        width: 5,
      },
      title: {
        offsetCenter: [0, "-30%"],
        color: "#fff",
        fontWeight: "bolder",
        fontStyle: "italic",
      },
      detail: {
        width: 80,
        height: 30,
        offsetCenter: [5, "50%"],
        formatter: "{value}%",
        valueAnimation: true,
        color: "#fff",
        fontWeight: "normal",
        fontSize: 15,
      },
      data: [{ value: 0, name: "RAM" }],
    },
    {
      name: "Disk",
      type: "gauge",
      center: ["79%", "55%"],
      radius: "65%",
      min: 0,
      max: 100,
      startAngle: 120,
      endAngle: -50,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          color: [
            [0.2, "lime"],
            [0.8, "#1e90ff"],
            [1, "#ff4500"],
          ],
          width: 2,
        },
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: "auto",
        },
      },
      axisLabel: {
        color: "#fff",
        fontWeight: "normal",
      },
      splitLine: {
        length: 15,
        lineStyle: {
          width: 3,
          color: "#fff",
        },
      },
      pointer: {
        width: 2,
      },
      title: {
        color: "#fff",
        fontWeight: "bolder",
        fontStyle: "italic",
      },
      detail: {
        width: 80,
        height: 30,
        offsetCenter: [0, "50%"],
        formatter: "{value}%",
        valueAnimation: true,
        color: "#fff",
        fontWeight: "normal",
        fontSize: 15,
      },
      data: [{ value: 0, name: "Disk" }],
    },
  ],
}

const barOption: EChartsOption = {
  backgroundColor: "rgba(255,255,255,0.1)",
  color: ["rgba(219,61,61,0.7)", "rgba(30, 144, 255,0.7)"],
  title: {
    text: "Current Users",
    subtext: "(%)",
    left: "1%",
    top: "2%",
    textStyle: {
      fontWeight: "bolder",
      color: "#fff",
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    formatter: `{b}<br>
      <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#a93a3a;"></span>
      {a0}: {c0}%<br>
      <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#2474c2;"></span>
      {a1}: {c1}%`,
  },
  legend: {
    data: ["CPU", "RAM"],
    textStyle: {
      color: "#fff",
    },
    top: "3%",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "value",
      max: 100,
      boundaryGap: [0, 0.01],
      axisLabel: {
        rotate: 0,
        margin: 8,
        color: "#fff",
      },
    },
  ],
  yAxis: [
    {
      type: "category",
      data: [],
      axisLabel: {
        rotate: 0,
        margin: 8,
        color: "#fff",
      },
    },
  ],
  series: [
    {
      name: "CPU",
      type: "bar",
      data: [],
    },
    {
      name: "RAM",
      type: "bar",
      data: [],
    },
  ],
}

const almOption: EChartsOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    formatter: (params: any) => {
      const target = almTooltipData.find(
        item => item.Feature === params[0].name
      )
      return `
        Module: ${params[0].name}<br>
        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#14c8d4;"></span>
        ${target?.Use ?? 0} / ${target?.Issued ?? 0} (${params[0].value}%)
      `
    },
  },
  grid: {
    left: 130,
    right: 30,
  },
  legend: {
    data: ["On duty", "Total"],
    top: "5%",
    textStyle: {
      color: "#ccc",
    },
    selectedMode: false,
  },
  yAxis: {
    type: "category",
    axisLabel: {
      show: true,
      interval: 0,
      margin: 8,
    },
    data: [], // 要記得填入 category 名稱
    axisLine: {
      lineStyle: {
        color: "#ccc",
      },
    },
  },
  xAxis: {
    type: "value",
    splitLine: { show: false },
    axisLine: {
      lineStyle: {
        color: "#ccc",
      },
    },
  },
  series: [
    {
      name: "On duty",
      type: "bar",
      barWidth: 10,
      itemStyle: {
        borderRadius: 5,
        color: new ECharts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#14c8d4" },
          { offset: 1, color: "#43eec6" },
        ]),
      },
      label: {
        show: true,
        position: "right",
        formatter: "{b}\n{c}%",
        color: "#fff",
      },
      data: [],
    },
    {
      name: "Total",
      type: "bar",
      barGap: "-100%",
      barWidth: 10,
      itemStyle: {
        color: new ECharts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#7c7c7c" },
          { offset: 0.2, color: "#666666" },
          { offset: 1, color: "#545454" },
        ]),
      },
      z: -12,
      data: [],
    },
  ],
}

// 你的其他 reactive 狀態像 hardwareInfo, gaugeOption, barOption 等自己依需求定義
// ====== Functions =======

async function updatePage() {
  deviceIpList.value.sort((a, b) =>
    a.ip.replace("192.168.33", "0") > b.ip.replace("192.168.33", "0") ? 1 : -1
  )
  if (deviceIpList.value.length > 0) {
    if (!deviceIp.value) deviceIp.value = deviceIpList.value[0].ip
    deviceIpVeil.value = true

    timer.value = window.setInterval(() => {
      if (almData.dataY.length === 0) getAnsysLicenseModules()
      updateViewData()
    }, 2000)
  } else {
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      message: "Please set monitor cluster correctly",
    })
  }
}

async function updateViewData() {
  try {
    const payload = { ip: deviceIp.value }
    const res = await apiMonitorDetail(payload)
    updateGauge(res.data)
    updateUserBarChart(res.data.UserList)
    updateLicenseBarChart(res.data.LicenseLogList)
    updateLicenseLog(res.data.LicenseLogList)
    setTime("ansystotaltime", licenseLogList.value)
    sortLicenseLogList(sortBy.value)
    store.dispatch("changeLoadingState", false)
  } catch (err) {
    console.error(err)
  }
}
function setTime(textId: string, licenseList: { StartTime: string }[]) {
  const end = new Date()
  let totalMs = 0
  let totalTimeText = "0"

  if (licenseList.length > 0) {
    for (const item of licenseList) {
      totalMs += end.getTime() - new Date(item.StartTime).getTime()
    }

    const timeInSec = totalMs / 1000
    const day = Math.floor(timeInSec / 86400)
    const hour = Math.floor(timeInSec / 3600) % 24
    const minute = Math.floor(timeInSec / 60) % 60
    const second = Math.floor(timeInSec) % 60

    totalTimeText = `${day}Day ${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:${second.toString().padStart(2, "0")}`
  }

  const el = document.getElementById(textId)
  if (el) {
    el.innerText = totalTimeText
  }
}
function updateGauge(data: any) {
  let totalCapacity = 0
  let availableCapacity = 0
  let diskUtilization = 0
  let remainingCpu = 0
  let remainingRam = 0
  let diskTitle = ""
  let cpuUtilization = 0
  let ramUtilization = 0

  if (data.DiskData.length !== 0) {
    for (let d = 0; d < data.DiskData.length; ++d) {
      diskTitle += t("monitor.diskTitle", {
        disk: data.DiskData[d].Name,
        total: data.DiskData[d].Total_space.toFixed(1),
        residual: data.DiskData[d].Capacity.toFixed(1),
      })
      totalCapacity += data.DiskData[d].Total_space
      availableCapacity += data.DiskData[d].Capacity
    }
    hardwareInfo.diskTitle = diskTitle
    diskUtilization =
      ((totalCapacity - availableCapacity) / totalCapacity) * 100
  }

  try {
    cpuUtilization = Number(data.CpuData.Utilization.toFixed(1))
    ramUtilization = Number(data.MemoryData.Utilization.toFixed(1))
    remainingCpu = Math.ceil(
      ((100 - cpuUtilization) / 100) * data.CpuData.Number
    )
    remainingRam = Math.ceil(
      ((100 - ramUtilization) / 100) * data.MemoryData.Size
    )

    hardwareInfo.ipText = data.Ip
    hardwareInfo.cpuText = t("monitor.core", data.CpuData.Number)
    hardwareInfo.remainingCpuText = t("monitor.core", remainingCpu)
    hardwareInfo.ramText = data.MemoryData.Size + " (MB)"
    hardwareInfo.remainingRamText = remainingRam + " (MB)"
    hardwareInfo.totalDiskText = totalCapacity.toFixed(0) + " (GB)"
    hardwareInfo.remainingDiskText = Math.ceil(availableCapacity) + " (GB)"
  } catch {
    cpuUtilization = 0
    ramUtilization = 0
    hardwareInfo.ipText = data.Ip
    hardwareInfo.cpuText = t("monitor.device-disconnected")
    hardwareInfo.remainingCpuText = t("monitor.device-disconnected")
    hardwareInfo.ramText = t("monitor.device-disconnected")
    hardwareInfo.remainingRamText = t("monitor.device-disconnected")
    hardwareInfo.totalDiskText = t("monitor.device-disconnected")
    hardwareInfo.remainingDiskText = t("monitor.device-disconnected")
  }

  gaugeOption.series![0].data[0].value = cpuUtilization
  gaugeOption.series![1].data[0].value = ramUtilization
  gaugeOption.series![2].data[0].value = diskUtilization.toFixed(1)
}

function updateUserBarChart(userInfo: any[]) {
  userInfo.sort((a, b) => a.cpu - b.cpu)
  barOption.yAxis![0].data = userInfo.map(item => item.user)
  barOption.series![0].data = userInfo.map(item => item.cpu.toFixed(2))
  barOption.series![1].data = userInfo.map(item => item.ram.toFixed(2))
  if (Array.isArray(barOption.title)) {
    barOption.title[0].text = t("monitor.realtime-users")
    barOption.title[0].subtext = t("monitor.realtime-users-subtext")
  } else if (barOption.title) {
    barOption.title.text = t("monitor.realtime-users")
    barOption.title.subtext = t("monitor.realtime-users-subtext")
  }
}

function updateLicenseBarChart(licenseLog: any[]) {
  if (almTooltipData.length === 0) return
  const features = [...new Set(licenseLog.map(item => item.Product))]
  almTooltipData.forEach(x => (x.Use = 0))

  const dutyLicenses = features.map(feature => {
    const issued = almTooltipData.find(x => x.Feature === feature)?.Issued ?? 0
    const use = licenseLog
      .filter(x => x.Product === feature)
      .reduce((acc, item) => acc + item.Task, 0)
    const tooltipItem = almTooltipData.find(x => x.Feature === feature)

    return { Feature: feature, Issued: issued, Use: use }
  })

  const data = dutyLicenses.map(duty => ({
    feature: duty.Feature,
    usageDenominator: 100,
    usageFraction:
      duty.Issued > 0 ? Math.round((duty.Use / duty.Issued) * 100) : 0,
  }))

  almData.dataS0 = almData.dataS0.map(() => 0)
  data.forEach(d => {
    const idx = almData.dataY.findIndex(f => f === d.feature)
    if (idx !== -1) almData.dataS0[idx] = d.usageFraction
  })

  const list = almData.dataY
    .map((feature, i) => ({
      feature,
      rate: almData.dataS0[i],
    }))
    .sort((a, b) => b.rate - a.rate)

  list.forEach((item, j) => {
    almData.dataY[j] = item.feature
    almData.dataS0[j] = item.rate
  })

  if (almData.dataY.length > 0) showCurrPage()
}

function updateLicenseLog(licenseLog: any[]) {
  const terminatingQueueStr = localStorage.getItem("terminatingQueue") || "[]"
  const terminatingSet = new Set(JSON.parse(terminatingQueueStr))
  const currentHandleSet = new Set(licenseLog.map(item => item.Handle))
  const difference = new Set(
    [...terminatingSet].filter(x => !currentHandleSet.has(x))
  )
  const intersection = new Set(
    [...terminatingSet].filter(x => currentHandleSet.has(x))
  )

  if (difference.size > 0) {
    difference.forEach(val => terminatingSet.delete(val))
    localStorage.setItem(
      "terminatingQueue",
      JSON.stringify(Array.from(terminatingSet))
    )
  }

  licenseLog.forEach(item => {
    item.ModuleName =
      item.Task > 1 ? `${item.Product} x ${item.Task}` : item.Product
    item.terminating = intersection.has(item.Handle)
  })

  AlllicenseLogList.value = [...licenseLog].reverse()
  licenseLogList.value = resetAlmTooltipData(AlllicenseLogList.value)
}
function resetAlmTooltipData(almTooltipData: any[]): any[] {
  if (typeof almTooltipData !== "undefined" && groupname.value !== "ALL") {
    const newList: any[] = []
    const selectList: string[] = []

    for (const [k, v] of Object.entries(groupdict.value)) {
      if (v === groupname.value) {
        selectList.push(k)
      }
    }

    for (const item of almTooltipData) {
      if (selectList.includes(item.UserName)) {
        newList.push(item)
      }
    }

    return newList
  } else {
    return almTooltipData
  }
}

function sortLicenseLogList(option: string = "Start Time", event?: Event) {
  if (event) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
  }

  switch (option) {
    case "User Name":
      sortBy.value = "User Name"
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.UserName > b.UserName
            ? 1
            : -1
          : b.UserName > a.UserName
          ? 1
          : -1
      )
      break
    case "Device Name":
      sortBy.value = "Device Name"
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.Host > b.Host
            ? 1
            : -1
          : b.Host > a.Host
          ? 1
          : -1
      )
      break
    case "Feature Name":
      sortBy.value = "Feature Name"
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.ModuleName > b.ModuleName
            ? 1
            : -1
          : b.ModuleName > a.ModuleName
          ? 1
          : -1
      )
      break
    default:
      sortBy.value = ""
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.StartTime > b.StartTime
            ? 1
            : -1
          : b.StartTime > a.StartTime
          ? 1
          : -1
      )
      break
  }
}

async function getAnsysLicenseModules() {
  try {
    const res = await apiGetLicensesListByIp({ ip: deviceIp.value })
    const alm = res.data
    almTooltipData = alm
    const data: {
      feature: string
      usageDenominator: number
      usageFraction: number
    }[] = []

    for (let d = 0; d < alm.length; ++d) {
      data.push({
        feature: alm[d].Feature,
        usageDenominator: 100,
        usageFraction: Math.round((alm[d].Use / alm[d].Issued) * 100),
      })
    }

    data.sort((a, b) => b.usageFraction - a.usageFraction)

    for (let i = 0; i < data.length; i++) {
      almData.dataY[i] = data[i].feature
      almData.dataS0[i] = data[i].usageFraction
      almData.dataS1[i] = data[i].usageDenominator
    }
    if (almData.dataY.length > 0) showCurrPage()
  } catch (error) {
    console.error(error)
  }
}
const showCurrPage = () => {
  const temp = { y: [], s0: [], s1: [] } as {
    y: string[]
    s0: number[]
    s1: number[]
  }

  for (
    let i = almData.almPagePointer;
    i < almData.almPagePointer + almData.almModulesPerPage;
    i++
  ) {
    temp.y.push(almData.dataY[i])
    temp.s0.push(almData.dataS0[i])
    temp.s1.push(almData.dataS1[i])
  }

  ;(almOption.yAxis as echarts.YAXisComponentOption)[0].data = temp.y.reverse()
  almOption.series![0].data = temp.s0.reverse()
  almOption.series![1].data = temp.s1.reverse()
}

const showFirst = () => {
  almData.almPagePointer = 0
  showCurrPage()
}

const showBefore = () => {
  const d = almData
  if (d.almPagePointer > d.almModulesPerPage) {
    d.almPagePointer -= d.almModulesPerPage
  } else {
    d.almPagePointer = 0
  }
  showCurrPage()
}

const showNext = () => {
  const d = almData
  if (d.almPagePointer < d.dataY.length - 2 * d.almModulesPerPage) {
    d.almPagePointer += d.almModulesPerPage
  } else {
    d.almPagePointer = d.dataY.length - d.almModulesPerPage
  }
  showCurrPage()
}

const showLast = () => {
  almData.almPagePointer = almData.dataY.length - almData.almModulesPerPage
  showCurrPage()
}

const getActiveTime = (startTime: string) => {
  const MS_PER_HOUR = 60 * 60 * 1000
  const MS_PER_MINUTE = 60 * 1000
  const currentTime = Date.now()

  const isoTime = startTime.replace(/\//g, "-").replace(" ", "T") + "+08:00"
  const startTimestamp = new Date(isoTime).getTime()
  const diff = currentTime - startTimestamp

  return {
    hh: Math.floor(diff / MS_PER_HOUR),
    mm: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
  }
}

const enableTerminateButton = (startTime: string) => {
  const { hh, mm } = getActiveTime(startTime)
  return userInfo.value.isAdmin && (hh > 0 || mm >= terminationDisableMinute)
}

const openTerminateAlert = (item: any) => {
  showTerminateConfirm.value = true
  selectedLicense.value = item
}

const terminateLicense = (isConfirm: boolean) => {
  if (!isConfirm) {
    showTerminateConfirm.value = false
    return
  }
  terminatingProgress.show = true
  const terminatingQueue = [selectedLicense.value.Handle]
  localStorage.setItem("terminatingQueue", JSON.stringify(terminatingQueue))
  const payload = { ...selectedLicense.value } as TerminateLicensePayload

  apiTerminateLicense(payload)
    .then(res => {
      if (res.data === "success") {
        terminatingProgress.done = 2
        terminatingProgress.show = false
        terminatingProgress.done = 1
      } else {
        terminatingProgress.show = false
        // 處理錯誤提示
      }
    })
    .catch(console.error)
    .finally(() => {
      showTerminateConfirm.value = false
    })
}

const licenseHistoryLink = () =>
  router.push({ name: "License History", params: { ip: deviceIp.value } })
const licenseHistoryTop100 = () => router.push({ name: "Check In Top200" })
const hardwareHistoryLink = () =>
  router.push({ name: "Hardware History", params: { ip: deviceIp.value } })

const detectRWD = () => {
  const detailGauge = document.getElementById("detailGauge") as any
  const UserBarChart = document.getElementById("UserBarChart") as any
  const width = detailGauge?.offsetWidth ?? 420
  detailGauge?.resize?.({
    width: Math.max(width, 420),
    height: width < 420 ? 240 : 300,
  })
  if (layout.value) {
    UserBarChart?.resize?.({
      width: layout.value.isSidenavShown
        ? window.innerWidth - layout.value.sidenavWidth - 60
        : window.innerWidth - 60,
    })
  }
}

const changelicense = () => {
  licenseLogList.value = resetalmTooltipData(AlllicenseLogList.value)
  settime("ansystotaltime", licenseLogList.value)
}

const settime = (text: string, licenseList: any[]) => {
  let mstime = 0
  const end = new Date()
  if (licenseList.length !== 0) {
    for (const item of licenseList) {
      mstime += end.getTime() - Date.parse(item.StartTime)
    }
  }
  const time = mstime / 1000
  const day = Math.floor(time / 60 / 60 / 24)
  const hour = Math.floor(time / 60 / 60) % 24
  const minute = Math.floor(time / 60) % 60
  const second = Math.floor(time) % 60
  const totaltime = `${day}Day ${hour}:${minute}:${second}`
  const obj = document.getElementById(text)
  if (obj) obj.innerText = totaltime
}

const resetalmTooltipData = (data: any[]) => {
  if (data !== undefined && groupname.value !== "ALL") {
    const selectlist = Object.entries(groupdict.value)
      .filter(([_, v]) => v === groupname.value)
      .map(([k]) => k)

    return data.filter(item => selectlist.includes(item.UserName))
  }
  return data
}
const changeDeviceIp = () => {
  changeLoadingState(true)
}
const changeLangHandler = () => {
  const legend = almOption.legend

  // 如果是陣列，只處理第一個 legend
  if (Array.isArray(legend)) {
    if (legend[0]?.data && Array.isArray(legend[0].data)) {
      legend[0].data[0] = t("monitor.on-duty") as string
      legend[0].data[1] = t("monitor.total") as string
    }
  } else if (legend && typeof legend === "object") {
    if (legend.data && Array.isArray(legend.data)) {
      legend.data[0] = t("monitor.on-duty") as string
      legend.data[1] = t("monitor.total") as string
    }
  }

  // 修改 series 名稱
  if (Array.isArray(almOption.series)) {
    if (almOption.series[0])
      almOption.series[0].name = t("monitor.on-duty") as string
    if (almOption.series[1])
      almOption.series[1].name = t("monitor.total") as string
  }
}

const groupprintdict = (key: string) => {
  const k = key.toLowerCase()
  const lowerDict = Object.fromEntries(
    Object.entries(groupdict.value).map(([k, v]) => [k.toLowerCase(), v])
  )
  return lowerDict[k] ?? ""
}
</script>

<style lang="less" scoped>
.group-selector {
  width: 100px;
  margin: 0;
  padding: 20% 0%;
  min-height: unset;
  text-align: center;
  text-align-last: center;
}
.group {
  display: flex;
}
.detail-container {
  margin: 20px;
  padding: 0px;
}
#detailGauge {
  width: 100%;
  height: 300px;
  max-width: 520px;
  display: block;
  margin: auto;
}
.ip-selector {
  width: 180px;
  margin: 0;
  min-height: unset;
  float: left;
}
.block-title {
  font-size: 22px;
  text-align: left;
}
#UserBarChart {
  width: 100%;
  height: 400px;
  margin-top: 40px;
}
#almChart {
  width: 100%;
  height: 500px;
  min-width: 650px;
}
.tab-content-title {
  margin-top: 10px;
  text-align: left;
  font-weight: bolder;
}
.infotable {
  color: white;
  font-size: 16px;
  margin-top: 5px;
  text-align: left;
  border-collapse: collapse;
  width: 100%;
  th {
    padding-left: 5px;
    padding-top: 10px;
    padding-bottom: 10px;
    text-align: left;
    background-color: #2d2d2d;
    color: white;
  }
  th:hover {
    text-align: left;
    background-color: #2d2d2d;
    color: white;
  }
  td {
    padding-left: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  tr:nth-child(even) {
    background-color: #474747;
  }
  tr:hover {
    background-color: rgba(255, 255, 255, 0.7);
    color: black;
  }
  .infoleft {
    width: 40%;
  }
}
.page-button {
  margin: 10px;
  margin-top: 0px;
  background: none;
  border: none;
  cursor: pointer;
}
.button-line {
  position: relative;
  margin-top: -30px;
  margin-left: -20px;
}
.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: x-large;
  font-weight: bolder;
  color: white;
  margin: auto;
}
.license-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.ansys-table {
  font-size: small;
  text-align: left;
  border-collapse: collapse;
  margin-top: 20px;
  color: white;
  font-family: sans-serif;
  min-width: 650px;
  width: 100%;
  th {
    padding: 10px 0 10px 10px;
    cursor: pointer;
    text-align: left;
    background-color: #04233d;
    color: white;
  }
  th:hover {
    text-align: left;
    background-color: #04233d;
    color: white;
  }
  td {
    padding: 5px 0 5px 10px;
  }
  tr:nth-child(even) {
    background-color: rgba(34, 117, 201, 0.3);
  }
  tr:hover {
    background-color: rgba(255, 255, 255, 0.7);
    color: black;
  }
}
.history-button {
  color: white;
  font-size: large;
  background-color: rgba(49, 99, 142, 0.6);
  position: relative;
  border-radius: 20px;
  border: 1px solid #aaa;
  float: right;
  display: block;
  padding: 2px 10px;
  cursor: pointer;
  &:hover {
    color: #ededed;
    background-color: rgba(74, 153, 195, 0.6);
    border-radius: 20px;
    box-shadow: 0px 0px 15px rgba(74, 153, 195, 0.6);
  }
}
.slide-fade-enter-active {
  transition: all 0.5s ease;
}
.slide-fade-leave-active {
  transition: all 0s;
}
.slide-fade-enter,
.slide-fade-leave-active {
  transform: translateX(-50px);
  opacity: 0.5;
}
@media (min-width: 1000px) {
  .ansys-table {
    width: 100%;
  }
}
</style>
