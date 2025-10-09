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
            :locale="$i18n.locale"
            no-title
          ></v-date-picker>
        </v-menu>
      </v-col>

      <!-- 結束日期 -->
      <v-col cols="12" lg="4" sm="6">
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
            :locale="$i18n.locale"
            no-title
          ></v-date-picker>
        </v-menu>
      </v-col>

      <!-- 群組選擇 -->
      <v-col cols="12" lg="2" sm="6" v-if="isDisplay">
        <v-select
          v-model="groupname"
          :items="grouplist"
          :label="$t('monitor.group')"
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
          :style="userChartStyle"
        />
      </v-col>
      <v-col cols="12">
        <VueECharts
          ref="licenseChart"
          class="history-chart"
          :option="licenseHistoryOption"
          :style="licenseChartStyle"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { apiGetLicenseHistory, apiGetgroup } from "@/assets/ts/api"
import VueECharts from "vue-echarts"
import Color from "@/assets/ts/color-palette"

interface Props {
  ip: string
}

interface LicenseLogItem {
  Product: string
  UserName: string
  StartTime: string
  EndTime: string
  Task: number
}

interface ChartData {
  legendData: string[]
  yAxisData: string[]
  series: any[]
  grid: {
    left: string
    right: string
    bottom: string
    containLabel: boolean
    borderColor: string
  }
  max: number | null
  tooltip: any
}

interface ChartStyleData {
  height: number
}

const props = defineProps<Props>()
const store = useStore()
const { t } = useI18n()

const groupdict = ref<Record<string, string>>({})
const licenseLogList = ref<LicenseLogItem[]>([])
const AlllicenseLogList = ref<LicenseLogItem[]>([])
const softwarename = ref<string>("ANSYS")
const isDisplay = ref<boolean>(false)
const startDate = ref<Date>(
  new Date(new Date().toISOString().split("T")[0] + " 00:00:00")
)
const startMenu = ref(false)
const endDate = ref<Date>(new Date())
const endmenu = ref(false)
const numericalAlert = ref<boolean>(false)
const emptyAlert = ref<boolean>(false)
const groupname = ref<string>("ALL")
const grouplist = ref<string[]>([])

const userChart = ref<any>(null)
const licenseChart = ref<any>(null)

const barChartOption = {
  title: [
    {
      // 主標題
      text: "",
      left: "center",
      textStyle: {
        color: "#fff",
        fontSize: 28,
      },
    },
    {
      // 副標題
      text: "累積時數比重",
      left: 822,
      top: 50,
      textStyle: {
        color: "#fff",
      },
    },
  ],
  legend: {
    bottom: "0%",
    textStyle: {
      color: "#fff",
    },
  },
  xAxis: {
    type: "value",
    name: "Hours",
    axisLabel: {
      color: "#fff",
    },
    nameTextStyle: {
      color: "#fff",
    },
    splitLine: {
      lineStyle: {
        color: "#888",
      },
    },
  },
  yAxis: {
    type: "category",
    axisLabel: {
      color: "#fff",
      interval: 0,
    },
    nameTextStyle: {
      color: "#fff",
    },
  },
  series: [],
  color: Color, // 這裡 Color 必須是一個顏色陣列，確保已定義
}
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
const userHistoryData = ref<ChartData>({
  legendData: [],
  yAxisData: [],
  series: [],
  grid: {
    left: "3%",
    right: "5%",
    bottom: "25px",
    containLabel: true,
    borderColor: "#333",
  },
  max: null,
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    formatter: (params: any) => {
      if (Array.isArray(params)) {
        let temp = params.filter((item: any) => item.data > 0)
        if (temp.length > 0) {
          let first = temp.shift()
          let result = `User: ${first.name}<br>`
          result += `${first.seriesName}: ${first.data}<hr><div style="text-align:left">`
          for (let item of temp) {
            result += `${item.marker} ${item.seriesName}: ${item.data}<br>`
          }
          result += "</div>"
          return result
        } else {
          return ""
        }
      }
    },
  },
})

