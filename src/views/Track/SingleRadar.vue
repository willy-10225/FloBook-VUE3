<template>
  <v-container fluid class="pa-0" style="height: 100%">
    <v-chart class="radar" :options="option" autoresize />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { RadarChart } from "echarts/charts"
import { TooltipComponent, LegendComponent } from "echarts/components"
import VChart from "vue-echarts"

use([CanvasRenderer, RadarChart, TooltipComponent, LegendComponent])

const option = ref<any>({
  backgroundColor: {
    type: "radial",
    x: 0.5,
    y: 0.4,
    r: 0.3,
    colorStops: [{ offset: 1, color: "#1b1b1b" }],
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(0,0,250,0.2)",
  },
  textStyle: {
    color: "#4ac7f5",
    fontSize: 16,
  },
  radar: {
    center: ["50%", "50%"],
    radius: "70%",
    startAngle: 90,
    nameGap: 16,
    splitNumber: 4,
    shape: "polygon",
    axisLine: {
      show: true,
      lineStyle: {
        color: "#564d8e",
        width: 1,
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: "#4b476f",
        width: 1,
      },
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: "#2c2949",
      },
    },
    indicator: [
      { text: "Consultant", max: 100 },
      { text: "Bench Mark", max: 100 },
      { text: "Demo Material", max: 100 },
      { text: "Training Material", max: 100 },
      { text: "Case Study", max: 100 },
    ],
  },
  series: [
    {
      name: "Projects Statistic",
      type: "radar",
      symbol: "none",
      areaStyle: { opacity: 0.6 },
      lineStyle: { width: 0.8 },
      data: [],
    },
  ],
})

function randomData() {
  const newData = [] as { value: number[] }[]
  for (let u = 0; u < 1; u++) {
    const value = [] as number[]
    for (let i = 0; i < 5; i++) {
      value[i] = Math.round(Math.random() * 100)
    }
    newData[u] = { value }
  }
  option.value.series[0].data = newData
}

onMounted(() => {
  randomData()
})
</script>

<style scoped>
.radar {
  width: 100%;
  height: 100%;
}
</style>
