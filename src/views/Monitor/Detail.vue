<template>
  <div class="detail-container" ref="detailContainer">
    <div style="display: flex; justify-content: flex-end; height: 300px">
      <div style="flex: 1">
        <v-chart
          ref="detailGauge"
          id="detailGauge"
          :options="gaugeOption"
        ></v-chart>
      </div>
      <div style="flex: 1">
        <div class="table-title">
          <div style="display: flex; align-items: center">
            <span class="block-title">
              {{ $t("monitor.realtime-hardware") }}
            </span>
          </div>
          <input
            class="history-button"
            type="button"
            @click="hardwareHistoryLink"
            :value="$t('monitor.history-hardware')"
          />
        </div>
        <mu-select
          v-if="deviceIpVeil"
          v-model="deviceIp"
          @change="changeDeviceIp"
          class="ip-selector"
        >
          <mu-option
            v-for="option in deviceIpList"
            :key="option.ip"
            :label="option.id"
            :value="option.ip"
          ></mu-option>
        </mu-select>
        <table class="infotable">
          <tbody>
            <tr>
              <th class="infoleft">{{ $t("monitor.device-ip") }}</th>
              <th>{{ hardwareInfo.ipText }}</th>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.cpu-total") }}</td>
              <td>{{ hardwareInfo.cpuText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.cpu-residual") }}</td>
              <td>{{ hardwareInfo.remainingCpuText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.ram-total") }}</td>
              <td>{{ hardwareInfo.ramText }}</td>
            </tr>
            <tr>
              <td class="infoleft">{{ $t("monitor.ram-residual") }}</td>
              <td>{{ hardwareInfo.remainingRamText }}</td>
            </tr>
            <tr :title="hardwareInfo.diskTitle">
              <td class="infoleft">{{ $t("monitor.disk-total") }}</td>
              <td>{{ hardwareInfo.totalDiskText }}</td>
            </tr>
            <tr :title="hardwareInfo.diskTitle">
              <td class="infoleft">{{ $t("monitor.disk-residual") }}</td>
              <td>{{ hardwareInfo.remainingDiskText }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <br />
    <v-chart
      ref="UserBarChart"
      id="UserBarChart"
      :options="barOption"
    ></v-chart>
    <br />
    <div class="license-section">
      <div style="flex: 1">
        <mu-tabs
          :value.sync="activeTab"
          color="#333"
          indicator-color="yellow"
          style="height: 40px; width: unset; margin-right: 20px"
        >
          <mu-tab style="color: white">ANSYS</mu-tab>
        </mu-tabs>
        <transition name="slide-fade">
          <div v-if="activeTab === 0">
            <div class="tab-content-title">
              {{ $t("monitor.realtime-licenses") }}
            </div>
            <v-chart
              ref="almChart1"
              id="almChart"
              :options="almOption"
              auto-resize
            ></v-chart>
            <div class="button-line">
              <button class="page-button" @click="showFirst">
                <img src="/img/Monitor/page-first.svg" />
              </button>
              <button class="page-button" @click="showBefore">
                <img src="/img/Monitor/page-before.svg" />
              </button>
              <button class="page-button" @click="showNext">
                <img src="/img/Monitor/page-next.svg" />
              </button>
              <button class="page-button" @click="showLast">
                <img src="/img/Monitor/page-last.svg" />
              </button>
            </div>
            <div style="flex: 1">
              <div style="width: 100%">
                <div class="table-title">
                  <span class="block-title">
                    {{ $t("monitor.realtime-licenses-detail") }}
                  </span>
                  <div class="group">
                    <h6>{{ $t("monitor.group") }}:</h6>
                    <mu-select
                      v-model="groupname"
                      @change="changelicense"
                      class="group-selector"
                    >
                      <mu-option
                        v-for="option in grouplist"
                        :key="option"
                        :label="option"
                        :value="option"
                      ></mu-option>
                    </mu-select>
                  </div>
                  <div>
                    <label>{{ $t("monitor.group-totaltime") }}:</label>
                    <label id="ansystotaltime">0</label>
                  </div>
                  <input
                    class="history-button"
                    type="button"
                    @click="licenseHistoryTop100"
                    :value="$t('monitor.history-licenses-top100')"
                  />
                  <input
                    class="history-button"
                    type="button"
                    @click="licenseHistoryLink"
                    :value="$t('monitor.history-licenses')"
                  />
                </div>
                <table class="ansys-table">
                  <tbody>
                    <tr>
                      <th>
                        <span
                          @click="sortLicenseLogList('User Name', $event)"
                          >{{ $t("monitor.user-name") }}</span
                        >
                      </th>
                      <th>
                        <span>{{ $t("monitor.group") }}</span>
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Device Name', $event)"
                          >{{ $t("monitor.device-name") }}</span
                        >
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Feature Name', $event)"
                          >{{ $t("monitor.feature-name") }}</span
                        >
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Start Time', $event)"
                          >{{ $t("monitor.start-time") }}</span
                        >
                      </th>
                      <th>
                        <span
                          @click="sortLicenseLogList('Time Used', $event)"
                          >{{ $t("monitor.used-time") }}</span
                        >
                      </th>
                      <th style="cursor: not-allowed">Termination</th>
                    </tr>
                    <tr v-for="item in licenseLogList" :key="item.Handle">
                      <td>{{ item.UserName }}</td>
                      <td>{{ groupprintdict(item.UserName) }}</td>
                      <td>{{ item.Host }}</td>
                      <td>{{ item.ModuleName }}</td>
                      <td>{{ item.StartTime }}</td>
                      <td>
                        {{
                          $t(
                            "monitor.format-time",
                            getActiveTime(item.StartTime)
                          )
                        }}
                      </td>
                      <td>
                        <mu-button v-if="item.terminating" small disabled
                          >Terminating</mu-button
                        >
                        <mu-button
                          v-else
                          small
                          color="error"
                          :disabled="!enableTerminateButton(item.StartTime)"
                          @click="openTerminateAlert(item)"
                          >Terminate</mu-button
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <confirm-dialog
      :title="'Are you sure to terminate the usage of this license?'"
      :openAlert="showTerminateConfirm"
      :safeOption="$t('common.cancel')"
      :dangerOption="$t('common.confirm')"
      confirmColor="primary"
      @closeConfirmDialog="terminateLicense($event)"
    ></confirm-dialog>
    <qi-progress :progress="terminatingProgress" />
  </div>
</template>

<script>
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import QiProgress from "@/components/common/QiProgress.vue"
import ECharts from "vue-echarts"
import echarts from "echarts"
import { mapGetters, mapActions } from "vuex"
import {
  apiMonitorDetail,
  apiGetLicensesListByIp,
  apiTerminateLicense,
  apiMonitorList,
  apiAdminConfig,
} from "@/assets/js/api"

let almTooltipData = []

export default {
  name: "MonitorDetail",
  components: {
    "v-chart": ECharts,
    ConfirmDialog,
    QiProgress,
  },
  props: { ip: { type: String, default: "" }, group: Object },
  computed: {
    ...mapGetters(["layout", "userInfo"]),
    dataLoading() {
      return this.$t("common.data-loading")
    },
  },
  watch: {
    layout: {
      handler() {
        this.detectRWD()
      },
      deep: true,
    },
  },
  data() {
    return {
      licenseLogList: [],
      AlllicenseLogList: [],
      groupdict: {},
      grouplist: [],
      groupname: "",
      deviceIp: "",
      deviceIpVeil: false,
      deviceIpList: [],
      activeTab: 0,
      showTerminateConfirm: false,
      selectedLicense: {},
      terminationDisableMinute: 5,
      sortOrder: "asc",
      sortBy: "",
      terminatingProgress: {
        show: false,
        title: "Terminating...",
        done: 1,
        total: 2,
      },
      hardwareInfo: {
        ipText: this.dataLoading,
        cpuText: this.dataLoading,
        remainingCpuText: this.dataLoading,
        ram: this.dataLoading,
        ramText: this.dataLoading,
        remainingRamText: this.dataLoading,
        totalDiskText: this.dataLoading,
        remainingDiskText: this.dataLoading,
        diskTitle: this.dataLoading,
      },

      gaugeOption: {
        backgroundColor: "#1b1b1b",
        tooltip: {
          formatter: "{a} <br/>{c}(%)",
        },
        toolbox: {
          show: false,
        },
        series: [
          {
            backgroundColor: "#12001b",
            name: "CPU",
            type: "gauge",
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: "80%",
            itemStyle: {
              backgroundColor: "#12001b",
            },
            axisLine: {
              lineStyle: {
                color: [
                  [0.2, "lime"],
                  [0.8, "#1e90ff"],
                  [1, "#ff4500"],
                ],
                width: 3,
              },
            },
            axisLabel: {
              textStyle: {
                fontWeight: "bolder",
                color: "#fff",
              },
            },
            axisTick: {
              length: 15,
              lineStyle: {
                color: "auto",
              },
            },
            splitLine: {
              length: 25,
              lineStyle: {
                width: 3,
                color: "#fff",
              },
            },
            pointer: {
              shadowColor: "#fff",
              shadowBlur: 5,
            },
            title: {
              textStyle: {
                fontWeight: "bolder",
                fontSize: 20,
                fontStyle: "italic",
                color: "#fff",
              },
            },
            detail: {
              offsetCenter: [0, "50%"],
              formatter: "{value}%",
              textStyle: {
                fontWeight: "bolder",
                color: "#fff",
              },
            },
            data: [{ value: 0, name: "CPU" }],
          },
          {
            name: "RAM",
            type: "gauge",
            center: ["19%", "55%"],
            radius: "65%",
            min: 0,
            max: 100,
            startAngle: 230,
            endAngle: 55,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                color: [
                  [0.2, "lime"],
                  [0.8, "#1e90ff"],
                  [1, "#ff4500"],
                ],
                width: 2,
              },
            },
            axisLabel: {
              textStyle: {
                fontWeight: "normal",
                color: "#fff",
              },
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: "auto",
              },
            },
            splitLine: {
              length: 20,
              lineStyle: {
                width: 3,
                color: "#fff",
              },
            },
            pointer: {
              width: 5,
            },
            title: {
              offsetCenter: [0, "-30%"],
              textStyle: {
                fontWeight: "bolder",
                fontStyle: "italic",
                color: "#fff",
              },
            },
            detail: {
              width: 80,
              height: 30,
              offsetCenter: [5, "50%"],
              formatter: "{value}%",
              textStyle: {
                fontWeight: "normal",
                color: "#fff",
                fontSize: 15,
              },
            },
            data: [{ value: 0, name: "RAM" }],
          },
          {
            name: "Disk",
            type: "gauge",
            center: ["79%", "55%"],
            radius: "65%",
            min: 0,
            max: 100,
            startAngle: 120,
            endAngle: -50,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                color: [
                  [0.2, "lime"],
                  [0.8, "#1e90ff"],
                  [1, "#ff4500"],
                ],
                width: 2,
              },
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: "auto",
              },
            },
            axisLabel: {
              textStyle: {
                fontWeight: "normal",
                color: "#fff",
              },
            },
            splitLine: {
              length: 15,
              lineStyle: {
                width: 3,
                color: "#fff",
              },
            },
            pointer: {
              width: 2,
            },
            title: {
              textStyle: {
                fontWeight: "bolder",
                fontStyle: "italic",
                color: "#fff",
              },
            },
            detail: {
              width: 80,
              height: 30,
              offsetCenter: [0, "50%"],
              formatter: "{value}%",
              textStyle: {
                fontWeight: "normal",
                color: "#fff",
                fontSize: 15,
              },
            },
            data: [{ value: 0, name: "Disk" }],
          },
        ],
      },
      barOption: {
        backgroundColor: "rgba(255,255,255,0.1)",
        color: ["rgba(219,61,61,0.7)", "rgba(30, 144, 255,0.7)"],
        title: {
          text: "Current Users",
          textStyle: { fontWeight: "bolder", color: "#fff" },
          subtext: "(%)",
          left: "1%",
          top: "2%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: `{b}<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#a93a3a;"></span>
                      {a0}: {c0}%<br><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#2474c2;"></span>
                      {a1}: {c1}%`,
        },
        legend: {
          data: ["CPU", "RAM"],
          textStyle: { color: "#fff" },
          top: "3%",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            max: 100,
            type: "value",
            boundaryGap: [0, 0.01],
            axisLabel: {
              show: true,
              interval: "auto",
              rotate: 0,
              margin: 8,
              clickable: false,
              formatter: null,
              textStyle: {
                color: "#fff",
              },
            },
          },
        ],
        yAxis: [
          {
            type: "category",
            data: [],
            axisLabel: {
              show: true,
              interval: "auto",
              rotate: 0,
              margin: 8,
              clickable: false,
              formatter: null,
              textStyle: {
                color: "#fff",
              },
            },
          },
        ],
        series: [
          {
            name: "CPU",
            type: "bar",
            data: [],
          },
          {
            name: "RAM",
            type: "bar",
            data: [],
          },
        ],
      },
      almOption: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: params => {
            return `Moudule:
            ${params[0].name}<br>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#14c8d4;"></span>
            ${almTooltipData.find(item => item.Feature == params[0].name).Use}/
            ${
              almTooltipData.find(item => item.Feature == params[0].name).Issued
            }
            (${params[0].value}%)
            `
          },
        },
        grid: {
          left: 130,
          right: 30,
        },
        legend: {
          data: ["On duty", "Total"],
          top: "5%",
          textStyle: {
            color: "#ccc",
          },
          selectedMode: false,
        },
        yAxis: {
          axisLabel: {
            show: true,
            interval: 0, // Show every single label
            margin: 8,
          },
          data: [],
          axisLine: {
            lineStyle: {
              color: "#ccc",
            },
          },
        },
        xAxis: {
          splitLine: { show: false },
          axisLine: {
            lineStyle: {
              color: "#ccc",
            },
          },
        },
        series: [
          {
            name: "On duty",
            type: "bar",
            barWidth: 10,
            itemStyle: {
              normal: {
                formatter: "{b}\n{c}%",
                barBorderRadius: 5,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#14c8d4" },
                  { offset: 1, color: "#43eec6" },
                ]),
              },
            },
            data: [],
          },
          {
            name: "Total",
            type: "bar",
            barGap: "-100%",
            barWidth: 10,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#7c7c7c" },
                  { offset: 0.2, color: "#666666" },
                  { offset: 1, color: "#545454" },
                ]),
              },
            },
            z: -12,
            data: [],
          },
        ],
      },
      almData: {
        dataY: [],
        dataS0: [],
        dataS1: [],
        almPagePointer: 0,
        almModulesPerPage: 15,
      },
    }
  },
  created() {
    this.changeLoadingState(true)
    apiAdminConfig().then(res => {
      this.groups = res.data.allGroups.map(group => {
        group.members.split(",").forEach(member => {
          const trimmedMember = member.trim() // 去掉多余空格
          res.data.members.forEach(detail => {
            if (trimmedMember === detail.display_name) {
              if (this.groupdict[detail.computeraccount]) {
                // 如果已存在，则累加到现有值
                if (
                  !this.groupdict[detail.computeraccount].includes(group.name)
                ) {
                  this.groupdict[detail.computeraccount] += `,${group.name}`
                }
              } else {
                // 如果不存在，则直接赋值
                this.groupdict[detail.computeraccount] = group.name
              }
            }
          })
        })
      })

      this.grouplist = Array.from(
        new Set(
          Object.values(this.groupdict)
            .flatMap(value => value.split(",")) // 按逗号分隔每个字符串
            .concat("ALL") // 添加 "ALL"
        )
      )
      this.groupname = "ALL"
    })
    apiMonitorList().then(res => {
      this.deviceIpList = res.data.map(item => ({ id: item.Id, ip: item.Ip }))
      this.setDeviceIpList(
        res.data.map(item => ({
          ip: item.Ip,
          id: item.Id,
        }))
      )
      this.updatePage()
    })
    //}
  },
  mounted() {
    window.addEventListener("resize", this.detectRWD)
    this.$root.$on("changeLanguage", this.changeLangHandler)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.detectRWD)
    clearInterval(this.timer)
    this.$root.$off("changeLanguage", this.changeLangHandler)
  },
  methods: {
    ...mapActions(["changeLoadingState", "setDeviceIpList"]),

    updatePage() {
      const vm = this
      vm.deviceIpList.sort((a, b) =>
        a.ip.replace("192.168.33", "0") > b.ip.replace("192.168.33", "0")
          ? 1
          : -1
      )
      if (vm.deviceIpList.length > 0) {
        if (vm.ip == "") vm.deviceIp = vm.deviceIpList[0].ip
        else vm.deviceIp = vm.ip
        vm.deviceIpVeil = true

        vm.timer = setInterval(
          (function loop() {
            // TODO: Get everything by cache
            if (vm.almData.dataY.length == 0) vm.getAnsysLicenseModules()
            vm.updateViewData()
            return loop
          })(),
          2000
        )
      } else {
        vm.changeLoadingState({
          showDialog: true,
          isLoading: false,
          isSuccess: false,
          showAction: true,
          message: "Please set monitor cluster correctly",
        })
      }
    },
    updateViewData() {
      const vm = this
      const payload = { ip: vm.deviceIp }
      apiMonitorDetail(payload)
        .then(res => {
          updateGauge(res.data)
          updateUserBarChart(res.data.UserList)
          updateLicenseBarChart(res.data.LicenseLogList)
          updateLicenseLog(res.data.LicenseLogList)
          vm.settime("ansystotaltime", vm.licenseLogList)

          vm.sortLicenseLogList(this.sortBy)
          vm.changeLoadingState(false)
        })
        .catch(err => {
          console.log(err)
        })

      function updateGauge(data) {
        let totalCapacity = 0
        let availableCapacity = 0
        let diskUtilization = 0
        let remainingCpu = 0
        let remainingRam = 0
        let diskTitle = ""
        let cpuUtilization, ramUtilization

        if (data.DiskData.length != 0) {
          for (let d = 0; d < data.DiskData.length; ++d) {
            diskTitle += vm.$t("monitor.diskTitle", {
              disk: data.DiskData[d].Name,
              total: data.DiskData[d].Total_space.toFixed(1),
              residual: data.DiskData[d].Capacity.toFixed(1),
            })
          }
          vm.hardwareInfo.diskTitle = diskTitle
          diskUtilization = getDiskUtilization(data.DiskData)
        }

        try {
          cpuUtilization = data.CpuData.Utilization.toFixed(1)
          ramUtilization = data.MemoryData.Utilization.toFixed(1)
          remainingCpu = Math.ceil(
            ((100 - cpuUtilization) / 100) * data.CpuData.Number
          )
          remainingRam = Math.ceil(
            ((100 - ramUtilization) / 100) * data.MemoryData.Size
          )

          // Info
          vm.hardwareInfo.ipText = data.Ip
          vm.hardwareInfo.cpuText = vm.$tc("monitor.core", data.CpuData.Number)
          vm.hardwareInfo.remainingCpuText = vm.$tc(
            "monitor.core",
            remainingCpu
          )
          vm.hardwareInfo.ramText = data.MemoryData.Size + " (MB)"
          vm.hardwareInfo.remainingRamText = remainingRam + " (MB)"
          vm.hardwareInfo.totalDiskText = totalCapacity.toFixed(0) + " (GB)"
          vm.hardwareInfo.remainingDiskText =
            Math.ceil(availableCapacity) + " (GB)"
        } catch {
          cpuUtilization = 0
          ramUtilization = 0

          // Info
          vm.hardwareInfo.ipText = data.Ip
          vm.hardwareInfo.cpuText = vm.$t("monitor.device-disconnected")
          vm.hardwareInfo.remainingCpuText = vm.$t(
            "monitor.device-disconnected"
          )
          vm.hardwareInfo.ramText = vm.$t("monitor.device-disconnected")
          vm.hardwareInfo.remainingRamText = vm.$t(
            "monitor.device-disconnected"
          )
          vm.hardwareInfo.totalDiskText = vm.$t("monitor.device-disconnected")
          vm.hardwareInfo.remainingDiskText = vm.$t(
            "monitor.device-disconnected"
          )
        }

        // Update Gauges
        vm.gaugeOption.series[0].data[0].value = cpuUtilization
        vm.gaugeOption.series[1].data[0].value = ramUtilization
        vm.gaugeOption.series[2].data[0].value = diskUtilization

        function getDiskUtilization(diskData) {
          for (let d = 0; d < diskData.length; ++d) {
            totalCapacity += diskData[d].Total_space
            availableCapacity += diskData[d].Capacity
          }
          return (
            ((totalCapacity - availableCapacity) / totalCapacity) *
            100
          ).toFixed(1)
        }
      }
      function updateUserBarChart(userInfo) {
        userInfo.sort((a, b) => a.cpu - b.cpu)
        vm.barOption.yAxis[0].data = userInfo.map(item => item.user)
        vm.barOption.series[0].data = userInfo.map(item => item.cpu.toFixed(2))
        vm.barOption.series[1].data = userInfo.map(item => item.ram.toFixed(2))
        vm.barOption.title.text = vm.$t("monitor.realtime-users")
        vm.barOption.title.subtext = vm.$t("monitor.realtime-users-subtext")
      }
      function updateLicenseBarChart(licenseLog) {
        if (almTooltipData.length == 0) return
        let features = [...new Set(licenseLog.map(item => item.Product))]
        let dutyLicenses = []
        almTooltipData.forEach(x => (x.Use = 0))
        for (let i = 0; i < features.length; i++) {
          let dutyLicense = {
            Feature: features[i],
            Issued: almTooltipData.find(x => x.Feature == features[i]).Issued,
            Use: licenseLog
              .filter(x => x.Product == features[i])
              .reduce((acc, item) => acc + item.Task, 0),
          }
          almTooltipData.find(x => x.Feature == features[i]).Use =
            dutyLicense.Use
          dutyLicenses.push(dutyLicense)
        }
        let data = []
        for (let d = 0; d < dutyLicenses.length; ++d) {
          let obj = {
            feature: dutyLicenses[d].Feature,
            usageDenominator: 100,
            usageFraction: Math.round(
              (dutyLicenses[d].Use / dutyLicenses[d].Issued) * 100
            ),
          }
          data.push(obj)
        }
        vm.almData.dataS0 = vm.almData.dataS0.map(() => 0)
        for (let i = 0; i < data.length; i++) {
          let index = vm.almData.dataY.findIndex(
            feature => feature == data[i].feature
          )
          vm.almData.dataS0[index] = data[i].usageFraction
        }

        // Sorting
        let list = []
        for (let i = 0; i < vm.almData.dataS0.length; i++)
          list.push({
            feature: vm.almData.dataY[i],
            rate: vm.almData.dataS0[i],
          })
        list.sort((a, b) => b.rate - a.rate)
        for (let j = 0; j < list.length; j++) {
          vm.almData.dataY[j] = list[j].feature
          vm.almData.dataS0[j] = list[j].rate
        }
        if (vm.almData.dataY.length > 0) vm.showCurrPage()
      }
      function updateLicenseLog(licenseLog) {
        // For the sake of showing terminating state
        const terminatingSet = new Set(
          JSON.parse(localStorage.getItem("terminatingQueue")) || []
        )
        const currentHandleSet = new Set(
          licenseLog.map(item => item.Handle) || []
        )
        const difference = terminatingSet.difference(currentHandleSet)
        const intersection = terminatingSet.intersection(currentHandleSet)

        if (difference.size > 0) {
          difference.forEach(val => {
            terminatingSet.delete(val)
          })
          localStorage.setItem(
            "terminatingQueue",
            JSON.stringify(Array.from(terminatingSet))
          )
        }

        licenseLog.forEach(item => {
          Object.assign(item, {
            ModuleName:
              item.Task > 1 ? item.Product + " x " + item.Task : item.Product,
          })
          if (intersection.size > 0) {
            intersection.forEach(val => {
              //###這邊好像怪怪的 如果陣列大於二判斷起來就怪怪的
              if (item.Handle == val) item.terminating = true
              else item.terminating = false
            })
          }
        })
        vm.AlllicenseLogList = licenseLog.reverse()
        vm.licenseLogList = vm.resetalmTooltipData(vm.AlllicenseLogList)
      }
    },
    sortLicenseLogList(option, event) {
      if (event) {
        this.sortOrder = this.sortOrder === "asc" ? "dsc" : "asc"
      }
      switch (option) {
        case "User Name":
          this.sortBy = "User Name"
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === "asc")
              return a.UserName > b.UserName ? 1 : -1
            else return b.UserName > a.UserName ? 1 : -1
          })
          break
        case "Device Name":
          this.sortBy = "Device Name"
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === "asc") return a.Host > b.Host ? 1 : -1
            else return b.Host > a.Host ? 1 : -1
          })
          break
        case "Feature Name":
          this.sortBy = "Feature Name"
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === "asc")
              return a.ModuleName > b.ModuleName ? 1 : -1
            else return b.ModuleName > a.ModuleName ? 1 : -1
          })
          break
        default:
          this.sortBy = ""
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === "asc")
              return a.StartTime > b.StartTime ? 1 : -1
            else return b.StartTime > a.StartTime ? 1 : -1
          })
          break
      }
    },
    getAnsysLicenseModules() {
      apiGetLicensesListByIp({ ip: this.deviceIp })
        .then(res => {
          let alm = res.data

          almTooltipData = alm // For tooltip
          let data = []

          for (let d = 0; d < alm.length; ++d) {
            let obj = {
              feature: alm[d].Feature,
              usageDenominator: 100,
              usageFraction: Math.round((alm[d].Use / alm[d].Issued) * 100),
            }
            data.push(obj)
          }
          data.sort(function (a, b) {
            return b.usageFraction - a.usageFraction
          })

          for (let i = 0; i < data.length; i++) {
            this.almData.dataY[i] = data[i].feature
            this.almData.dataS0[i] = data[i].usageFraction
            this.almData.dataS1[i] = data[i].usageDenominator
          }
          if (this.almData.dataY.length > 0) this.showCurrPage()
        })
        .catch(error => {
          console.log(error)
        })
    },
    showCurrPage() {
      var temp = {
        y: [],
        s0: [],
        s1: [],
      }

      for (
        let i = this.almData.almPagePointer;
        i < this.almData.almPagePointer + this.almData.almModulesPerPage;
        i++
      ) {
        temp.y.push(this.almData.dataY[i])
        temp.s0.push(this.almData.dataS0[i])
        temp.s1.push(this.almData.dataS1[i])
      }
      this.almOption.yAxis.data = temp.y.reverse()
      this.almOption.series[0].data = temp.s0.reverse()
      this.almOption.series[1].data = temp.s1.reverse()
    },
    showFirst() {
      this.almData.almPagePointer = 0
      this.showCurrPage()
    },
    showBefore() {
      var d = this.almData
      if (d.almPagePointer > d.almModulesPerPage) {
        d.almPagePointer -= d.almModulesPerPage
      } else {
        d.almPagePointer = 0
      }
      this.showCurrPage()
    },
    showNext() {
      var d = this.almData
      if (d.almPagePointer < d.dataY.length - 2 * d.almModulesPerPage) {
        d.almPagePointer += d.almModulesPerPage
      } else {
        d.almPagePointer = d.dataY.length - d.almModulesPerPage
      }
      this.showCurrPage()
    },
    showLast() {
      var d = this.almData
      d.almPagePointer = d.dataY.length - d.almModulesPerPage
      this.showCurrPage()
    },
    getActiveTime(startTime) {
      const MS_PER_HOUR = 60 * 60 * 1000
      const MS_PER_MINUTE = 60 * 1000

      // 获取当前时间的 UTC 时间戳
      const currentTime = Date.now() // 使用 Date.now() 获取当前时间（UTC时间）

      // 解析 startTime 并将其转换为 UTC 时间
      let isoTime = startTime.replace(/\//g, "-").replace(" ", "T") + "+08:00"
      let startTimestamp = new Date(isoTime).getTime()

      // 计算时间差（以毫秒为单位）
      const timeDifference = currentTime - startTimestamp

      let hour = Math.floor(timeDifference / MS_PER_HOUR)
      let min = Math.floor((timeDifference % MS_PER_HOUR) / MS_PER_MINUTE)

      return { hh: hour, mm: min }
    },
    enableTerminateButton(startTime) {
      const timeObj = this.getActiveTime(startTime)
      if (this.userInfo.isAdmin) {
        if (timeObj.hh == 0 && timeObj.mm < this.terminationDisableMinute)
          return false
        else return true
      } else return false
    },
    openTerminateAlert(item) {
      this.showTerminateConfirm = true
      this.selectedLicense = item
    },
    terminateLicense(isConfirm) {
      if (isConfirm) {
        // Loading
        this.terminatingProgress.show = true
        // Enqueue to terminatingQueue
        const terminatingQueue = []
        terminatingQueue.push(this.selectedLicense.Handle)
        localStorage.setItem(
          "terminatingQueue",
          JSON.stringify(terminatingQueue)
        )
        // API
        const payload = Object.assign({}, this.selectedLicense)
        delete payload.terminating
        apiTerminateLicense(payload)
          .then(res => {
            if (res.data == "success") {
              this.terminatingProgress.done = 2
              this.terminatingProgress.show = false
              this.terminatingProgress.done = 1
            } else if (res.data == "error") {
              this.changeLoadingState({
                showDialog: true,
                isLoading: false,
                isSuccess: false,
                showAction: true,
                message: res.data.errorMessage,
              })
              this.terminatingProgress.show = false
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
      this.showTerminateConfirm = false
    },
    licenseHistoryLink() {
      this.$router.push({
        name: "License History",
        params: { ip: this.deviceIp },
      })
    },
    licenseHistoryTop100() {
      this.$router.push({
        name: "Check In Top200",
      })
    },
    hardwareHistoryLink() {
      this.$router.push({
        name: "Hardware History",
        params: { ip: this.deviceIp },
      })
    },
    detectRWD() {
      // detailGauge
      this.$refs.detailGauge.resize({
        width:
          this.$refs.detailGauge.width < 420
            ? 420
            : this.$refs.detailGauge.width,
        height: this.$refs.detailGauge.width < 420 ? 240 : 300,
      })

      // // barChart
      const isShown = this.layout.isSidenavShown
      const sw = this.layout.sidenavWidth
      this.$refs.UserBarChart.resize({
        width: isShown ? window.innerWidth - sw - 60 : window.innerWidth - 60,
      })
    },
    changeDeviceIp() {
      this.changeLoadingState(true)
    },
    changeLangHandler() {
      this.almOption.legend.data[0] = this.$t("monitor.on-duty")
      this.almOption.legend.data[1] = this.$t("monitor.total")
      this.almOption.series[0].name = this.$t("monitor.on-duty")
      this.almOption.series[1].name = this.$t("monitor.total")
    },
    resetalmTooltipData(almTooltipData) {
      if (almTooltipData !== "undefined" && this.groupname !== "ALL") {
        var newlist = []
        var selectlist = []
        for (const [k, v] of Object.entries(this.groupdict)) {
          if (v === this.groupname) {
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
    },
    settime(text, licenseList) {
      const end = new Date()
      var mstime = 0
      var totaltime = "0"
      if (licenseList.length != 0) {
        for (const key of licenseList) {
          mstime += end - Date.parse(key.StartTime)
        }
        const time = mstime / 1000
        var day = Math.floor(time / 60 / 60 / 24)
        var hour = Math.floor(time / 60 / 60) % 24
        var month = Math.floor(time / 60) % 60
        var second = Math.floor(time) % 60
        totaltime = day + "Day " + hour + ":" + month + ":" + second
      }
      var obj = document.getElementById(text)
      if (obj != null) {
        obj.innerText = totaltime
      }
    },
    changelicense() {
      this.licenseLogList = this.resetalmTooltipData(this.AlllicenseLogList)
      this.settime("ansystotaltime", this.licenseLogList)
    },
    groupprintdict(key) {
      const lowerCaseKey = key.toLowerCase() // 将输入的 key 转为小写
      const lowerCaseDict = Object.fromEntries(
        Object.entries(this.groupdict).map(([k, v]) => [k.toLowerCase(), v])
      ) // 将 this.groupdict 的键转为小写

      if (lowerCaseKey in lowerCaseDict) {
        return lowerCaseDict[lowerCaseKey]
      } else {
        return ""
      }
    },
  },
}
</script>

<style lang="less" scoped>
.group-selector {
  width: 100px;
  margin: 0;
  padding: 20% 0%;
  min-height: unset;
  text-align: center;
  text-align-last: center;
}
.group {
  display: flex;
}
.detail-container {
  margin: 20px;
  padding: 0px;
}
#detailGauge {
  width: 100%;
  height: 300px;
  max-width: 520px;
  display: block;
  margin: auto;
}
.ip-selector {
  width: 180px;
  margin: 0;
  min-height: unset;
  float: left;
}
.block-title {
  font-size: 22px;
  text-align: left;
}
#UserBarChart {
  width: 100%;
  height: 400px;
  margin-top: 40px;
}
#almChart {
  width: 100%;
  height: 500px;
  min-width: 650px;
}
.tab-content-title {
  margin-top: 10px;
  text-align: left;
  font-weight: bolder;
}
.infotable {
  color: white;
  font-size: 16px;
  margin-top: 5px;
  text-align: left;
  border-collapse: collapse;
  width: 100%;
  th {
    padding-left: 5px;
    padding-top: 10px;
    padding-bottom: 10px;
    text-align: left;
    background-color: #2d2d2d;
    color: white;
  }
  th:hover {
    text-align: left;
    background-color: #2d2d2d;
    color: white;
  }
  td {
    padding-left: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  tr:nth-child(even) {
    background-color: #474747;
  }
  tr:hover {
    background-color: rgba(255, 255, 255, 0.7);
    color: black;
  }
  .infoleft {
    width: 40%;
  }
}
.page-button {
  margin: 10px;
  margin-top: 0px;
  background: none;
  border: none;
  cursor: pointer;
}
.button-line {
  position: relative;
  margin-top: -30px;
  margin-left: -20px;
}
.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: x-large;
  font-weight: bolder;
  color: white;
  margin: auto;
}
.license-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.ansys-table {
  font-size: small;
  text-align: left;
  border-collapse: collapse;
  margin-top: 20px;
  color: white;
  font-family: sans-serif;
  min-width: 650px;
  width: 100%;
  th {
    padding: 10px 0 10px 10px;
    cursor: pointer;
    text-align: left;
    background-color: #04233d;
    color: white;
  }
  th:hover {
    text-align: left;
    background-color: #04233d;
    color: white;
  }
  td {
    padding: 5px 0 5px 10px;
  }
  tr:nth-child(even) {
    background-color: rgba(34, 117, 201, 0.3);
  }
  tr:hover {
    background-color: rgba(255, 255, 255, 0.7);
    color: black;
  }
}
.history-button {
  color: white;
  font-size: large;
  background-color: rgba(49, 99, 142, 0.6);
  position: relative;
  border-radius: 20px;
  border: 1px solid #aaa;
  float: right;
  display: block;
  padding: 2px 10px;
  cursor: pointer;
  &:hover {
    color: #ededed;
    background-color: rgba(74, 153, 195, 0.6);
    border-radius: 20px;
    box-shadow: 0px 0px 15px rgba(74, 153, 195, 0.6);
  }
}
.slide-fade-enter-active {
  transition: all 0.5s ease;
}
.slide-fade-leave-active {
  transition: all 0s;
}
.slide-fade-enter,
.slide-fade-leave-active {
  transform: translateX(-50px);
  opacity: 0.5;
}
@media (min-width: 1000px) {
  .ansys-table {
    width: 100%;
  }
}
</style>
