<template>
  <div class="detail-container" ref="detailContainer">
    <div style="display: flex; justify-content: flex-end; height: 300px">
      <!-- 左：儀表板 -->
      <div style="flex: 1">
        <VChart
          ref="detailGauge"
          id="detailGauge"
          :option="gaugeOption"
          autoresize
        />
      </div>

      <!-- 右：即時硬體資訊 + 裝置選擇 -->
      <div style="flex: 1">
        <div class="table-title">
          <div style="display: flex; align-items: center">
            <span class="block-title">
              {{ t("monitor.realtime-hardware") }}
            </span>
          </div>
          <v-btn
            class="history-button"
            size="small"
            variant="outlined"
            @click="hardwareHistoryLink"
          >
            {{ t("monitor.history-hardware") }}
          </v-btn>
        </div>

        <v-select
          v-if="deviceIpVeil"
          v-model="deviceIp"
          :items="deviceIpList"
          item-title="id"
          item-value="ip"
          @update:modelValue="changeDeviceIp"
          class="ip-selector"
          density="comfortable"
          variant="outlined"
        />

        <table class="infotable">
          <tbody>
            <tr>
              <th class="infoleft">{{ t("monitor.device-ip") }}</th>
              <th>{{ hardwareInfo.ipText }}</th>
            </tr>
            <tr>
              <td class="infoleft">{{ t("monitor.cpu-total") }}</td>
              <td>{{ hardwareInfo.cpuText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ t("monitor.cpu-residual") }}</td>
              <td>{{ hardwareInfo.remainingCpuText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ t("monitor.ram-total") }}</td>
              <td>{{ hardwareInfo.ramText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ t("monitor.ram-residual") }}</td>
              <td>{{ hardwareInfo.remainingRamText }}</td>
            </tr>
            <tr :title="hardwareInfo.diskTitle">
              <td class="infoleft">{{ t("monitor.disk-total") }}</td>
              <td>{{ hardwareInfo.totalDiskText }}</td>
            </tr>
            <tr :title="hardwareInfo.diskTitle">
              <td class="infoleft">{{ t("monitor.disk-residual") }}</td>
              <td>{{ hardwareInfo.remainingDiskText }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <br />

    <!-- 使用者柱狀圖 -->
    <VChart
      ref="UserBarChart"
      id="UserBarChart"
      :option="barOption"
      autoresize
    />

    <br />

    <!-- 许可區塊 -->
    <div class="license-section">
      <div style="flex: 1">
        <v-tabs
          v-model="activeTab"
          bg-color="#333"
          density="compact"
          slider-color="yellow"
          style="height: 40px; width: unset; margin-right: 20px"
        >
          <v-tab value="ansys" style="color: white">ANSYS</v-tab>
        </v-tabs>

        <transition name="slide-fade">
          <div v-if="activeTab === 'ansys'">
            <div class="tab-content-title">
              {{ t("monitor.realtime-licenses") }}
            </div>

            <VChart
              ref="almChart1"
              id="almChart"
              :option="almOption"
              autoresize
            />

            <div class="button-line">
              <v-btn class="page-button" variant="text" @click="showFirst">
                <img src="/img/Monitor/page-first.svg" />
              </v-btn>
              <v-btn class="page-button" variant="text" @click="showBefore">
                <img src="/img/Monitor/page-before.svg" />
              </v-btn>
              <v-btn class="page-button" variant="text" @click="showNext">
                <img src="/img/Monitor/page-next.svg" />
              </v-btn>
              <v-btn class="page-button" variant="text" @click="showLast">
                <img src="/img/Monitor/page-last.svg" />
              </v-btn>
            </div>

            <div style="flex: 1">
              <div style="width: 100%">
                <div class="table-title">
                  <span class="block-title">
                    {{ t("monitor.realtime-licenses-detail") }}
                  </span>
                  <div class="group">
                    <span class="grouptitle">{{ t("monitor.group") }}:</span>
                    <v-select
                      v-model="groupname"
                      :items="grouplist"
                      class="group-selector"
                      density="comfortable"
                      variant="outlined"
                      @update:modelValue="changelicense"
                    />
                  </div>

                  <div class="totalusagetime">
                    <label>{{ t("monitor.group-totaltime") }}:</label>
                    <label id="ansystotaltime">0</label>
                  </div>

                  <v-btn
                    class="history-button"
                    size="small"
                    variant="outlined"
                    @click="licenseHistoryTop100"
                  >
                    {{ t("monitor.history-licenses-top100") }}
                  </v-btn>
                  <v-btn
                    class="history-button"
                    size="small"
                    variant="outlined"
                    @click="licenseHistoryLink"
                  >
                    {{ t("monitor.history-licenses") }}
                  </v-btn>
                </div>

                <table class="ansys-table">
                  <tbody>
                    <tr>
                      <th>
                        <span
                          @click="sortLicenseLogList('User Name', $event)"
                          >{{ t("monitor.user-name") }}</span
                        >
                      </th>
                      <th>
                        <span>{{ t("monitor.group") }}</span>
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Device Name', $event)"
                          >{{ t("monitor.device-name") }}</span
                        >
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Feature Name', $event)"
                          >{{ t("monitor.feature-name") }}</span
                        >
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Start Time', $event)"
                          >{{ t("monitor.start-time") }}</span
                        >
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Time Used', $event)"
                          >{{ t("monitor.used-time") }}</span
                        >
                      </th>
                      <th style="cursor: not-allowed">Termination</th>
                    </tr>

                    <tr v-for="item in licenseLogList" :key="item.Handle">
                      <td>{{ item.UserName }}</td>
                      <td>{{ groupprintdict(item.UserName) }}</td>
                      <td>{{ item.Host }}</td>
                      <td>{{ item.ModuleName }}</td>
                      <td>{{ item.StartTime }}</td>
                      <td>
                        {{
                          t(
                            "monitor.format-time",
                            getActiveTime(item.StartTime)
                          )
                        }}
                      </td>
                      <td>
                        <v-btn v-if="item.terminating" size="small" disabled>
                          Terminating
                        </v-btn>

                        <v-btn
                          v-else
                          size="small"
                          color="error"
                          :disabled="!enableTerminateButton(item.StartTime)"
                          @click="openTerminateAlert(item)"
                        >
                          Terminate
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 確認對話框（請改成你專案的 Vuetify Dialog；這裡先沿用你的元件） -->
    <confirm-dialog
      :title="'Are you sure to terminate the usage of this license?'"
      :openAlert="showTerminateConfirm"
      :safeOption="t('common.cancel')"
      :dangerOption="t('common.confirm')"
      confirmColor="primary"
      @closeConfirmDialog="terminateLicense($event)"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  nextTick,
} from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import QiProgress from "@/components/common/QiProgress.vue"
import { useRouter } from "vue-router"
// ---- vue-echarts + echarts (Vue 3 寫法) ----
import { use as echartsUse } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart, GaugeChart } from "echarts/charts"
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components"
import VChart from "vue-echarts"

