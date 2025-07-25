<template>
  <v-chart class="simple-gauge" :option="option" autoresize />
</template>

<script setup lang="ts">
import { computed } from "vue"
import VChart from "vue-echarts"
import type { EChartsOption } from "echarts"

// ✅ 定義 props
const props = defineProps<{
  percent: number
  title: {
    text: string
    subtext: string
  }
}>()

// ✅ 顏色依據百分比決定
function getColors(data: number) {
  if (data <= 40) {
    return ["rgba(12,255,0,1)", "rgba(12,255,0,0.3)"]
  } else if (data <= 70) {
    return ["rgba(255,123,0,1)", "rgba(255,123,0,0.3)"]
  } else {
    return ["rgba(255,0,36,1)", "rgba(255,0,36,0.3)"]
  }
}

// ✅ ECharts 圖表配置
const option = computed<EChartsOption>(() => {
  const [color0, color1] = getColors(props.percent)

  return {
    backgroundColor: "transparent",
    title: {
      x: "center",
      y: "center",
      text: props.title.text,
      subtext: props.title.subtext,
      textStyle: {
        fontWeight: "normal",
        color: "#FFF",
        fontSize: 20,
      },
      subtextStyle: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#FFF",
      },
    },
    series: [
      {
        type: "pie",
        center: ["50%", "50%"],
        radius: ["55%", "75%"],
        startAngle: 225,
        color: [
          {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0.5,
            y2: 1,
            colorStops: [
              { offset: 0, color: color0 },
              { offset: 1, color: color1 },
            ],
          },
          "none",
        ],
        label: { show: false },
        hoverAnimation: false,
        data: [
          { value: 75, name: "已使用" },
          { value: 25, name: "空間" },
        ],
      },
      {
        type: "pie",
        center: ["50%", "50%"],
        radius: ["53%", "52%"],
        startAngle: 225,
        label: { show: false },
        hoverAnimation: false,
        data: [
          { value: 75, name: "內圈" },
          { value: 25, name: "其他" },
        ],
      },
      {
        type: "pie",
        center: ["50%", "50%"],
        radius: ["55%", "75.1%"],
        startAngle: 315,
        clockwise: false,
        color: ["rgba(34,34,34,.9)", "#ff7a00", "transparent"],
        itemStyle: {
          borderColor: "transparent",
          borderWidth: 20,
        },
        label: {
          show: false,
        },
        data: [
          {
            value: ((100 - props.percent) * 270) / 360,
            label: {
              show: true,
              position: "center",
              formatter: props.percent + "%",
              fontSize: 40,
              fontWeight: "normal",
              color: "#fff",
            },
            name: "",
          },
          { value: 1, name: "" },
          {
            value: 100 - ((100 - props.percent) * 270) / 360,
            name: "",
          },
        ],
      },
    ],
  }
})
</script>

<style scoped>
.simple-gauge {
  width: 250px;
  height: 250px;
  display: inline-block;
}
</style>
