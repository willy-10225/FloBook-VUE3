<template>
  <v-container class="history-container" style="width: 70%">
    <v-row class="bg-grey-darken-2">
      <v-col cols="12" lg="12" sm="12">
        <div class="ansyshistitle">
          <h2>{{ $t("monitor.history-hardware") }}</h2>
          <br />
          <v-select
            v-model="deviceIp"
            class="ip-selector"
            :label="'ip'"
            :items="deviceIpList"
            item-title="id"
            item-value="ip"
            @update:model-value="handleDeviceIpChange"
          ></v-select
          ><br />
          {{ $t("monitor.select-time") }}<br />
          {{ $t("monitor.history-notice") }}
        </div>
      </v-col>
      <v-col cols="12" lg="3" sm="6">
        <v-menu
          v-model="startMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ props }">
            <v-text-field
              v-model="formattedStartDate"
              v-bind="props"
              :label="$t('monitor.start-date')"
              readonly
              style="width: 100%"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="startDate"
            @update:model-value="alertFn"
            :locale="$i18n.locale"
            no-title
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" lg="3" sm="6">
        <v-menu
          v-model="endmenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ props }">
            <v-text-field
              v-model="formattedEndDate"
              v-bind="props"
              :label="$t('monitor.end-date')"
              readonly
              style="width: 100%"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="endDate"
            @update:model-value="alertFn"
            :locale="$i18n.locale"
            no-title
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" lg="2" sm="6" v-if="time">
        <v-select
          v-model="time_interval"
          :label="$t('monitor.time-interval')"
          :items="timelist"
        ></v-select>
      </v-col>
      <v-col cols="12" lg="2" sm="6">
        <v-select
          v-model="userName"
          :label="$t('monitor.user-name')"
          :items="hardwareUserList"
          @update:model-value="get_data()"
        ></v-select>
      </v-col>
      <v-col cols="12" lg="2" sm="6">
        <br />
        <v-btn
          :disabled="disableSearch"
          color="blue-grey-darken-4"
          @click="submit"
          >{{ $t("common.search") }}</v-btn
        >
      </v-col>
      <v-alert
        type="warning"
        v-if="emptyAlert"
        closable
        @click:close="emptyAlert = false"
      >
        <v-icon>mdi-alert</v-icon>
        {{ $t("validate.selectDuration") }}
      </v-alert>
      <v-alert
        type="error"
        v-if="numericalAlert"
        closable
        @click:close="numericalAlert = false"
      >
        <v-icon>mdi-alert-circle</v-icon>
        {{ $t("validate.wrongDuration") }}
      </v-alert>
    </v-row>
    <h2 v-if="isDisplay">{{ $t("monitor.hardware-utilization") }}</h2>
    <SimpleGauge
      v-if="isDisplay"
      :percent="gaugeData.avgCpu"
      :title="{ text: $t('monitor.average-utilization'), subtext: '(CPU)' }"
    ></SimpleGauge>
    <SimpleGauge
      v-if="isDisplay"
      :percent="gaugeData.maxCpu"
      :title="{ text: $t('monitor.maximun-utilization'), subtext: '(CPU)' }"
    ></SimpleGauge>
    <SimpleGauge
      v-if="isDisplay"
      :percent="gaugeData.avgRam"
      :title="{ text: $t('monitor.average-utilization'), subtext: '(RAM)' }"
    ></SimpleGauge>
    <SimpleGauge
      v-if="isDisplay"
      :percent="gaugeData.maxRam"
      :title="{ text: $t('monitor.maximun-utilization'), subtext: '(RAM)' }"
    ></SimpleGauge>
    <VueECharts
      ref="hwHistoryChart"
      class="history-chart"
      v-if="isDisplay"
      :options="hwHistoryOption"
    ></VueECharts>
  </v-container>
</template>