echartsUse([
  CanvasRenderer,
  BarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

// ---- API ----
import {
  apiMonitorDetail,
  apiGetLicensesListByIp,
  apiTerminateLicense,
  apiMonitorList,
  apiAdminConfig,
} from "@/assets/ts/api"

type LicenseLog = {
  Task?: number
  Handle?: string
  Product?: string
  StartTime?: string
  Host?: string
  UserName?: string
  terminating?: boolean
  ModuleName?: string
}
type HardwareInfo = {
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

const props = defineProps<{ ip?: string; group?: Record<string, unknown> }>()
const router = useRouter()
// i18n
const { t } = useI18n()

// Vuex（假設專案仍使用 Vuex 4）
const store = useStore()
const layout = computed(() => store.getters?.layout || {})
const userInfo = computed(() => store.getters?.userInfo || {})
const changeLoadingState = (payload: any) =>
  store.dispatch?.("changeLoadingState", payload)
const setDeviceIpList = (payload: any) =>
  store.dispatch?.("setDeviceIpList", payload)

// ---- 狀態 ----
const activeTab = ref<"ansys">("ansys")

const licenseLogList = ref<LicenseLog[]>([])
const AlllicenseLogList = ref<LicenseLog[]>([])
const groupdict = reactive<Record<string, string>>({})
const grouplist = ref<string[]>([])
const groupname = ref<string>("")

const deviceIp = ref<string>("")
const deviceIpVeil = ref<boolean>(false)
const deviceIpList = ref<Array<{ id: string; ip: string }>>([])

const showTerminateConfirm = ref(false)
const selectedLicense = ref<LicenseLog>({})
const terminationDisableMinute = ref(5)
const sortOrder = ref<"asc" | "dsc">("asc")
const sortBy = ref<string>("")

const dataLoading = computed(() => t("common.data-loading"))

const hardwareInfo = reactive<HardwareInfo>({
  ipText: dataLoading.value,
  cpuText: dataLoading.value,
  remainingCpuText: dataLoading.value,
  ram: dataLoading.value as unknown as string,
  ramText: dataLoading.value,
  remainingRamText: dataLoading.value,
  totalDiskText: dataLoading.value,
  remainingDiskText: dataLoading.value,
  diskTitle: dataLoading.value,
})

// ---- ECharts Options （保持你的造型）----
const gaugeOption = reactive<any>({
  backgroundColor: "#1b1b1b",
  tooltip: { formatter: "{a} <br/>{c}(%)" },
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
      axisLabel: { color: "#fff", fontWeight: "bolder", fontSize: 12 },
      axisTick: { length: 10, lineStyle: { color: "auto" } },
      splitLine: { length: 20, lineStyle: { width: 2, color: "#fff" } },
      pointer: { shadowColor: "#fff", shadowBlur: 5 },
      title: { color: "#fff", fontWeight: "bolder", fontSize: 14 },
      detail: {
        offsetCenter: [0, "50%"],
        formatter: "{value}%",
        color: "#fff",
        fontSize: 14,
      },
      data: [{ value: 0, name: "CPU" }],
    },
    {
      name: "RAM",
      type: "gauge",
      center: ["18%", "55%"],
      radius: "70%",
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
      axisLabel: { color: "#fff", fontSize: 10 },
      axisTick: { length: 8, lineStyle: { color: "auto" } },
      splitLine: { length: 15, lineStyle: { width: 2, color: "#fff" } },
      pointer: { width: 4 },
      title: { offsetCenter: [0, "-25%"], color: "#fff", fontWeight: "bolder" },
      detail: {
        offsetCenter: [0, "50%"],
        formatter: "{value}%",
        color: "#fff",
        fontSize: 12,
      },
      data: [{ value: 0, name: "RAM" }],
    },
    {
      name: "Disk",
      type: "gauge",
      center: ["82%", "55%"],
      radius: "70%",
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
      axisTick: { length: 8, lineStyle: { color: "auto" } },
      axisLabel: { color: "#fff", fontSize: 10 },
      splitLine: { length: 15, lineStyle: { width: 2, color: "#fff" } },
      pointer: { width: 2 },
      title: { color: "#fff", fontWeight: "bolder" },
      detail: {
        offsetCenter: [0, "50%"],
        formatter: "{value}%",
        color: "#fff",
        fontSize: 12,
      },
      data: [{ value: 0, name: "Disk" }],
    },
  ],
})

const barOption = reactive<any>({
  backgroundColor: "rgba(255,255,255,0.1)",
  color: ["rgba(219,61,61,0.7)", "rgba(30, 144, 255,0.7)"],
  title: {
    text: "Current Users",
    fontWeight: "bolder",
    color: "#fff",
    subtext: "(%)",
    left: "1%",
    top: "2%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter:
      `{b}<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#a93a3a;"></span>` +
      `{a0}: {c0}%<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#2474c2;"></span>` +
      `{a1}: {c1}%`,
  },
  legend: {
    data: ["CPU", "RAM"],
    textStyle: { color: "#fff" },
    top: "3%",
  },
  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  xAxis: [
    {
      max: 100,
      type: "value",
      boundaryGap: [0, 0.01],
      axisLabel: { color: "#fff" },
    },
  ],
  yAxis: [{ type: "category", data: [], axisLabel: { color: "#fff" } }],
  series: [
    { name: "CPU", type: "bar", data: [] },
    { name: "RAM", type: "bar", data: [] },
  ],
})

const almOption = reactive<any>({
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: any[]) => {
      const name = params?.[0]?.name ?? ""
      const rec = almTooltipData.find(i => i.Feature === name)
      const use = rec?.Use ?? 0
      const issued = rec?.Issued ?? 0
      const pct = params?.[0]?.value ?? 0
      return `Moudule: ${name}<br>
      <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#14c8d4;"></span>
      ${use}/${issued} (${pct}%)`
    },
  },
  grid: { left: 130, right: 30 },
  legend: {
    data: ["On duty", "Total"],
    top: "5%",
    textStyle: { color: "#ccc" },
    selectedMode: false,
  },
  yAxis: {
    axisLabel: { show: true, interval: 0, margin: 8 },
    data: [],
    axisLine: { lineStyle: { color: "#ccc" } },
  },
  xAxis: {
    splitLine: { show: false },
    axisLine: { lineStyle: { color: "#ccc" } },
  },
  series: [
    {
      name: "On duty",
      type: "bar",
      barWidth: 10,
      itemStyle: {
        formatter: "{b}\n{c}%",
        borderRadius: 5,
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#14c8d4" },
            { offset: 1, color: "#43eec6" },
          ],
        },
      },
      data: [],
    },
    {
      name: "Total",
      type: "bar",
      barGap: "-100%",
      barWidth: 10,
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#7c7c7c" },
            { offset: 0.2, color: "#666666" },
            { offset: 1, color: "#545454" },
          ],
        },
      },
      z: -12,
      data: [],
    },
  ],
})

