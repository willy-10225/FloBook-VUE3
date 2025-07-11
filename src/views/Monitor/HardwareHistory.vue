<template>
  <v-container class="history-container">
    <v-row gutter style="background-color: #666">
      <v-col cols="12" lg="12" sm="12">
        <div class="ansyshistitle">
          <h2>{{ $t("monitor.history-hardware") }}</h2>
          <br />
          <v-select
            v-model="deviceIp"
            label="IP"
            :items="deviceIpList"
            item-title="id"
            item-value="ip"
            @update:modelValue="handleDeviceIpChange"
            dense
          />
          <br />
          {{ $t("monitor.select-time") }}<br />
          {{ $t("monitor.history-notice") }}
        </div>
      </v-col>

      <v-col cols="12" lg="3" sm="6">
        <DatePicker
          v-model="startDate"
          :label="$t('monitor.start-date')"
          @update:modelValue="alertFn"
        />
      </v-col>
      <v-col cols="12" lg="3" sm="6">
        <DatePicker
          v-model="endDate"
          :label="$t('monitor.end-date')"
          @update:modelValue="alertFn"
        />
      </v-col>
      <v-col cols="12" lg="1" sm="6" v-if="time">
        <v-select
          v-model="time_interval"
          :items="timelist"
          :label="$t('monitor.time-interval')"
          dense
        />
      </v-col>
      <v-col cols="12" lg="2" sm="6">
        <v-select
          v-model="userName"
          :items="hardwareUserList"
          :label="$t('monitor.user-name')"
          dense
        />
      </v-col>
      <v-col cols="12" lg="3" sm="6">
        <br />
        <v-btn
          :disabled="disableSearch"
          color="blue-grey darken-4"
          @click="submit"
        >
          {{ $t("common.search") }}
        </v-btn>
      </v-col>
      <v-col cols="12">
        <v-alert
          v-if="emptyAlert"
          type="warning"
          dismissible
          @update:modelValue="emptyAlert = false"
        >
          {{ $t("validate.selectDuration") }}
        </v-alert>
        <v-alert
          v-if="numericalAlert"
          type="error"
          dismissible
          @update:modelValue="numericalAlert = false"
        >
          {{ $t("validate.wrongDuration") }}
        </v-alert>
      </v-col>
    </v-row>

    <div v-if="isDisplay">
      <h2>{{ $t("monitor.hardware-utilization") }}</h2>
      <SimpleGauge
        :percent="gaugeData.avgCpu"
        :title="{ text: $t('monitor.average-utilization'), subtext: '(CPU)' }"
      />
      <SimpleGauge
        :percent="gaugeData.maxCpu"
        :title="{ text: $t('monitor.maximum-utilization'), subtext: '(CPU)' }"
      />
      <SimpleGauge
        :percent="gaugeData.avgRam"
        :title="{ text: $t('monitor.average-utilization'), subtext: '(RAM)' }"
      />
      <SimpleGauge
        :percent="gaugeData.maxRam"
        :title="{ text: $t('monitor.maximum-utilization'), subtext: '(RAM)' }"
      />
      <v-chart
        ref="hwHistoryChart"
        class="history-chart"
        :options="hwHistoryOption"
      />
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import ECharts from "vue-echarts"
import SimpleGauge from "@/components/Monitor/SimpleGauge.vue"
import DatePicker from "@/components/common/DatePicker.vue"
import {
  apiGetHardwareUserListByIp,
  apiGetHardwareHistory,
  apiMonitorList,
} from "@/assets/ts/api"

interface GaugeData {
  avgCpu: number
  avgRam: number
  maxCpu: number
  maxRam: number
}

interface DeviceIp {
  id: string
  ip: string
}

interface HardwareHistoryItem {
  listtime: string
  cpulist: number[]
  ramlist: number[]
  avgcpu: number
  avgram: number
}

const store = useStore()
const deviceIp = ref("")
const time = ref(true)
const Alltimelist = ["10min", "30min", "1hr", "4hr", "1day"]
const timelist = ref([...Alltimelist])
const disableSearch = ref(true)
const deviceIpList = ref<DeviceIp[]>([])
const isDisplay = ref(false)
const startDate = ref(
  new Date(new Date().toISOString().split("T")[0] + "T00:00:00")
)
const endDate = ref(new Date())
const userName = ref("")
const time_interval = ref("10min")
const numericalAlert = ref(false)
const emptyAlert = ref(false)
const hardwareUserList = ref<string[]>([])
const gaugeData = ref<GaugeData>({
  avgCpu: 0,
  avgRam: 0,
  maxCpu: 0,
  maxRam: 0,
})
const hwHistoryOption = ref<any>({
  title: { left: "center", textStyle: { color: "white", fontSize: 28 } },
  tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
  legend: {
    data: ["CPU", "RAM", "CPUline", "RAMline"],
    top: "6%",
    textStyle: { color: "#fff" },
  },
  grid: { left: "5%", right: "5%", top: "16%" },
  xAxis: [
    {
      type: "category",
      data: [],
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#fff" } },
    },
  ],
  yAxis: [
    {
      scale: true,
      axisLine: { lineStyle: { color: "#fff" } },
      splitLine: { show: false },
    },
  ],
  dataZoom: [{ /* 略 */ type: "slider", show: true }],
  series: [
    {
      name: "CPU",
      type: "candlestick",
      data: [],
      itemStyle: { color: "#FD1050", color0: "#0CF49B" },
    },
    {
      name: "RAM",
      type: "candlestick",
      data: [],
      itemStyle: { color: "#FD1050", color0: "#0CF49B" },
    },
    {
      name: "CPUline",
      type: "line",
      data: [],
      smooth: true,
      showSymbol: false,
    },
    {
      name: "RAMline",
      type: "line",
      data: [],
      smooth: true,
      showSymbol: false,
    },
  ],
})

