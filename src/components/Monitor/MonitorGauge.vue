<template>
  <div class="monitor-gauge">
    <router-link :to="{ name: 'MonitorDetail', params: { ip: gauge.Ip } }">{{
      gauge.Id
    }}</router-link>
    <div class="chart-container">
      <v-chart
        :option="gaugeOption"
        :autoresize="true"
        style="width: 100%; height: 200px"
        ref="gaugeChart"
      />
    </div>
    <div class="icon-frame">
      <ul>
        <li v-if="gauge.AnsysLicenseServer">
          <div
            class="IconServer"
            data-toggle="tooltip"
            data-placement="top"
            title="Server"
          ></div>
        </li>
        <li v-if="!gauge.AnsysLicenseServer">
          <div
            class="IconClient"
            data-toggle="tooltip"
            data-placement="top"
            title="Workstation"
          ></div>
        </li>
        <li v-if="gauge.AnsysLicenseServer">
          <div
            class="IconLicenseY"
            data-toggle="tooltip"
            data-placement="top"
            title="ANSYS License"
          ></div>
        </li>
        <li v-if="!gauge.AnsysLicenseServer">
          <div
            class="IconLicenseN"
            data-toggle="tooltip"
            data-placement="top"
            title="Workstation"
          ></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { GaugeChart } from "echarts/charts"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components"
import VChart from "vue-echarts"

use([
  CanvasRenderer,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

export default {
  name: "MonitorGauge",
  props: {
    gauge: Object,
    i: Number,
  },
  components: {
    VChart,
  },
  data() {
    return {
      gaugeOption: {
        backgroundColor: "#1b1b1b",
        tooltip: {
          formatter: "{a}<br/>{c}(%)",
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
              fontWeight: "normal",
              color: "#fff",
              fontSize: 9,
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
              fontWeight: "normal",
              fontSize: 25,
              fontStyle: "italic",
              color: "#fff",
            },
            detail: {
              offsetCenter: [0, "50%"],
              formatter: "{value}%",
              fontWeight: "normal",
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
              fontWeight: "normal",
              color: "#1b1b1b",
              fontSize: 8,
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
              fontWeight: "normal",
              fontStyle: "italic",
              fontSize: 15,
              color: "#fff",
            },
            detail: {
              width: 80,
              height: 30,
              offsetCenter: [10, "20%"],
              formatter: "{value}%",
              fontWeight: "normal",
              color: "#fff",
              fontSize: 20,
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
              fontWeight: "normal",
              color: "#1b1b1b",
              fontSize: 5,
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
              offsetCenter: [3, "-30%"],
              show: true,
              fontWeight: "normal",
              fontStyle: "italic",
              fontSize: 13,
              color: "#fff",
            },
            detail: {
              width: 80,
              height: 30,
              offsetCenter: [3, "20%"],
              formatter: "{value}%",
              fontWeight: "normal",
              color: "#fff",
              fontSize: 15,
            },
            data: [{ value: 0, name: "Disk" }],
          },
        ],
      },
    }
  },
  mounted() {
    this.updateGauge(this.gauge)
    // 確保圖表在DOM準備好後進行渲染
    this.$nextTick(() => {
      if (this.$refs.gaugeChart) {
        this.$refs.gaugeChart.resize()
      }
    })
  },
  watch: {
    gauge: {
      handler(val) {
        this.updateGauge(val)
      },
      deep: true,
    },
  },
  methods: {
    updateGauge(data) {
      if (!data || !data.DiskData) {
        console.warn("Invalid gauge data:", data)
        return
      }

      var vm = this
      var totalCapacity = 0
      var availableCapacity = 0

      // 安全地處理 DiskData
      if (Array.isArray(data.DiskData)) {
        for (var d = 0; d < data.DiskData.length; ++d) {
          if (
            data.DiskData[d] &&
            typeof data.DiskData[d].Total_space === "number" &&
            typeof data.DiskData[d].Capacity === "number"
          ) {
            totalCapacity += data.DiskData[d].Total_space
            availableCapacity += data.DiskData[d].Capacity
          }
        }
      }

      if (!isNaN(data.CpuData?.Utilization)) {
        // With Connection
        vm.gaugeOption.series.forEach(item => {
          item.axisLine.lineStyle.color = [
            [0.2, "#106000"],
            [0.8, "#026e84"],
            [1, "#ba0707"],
          ]
        })
        vm.gaugeOption.tooltip.formatter = "{a}<br/>{c}(%)"

        const diskUsagePercent =
          totalCapacity > 0
            ? parseInt(
                ((totalCapacity - availableCapacity) / totalCapacity) * 100
              )
            : 0

        vm.gaugeOption.series[0].data[0].value =
          parseInt(data.CpuData.Utilization) || 0
        vm.gaugeOption.series[1].data[0].value =
          parseInt(data.MemoryData?.Utilization) || 0
        vm.gaugeOption.series[2].data[0].value = !isNaN(diskUsagePercent)
          ? diskUsagePercent
          : 0
      } else {
        // Without Connection
        vm.gaugeOption.series.forEach(item => {
          item.axisLine.lineStyle.color = [
            [0.2, "grey"],
            [0.8, "grey"],
            [1, "grey"],
          ]
        })
        vm.gaugeOption.tooltip.formatter = this.$t
          ? this.$t("monitor.device-disconnected")
          : "Device Disconnected"

        const diskUsagePercent =
          totalCapacity > 0
            ? parseInt(
                ((totalCapacity - availableCapacity) / totalCapacity) * 100
              )
            : 0

        vm.gaugeOption.series[0].data[0].value = 0
        vm.gaugeOption.series[1].data[0].value = 0
        vm.gaugeOption.series[2].data[0].value = !isNaN(diskUsagePercent)
          ? diskUsagePercent
          : 0
      }

      // 強制重新渲染圖表
      this.$nextTick(() => {
        if (this.$refs.gaugeChart) {
          this.$refs.gaugeChart.resize()
        }
      })
    },
  },
}
</script>

<style scoped>
.chart-container {
  width: 370px;
  height: 200px;
  margin: 0 auto;
  position: relative;
}

a {
  color: white;
}

.monitor-gauge {
  background-color: rgba(27, 27, 27, 0);
  float: left;
  padding-bottom: 20px;
  text-align: center;
  padding: 10px;
  height: 280px;
}

.icon-frame {
  text-align: center;
  position: relative;
  top: -50px;
}

.icon-frame ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.icon-frame ul li {
  display: inline-block;
  text-decoration: none;
  margin: 0 5px;
}

.IconServer {
  width: 30px;
  height: 30px;
  background-image: url("/img/Monitor/ServerIcon.PNG");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
  margin: auto;
  margin-top: 10px;
}

.IconClient {
  width: 30px;
  height: 30px;
  background-image: url("/img/Monitor/ClientIcon.PNG");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
  margin: auto;
  margin-top: 10px;
}

.IconLicenseY {
  width: 30px;
  height: 30px;
  background-image: url("/img/Monitor/AnsysIcon.PNG");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
  margin: auto;
}

.IconLicenseN {
  width: 30px;
  height: 30px;
  position: relative;
  margin: auto;
}
</style>