const almData = reactive({
  dataY: [] as string[],
  dataS0: [] as number[],
  dataS1: [] as number[],
  almPagePointer: 0,
  almModulesPerPage: 15,
})

let almTooltipData: Array<{ Feature: string; Use: number; Issued: number }> = []

// ---- Refs ----
const detailGauge = ref<InstanceType<typeof VChart> | null>(null)
const UserBarChart = ref<InstanceType<typeof VChart> | null>(null)

let timer: number | undefined

// ---- methods ----
function changelicense() {
  licenseLogList.value = resetalmTooltipData(AlllicenseLogList.value)
  settime("ansystotaltime", licenseLogList.value)
}
function detectRWD() {
  // 這裡使用 autoresize，保留寬度邏輯簡化
  // 若仍需計算寬度，可用下列參考：
  const isShown = layout.value?.isSidenavShown
  const sw = layout.value?.sidenavWidth || 0
  if (UserBarChart.value) {
    UserBarChart.value.resize({
      width: isShown ? window.innerWidth - sw - 60 : window.innerWidth - 60,
    } as any)
  }
}

function changeDeviceIp() {
  changeLoadingState(true)
}

function changeLangHandler() {
  almOption.legend.data[0] = t("monitor.on-duty")
  almOption.legend.data[1] = t("monitor.total")
  almOption.series[0].name = t("monitor.on-duty")
  almOption.series[1].name = t("monitor.total")
}