const licenseHistoryData = ref<ChartData>({
  legendData: [],
  yAxisData: [],
  series: [],
  grid: {
    left: "3%",
    right: "7%",
    bottom: "25px",
    containLabel: true,
    borderColor: "#333",
  },
  max: null,
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    formatter: (params: any) => {
      if (Array.isArray(params)) {
        let temp = params.filter((item: any) => item.data > 0)
        if (temp.length > 0) {
          let first = temp.shift()
          let result = `Feature: ${first.name}<br>`
          result += `${first.seriesName}: ${first.data}<hr><div style="text-align:left">`
          for (let item of temp) {
            result += `${item.marker} ${item.seriesName}: ${item.data}<br>`
          }
          result += "</div>"
          return result
        } else {
          return ""
        }
      }
    },
  },
})

const userChartStyleData = ref<ChartStyleData>({
  height: 650,
})

const licenseChartStyleData = ref<ChartStyleData>({
  height: 650,
})

const userHistoryOption = computed(() => {
  let option = JSON.parse(JSON.stringify(barChartOption))
  option.legend.data = userHistoryData.value.legendData
  option.yAxis.data = userHistoryData.value.yAxisData
  option.series = userHistoryData.value.series
  option.yAxis.name = "Users"
  option.title[0].text = t("monitor.user-license")
  option.title[1].text = t("monitor.time-percentage")
  option.title[1].left =
    option.title[1].text == "Percentage of time usage" ? "680" : "745"
  option.grid = userHistoryData.value.grid
  option.tooltip = userHistoryData.value.tooltip
  return option
})

const licenseHistoryOption = computed(() => {
  let option = JSON.parse(JSON.stringify(barChartOption))
  option.legend.data = licenseHistoryData.value.legendData
  option.yAxis.data = licenseHistoryData.value.yAxisData
  option.yAxis.name = "Licenses"
  option.series = licenseHistoryData.value.series
  option.title[0].text = t("monitor.license-user")
  option.title[1].text = t("monitor.time-percentage")
  option.title[1].left =
    option.title[1].text == "Percentage of time usage" ? "680" : "745"
  option.grid = licenseHistoryData.value.grid
  option.tooltip = licenseHistoryData.value.tooltip
  return option
})

const userChartStyle = computed(() => ({
  height: userChartStyleData.value.height + "px",
}))

const licenseChartStyle = computed(() => ({
  height: licenseChartStyleData.value.height + "px",
}))

const layout = computed(() => store.getters.layout)

watch(
  layout,
  () => {
    if (isDisplay.value) detectRWD()
  },
  { deep: true }
)

const changeLoadingState = (state: boolean) => {
  store.dispatch("changeLoadingState", state)
}

