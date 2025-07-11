<!-- MultiRadar.vue -->
<template>
  <v-container fluid>
    <v-chart class="radar" :option="option" autoresize />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { RadarChart } from "echarts/charts"
import { TooltipComponent, LegendComponent } from "echarts/components"
import type { EChartsOption } from "echarts"
import VChart from "vue-echarts"

// 注入 echarts 元件
use([CanvasRenderer, RadarChart, TooltipComponent, LegendComponent])

interface UserData {
  name: string
  value: number[]
}

const option = ref<EChartsOption>({
  backgroundColor: {
    type: "radial",
    x: 0.5,
    y: 0.4,
    r: 0.3,
    colorStops: [
      { offset: 0, color: "#895355" },
      { offset: 0.2, color: "#593640" },
      { offset: 1, color: "#333" },
    ],
    globalCoord: false,
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(0,0,250,0.2)",
  },
  legend: {
    show: true,
    bottom: 5,
    left: 16,
    itemWidth: 14,
    itemHeight: 10,
    itemGap: 48,
    width: "100%",
    height: 80,
    align: "auto",
    data: [],
    textStyle: {
      color: "#fff",
      fontSize: 14,
    },
    selectedMode: true,
    orient: "horizontal",
  },
  textStyle: {
    color: "#4ac7f5",
    fontSize: 16,
  },
  radar: {
    center: ["50%", "40%"],
    radius: 160,
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
      areaStyle: {
        opacity: 0.3,
      },
      lineStyle: {
        width: 0.8,
      },
      data: [],
    },
  ],
})

function randomData() {
  const data: UserData[] = []
  for (let i = 0; i < 10; i++) {
    data.push({
      name: `user${i}`,
      value: Array.from({ length: 5 }, () => Math.round(Math.random() * 100)),
    })
  }

  option.value.legend = {
    ...(option.value.legend || {}),
    data: data.map(d => d.name),
  }

  if (Array.isArray(option.value.series)) {
    option.value.series[0].data = data
  }
}

onMounted(() => {
  randomData()
})
</script>

<style scoped>
.radar {
  width: 100%;
  height: 600px;
}
</style>