function getActiveTime(startTime?: string) {
  const MS_PER_HOUR = 60 * 60 * 1000
  const MS_PER_MINUTE = 60 * 1000
  if (!startTime) return { hh: 0, mm: 0 }
  const currentTime = Date.now()
  const isoTime = startTime.replace(/\//g, "-").replace(" ", "T") + "+08:00"
  const startTimestamp = new Date(isoTime).getTime()
  const diff = currentTime - startTimestamp
  const hour = Math.floor(diff / MS_PER_HOUR)
  const min = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE)
  return { hh: hour, mm: min }
}

function enableTerminateButton(startTime?: string) {
  const timeObj = getActiveTime(startTime)
  if (userInfo.value?.isAdmin) {
    if (timeObj.hh === 0 && timeObj.mm < terminationDisableMinute.value)
      return false
    return true
  }
  return false
}

function openTerminateAlert(item: LicenseLog) {
  showTerminateConfirm.value = true
  selectedLicense.value = item
}

function terminateLicense(isConfirm: boolean) {
  if (isConfirm) {
    const terminatingQueue: string[] = []
    if (selectedLicense.value?.Handle)
      terminatingQueue.push(selectedLicense.value.Handle)
    localStorage.setItem("terminatingQueue", JSON.stringify(terminatingQueue))

    const payload: any = { ...selectedLicense.value }
    delete payload.terminating

    apiTerminateLicense(payload)
      .then((res: any) => {
        if (res.data === "success") {
        } else if (res.data === "error") {
          changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            message: res.data.errorMessage,
          })
        }
      })
      .catch(console.log)
  }
  showTerminateConfirm.value = false
}

