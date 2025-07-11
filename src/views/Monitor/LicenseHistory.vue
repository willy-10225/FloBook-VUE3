<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title>
        {{ t("monitor.licenseTop100") }}
      </v-card-title>
      <v-data-table
        :headers="[
          { title: 'No.', key: 'Rowid' },
          { title: t('monitor.user-name'), key: 'UserName' },
          { title: t('monitor.device-name'), key: 'Host' },
          { title: t('monitor.feature-name'), key: 'ModuleName' },
          { title: t('monitor.start-time'), key: 'StartTime' },
          { title: t('monitor.end-time'), key: 'EndTime' },
          { title: t('monitor.used-time'), key: 'spentTime' },
        ]"
        :items="licenseLogList"
        :sort-by="sortBy"
        @update:sort-by="onSortBy"
        class="ansys-table"
        dense
      >
        <template #item.ModuleName="{ item }">
          <div v-html="item.ModuleName" />
        </template>
        <template #item.spentTime="{ item }">
          {{
            t(
              "monitor.format-time",
              getActiveTime(item.StartTime, item.EndTime)
            )
          }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { apiMonitorList, apiGetLicenseTop100 } from "@/assets/ts/api"
import type { DataTableSortItem as SortItem } from "vuetify"

const store = useStore()
const { t } = useI18n()

const deviceIp = ref("")
const deviceIpList = ref<{ id: number; ip: string }[]>([])
const licenseLogList = ref<any[]>([])
const sortBy = ref<SortItem[]>([{ key: "Rowid", order: "asc" }])

let timer: number | undefined

onMounted(() => {
  store.dispatch("changeLoadingState", true)
  const cachedIpList = sessionStorage.deviceIpList
  if (cachedIpList) {
    deviceIpList.value = JSON.parse(cachedIpList)
    updatePage()
  } else {
    apiMonitorList().then(res => {
      const list = res.data.map((item: any) => ({ id: item.Id, ip: item.Ip }))
      deviceIpList.value = list
      store.dispatch("setDeviceIpList", list)
      updatePage()
    })
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

function updatePage() {
  deviceIpList.value.sort((a, b) => (a.ip > b.ip ? 1 : -1))
  deviceIp.value = deviceIpList.value.length > 0 ? deviceIpList.value[0].ip : ""
  if (deviceIp.value) {
    timer = setInterval(() => {
      updateViewData()
    }, 300000)
    updateViewData()
  } else {
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      message: "Please set monitor cluster correctly",
    })
  }
}

function updateViewData() {
  apiGetLicenseTop100().then(res => {
    const licenseLog = res.data.map((item: any) => ({
      ...item,
      ModuleName: item.Product.includes(",")
        ? item.Product.replaceAll(",", "<br>")
        : item.Product,
      spentTime:
        new Date(item.EndTime).getTime() - new Date(item.StartTime).getTime(),
    }))
    licenseLogList.value = licenseLog
    store.dispatch("changeLoadingState", false)
  })
}

function getActiveTime(startTime: string, endTime: string) {
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime()
  const hh = Math.floor(diff / (60 * 60 * 1000))
  const mm = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  return { hh, mm }
}

function onSortBy(val: SortItem[]) {
  sortBy.value = val
}
</script>
<style scoped>
.ansys-table {
  font-size: small;
  color: white;
}
.v-data-table thead {
  background-color: #04233d;
  color: white;
}
.v-data-table tbody tr:nth-child(even) {
  background-color: rgba(34, 117, 201, 0.3);
}
.v-data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
}
</style>
