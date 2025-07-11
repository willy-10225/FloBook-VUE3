<template>
  <div class="gantt-wrapper" ref="ganttWrapper">
    <table class="gantt-head sticky" ref="ganttHead">
      <tr>
        <th
          class="year"
          :colspan="year.colspan"
          v-for="(year, index) in head.years"
          :key="'tlYear' + index"
        >
          {{ year.value }}
        </th>
      </tr>
      <tr>
        <th
          class="month"
          :colspan="month.colspan"
          v-for="(month, index) in head.months"
          :key="'tlMonth' + index"
        >
          {{ month.value }}
        </th>
      </tr>
      <tr>
        <th v-for="(date, index) in head.dates" :key="'tlDate' + index">
          <div class="date">{{ date }}</div>
        </th>
      </tr>
    </table>
    <table class="gantt-body">
      <tr>
        <td v-for="(date, index) in head.dates" :key="'tlBody' + index">
          <div class="gantt-field"></div>
        </td>
      </tr>
    </table>
    <div class="gantt-timebar-wrapper"></div>
    <div
      class="gantt-timebar"
      v-for="(cp, index) in projectInfo.checkPoints"
      :key="'cp' + index"
      :style="getTimebarStyle(cp, index)"
    >
      {{ cp.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import type { CSSProperties } from "vue"

interface YearCol {
  value: number
  colspan?: number
}
interface MonthCol {
  value: number
  colspan?: number
}
interface CheckPoint {
  name: string
  dateDuration: number
}

const head = reactive<{
  years: YearCol[]
  months: MonthCol[]
  dates: number[]
}>({
  years: [],
  months: [],
  dates: [],
})

const duration = reactive({
  startTime: new Date(2018, 11, 1),
  endTime: new Date(2019, 9, 1),
})

const projectInfo = reactive({
  checkPoints: [
    { name: "Begin", dateDuration: 45 },
    { name: "Mid", dateDuration: 12 },
    { name: "End", dateDuration: 25 },
  ] as CheckPoint[],
})

const ganttWrapper = ref<HTMLDivElement | null>(null)
const ganttHead = ref<HTMLTableElement | null>(null)

function getDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return dates
}

function getHead() {
  const tempDates = getDates(duration.startTime, duration.endTime)
  let yearColCount = 0
  let monthColCount = 0
  head.years = []
  head.months = []
  head.dates = []

  for (let i = 0; i < tempDates.length; i++) {
    const date = tempDates[i]

    if (i === 0) {
      head.years.push({ value: date.getFullYear() })
      head.months.push({ value: date.getMonth() + 1 })
    } else {
      // 新年第一天
      if (date.getMonth() === 0 && date.getDate() === 1) {
        head.years[head.years.length - 1].colspan = yearColCount
        head.years.push({ value: date.getFullYear() })
        yearColCount = 0
      }
      // 新月第一天
      if (date.getDate() === 1) {
        head.months[head.months.length - 1].colspan = monthColCount
        head.months.push({ value: date.getMonth() + 1 })
        monthColCount = 0
      }
    }
    head.dates.push(date.getDate())
    yearColCount++
    monthColCount++
  }
  if (head.years.length > 0)
    head.years[head.years.length - 1].colspan = yearColCount
  if (head.months.length > 0)
    head.months[head.months.length - 1].colspan = monthColCount
}

function getTimebarStyle(checkPoint: CheckPoint, index: number): CSSProperties {
  const TOP_MARGIN = 80
  const TIMEBAR_WIDTH = 30
  const TABLE_BORDER_WIDTH = 1
  const TIMEBAR_HEIGHT = 25
  const TIMEBAR_MARGIN = 5

  return {
    width: `${
      checkPoint.dateDuration * (TIMEBAR_WIDTH + TABLE_BORDER_WIDTH)
    }px`,
    height: `${TIMEBAR_HEIGHT}px`,
    left: `${1 + index * (TIMEBAR_WIDTH + TABLE_BORDER_WIDTH)}px`,
    top: `${TOP_MARGIN + index * (TIMEBAR_HEIGHT + TIMEBAR_MARGIN)}px`,
    position: "absolute",
    borderRadius: "20px",
    cursor: "pointer",
    textAlign: "left",
    verticalAlign: "middle",
    fontSize: "14px",
    padding: "2px 10px",
    backgroundColor: "#2ecaac",
  } as CSSProperties
}

onMounted(() => {
  getHead()
  if (ganttWrapper.value) {
    // 滚动到右侧
    ganttWrapper.value.scrollLeft = ganttWrapper.value.scrollWidth
  }
})
</script>

<style scoped>
.gantt-wrapper {
  position: relative;
  overflow: auto;
  width: 100%;
  height: 70vh;
  background-color: rgb(168, 168, 168);
}
.gantt-head {
  position: sticky;
  top: 0;
  z-index: 1;
  border-collapse: collapse;
}
.gantt-head th {
  border: 1px solid rgb(109, 109, 109);
  font-size: 14px;
  user-select: none;
}
.gantt-head .year {
  background-color: rgb(107, 107, 107);
  height: 22px;
}
.gantt-head .month {
  background-color: rgb(126, 126, 126);
  height: 22px;
}
.gantt-head .date {
  background-color: rgb(153, 152, 152);
  width: 30px;
  height: 22px;
}
.gantt-body {
  border-collapse: collapse;
  user-select: none;
}
.gantt-body td {
  border: 1px dashed gray;
}
.gantt-body .gantt-field {
  width: 30px;
  height: 70vh;
}
</style>