function licenseHistoryLink() {
  // 保留原路由名稱
  router.push({
    name: "LicenseHistory",
    params: { ip: deviceIp.value },
  })
}

function licenseHistoryTop100() {
  router.push({ name: "CheckInTop200" })
}

function hardwareHistoryLink() {
  router.push({
    name: "HardwareHistory",
    params: { ip: deviceIp.value },
  })
}

function sortLicenseLogList(option?: string, event?: MouseEvent) {
  if (event) sortOrder.value = sortOrder.value === "asc" ? "dsc" : "asc"
  switch (option) {
    case "User Name":
      sortBy.value = "User Name"
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.UserName! > b.UserName!
            ? 1
            : -1
          : b.UserName! > a.UserName!
          ? 1
          : -1
      )
      break
    case "Device Name":
      sortBy.value = "Device Name"
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.Host! > b.Host!
            ? 1
            : -1
          : b.Host! > a.Host!
          ? 1
          : -1
      )
      break
    case "Feature Name":
      sortBy.value = "Feature Name"
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.ModuleName! > b.ModuleName!
            ? 1
            : -1
          : b.ModuleName! > a.ModuleName!
          ? 1
          : -1
      )
      break
    default:
      sortBy.value = ""
      licenseLogList.value.sort((a, b) =>
        sortOrder.value === "asc"
          ? a.StartTime! > b.StartTime!
            ? 1
            : -1
          : b.StartTime! > a.StartTime!
          ? 1
          : -1
      )
      break
  }
}

function showCurrPage() {
  const temp = { y: [] as string[], s0: [] as number[], s1: [] as number[] }
  for (
    let i = almData.almPagePointer;
    i < almData.almPagePointer + almData.almModulesPerPage;
    i++
  ) {
    temp.y.push(almData.dataY[i])
    temp.s0.push(almData.dataS0[i])
    temp.s1.push(almData.dataS1[i])
  }
  almOption.yAxis.data = temp.y.reverse()
  almOption.series[0].data = temp.s0.reverse()
  almOption.series[1].data = temp.s1.reverse()
}

function showFirst() {
  almData.almPagePointer = 0
  showCurrPage()
}
function showBefore() {
  const d = almData
  if (d.almPagePointer > d.almModulesPerPage)
    d.almPagePointer -= d.almModulesPerPage
  else d.almPagePointer = 0
  showCurrPage()
}
function showNext() {
  const d = almData
  if (d.almPagePointer < d.dataY.length - 2 * d.almModulesPerPage)
    d.almPagePointer += d.almModulesPerPage
  else d.almPagePointer = d.dataY.length - d.almModulesPerPage
  showCurrPage()
}
function showLast() {
  almData.almPagePointer = almData.dataY.length - almData.almModulesPerPage
  showCurrPage()
}