<script setup lang="ts">
import {
  ref,
  nextTick,
  computed,
  watch,
  onMounted,
  onUnmounted,
  getCurrentInstance,
} from "vue"
import { useStore } from "vuex"
import SimpleGauge from "@/components/Monitor/SimpleGauge.vue"
import {
  apiGetHardwareUserListByIp,
  apiGetHardwareHistory,
  apiMonitorList,
} from "@/assets/ts/api"

interface DeviceIp {
  id: string
  ip: string
}

interface GaugeData {
  avgCpu: number
  avgRam: number
  maxCpu: number
  maxRam: number
}

interface HardwareData {
  listtime: string
  cpulist: number[]
  ramlist: number[]
  avgcpu: number
  avgram: number
}

const props = defineProps<{
  ip: string
}>()

const store = useStore()
const instance = getCurrentInstance()

const deviceIp = ref<string>("")
const time = ref<boolean>(true)
const Alltimelist = ref<string[]>(["10min", "30min", "1hr", "4hr", "1day"])
const timelist = ref<string[]>(["10min", "30min", "1hr", "4hr", "1day"])
const disableSearch = ref<boolean>(true)
const deviceIpList = ref<DeviceIp[]>([])
const isDisplay = ref<boolean>(false)
const startDate = ref<Date>(
  new Date(new Date().toISOString().split("T")[0] + " 00:00:00")
)
const startMenu = ref(false)
const endDate = ref<Date>(new Date())
const endmenu = ref(false)
const userName = ref<string>("")
const time_interval = ref<string>("10min")
const numericalAlert = ref<boolean>(false)
const emptyAlert = ref<boolean>(false)
const hardwareUserList = ref<string[]>([])
const hwHistoryChart = ref<any>(null)

const gaugeData = ref<GaugeData>({
  avgCpu: 0,
  avgRam: 0,
  maxCpu: 0,
  maxRam: 0,
})

const hwHistoryOption = ref<any>({
  title: {
    text: "",
    left: "center",
    textStyle: {
      color: "white",
      fontSize: 28,
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      lineStyle: {
        color: "#376df4",
        width: 2,
        opacity: 1,
      },
    },
  },
  legend: {
    data: ["CPU", "RAM", "CPUline", "RAMline"],
    top: "6%",
    textStyle: { color: "#fff" },
    selected: {
      CPU: true,
      RAM: true,
      CPUline: false,
      RAMline: false,
    },
  },
  grid: {
    left: "5%",
    right: "5%",
    top: "16%",
  },
  xAxis: [
    {
      type: "category",
      data: [] as string[],
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#ffffff" } },
    },
  ],
  yAxis: [
    {
      scale: true,
      axisLine: { lineStyle: { color: "#ffffff" } },
      splitLine: { show: false },
    },
  ],
  dataZoom: [
    {
      textStyle: {
        color: "#8392A5",
      },
      handleIcon:
        "path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
      dataBackground: {
        areaStyle: {
          color: "#8392A5",
        },
        lineStyle: {
          opacity: 0.8,
          color: "#8392A5",
        },
      },
      brushSelect: true,
      type: "slider",
      show: true,
    },
  ],
  series: [
    {
      name: "CPU",
      type: "candlestick",
      data: [] as number[][],
      itemStyle: {
        color: "#FD1050",
        color0: "#0CF49B",
        borderColor: "#FD1050",
        borderColor0: "#0CF49B",
      },
      markLine: {
        symbol: ["none", "none"],
        data: [[{ emphasis: {} }, { emphasis: {} }]],
      },
    },
    {
      name: "RAM",
      type: "candlestick",
      data: [] as number[][],
      itemStyle: {
        color: "#FD1050",
        color0: "#0CF49B",
        borderColor: "#FD1050",
        borderColor0: "#0CF49B",
      },
      markLine: {
        symbol: ["none", "none"],
        data: [[{ emphasis: {} }, { emphasis: {} }]],
      },
    },
    {
      name: "CPUline",
      type: "line",
      data: [] as number[],
      smooth: true,
      showSymbol: false,
      lineStyle: {
        opacity: 1,
      },
    },
    {
      name: "RAMline",
      type: "line",
      data: [] as number[],
      smooth: true,
      showSymbol: false,
      lineStyle: {
        opacity: 1,
      },
    },
  ],
})
const formattedEndDate = computed({
  get: () => {
    const d = endDate.value
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, "0")
    const day = d.getDate().toString().padStart(2, "0")
    return `${y}-${m}-${day}`
  },
  set: (val: string) => {
    endDate.value = val ? new Date(val) : new Date()
  },
})
const formattedStartDate = computed({
  get: () => {
    const d = startDate.value
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, "0")
    const day = d.getDate().toString().padStart(2, "0")
    return `${y}-${m}-${day}`
  },
  set: (val: string) => {
    startDate.value = val ? new Date(val) : new Date()
  },
})
const layout = computed(() => store.getters.layout)

