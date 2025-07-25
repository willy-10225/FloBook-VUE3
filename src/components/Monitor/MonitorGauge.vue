<template>
  <div class="monitor-gauge">
    <router-link :to="{ name: 'MonitorDetail', params: { ip: gauge.Ip } }">
      {{ gauge.Id }}
    </router-link>

    <v-chart class="echarts" :option="gaugeOption" />

    <div class="icon-frame">
      <ul>
        <li v-if="gauge.AnsysLicenseServer">
          <div class="IconServer" title="Server"></div>
        </li>
        <li v-else>
          <div class="IconClient" title="Workstation"></div>
        </li>
        <li v-if="gauge.AnsysLicenseServer">
          <div class="IconLicenseY" title="ANSYS License"></div>
        </li>
        <li v-else>
          <div class="IconLicenseN" title="Workstation"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from "vue"
import { useI18n } from "vue-i18n"
import { EChartsOption } from "echarts"
import VChart from "vue-echarts"
export interface DiskDataItem {
  Capacity: number
  Total_space: number
}

export interface CpuData {
  Utilization: string
}

export interface MemoryData {
  Utilization: string
}

export interface GaugeProps {
  Ip: string
  Id: string
  DiskData: DiskDataItem[]
  CpuData: CpuData
  MemoryData: MemoryData
  AnsysLicenseServer: boolean
}

const props = defineProps<{
  gauge: GaugeProps
}>()

const { t } = useI18n()

const gaugeOption = ref<EChartsOption>({
  /* 初始設定略 */
})

const updateGauge = (data: GaugeProps) => {
  let totalCapacity = 0
  let availableCapacity = 0

  for (const disk of data.DiskData) {
    totalCapacity += disk.Total_space
    availableCapacity += disk.Capacity
  }

  const diskUsage =
    totalCapacity > 0
      ? Math.round(((totalCapacity - availableCapacity) / totalCapacity) * 100)
      : 0
  const cpuUsage = parseInt(data.CpuData?.Utilization ?? "0")
  const ramUsage = parseInt(data.MemoryData?.Utilization ?? "0")

  const isConnected = !isNaN(cpuUsage)
  const color = isConnected
    ? [
        [0.2, "#106000"],
        [0.8, "#026e84"],
        [1, "#ba0707"],
      ]
    : [
        [0.2, "grey"],
        [0.8, "grey"],
        [1, "grey"],
      ]

  gaugeOption.value = {
    backgroundColor: "#1b1b1b",
    tooltip: {
      formatter: isConnected
        ? "{a}<br/>{c}(%)"
        : t("monitor.device-disconnected"),
    },
    series: [
      {
        name: "CPU",
        type: "gauge",
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: "90%",
        axisLine: {
          lineStyle: {
            color: [
              [0.2, "#106000"],
              [0.8, "#026e84"],
              [1, "#ba0707"],
            ],
            width: 4,
          },
        },
        axisLabel: {
          fontSize: 9,
          color: "#fff",
        },
        axisTick: {
          length: 9,
          lineStyle: {
            color: "auto",
          },
        },
        splitLine: {
          length: 13,
          lineStyle: {
            width: 1,
            color: "#fff",
          },
        },
        pointer: {
          width: 5,
        },
        title: {
          fontSize: 25,
          fontStyle: "italic",
          color: "#fff",
        },
        detail: {
          offsetCenter: [0, "50%"],
          formatter: "{value}%",
          fontSize: 25,
          color: "#fff",
        },
        data: [{ value: 0, name: "CPU" }],
      },
      {
        name: "RAM",
        type: "gauge",
        center: ["17%", "50%"],
        radius: "62%",
        min: 0,
        max: 100,
        startAngle: 315,
        endAngle: 45,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            color: [
              [0.2, "#106000"],
              [0.8, "#026e84"],
              [1, "#ba0707"],
            ],
            width: 2,
          },
        },
        axisLabel: {
          fontSize: 8,
          color: "#1b1b1b",
        },
        axisTick: {
          length: 6,
          lineStyle: {
            color: "auto",
          },
        },
        splitLine: {
          length: 11,
          lineStyle: {
            width: 1,
            color: "#fff",
          },
        },
        pointer: {
          width: 4,
        },
        title: {
          offsetCenter: [0, "-30%"],
          fontStyle: "italic",
          fontSize: 15,
          color: "#fff",
        },
        detail: {
          width: 80,
          height: 30,
          offsetCenter: [10, "20%"],
          formatter: "{value}%",
          fontSize: 20,
          color: "#fff",
        },
        data: [{ value: 0, name: "RAM" }],
      },
      {
        name: "Disk",
        type: "gauge",
        center: ["80%", "45%"],
        radius: "50%",
        min: 0,
        max: 100,
        startAngle: 135,
        endAngle: -125,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            color: [
              [0.2, "#106000"],
              [0.8, "#026e84"],
              [1, "#ba0707"],
            ],
            width: 2,
          },
        },
        axisTick: {
          length: 6,
          lineStyle: {
            color: "auto",
          },
        },
        axisLabel: {
          fontSize: 5,
          color: "#1b1b1b",
        },
        splitLine: {
          length: 8,
          lineStyle: {
            width: 1,
            color: "#fff",
          },
        },
        pointer: {
          width: 4,
        },
        title: {
          show: true,
          fontStyle: "italic",
          fontSize: 13,
          color: "#fff",
        },
        detail: {
          width: 80,
          height: 30,
          offsetCenter: [3, "20%"],
          formatter: "{value}%",
          fontSize: 15,
          color: "#fff",
        },
        data: [{ value: 0, name: "Disk" }],
      },
    ]
  }
}

onMounted(() => updateGauge(props.gauge))

watch(() => props.gauge, updateGauge, { deep: true })
</script>

<style scoped>
.echarts {
  width: 370px;
  height: 200px;
  margin: auto;
}
.monitor-gauge {
  background-color: rgba(27, 27, 27, 0);
  float: left;
  padding: 10px;
  height: 280px;
  text-align: center;
}
.icon-frame {
  text-align: center;
  position: relative;
  top: -50px;
}
.icon-frame ul li {
  display: inline-block;
  margin: auto;
}
.IconServer,
.IconClient,
.IconLicenseY,
.IconLicenseN {
  width: 30px;
  height: 30px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  margin: 10px auto 0;
}
.IconServer {
  background-image: url("/img/Monitor/ServerIcon.PNG");
}
.IconClient {
  background-image: url("/img/Monitor/ClientIcon.PNG");
}
.IconLicenseY {
  background-image: url("/img/Monitor/AnsysIcon.PNG");
}
</style>
