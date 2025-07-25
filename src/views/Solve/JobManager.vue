<template>
  <section class="jobmanager-container">
    <section class="jobmanager-list-container">
      <div class="jobmanager-list-head">
        <RouterLink :to="{ name: 'JobSubmission' }">
          <v-btn icon color="teal" class="add-job-button">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </RouterLink>
        <RouterLink :to="{ name: 'MonitorDetail' }">
          <v-btn icon color="teal" class="add-job-button">
            <v-icon>mdi-desktop-mac</v-icon>
          </v-btn>
        </RouterLink>
      </div>

      <v-row class="mt-4" style="width: 80%; margin-top: 15px">
        <v-col cols="6">
          <v-select
            v-model="filter.status"
            :items="statusOptions"
            label="Status"
            @change="handleSelectChange"
            dense
            outlined
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="filter.user"
            :items="userOptions"
            label="User"
            @change="handleSelectChange"
            dense
            outlined
          />
        </v-col>
      </v-row>

      <v-data-table
        :headers="tableHeaders"
        :items="filteredJobs"
        :items-per-page="10"
        :sort-by.sync="sort"
        :expanded.sync="expanded"
        item-key="id"
        class="mt-4"
        :height="tableHeight"
        @click:row="handleRowClick"
      >
        <template #item.status="{ item }">
          <span :style="statusStyle(item.status)">{{ item.status }}</span>
        </template>

        <template #item.name="{ item }">
          <span v-if="item.isStar" style="color: yellow">{{ item.name }}</span>
          <span v-else>{{ item.name }}</span>
        </template>

        <template #item.action="{ item }">
          <div v-if="userInfo.isAdmin || item.user === userInfo.name">
            <v-btn
              v-if="item.status === statusOption.running"
              color="red"
              small
              text
              @click.stop="terminateJob(item.id)"
            >
              Terminate
            </v-btn>

            <template
              v-if="item.status === statusOption.waiting && userInfo.isAdmin"
            >
              <v-btn small text color="blue" @click.stop="priorityUp(item.id)"
                >Up</v-btn
              >
              <v-btn small text color="blue" @click.stop="priorityDown(item.id)"
                >Down</v-btn
              >
              <v-btn small text color="blue" @click.stop="priorityTop(item.id)"
                >Top</v-btn
              >
              <v-btn small text color="red" @click.stop="terminateJob(item.id)"
                >Cancel</v-btn
              >
            </template>

            <v-btn
              v-if="item.status === statusOption.finished"
              color="blue"
              small
              text
              @click.stop="downloadFile(item.id)"
            >
              Download
            </v-btn>
          </div>
        </template>
        <!-- @ts-ignore -->
        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length">
              <v-list dense>
                <v-list-item>Id: {{ item.id }}</v-list-item>
                <v-list-item>Job Name: {{ item.name }}</v-list-item>
                <v-list-item>Status: {{ item.status }}</v-list-item>
                <v-list-item>User: {{ item.user }}</v-list-item>
                <v-list-item>CPU: {{ item.cpu }}</v-list-item>
                <v-list-item>GPU: {{ item.gpu }}</v-list-item>
                <v-list-item>Type: {{ item.type }}</v-list-item>
                <v-list-item>Version: {{ item.version }}</v-list-item>
                <v-list-item>PID: {{ item.pid }}</v-list-item>
                <v-list-item v-if="item.isStar">Priority: Top</v-list-item>
              </v-list>
            </td>
          </tr>
        </template>
      </v-data-table>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter, RouterLink } from "vue-router"
import {
  VDataTable,
  VBtn,
  VSelect,
  VRow,
  VCol,
  VIcon,
  VList,
  VListItem,
} from "vuetify/components"
import {
  apiGetAllJobs,
  apiModifyJobPriority,
  apiTerminateJob,
  apiDownloadJob,
} from "@/assets/ts/api"

// Types
interface Job {
  id: number
  name: string
  user: string
  cpu: number
  gpu: number
  status: string
  type: string
  version: string
  pid: number
  isStar: boolean
  priority?: number
}

const statusOption = {
  default: "Priority ( Running + Waiting )",
  finished: "Finished",
  running: "Running",
  waiting: "Waiting",
  uploading: "Uploading",
  failed: "Failed",
  canceled: "Canceled",
  all: "All",
}

const filter = ref({
  status: statusOption.default,
  user: statusOption.all,
})

type SortItem = { key: keyof Job; order?: "asc" | "desc" }
const sort = ref<SortItem[]>([{ key: "id", order: "desc" }])

const expanded = ref<string[]>([])

const jobList = ref<Job[]>([])

const userInfo = ref({
  isAdmin: true, // 依實際情況注入
  name: "user1",
})

