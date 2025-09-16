<template>
  <v-container>
    <v-card>
      <v-card-title class="text-start">
        {{ t("monitor.unnormaluse-list") }}
      </v-card-title>
      <v-card-text class="text-start">
        <div style="font-size: 8px">
          {{ t("monitor.over-allowed-value-cpu") }} 4<br />
          {{ t("monitor.over-allowed-value-ram") }} 0.3
        </div>
        <v-data-table
          class="custom-header"
          :headers="headers"
          :items="licenseLogList"
          :sort-by="sortBy"
          :sort-desc="isDesc"
          @update:sort-by="onSort"
          @update:sort-desc="onSortOrder"
          hide-default-footer
          no-data-text=""
          density="compact"
        >
          <template #item.UnNType="{ item }">
            <span :class="colorFor(item.UnNType)">
              {{ labelFor(item.UnNType) }}
            </span>
          </template>

          <template #item.sendEmail="{ item }">
            <v-btn
              small
              color="warning"
              :disabled="!canTerminate"
              @click="openTerminate(item)"
            >
              Send
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogOpen">
      <v-card>
        <v-card-title>Send mail to “{{ emailTo }}”?</v-card-title>
        <v-card-actions>
          <v-btn text @click="dialogOpen = false">
            {{ t("common.cancel") }}
          </v-btn>
          <v-btn color="primary" @click="confirmTerminate">
            {{ t("common.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"
import {
  apiGetUnnormalUseData,
  apiSendEmailUnnormalUse,
  apiMonitorList,
} from "@/assets/ts/api"

interface LicenseLog {
  KeyID: string
  User: string
  Ip: string
  UnNType: number
  OverAllowedValue: number
  CPU: number
  RAM: number
  Time: string
  DurationTimes: string
  terminating?: boolean
}

const { t } = useI18n()
const store = useStore()

const deviceIpList = ref<{ ip: string; id: string }[]>([])
const deviceIp = ref("")
const licenseLogList = ref<LicenseLog[]>([])
const dialogOpen = ref(false)
const selected = ref<LicenseLog | null>(null)
const emailTo = ref("")
const sortBy = ref<SortItem[]>([{ key: "Time", order: false }])
const isDesc = ref(false)

const headers = [
  { title: t("monitor.user"), key: "User" },
  { title: t("monitor.device-address"), key: "Ip" },
  { title: t("monitor.unnormal-type"), key: "UnNType" },
  { title: t("monitor.over-allowed-value"), key: "OverAllowedValue" },
  { title: t("monitor.capture-time"), key: "Time" },
  { title: t("monitor.duration-time"), key: "DurationTimes" },
  { title: "Send Email", key: "sendEmail", sortable: false },
]

const canTerminate = computed(() => store.getters.userInfo.isAdmin)

function colorFor(type: number) {
  switch (type) {
    case 1:
      return "text-yellow-darken-4"
    case 2:
      return "text-cyan accent-2"
    case 3:
      return "text-red"
    default:
      return ""
  }
}

function labelFor(type: number) {
  if (type === 1) return "CPU"
  if (type === 2) return "RAM"
  if (type === 3) return t("monitor.unNType-hilo")
  return String(type)
}

interface SortItem {
  key: string
  order?: boolean | "asc" | "desc"
}

function onSort(val: SortItem[]) {
  sortBy.value = val
}
function onSortOrder(desc: boolean) {
  isDesc.value = desc
}

function openTerminate(item: LicenseLog) {
  selected.value = item
  emailTo.value = item.User.split("\\").pop() || item.User
  dialogOpen.value = true
}

function confirmTerminate() {
  if (selected.value) {
    apiSendEmailUnnormalUse(selected.value)
  }
  dialogOpen.value = false
}

async function loadDeviceList() {
  const res = await apiMonitorList()
  deviceIpList.value = res.data.map((i: any) => ({ ip: i.Ip, id: i.Id }))
  deviceIp.value = deviceIpList.value[0]?.ip || ""
}

async function refreshLogs() {
  if (!deviceIp.value) return

  const res = await apiGetUnnormalUseData()
  const arr = res.data as LicenseLog[]
  arr.forEach(i => (i.OverAllowedValue = i.OverAllowedValue))
  licenseLogList.value = arr
}

let timer: number
onMounted(async () => {
  await loadDeviceList()
  await refreshLogs()

  timer = window.setInterval(refreshLogs, 60000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>
<style>
.v-table table thead {
  background-color: #04233d;
  color: white;
}

:deep(.v-table__wrapper th),
:deep(.v-table__wrapper td) {
  border: none !important; /* 去除表線 */
}
</style>
