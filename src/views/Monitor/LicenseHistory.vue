<template>
  <v-container class="history-container" style="width: 60%" fluid>
    <v-row>
      <v-col cols="12">
        <div class="ansyshistitle">
          <h2>{{ $t("monitor.history-licenses") }} by {{ softwarename }}</h2>
          <br />
          {{ $t("monitor.select-time") }}
        </div>
      </v-col>

      <!-- 起始日期 -->
      <v-col cols="12" lg="4" sm="6">
        <h4 class="mb-2 text-left">{{ $t("monitor.start-date") }}</h4>
        <el-date-picker
          v-model="startDateByUserPicked"
          type="date"
          placeholder="Start Date"
          style="width: 100%"
        />
      </v-col>

      <!-- 結束日期 -->
      <v-col cols="12" lg="4" sm="6">
        <h4 class="mb-2 text-left">{{ $t("monitor.end-date") }}</h4>
        <el-date-picker
          v-model="endDateByUserPicked"
          type="date"
          placeholder="End Date"
          style="width: 100%"
        />
      </v-col>

      <!-- 群組選擇 -->
      <v-col cols="12" lg="2" sm="6" v-if="isDisplay">
        <v-select
          v-model="groupname"
          :items="grouplist"
          :label="$t('monitor.group')"
          class="group-selector"
          @update:modelValue="changelicense"
        />
      </v-col>

      <!-- 搜尋按鈕 -->
      <v-col cols="12" lg="2" sm="6">
        <br />
        <v-btn color="primary" @click="validateInput">
          {{ $t("common.search") }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- 提示訊息 -->
    <v-alert
      v-if="emptyAlert"
      type="warning"
      dismissible
      @click:close="emptyAlert = false"
    >
      <v-icon start>mdi-alert</v-icon>
      {{ $t("validate.selectDuration") }}
    </v-alert>

    <v-alert
      v-if="numericalAlert"
      type="error"
      dismissible
      @click:close="numericalAlert = false"
    >
      <v-icon start>mdi-alert-circle</v-icon>
      {{ $t("monitor.wrongDuration") }}
    </v-alert>

    <!-- ECharts -->
    <v-row v-if="isDisplay">
      <v-col cols="12">
        <VueECharts
          ref="userChart"
          class="history-chart"
          :option="userHistoryOption"
        />
      </v-col>
      <v-col cols="12">
        <VueECharts
          ref="licenseChart"
          class="history-chart"
          :option="licenseHistoryOption"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { apiGetLicenseHistory, apiGetgroup } from "@/assets/ts/api"
import VueECharts from "vue-echarts"
import Color from "@/assets/ts/color-palette"

const store = useStore()
const { t } = useI18n()
const ip = defineProps({ ip: String })

// reactive state
const softwarename = ref("ANSYS")
const isDisplay = ref(false)
const groupdict = ref<Record<string, string>>({})
const grouplist = ref<string[]>([])
const groupname = ref("ALL")

const startDateByUserPicked = ref(new Date())
const endDateByUserPicked = ref(new Date())
const numericalAlert = ref(false)
const emptyAlert = ref(false)

const licenseLogList = ref<any[]>([])
const AlllicenseLogList = ref<any[]>([])

// ====== Chart base option ======
const barChartOption = {
  title: [{ left: "center", textStyle: { color: "white", fontSize: 28 } }],
  legend: { bottom: "0%", textStyle: { color: "#fff" } },
  xAxis: {
    type: "value",
    axisLabel: { color: "#fff" },
    splitLine: { lineStyle: { color: "#888" } },
  },
  yAxis: { type: "category", axisLabel: { color: "#fff" } },
  series: [],
  color: Color,
}

// ====== Reactive chart data ======
const userHistoryData = ref({
  legendData: [] as string[],
  yAxisData: [] as string[],
  series: [] as any[],
})
const licenseHistoryData = ref({
  legendData: [] as string[],
  yAxisData: [] as string[],
  series: [] as any[],
})

const userHistoryOption = computed(() => ({
  ...barChartOption,
  yAxis: {
    ...barChartOption.yAxis,
    data: userHistoryData.value.yAxisData,
    name: "Users",
  },
  legend: { ...barChartOption.legend, data: userHistoryData.value.legendData },
  series: userHistoryData.value.series,
  title: [{ ...barChartOption.title[0], text: t("monitor.user-license") }],
}))

const licenseHistoryOption = computed(() => ({
  ...barChartOption,
  yAxis: {
    ...barChartOption.yAxis,
    data: licenseHistoryData.value.yAxisData,
    name: "Licenses",
  },
  legend: {
    ...barChartOption.legend,
    data: licenseHistoryData.value.legendData,
  },
  series: licenseHistoryData.value.series,
  title: [{ ...barChartOption.title[0], text: t("monitor.license-user") }],
}))

// ===== Methods =====
function validateInput() {
  apiGetgroup().then(res => {
    groupdict.value = res.data
    grouplist.value = [...new Set(Object.values(groupdict.value))]
    grouplist.value.push("ALL")
    groupname.value = "ALL"
  })

  if (!startDateByUserPicked.value || !endDateByUserPicked.value) {
    emptyAlert.value = true
    return
  }

  if (startDateByUserPicked.value > endDateByUserPicked.value) {
    numericalAlert.value = true
    return
  }
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`

  getLicenseHistory(
    ip.ip!,
    startDateByUserPicked.value,
    endDateByUserPicked.value
  )
}
function formatDate(date: Date, type: "start" | "end"): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0") // 月份從 0 開始
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  const ss = String(date.getSeconds()).padStart(2, "0")
  if (type == "start") {
    return `${yyyy}/${mm}/${dd} 00:00:00`
  }
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`
}
function getLicenseHistory(ip: string, startDate: Date, endDate: Date) {
  const payload = {
    ip: ip,
    start: formatDate(startDate, "start"),
    end: formatDate(endDate, "end"),
  }
  store.dispatch("changeLoadingState", true)

  apiGetLicenseHistory(payload)
    .then(res => {
      console.log("getLicenseHistory payload", res.data)
      AlllicenseLogList.value = res.data
      licenseLogList.value = filterByGroup(AlllicenseLogList.value)
      showHistoryChart(licenseLogList.value)
      isDisplay.value = true
      store.dispatch("changeLoadingState", false)
    })
    .catch(err => {
      console.log(err)
      store.dispatch("changeLoadingState", false)
    })
}

function filterByGroup(data: any[]) {
  if (groupname.value === "ALL") return data
  const users = Object.entries(groupdict.value)
    .filter(([k, v]) => v === groupname.value)
    .map(([k]) => k)
  return data.filter(item => users.includes(item.UserName))
}

function changelicense() {
  licenseLogList.value = filterByGroup(AlllicenseLogList.value)
  showHistoryChart(licenseLogList.value)
}

function showHistoryChart(data: any[]) {
  // User chart
  const userGroup: Record<string, number> = {}
  data.forEach(item => {
    const hours = Number(item.Hours) || 0
    userGroup[item.UserName] = (userGroup[item.UserName] || 0) + hours
  })
  console.log("userGroup", userGroup)
  userHistoryData.value = {
    legendData: Object.keys(userGroup),
    yAxisData: Object.keys(userGroup),
    series: [
      {
        name: t("monitor.user-license"),
        type: "bar",
        data: Object.values(userGroup),
      },
    ],
  }

  // License chart
  const licenseGroup: Record<string, number> = {}
  data.forEach(item => {
    const hours = Number(item.Hours) || 0
    licenseGroup[item.License] = (licenseGroup[item.License] || 0) + hours
  })

  licenseHistoryData.value = {
    legendData: Object.keys(licenseGroup),
    yAxisData: Object.keys(licenseGroup),
    series: [
      {
        name: t("monitor.license-user"),
        type: "bar",
        data: Object.values(licenseGroup),
      },
    ],
  }
}
</script>

<style scoped>
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
.group-selector {
  width: 100px;
  text-align: center;
}
.history-chart {
  display: block;
  width: 100%;
  height: 650px;
  margin: 20px auto;
}
</style>
