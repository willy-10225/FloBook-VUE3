<template>
  <v-chart class="simple-gauge" :option="option" autoresize />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { defineProps } from "vue"
import VChart from "vue-echarts"
import type { EChartsOption } from "echarts"

defineProps<{
  percent: number
  title: { text: string; subtext: string }
}>()

const props = defineProps<{
  percent: number
  title: { text: string; subtext: string }
}>()

function getColors(data: number) {
  if (data <= 40) {
    return ["rgba(12,255,0,1)", "rgba(12,255,0,0.3)"]
  } else if (data > 40 && data <= 70) {
    return ["rgba(255,123,0,1)", "rgba(255,123,0,0.3)"]
  } else {
    return ["rgba(255,0,36,1)", "rgba(255,0,36,0.3)"]
  }
}

const option = computed<EChartsOption>(() => {
  const [color0, color1] = getColors(props.percent)

  return {
    backgroundColor: "transparent",
    title: {
      x: "48%",
      y: "68%",
      textAlign: "center",
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
        name: "",
        type: "pie",
        center: ["50%", "40%"],
        radius: ["55%", "75%"],
        avoidLabelOverlap: false,
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
            globalCoord: false,
          },
          "none",
        ],
        hoverAnimation: false,
        legendHoverLink: false,
        label: { show: false },
        data: [
          { value: 75, name: "1" },
          { value: 25, name: "2" },
        ],
      },
      {
        name: " ",
        type: "pie",
        center: ["50%", "40%"],
        radius: ["53%", "52%"],
        avoidLabelOverlap: false,
        startAngle: 225,
        hoverAnimation: false,
        legendHoverLink: false,
        label: { show: false },
        data: [
          { value: 75, name: "1" },
          { value: 25, name: "2" },
        ],
      },
      {
        name: "",
        type: "pie",
        center: ["50%", "40%"],
        radius: ["55%", "75.1%"],
        avoidLabelOverlap: false,
        startAngle: 315,
        color: ["rgba(34,34,34,.9)", "#ff7a00", "transparent"],
        hoverAnimation: false,
        legendHoverLink: false,
        clockwise: false,
        itemStyle: {
          borderColor: "transparent",
          borderWidth: 20,
        },
        z: 10,
        label: {
          show: false,
        },
        data: [
          {
            value: ((100 - props.percent) * 270) / 360,
            label: {
              formatter: props.percent + "%",
              position: "center",
              show: true,
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