const tableHeaders = [
  { title: "No.", key: "id", width: 80, align: "center", sortable: true },
  { title: "Job Name", key: "name", align: "center", sortable: true },
  { title: "User", key: "user", width: 150, align: "center", sortable: true },
  { title: "CPU", key: "cpu", width: 80, align: "center", sortable: true },
  {
    title: "Status",
    key: "status",
    width: 110,
    align: "center",
    sortable: true,
  },
  {
    title: "Operation",
    key: "action",
    width: 450,
    align: "center",
    sortable: false,
  },
] as const

const statusOptions = Object.values(statusOption).filter(
  s => s !== statusOption.uploading
)

const userOptions = computed(() => {
  const users = Array.from(new Set(jobList.value.map(j => j.user)))
  users.unshift(statusOption.all)
  return users
})

const filteredJobs = computed(() => {
  let list = [...jobList.value]

  // ✅ 顯式定義 sortVal 並加上預設 fallback，防止 undefined 與錯誤類型
  const sortVal: { name: keyof Job; order: "asc" | "desc" } = {
    name: (sort.value[0]?.key as keyof Job) || "priority", // fallback
    order: sort.value[0]?.order === "desc" ? "desc" : "asc",
  }

  // 篩選狀態
  if (filter.value.status !== statusOption.all) {
    if (filter.value.status === statusOption.default) {
      list = list.filter(
        j =>
          j.status === statusOption.running || j.status === statusOption.waiting
      )
      list.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    } else {
      list = list.filter(j => j.status === filter.value.status)
      list.sort((a, b) => {
        const aVal = a[sortVal.name] ?? 0
        const bVal = b[sortVal.name] ?? 0
        return sortVal.order === "asc"
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
          ? 1
          : -1
      })
    }
  } else {
    // 不過濾狀態，只排序
    list.sort((a, b) => {
      const aVal = a[sortVal.name] ?? 0
      const bVal = b[sortVal.name] ?? 0
      return sortVal.order === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1
    })
  }

  // 篩選使用者
  if (filter.value.user !== statusOption.all) {
    list = list.filter(j => j.user === filter.value.user)
  }

  return list
})

const tableHeight = computed(() => window.innerHeight * 0.7)

function handleSelectChange() {
  expanded.value = []
}

function handleSortChange(name: keyof Job, order: boolean) {
  sort.value = [{ key: name, order: order ? "desc" : "asc" }]
}

function handleRowClick({ id }: Job) {
  const idStr = id.toString()
  if (expanded.value.includes(idStr)) {
    expanded.value = expanded.value.filter(x => x !== idStr)
  } else {
    expanded.value.push(idStr)
  }
}

function statusStyle(status: string) {
  switch (status) {
    case statusOption.uploading:
    case statusOption.waiting:
    case statusOption.running:
      return "color: #00abff"
    case statusOption.finished:
      return "color: #19d219"
    case statusOption.failed:
      return "color: #ff7070"
    case statusOption.canceled:
      return "color: white"
    default:
      return ""
  }
}

async function priorityUp(jobId: number) {
  await apiModifyJobPriority({ jobId, type: "up" })
  await initPage()
}

async function priorityDown(jobId: number) {
  await apiModifyJobPriority({ jobId, type: "down" })
  await initPage()
}

async function priorityTop(jobId: number) {
  await apiModifyJobPriority({ jobId, type: "star" })
  await initPage()
}

async function terminateJob(jobId: number) {
  const res = await apiTerminateJob({ jobId })
  if (res.data === "success") {
    // 此處可呼叫全局提示或狀態管理
    await initPage()
  } else {
    // 顯示錯誤訊息
  }
}

async function downloadFile(jobId: number) {
  const res = await apiDownloadJob({ jobId })
  const relativePath = res.data.split("\\").join("/")
  window.location.href = window.location.origin + "/" + relativePath
}

async function initPage() {
  const res = await apiGetAllJobs()
  jobList.value = res.data.map((job: Job) => {
    if (job.status === statusOption.uploading) job.status = statusOption.failed
    return job
  })
}

onMounted(() => {
  initPage()
  const timer = setInterval(initPage, 5000)
  onBeforeUnmount(() => clearInterval(timer))
})
</script>

<style scoped>
.jobmanager-container {
  position: relative;
  height: 100%;
}
.jobmanager-list-container {
  height: 100%;
  position: relative;
  background-color: #444;
  padding: 1px 30px 30px 30px;
  border-radius: 0;
  font-size: 20px;
  overflow-y: auto;
}
.jobmanager-list-head {
  position: absolute;
  top: 10px;
  right: 0;
  height: 50px;
}
.add-job-button {
  margin-left: 10px;
}
</style>