function alertFn() {
  const diff = endDate.value.getTime() - startDate.value.getTime()
  const minutes = diff / 1000 / 60
  if (minutes < 500 / 1) timelist.value = Alltimelist
  else if (minutes < 500 * 30) timelist.value = Alltimelist.slice(-5)
  else if (minutes < 500 * 60) timelist.value = Alltimelist.slice(-4)
  else if (minutes < 500 * 240) timelist.value = Alltimelist.slice(-3)
  else if (minutes < 500 * 1440) timelist.value = Alltimelist.slice(-2)
  else timelist.value = Alltimelist.slice(-1)
  time_interval.value = timelist.value[0]
}

async function handleDeviceIpChange() {
  await getHardwareUserList()
}

async function getHardwareUserList() {
  const res = await apiGetHardwareUserListByIp({
    Ip: deviceIp.value,
    Start: startDate.value.toString(),
    End: endDate.value.toString(),
  })
  hardwareUserList.value = res.data || []
  if (!hardwareUserList.value.includes(userName.value)) {
    userName.value = hardwareUserList.value.at(-1) ?? ""
  }
  disableSearch.value = false
}

async function getHardwareHistory() {
  if (startDate.value > endDate.value) {
    emptyAlert.value = false
    numericalAlert.value = true
    return
  }
  emptyAlert.value = false
  numericalAlert.value = false
  store.dispatch("changeLoadingState", {
    showDialog: true,
    isTimerNeeded: false,
  })
  const start = startDate.value.toISOString().slice(0, 10) + "T00:00:00"
  const isToday =
    endDate.value.toISOString().slice(0, 10) ===
    new Date().toISOString().slice(0, 10)
  const end = isToday
    ? endDate.value
    : new Date(endDate.value.toISOString().slice(0, 10) + "T23:59:59")
  const payload = {
    ip: deviceIp.value,
    user: userName.value,
    start,
    end: (end as Date).toISOString(),
    time_interval: time_interval.value,
  }
  await getHardwareUserList()
  const res = await apiGetHardwareHistory(payload)
  showChart(res.data)
  getGaugeData(res.data)
  store.dispatch("changeLoadingState", false)
}

function submit() {
  if (!startDate.value || !endDate.value) {
    emptyAlert.value = true
    return
  }
  getHardwareHistory()
}

function showChart(data: HardwareHistoryItem[]) {
  isDisplay.value = true
  hwHistoryOption.value.title.text = `Usage – ${userName.value}`
  hwHistoryOption.value.xAxis[0].data = data.map(i => i.listtime)
  hwHistoryOption.value.series[0].data = data.map(i =>
    i.cpulist.map(j => Math.round(j * 10) / 10)
  )
  hwHistoryOption.value.series[1].data = data.map(i =>
    i.ramlist.map(j => Math.round(j * 10) / 10)
  )
  hwHistoryOption.value.series[2].data = data.map(i => i.ramlist[1])
  hwHistoryOption.value.series[3].data = data.map(i => i.cpulist[1])
}

function getGaugeData(data: HardwareHistoryItem[]) {
  if (!data.length) {
    gaugeData.value = { avgCpu: 0, avgRam: 0, maxCpu: 0, maxRam: 0 }
    return
  }
  gaugeData.value.avgCpu =
    Math.round((data.reduce((s, i) => s + i.avgcpu, 0) / data.length) * 10) / 10
  gaugeData.value.avgRam =
    Math.round((data.reduce((s, i) => s + i.avgram, 0) / data.length) * 10) / 10
  gaugeData.value.maxCpu =
    Math.round(Math.min(100, Math.max(...data.map(i => i.cpulist[3]))) * 10) /
    10
  gaugeData.value.maxRam =
    Math.round(Math.min(100, Math.max(...data.map(i => i.ramlist[3]))) * 10) /
    10
}

onMounted(() => {
  apiMonitorList().then(r => {
    deviceIpList.value = r.data
  })
  alertFn()
})

onBeforeUnmount(() => {
  // any cleanup
})
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
  margin-right: auto;
  margin-left: auto;
}
</style>