function resetalmTooltipData(list: LicenseLog[]) {
  if (typeof list !== "undefined" && groupname.value !== "ALL") {
    const newlist: LicenseLog[] = []
    const selectlist: string[] = []
    for (const [k, v] of Object.entries(groupdict)) {
      if (v.split(",").includes(groupname.value)) selectlist.push(k)
    }
    for (const key of list) {
      if (
        key.UserName &&
        selectlist
          .map(x => x.toLowerCase())
          .includes(key.UserName.toLowerCase())
      ) {
        newlist.push(key)
      }
    }
    return newlist
  } else {
    return list
  }
}

function settime(elId: string, list: LicenseLog[]) {
  const end = new Date()
  let mstime = 0
  let totaltime = "0"
  if (list.length) {
    for (const key of list)
      mstime += end.getTime() - Date.parse(key.StartTime || "")
    const time = mstime / 1000
    const day = Math.floor(time / 60 / 60 / 24)
    const hour = Math.floor(time / 60 / 60) % 24
    const minute = Math.floor(time / 60) % 60
    const second = Math.floor(time) % 60
    totaltime = `${day}Day ${hour}:${minute}:${second}`
  }
  const obj = document.getElementById(elId)
  if (obj) obj.innerText = totaltime
}

function groupprintdict(key?: string) {
  if (!key) return ""
  const lowerKey = key.toLowerCase()
  const lowerDict: Record<string, string> = {}
  Object.entries(groupdict).forEach(
    ([k, v]) => (lowerDict[k.toLowerCase()] = v)
  )
  return lowerDict[lowerKey] || ""
}