const changeLoadingState = (
  state: boolean | { showDialog: boolean; isTimerNeeded: boolean }
) => {
  store.dispatch("changeLoadingState", state)
}

const alertFn = () => {
  const timeDiff = endDate.value.getTime() - startDate.value.getTime()
  if (timeDiff / (1000 * 60 * 10) < 500) {
    timelist.value = [...Alltimelist.value]
  } else if (timeDiff / (1000 * 60 * 30) < 500) {
    timelist.value = Alltimelist.value.slice(-5)
  } else if (timeDiff / (1000 * 60 * 60) < 500) {
    timelist.value = Alltimelist.value.slice(-4)
  } else if (timeDiff / (1000 * 60 * 60 * 4) < 500) {
    timelist.value = Alltimelist.value.slice(-3)
  } else if (timeDiff / (1000 * 60 * 60 * 24) < 500) {
    timelist.value = Alltimelist.value.slice(-2)
  } else if (timeDiff / (1000 * 60 * 60 * 24 * 30) < 500) {
    timelist.value = Alltimelist.value.slice(-1)
  }
  time_interval.value = timelist.value[0]
}
const formatDateTime = (date: Date): string => {
  const pad = (n: number) => (n < 10 ? "0" + n : n)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

const submit = () => {
  if (startDate.value !== undefined && endDate.value !== undefined) {
    if (startDate.value <= endDate.value) {
      getHardwareHistory(
        deviceIp.value,
        userName.value,
        startDate.value,
        endDate.value,
        time_interval.value
      )
      emptyAlert.value = false
      numericalAlert.value = false
    } else {
      emptyAlert.value = false
      numericalAlert.value = true
    }
  } else {
    emptyAlert.value = true
  }
}

const handleDeviceIpChange = () => {
  getHardwareUserList()
}

const getHardwareUserList = () => {
  apiGetHardwareUserListByIp({
    Ip: deviceIp.value,
    Start: startDate.value.toISOString(),
    End: endDate.value.toISOString(),
  })
    .then((res: any) => {
      const newHardwareUserList = res.data

      if (!newHardwareUserList.includes(userName.value)) {
        userName.value = newHardwareUserList[newHardwareUserList.length - 1]
      }

      hardwareUserList.value = newHardwareUserList
      disableSearch.value = false
    })
    .catch((err: any) => {
      console.log(err)
    })
}

const get_data = () => {
  // Implementation needed based on original logic
}

const getHardwareHistory = async (
  ip: string,
  userName: string,
  startDate: Date,
  endDate: Date,
  time_interval: string
) => {
  try {
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isTimerNeeded: false,
    })
    const isToday = endDate.toDateString() === new Date().toDateString()
    const pickedEnd = !isToday
      ? new Date(endDate.toISOString().split("T")[0] + " 23:59:59")
      : endDate

    const payload = {
      ip: ip,
      user: userName,
      start: formatDateTime(startDate),
      end: formatDateTime(pickedEnd),
      time_interval: time_interval,
    }

    getHardwareUserList()
    const res = await apiGetHardwareHistory(payload)
    showChart(res.data)
    getGaugeData(res.data)
  } catch (err) {
    console.log(err)
  } finally {
    changeLoadingState(false)
  }
}