const validateInput = () => {
  apiGetgroup().then((res: any) => {
    groupdict.value = res.data
    grouplist.value = [...new Set(Object.values(groupdict.value))]
    grouplist.value.push("ALL")
    groupname.value = "ALL"
  })

  if (startDate.value !== undefined && endDate.value !== undefined) {
    if (startDate.value <= endDate.value) {
      getLicenseHistory(props.ip, startDate.value, endDate.value)
      isDisplay.value = true
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

const getLicenseHistory = (ip: string, startDate: Date, endDate: Date) => {
  const payload = {
    Ip: ip,
    Start: startDate.toISOString(),
    End: endDate.toISOString(),
  }
  changeLoadingState(true)

  apiGetLicenseHistory(payload)
    .then((res: any) => {
      AlllicenseLogList.value = res.data

      licenseLogList.value = resetalmTooltipData(AlllicenseLogList.value)
      showHistoryChart(userHistoryData.value, "Product", "UserName")
      showHistoryChart(licenseHistoryData.value, "UserName", "Product")
      changeLoadingState(false)
    })
    .catch((err: any) => {
      console.log(err)
    })
}

const showHistoryChart = (
  data: ChartData,
  legendKey: keyof LicenseLogItem,
  yAxisKey: keyof LicenseLogItem
) => {
  data.legendData = [
    ...new Set(
      licenseLogList.value.map(
        (item: LicenseLogItem) => item[legendKey] as string
      )
    ),
  ]
  data.yAxisData = [
    ...new Set(
      licenseLogList.value.map(
        (item: LicenseLogItem) => item[yAxisKey] as string
      )
    ),
  ]
  increaseChartHeight(yAxisKey, data.yAxisData, data.legendData)
  data.series = []
  showBarChart()
  let sums = getSums(data)
  showPieChart(data)
  showTotalValue(yAxisKey)

  function showBarChart() {
    for (let legend of data.legendData) {
      let filter = licenseLogList.value.filter(
        (item: LicenseLogItem) => item[legendKey] == legend
      )
      let seriesData = new Array(data.yAxisData.length).fill(0)
      for (let i = 0; i < data.yAxisData.length; i++) {
        for (let item of filter) {
          if (item[yAxisKey] == data.yAxisData[i]) {
            if (yAxisKey == "UserName") {
              seriesData[i] += getDuration(item.StartTime, item.EndTime, 1)
              seriesData[i] = parseFloat(seriesData[i].toFixed(1))
            } else if (yAxisKey == "Product") {
              seriesData[i] += getDuration(
                item.StartTime,
                item.EndTime,
                item.Task
              )
              seriesData[i] = parseFloat(seriesData[i].toFixed(1))
            }
          } else seriesData[i] += 0
        }
      }
      data.series.push({
        name: legend,
        type: "bar",
        stack: "total",
        data: seriesData,
        barWidth: 30,
        barCategoryGap: "10%",
      })
    }
  }

  function showTotalValue(type: keyof LicenseLogItem) {
    let deviceLicenses = JSON.parse(
      sessionStorage.getItem("deviceIpList") || "[]"
    ).find((item: any) => item.ip == props.ip)?.licenses
    data.series.unshift({
      name: "TOTAL",
      type: "bar",
      barGap: "-100%",
      label: {
        show: true,
        position: "right",
        color: "white",
        formatter: (params: any) => {
          let productTask: number, totalTime: number, usageRate: string
          switch (type) {
            case "Product":
              try {
                productTask =
                  deviceLicenses?.find(
                    (item: any) => item.Feature == params.name
                  )?.Issued || 1
              } catch {
                productTask = 1
              }
              totalTime =
                getDuration(
                  startDate.value.toISOString(),
                  endDate.value.toISOString(),
                  1
                ) * productTask
              usageRate = ((params.value / totalTime) * 100).toFixed(1)
              return `${params.value}/${totalTime}\n(${usageRate}%)`
            case "UserName":
              return `${params.value}`
            default:
              return `${params.value}`
          }
        },
      },
      itemStyle: {
        color: "transparent",
      },
      data: sums.map((s: any) => s.xSum),
    })
  }
}

const getSums = (data: ChartData) => {
  let sums: any[] = []
  sortBy_yAxis(data)
  return sums

  function sortBy_yAxis(data: ChartData) {
    sums = new Array(data.yAxisData.length).fill(0)
    for (let y = 0; y < data.yAxisData.length; y++) {
      sums[y] = {
        index: y,
        xSum: sumArray(data.series.map((s: any) => s.data[y])),
        name: data.yAxisData[y],
      }
    }

    sums.sort((a: any, b: any) => b.xSum - a.xSum)
    let order = sums.map((s: any) => s.index)

    for (let l = 0; l < data.series.length; l++) {
      let temp1 = Object.assign([], data.series[l].data)
      data.series[l].data = order.map((o: number) => temp1[o])
      data.yAxisData = sums.map((s: any) => s.name)
    }
  }
}

const getDuration = (startTime: string, endTime: string, task: number) => {
  const MS_PER_HOUR = 60 * 60 * 1000
  let start: Date, end: Date, pickedStart: Date, pickedEnd: Date

  pickedStart = new Date(startDate.value)

  if (!isToday(endDate.value)) {
    const endDateStr = endDate.value.toISOString().split("T")[0] + " 23:59:59"
    pickedEnd = new Date(endDateStr)
  } else {
    pickedEnd = new Date(endDate.value)
  }

  if (startTime && endTime) {
    start = new Date(startTime)
    end = new Date(endTime)
  } else {
    start = new Date(startTime)
    end = new Date()
  }

  start = start < pickedStart ? pickedStart : start
  end = end > pickedEnd ? pickedEnd : end

  let duration = ((end.getTime() - start.getTime()) / MS_PER_HOUR) * task
  if (duration < 0.1) duration = 0.1
  return parseFloat(duration.toFixed(1))
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const sumArray = (array: number[]) => {
  let xSum = 0
  if (Array.isArray(array)) {
    for (let item of array) xSum += item
  }
  return parseFloat(xSum.toFixed(1))
}

const showPieChart = (data: ChartData) => {
  let pieData = data.series.map((s: any) => ({
    value: sumArray(s.data),
    name: s.name,
  }))

  data.series.push({
    name: "累積時數",
    type: "pie",
    radius: ["60", "100"],
    center: ["800", "190"],
    avoidLabelOverlap: false,
    tooltip: {
      trigger: "item",
    },
    label: {
      show: false,
      position: "center",
      formatter: "{d}%",
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 28,
        fontWeight: "bold",
      },
    },
    labelLine: {
      show: false,
    },
    data: pieData,
  })
}

const increaseChartHeight = (
  type: keyof LicenseLogItem,
  yAxisData: string[],
  legendData: string[]
) => {
  const original = 650
  const threshold = 8
  const barWidth = 40
  const legendHeight = 25

  if (type == "UserName") {
    if (yAxisData.length > threshold) {
      let overflow = yAxisData.length - threshold
      let heightIncrease = overflow * barWidth
      userChartStyleData.value.height = original + heightIncrease
    } else {
      userChartStyleData.value.height = original
    }

    if (legendData.length > threshold) {
      let newBottom = Math.ceil(legendData.length / threshold) * legendHeight
      userHistoryData.value.grid.bottom = newBottom + "px"
    } else {
      userHistoryData.value.grid.bottom = legendHeight + "px"
    }
  } else if (type == "Product") {
    if (yAxisData.length > threshold) {
      let overflow = yAxisData.length - threshold
      let heightIncrease = overflow * barWidth
      licenseChartStyleData.value.height = original + heightIncrease
    } else {
      licenseChartStyleData.value.height = original
    }

    if (legendData.length > threshold) {
      let newBottom = Math.ceil(legendData.length / threshold) * legendHeight
      licenseHistoryData.value.grid.bottom = newBottom + "px"
    } else {
      licenseHistoryData.value.grid.bottom = legendHeight + "px"
    }
  }

  nextTick(() => {
    detectRWD()
  })
}

const detectRWD = () => {
  if (userChart.value) userChart.value.resize()
  if (licenseChart.value) licenseChart.value.resize()
}

const settime = (text: string, licenseLogList: LicenseLogItem[]) => {
  const end = new Date()
  let mstime = 0
  let totaltime = "0"
  if (licenseLogList.length != 0) {
    for (const key of licenseLogList) {
      mstime += end.getTime() - Date.parse(key.StartTime)
    }
    const time = mstime / 1000
    const day = Math.floor(time / 60 / 60 / 24)
    const hour = Math.floor(time / 60 / 60) % 24
    const month = Math.floor(time / 60) % 60
    const second = Math.floor(time) % 60
    totaltime = day + "Day " + hour + ":" + month + ":" + second
  }
  const obj = document.getElementById(text)
  if (obj != null) {
    obj.innerText = totaltime
  }
}

const resetalmTooltipData = (almTooltipData: LicenseLogItem[]) => {
  if (almTooltipData !== undefined && groupname.value !== "ALL") {
    const newlist: LicenseLogItem[] = []
    const selectlist: string[] = []
    for (const [k, v] of Object.entries(groupdict.value)) {
      if (v === groupname.value) {
        selectlist.push(k)
      }
    }
    for (const key of almTooltipData) {
      if (selectlist.includes(key.UserName)) {
        newlist.push(key)
      }
    }
    return newlist
  } else {
    return almTooltipData
  }
}

const changelicense = () => {
  licenseLogList.value = resetalmTooltipData(AlllicenseLogList.value)
  settime("totaltimelabel", licenseLogList.value)
  showHistoryChart(userHistoryData.value, "Product", "UserName")
  showHistoryChart(licenseHistoryData.value, "UserName", "Product")
}

const groupprintdict = (key: string) => {
  if (key in groupdict.value) {
    return groupdict.value[key]
  } else {
    return ""
  }
}
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
  width: 100%;
  /* height: 1200px; */
  margin: 20px auto;
}
</style>