// ---- 資料抓取與更新 ----
function updateViewData() {
  const payload = { ip: deviceIp.value }
  apiMonitorDetail(payload)
    .then((res: any) => {
      updateGauge(res.data)
      updateUserBarChart(res.data.UserList || [])
      updateLicenseBarChart(res.data.LicenseLogList || [])
      updateLicenseLog(res.data.LicenseLogList || [])
      settime("ansystotaltime", licenseLogList.value)
      sortLicenseLogList(sortBy.value)
      changeLoadingState(false)
    })
    .catch(console.log)

  function updateGauge(data: any) {
    let totalCapacity = 0
    let availableCapacity = 0
    let diskUtilization = 0
    let remainingCpu = 0
    let remainingRam = 0
    let diskTitle = ""
    let cpuUtilization = 0
    let ramUtilization = 0

    if (data.DiskData?.length) {
      for (const d of data.DiskData) {
        diskTitle += t("monitor.diskTitle", {
          disk: d.Name,
          total: d.Total_space.toFixed(1),
          residual: d.Capacity.toFixed(1),
        })
      }
      hardwareInfo.diskTitle = diskTitle
      const tmp = getDiskUtilization(data.DiskData)
      diskUtilization = Number(tmp)
    }

    try {
      cpuUtilization = Number(data.CpuData?.Utilization?.toFixed(1)) || 0
      ramUtilization = Number(data.MemoryData?.Utilization?.toFixed(1)) || 0
      remainingCpu = Math.ceil(
        ((100 - cpuUtilization) / 100) * (data.CpuData?.Number || 0)
      )
      remainingRam = Math.ceil(
        ((100 - ramUtilization) / 100) * (data.MemoryData?.Size || 0)
      )

      hardwareInfo.ipText = data.Ip
      hardwareInfo.cpuText = t(
        "monitor.core",
        data.CpuData?.Number || 0
      ) as unknown as string
      hardwareInfo.remainingCpuText = t(
        "monitor.core",
        remainingCpu
      ) as unknown as string
      hardwareInfo.ramText = (data.MemoryData?.Size || 0) + " (MB)"
      hardwareInfo.remainingRamText = remainingRam + " (MB)"
      hardwareInfo.totalDiskText = totalCapacity.toFixed(0) + " (GB)"
      hardwareInfo.remainingDiskText = Math.ceil(availableCapacity) + " (GB)"
    } catch {
      hardwareInfo.ipText = data.Ip
      hardwareInfo.cpuText = t("monitor.device-disconnected")
      hardwareInfo.remainingCpuText = t("monitor.device-disconnected")
      hardwareInfo.ramText = t("monitor.device-disconnected")
      hardwareInfo.remainingRamText = t("monitor.device-disconnected")
      hardwareInfo.totalDiskText = t("monitor.device-disconnected")
      hardwareInfo.remainingDiskText = t("monitor.device-disconnected")
    }

    gaugeOption.series[0].data[0].value = cpuUtilization
    gaugeOption.series[1].data[0].value = ramUtilization
    gaugeOption.series[2].data[0].value = diskUtilization

    function getDiskUtilization(diskData: any[]) {
      totalCapacity = 0
      availableCapacity = 0
      for (const d of diskData) {
        totalCapacity += d.Total_space
        availableCapacity += d.Capacity
      }
      return (
        ((totalCapacity - availableCapacity) / totalCapacity) *
        100
      ).toFixed(1)
    }
  }

  function updateUserBarChart(
    userInfo: Array<{ user: string; cpu: number; ram: number }>
  ) {
    userInfo.sort((a, b) => a.cpu - b.cpu)
    barOption.yAxis[0].data = userInfo.map(i => i.user)
    barOption.series[0].data = userInfo.map(i => i.cpu.toFixed(2))
    barOption.series[1].data = userInfo.map(i => i.ram.toFixed(2))
    barOption.title.text = t("monitor.realtime-users")
    barOption.title.subtext = t("monitor.realtime-users-subtext")
  }

  function updateLicenseBarChart(licenseLog: LicenseLog[]) {
    if (almTooltipData.length === 0) return
    const features = [...new Set(licenseLog.map(i => i.Product))]
    const dutyLicenses: Array<{
      Feature: string
      Issued: number
      Use: number
    }> = []
    almTooltipData.forEach(x => (x.Use = 0))
    for (const f of features) {
      const rec = almTooltipData.find(x => x.Feature === f)!
      const duty = {
        Feature: f || "",
        Issued: rec?.Issued ?? 0,
        Use: licenseLog
          .filter(x => x.Product === f)
          .reduce((acc, it) => acc + (it.Task || 0), 0),
      }
      const target = almTooltipData.find(x => x.Feature === f)
      if (target) target.Use = duty.Use
      dutyLicenses.push(duty)
    }
    const data = dutyLicenses.map(d => ({
      feature: d.Feature,
      usageDenominator: 100,
      usageFraction: d.Issued ? Math.round((d.Use / d.Issued) * 100) : 0,
    }))
    // reset
    almData.dataS0 = almData.dataS0.map(() => 0)
    for (const d of data) {
      const idx = almData.dataY.findIndex(f => f === d.feature)
      if (idx >= 0) almData.dataS0[idx] = d.usageFraction
    }
    // sort
    const list = almData.dataY
      .map((f, i) => ({ feature: f, rate: almData.dataS0[i] }))
      .sort((a, b) => b.rate - a.rate)
    list.forEach((it, j) => {
      almData.dataY[j] = it.feature
      almData.dataS0[j] = it.rate
    })
    if (almData.dataY.length > 0) showCurrPage()
  }

  function updateLicenseLog(licenseLog: LicenseLog[]) {
    const terminatingSet = new Set<string>(
      JSON.parse(localStorage.getItem("terminatingQueue") || "[]")
    )
    const currentHandleSet = new Set<string>(
      licenseLog.map(i => String(i.Handle))
    )
    // remove finished
    for (const h of Array.from(terminatingSet)) {
      if (!currentHandleSet.has(h)) terminatingSet.delete(h)
    }
    localStorage.setItem(
      "terminatingQueue",
      JSON.stringify(Array.from(terminatingSet))
    )

    licenseLog.forEach(item => {
      item.ModuleName =
        item.Task && item.Task > 1
          ? `${item.Product} x ${item.Task}`
          : item.Product
      item.terminating = item.Handle
        ? terminatingSet.has(String(item.Handle))
        : false
    })

    AlllicenseLogList.value = [...licenseLog].reverse()
    licenseLogList.value = resetalmTooltipData(AlllicenseLogList.value)
  }
}