const showChart = async (data: HardwareData[]) => {
  isDisplay.value = true
  await nextTick()
  // 更新圖表配置
  hwHistoryOption.value.title.text =
    instance?.appContext.config.globalProperties.$t(
      "monitor.utilization-duration",
      { userName: userName.value }
    )
  hwHistoryOption.value.xAxis[0].data = data.map(item => item.listtime)
  // CPU K 線圖
  hwHistoryOption.value.series[0].data = data.map(item =>
    item.cpulist.map(j => Math.round(j * 10) / 10)
  )
  // RAM K 線圖
  hwHistoryOption.value.series[1].data = data.map(item =>
    item.ramlist.map(j => Math.round(j * 10) / 10)
  )
  // CPU line
  hwHistoryOption.value.series[2].data = data.map(item => item.ramlist[1])
  // RAM line
  hwHistoryOption.value.series[3].data = data.map(item => item.cpulist[1])

  await nextTick() // 確保 ECharts option 完全更新
  if (hwHistoryChart.value) {
    hwHistoryChart.value.setOption(hwHistoryOption.value, true) // 強制重新渲染
    hwHistoryChart.value.resize()
  }
}

const getGaugeData = (data: HardwareData[]) => {
  gaugeData.value.avgCpu =
    data.length > 0
      ? Math.round(
          (data.reduce((acc, obj) => acc + obj.avgcpu, 0) / data.length) * 10
        ) / 10
      : 0
  gaugeData.value.avgRam =
    data.length > 0
      ? Math.round(
          (data.reduce((acc, obj) => acc + obj.avgram, 0) / data.length) * 10
        ) / 10
      : 0

  let maxCpu = Math.max.apply(
    null,
    data.map(obj => obj.cpulist[3])
  )
  let maxRam = Math.max.apply(
    null,
    data.map(obj => obj.ramlist[3])
  )
  gaugeData.value.maxCpu =
    Math.round((maxCpu < 100 ? (maxCpu > 0 ? maxCpu : 0) : 100) * 10) / 10
  gaugeData.value.maxRam =
    Math.round((maxRam < 100 ? (maxRam > 0 ? maxRam : 0) : 100) * 10) / 10
}

const detectRWD = () => {
  hwHistoryChart.value?.resize({ width: "auto" })
}

const changeLangHandler = () => {
  // Language change handler
}

watch(
  layout,
  () => {
    if (isDisplay.value) detectRWD()
  },
  { deep: true }
)

onMounted(() => {
  getHardwareUserList()
  alertFn()
  instance?.appContext.app.config.globalProperties.$root?.$on(
    "changeLanguage",
    changeLangHandler
  )
})

onUnmounted(() => {
  instance?.appContext.app.config.globalProperties.$root?.$off(
    "changeLanguage",
    changeLangHandler
  )
})

// Created lifecycle equivalent
apiMonitorList().then((res: any) => {
  deviceIpList.value = res.data.map((item: any) => ({
    id: item.Id,
    ip: item.Ip,
  }))
})
deviceIp.value = props.ip
alertFn()
changeLoadingState(false)
</script>

<style scoped>
h2 {
  margin: 0px;
}
.history-container {
  padding: 20px 30px 30px 30px;
  margin-bottom: 60px;
  margin-top: 20px;
  border-radius: 10px;
  background-color: #666;
}
.ansyshistitle {
  color: white;
  font-size: x-large;
  font-weight: bolder;
  margin-bottom: 20px;
}
.history-chart {
  display: block;
  width: 95%;
  height: 650px;
  margin: 0 auto;
}
</style>
