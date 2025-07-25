<template>
  <div class="detail-container" ref="detailContainer">
    <div class="license-section">
      <div style="flex:1;">
        <div style="width: 100%;">
          <div class="table-title">
            <span class="block-title">
              {{ $t('monitor.realtime-licenses-detail') }}
            </span>
            <input class="history-button" type="button" @click="licenseHistoryLink" :value="$t('monitor.history-licenses')"/>
          </div>
          <table class="ansys-table">
            <tbody>
              <tr>
                <th><span @click="sortLicenseLogList('User Name', $event)">{{ $t('monitor.user-name') }}</span></th>
                <th><span @click="sortLicenseLogList('Device Name', $event)">{{ $t('monitor.device-name') }}</span></th>
                <th><span @click="sortLicenseLogList('Feature Name', $event)">{{ $t('monitor.feature-name') }}</span></th>
                <th><span @click="sortLicenseLogList('Start Time', $event)">{{ $t('monitor.start-time') }}</span></th>
                <th><span @click="sortLicenseLogList('Time Used', $event)">{{ $t('monitor.used-time') }}</span></th>
                <th style="cursor:not-allowed">Termination</th>
              </tr>
              <tr v-for="item in licenseLogList" :key="item.Handle">
                <td>{{ item.UserName }}</td>
                <td>{{ item.Host }}</td>
                <td>{{ item.ModuleName }}</td>
                <td>{{ item.StartTime }}</td>
                <td>{{ $t('monitor.format-time', getActiveTime(item.StartTime)) }}</td>
                <td>
                  <mu-button
                    v-if="item.terminating"
                    small
                    disabled
                  >Terminating</mu-button>
                  <mu-button
                    v-else
                    small
                    color="warning"
                    :disabled="!enableTerminateButton(item.StartTime)"
                    @click="openTerminateAlert(item)"
                  >Terminate</mu-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import QiProgress from '@/components/common/QiProgress.vue'
import { mapGetters, mapActions } from 'vuex'
import {
  apiMonitorDetail,
  apiMonitorList
} from '@/assets/js/api'

export default {
  name: 'MonitorDetail',
  components: {
    ConfirmDialog,
    QiProgress
  },
  props: { ip: { type: String, default: '' } },
  computed: {
    ...mapGetters(['layout', 'userInfo']),
    dataLoading() {
      return this.$t('common.data-loading')
    }
  },
  watch: {
    layout: {
      handler() {
        
      },
      deep: true
    }
  },
  data() {
    return {
      deviceIp: '',
      deviceIpVeil: false,
      deviceIpList: [],
      activeTab: 0,
      showTerminateConfirm: false,
      selectedLicense: {},
      terminationDisableMinute: 5,
      sortOrder: 'asc',
      sortBy: '',
      terminatingProgress: {
        show: false,
        title: 'Terminating...123',
        done: 1,
        total: 10
      },
      licenseLogList: []
    }
  },
  created() {
    this.changeLoadingState(true)
    let deviceIpList = sessionStorage.deviceIpList
    if (deviceIpList && deviceIpList != '') {
      this.deviceIpList = JSON.parse(deviceIpList)
      this.updatePage()
    } else {
      apiMonitorList().then(res => {
        this.deviceIpList = res.data.map(item => ({ id: item.Id, ip: item.Ip }))
        this.setDeviceIpList( res.data.map(item => ({ ip: item.Ip, id: item.Id }) ))
        this.updatePage()
      })
    }
  },
  mounted() {
    this.$root.$on('changeLanguage')
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.$root.$off('changeLanguage')
  },
  methods: {
    ...mapActions(['changeLoadingState', 'setDeviceIpList']),
    updatePage() {
      const vm = this
      vm.deviceIpList.sort((a, b) => a.ip > b.ip ? 1 : -1)
      if (vm.deviceIpList.length > 0) {
        if (vm.ip == '') vm.deviceIp = vm.deviceIpList[0].ip
        else vm.deviceIp = vm.ip
        vm.deviceIpVeil = true

        vm.timer = setInterval(
          (function loop() {
            // TODO: Get everything by cache
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
          message: 'Please set monitor cluster correctly'
        })
      }
    },
    updateViewData() {
      const vm = this
      const payload = { ip: vm.deviceIp }
      apiMonitorDetail(payload)
        .then(res => {
          updateLicenseLog(res.data.LicenseLogList)

          vm.sortLicenseLogList(this.sortBy)
          vm.changeLoadingState(false)
        })
        .catch(err => {
          console.log(err)
        })
      function updateLicenseLog(licenseLog) {
        // For the sake of showing terminating state
        const terminatingSet = new Set(JSON.parse(localStorage.getItem('terminatingQueue')) || [])
        const currentHandleSet = new Set(licenseLog.map(item => item.Handle) || [])
        const difference = terminatingSet.difference(currentHandleSet)
        const intersection = terminatingSet.intersection(currentHandleSet)

        if (difference.size > 0) {
          difference.forEach(val => {terminatingSet.delete(val)})
          localStorage.setItem('terminatingQueue', JSON.stringify(Array.from(terminatingSet)))
        }

        licenseLog.forEach(item => {
          Object.assign(item, {
            ModuleName:
              item.Task > 1 ? item.Product + ' x ' + item.Task : item.Product
          })//anshpc
          if (intersection.size > 0) {
            intersection.forEach(val => {
              if (item.Handle == val) item.terminating = true
              else item.terminating = false
            })
          }
        })
        vm.licenseLogList = licenseLog.reverse()
      }
    },
    sortLicenseLogList(option, event) {
      if (event) 
      {
        this.sortOrder = this.sortOrder === 'asc' ? 'dsc' : 'asc'
      }
      switch (option) 
      {
        case 'User Name':
          this.sortBy = 'User Name'
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === 'asc') return a.UserName > b.UserName ? 1 : -1
            else return b.UserName > a.UserName ? 1 : -1
          })
          break
        case 'Device Name':
          this.sortBy = 'Device Name'
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === 'asc') return a.Host > b.Host ? 1 : -1
            else return b.Host > a.Host ? 1 : -1
          })
          break
        case 'Feature Name':
          this.sortBy = 'Feature Name'
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === 'asc') return a.ModuleName > b.ModuleName ? 1 : -1
            else return b.ModuleName > a.ModuleName ? 1 : -1
          })
          break
        default:
          this.sortBy = ''
          this.licenseLogList.sort((a, b) => {
            if (this.sortOrder === 'asc') return a.StartTime > b.StartTime ? 1 : -1
            else return b.StartTime > a.StartTime ? 1 : -1
          })
          break
      } 
    },
    getActiveTime(startTime) {
      const MS_PER_HOUR = 60 * 60 * 1000
      const MS_PER_MINUTE = 60 * 1000
      let hour = Math.floor((new Date() - new Date(startTime)) / MS_PER_HOUR)
      let min = Math.floor(((new Date() - new Date(startTime)) % MS_PER_HOUR) / MS_PER_MINUTE)
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
        this.terminatingProgress.done = 0.7
        // IIIsetInterval
        setInterval(
        (function loop() {
          // TODO: Get everything by cache
          this.updateprogress()
          return loop
        })(),
        1000)
      }
      this.showTerminateConfirm = false
    },
    licenseHistoryLink() {
      this.$router.push({
        name: 'License History',
        params: { ip: this.deviceIp }
      })
    },
    updateprogress(){
      this.terminatingProgress.show = false
      this.terminatingProgress.show = true
      this.terminatingProgress.done = this.terminatingProgress.done+1
    }
  }
}
</script>

<style lang="less" scoped>
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