function getAnsysLicenseModules() {
  apiGetLicensesListByIp({ ip: deviceIp.value })
    .then((res: any) => {
      const alm: Array<{ Feature: string; Use: number; Issued: number }> =
        res.data || []
      almTooltipData = alm
      const data = alm
        .map(x => ({
          feature: x.Feature,
          usageDenominator: 100,
          usageFraction: x.Issued ? Math.round((x.Use / x.Issued) * 100) : 0,
        }))
        .sort((a, b) => b.usageFraction - a.usageFraction)

      data.forEach((d, i) => {
        almData.dataY[i] = d.feature
        almData.dataS0[i] = d.usageFraction
        almData.dataS1[i] = d.usageDenominator
      })
      if (almData.dataY.length > 0) showCurrPage()
    })
    .catch(console.log)
}

function updatePage() {
  deviceIpList.value.sort((a, b) =>
    a.ip.replace("192.168.33", "0") > b.ip.replace("192.168.33", "0") ? 1 : -1
  )
  if (deviceIpList.value.length > 0) {
    deviceIp.value = props.ip || deviceIpList.value[0].ip
    deviceIpVeil.value = true

    // 啟動輪詢
    timer = window.setInterval(
      (function loop() {
        if (almData.dataY.length === 0) getAnsysLicenseModules()
        updateViewData()
        return loop
      })(),
      2000
    )
  } else {
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      message: "Please set monitor cluster correctly",
    })
  }
}

// ---- lifecycle ----
onMounted(async () => {
  changeLoadingState(true)

  // 取得群組與成員映射
  const cfg = await apiAdminConfig()
  const res = cfg.data
  res.allGroups.forEach((group: any) => {
    group.members.split(",").forEach((member: string) => {
      const trimmed = member.trim()
      res.members.forEach((detail: any) => {
        if (trimmed === detail.display_name) {
          const key = detail.computeraccount
          if (groupdict[key]) {
            if (!groupdict[key].split(",").includes(group.name)) {
              groupdict[key] += `,${group.name}`
            }
          } else {
            groupdict[key] = group.name
          }
        }
      })
    })
  })
  grouplist.value = Array.from(
    new Set(
      Object.values(groupdict)
        .flatMap(v => v.split(","))
        .concat("ALL")
    )
  )
  groupname.value = "ALL"

  // 取得設備列表
  const listRes = await apiMonitorList()
  deviceIpList.value = listRes.data.map((i: any) => ({ id: i.Id, ip: i.Ip }))
  setDeviceIpList(listRes.data.map((i: any) => ({ ip: i.Ip, id: i.Id })))

  updatePage()

  window.addEventListener("resize", detectRWD)
  // 如有多語切換事件，可用全域 CustomEvent
  window.addEventListener("changeLanguage", changeLangHandler as any)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", detectRWD)
  window.removeEventListener("changeLanguage", changeLangHandler as any)
  if (timer) clearInterval(timer)
})
</script>

<style lang="less" scoped>
.totalusagetime label {
  font-size: 18px;
}
.group-selector {
  width: 100px;
  padding: 20% 0%;
  min-height: unset;
}

.group {
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: center; /* 水平置中（如果需要整組置中） */
  margin: 0;
}
.grouptitle {
  font-size: 18px;
  margin-right: 8px; /* 讓標題和選單有點間距 */
}

.detail-container {
  margin: 20px;
  font-size: 14px; /* 基础文字大小，可改为 15px / 16px */
  padding: 0px;
}
#detailGauge {
  width: 100%;
  height: 300px;
  max-width: 590px;
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
  font-size: 18px; /* 標題文字 */
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
  font-size: 14px;
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
.v-btn {
  text-transform: none;
}
.history-button {
  color: white;
  font-size: 18px;
  background-color: rgba(49, 99, 142, 0.6);
  border-radius: 20px;
  border: 1px solid #aaa;
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
.v-chart {
  font-size: 14px !important;
}
</style>
