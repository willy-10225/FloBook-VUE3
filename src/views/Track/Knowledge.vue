<template>
  <v-container class="knowledge-container">
    <v-row>
      <v-col cols="12">
        <h2>Knowledge Database</h2>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col cols="10">
        <v-autocomplete
          v-model="searchWord"
          :items="
            results.map(item =>
              item.length < 70 ? item : item.slice(0, 70) + '...'
            )
          "
          :label="$t('track.search')"
          hide-details
          @change="search"
          @keyup="searchByKeyup"
          clearable
        />
      </v-col>
      <v-col cols="2" class="d-flex justify-end">
        <v-btn icon color="primary" :to="{ name: 'Create Project' }">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="columns"
      :items="
        displayList.slice(
          firstIndexOfCurrentPage,
          firstIndexOfCurrentPage + entriesPerPage
        )
      "
      :items-per-page="entriesPerPage"
      :sort-by.sync="sortBy"
      class="elevation-1"
    >
      <template #item.actions="{ item }">
        <v-btn
          icon
          color="error"
          @click.stop="openDeleteProjectAlert(item.id)"
          v-if="checkDeletePermission(item)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>

      <template #item.customerName="{ item }">
        <div v-for="name in item.customerName" :key="name">{{ name }}</div>
      </template>

      <template #item.domain="{ item }">
        <div v-for="(name, index) in item.domain" :key="name">
          {{ index + 1 }}. {{ name }}
        </div>
      </template>

      <template #item.industryType="{ item }">
        {{ item.industryType.join(", ") }}
      </template>

      <template #item.dateRange="{ item }">
        {{ item.startTime }} ~ {{ item.closeTime }}
      </template>

      <template #item.projectState="{ item }">
        {{ $t("track." + item.projectState) }}
      </template>

      <template v-slot:item.data-table-expand="{ item }">
        <v-list dense>
          <v-list-item>
            {{ $t("track.product") }}: {{ item.product }}
          </v-list-item>
          <v-list-item> {{ $t("track.deal") }}: {{ item.deal }} </v-list-item>
          <v-list-item>
            {{ $t("track.security") }}: {{ item.security }}
          </v-list-item>
          <v-list-item>
            {{ $t("track.software") }}: {{ item.software.join(", ") }}
          </v-list-item>
          <v-list-item>
            {{ $t("track.manager") }}: {{ item.manager }}
          </v-list-item>
          <v-list-item>
            {{ $t("track.teammates") }}: {{ item.teammates.join(", ") }}
          </v-list-item>
          <v-list-item>
            {{ $t("track.projectDescription") }}: {{ item.projectDescription }}
          </v-list-item>
          <v-list-item>
            <v-btn
              color="primary"
              :to="{ name: 'Project Detail', params: { projectId: item.id } }"
            >
              {{ $t("track.detail") }}
            </v-btn>
          </v-list-item>
        </v-list>
      </template>
    </v-data-table>

    <confirm-dialog
      :open="alertDeleteProject"
      :title="$t('track.confirm-delete')"
      :safeOption="$t('common.cancel')"
      :dangerOption="$t('common.delete')"
      @close="deleteProject"
    />

    <v-row justify="center" class="mt-4">
      <v-pagination
        v-model="currentPage"
        :length="Math.ceil(displayList.length / entriesPerPage)"
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import { apiProjectListInit, apiDeleteProject } from "@/assets/ts/api"
import { drySort } from "@/assets/ts/dry"
import type { DataTableHeader } from "vuetify"

interface Project {
  id: number
  manager: string
  security: string
  executor: string
  projectState: string
  checkPoint: string
  projectType: string
  projectDescription: string
  deal: string
  product: string
  projectName: string
  startTime: string
  closeTime: string
  software: string[]
  domain: string[]
  teammates: string[]
  customerName: string[]
  industryType: string[]
}

const store = useStore()
const router = useRouter()
const sortBy = ref<{ key: string; order: "asc" | "desc" | boolean }[]>([
  { key: "id", order: "asc" },
])
const dataList = ref<Project[]>([])
const displayList = ref<Project[]>([])
const results = ref<string[]>([])

const firstIndexOfCurrentPage = ref(0)
const currentPage = ref(1)
const totalPages = ref(10)
const entriesPerPage = ref(10)
const searchWord = ref("")

const sort = ref<{
  name: keyof Project
  order: "asc" | "desc"
}>({
  name: "id",
  order: "desc",
})

const alertDeleteProject = ref(false)
const deleteProjectId = ref(-1)

const currentUser = ref(sessionStorage.getItem("userName") || "")

const columns = computed<DataTableHeader[]>(() => [
  {
    text: "Delete",
    value: "actions",
    width: 100,
    sortable: false,
    align: "center" as const,
  },
  {
    text: "ID",
    value: "id",
    width: 100,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Project Type",
    value: "projectType",
    width: 120,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Project Name",
    value: "projectName",
    width: 350,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Customer",
    value: "customerName",
    width: 200,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Domain",
    value: "domain",
    width: 250,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Industry",
    value: "industryType",
    width: 200,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Executor",
    value: "executor",
    width: 200,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "Duration",
    value: "checkPoint",
    width: 240,
    sortable: true,
    align: "center" as const,
  },
  {
    text: "State",
    value: "projectState",
    width: 150,
    sortable: true,
    align: "center" as const,
  },
])

function shortType(type: string): string {
  switch (type) {
    case "Benchmark":
      return "BM"
    case "Consultant":
      return "CS"
    case "Demo Material":
      return "Demo"
    case "Training Material":
      return "Training"
    case "Case Study":
      return "Study"
    default:
      return type
  }
}

function getProjectListInit() {
  store.dispatch("changeLoadingState", true)
  apiProjectListInit({ id: parseInt(store.getters.userInfo.userId) })
    .then(res => {
      const raw = res.data.map(
        (item: any): Project => ({
          id: item.id,
          manager: item.manager || "",
          security: item.security || "",
          executor: item.executor || "",
          projectState: item.status || "",
          checkPoint: item.chekpoint || "",
          projectType: shortType(item.type),
          projectDescription: item.describe || "",
          deal: item.deal === "" ? "Unknown" : item.deal,
          product: item.product.replace(/%2C/g, ",") || "",
          projectName: item.subject.replace(/%2C/g, ",") || "",
          startTime: item.start_time.split(" ")[0],
          closeTime: item.close_time.split(" ")[0],
          software:
            item.software
              ?.split(",")
              .map((x: string) => decodeURIComponent(x)) || [],
          domain:
            item.field === "null"
              ? []
              : item.field.split(",").map((x: string) => decodeURIComponent(x)),
          teammates:
            item.team === "null"
              ? []
              : item.team.split(",").map((x: string) => decodeURIComponent(x)),
          customerName: item.client.includes("-")
            ? item.client.split("-")
            : [item.client],
          industryType:
            item.industry === "null"
              ? []
              : item.industry
                  .split(",")
                  .map((x: string) => decodeURIComponent(x)),
        })
      )

      dataList.value = raw
      displayList.value = drySort(raw, sort.value.name, sort.value.order)
      resultsInit()
      store.dispatch("changeLoadingState", false)
    })
    .catch(err => {
      store.dispatch("changeLoadingState", false)
      console.error(err)
    })
}

function resultsInit() {
  const tempSet = new Set<string>()
  for (const item of dataList.value) {
    Object.values(item).forEach(val => {
      if (val) tempSet.add(val.toString())
    })
  }
  results.value = Array.from(tempSet).filter(Boolean).sort().reverse()
}

function search(value: string) {
  value = value.replace(/\\/g, "\\\\").replace(/\[/g, "\\[")
  if (!value) {
    displayList.value = [...dataList.value]
    return
  }

  displayList.value = dataList.value.filter(item =>
    Object.values(item).some(v =>
      v?.toString().toLowerCase().includes(value.toLowerCase())
    )
  )
  firstIndexOfCurrentPage.value = 0
}

function searchByKeyup(e: KeyboardEvent) {
  const target = e.target as HTMLInputElement
  searchWord.value = target.value
  search(searchWord.value)
}

function handleSortChange(payload: {
  name: keyof Project
  order: "asc" | "desc"
}) {
  sort.value = payload
  displayList.value = drySort(displayList.value, payload.name, payload.order)
}

function changePage(page: number) {
  currentPage.value = page
  firstIndexOfCurrentPage.value = entriesPerPage.value * (page - 1)
}

function detialLink(project: Project) {
  router.push({
    name: "Project Detail",
    query: {
      project: JSON.stringify(project), // ✅ 這裡就可以是 string
    },
  })
}

function checkDeletePermission(project: Project) {
  return (
    currentUser.value === project.executor ||
    project.teammates.includes(currentUser.value)
  )
}

function openDeleteProjectAlert(id: number) {
  alertDeleteProject.value = true
  deleteProjectId.value = id
}

function deleteProject(isConfirm: boolean) {
  if (!isConfirm) {
    alertDeleteProject.value = false
    return
  }

  store.dispatch("changeLoadingState", true)
  const userName = sessionStorage.getItem("userName")
  if (!userName) {
    console.error("userName 不存在，無法刪除")
    return
  }
  apiDeleteProject({
    id: deleteProjectId.value,
    userName,
  })
    .then(() => {
      getProjectListInit()
    })
    .catch(console.error)
    .finally(() => {
      store.dispatch("changeLoadingState", false)
      alertDeleteProject.value = false
    })
}

onMounted(() => {
  getProjectListInit()
})
</script>

<style scoped>
.knowledge-container {
  background-color: #444;
  border-radius: 10px;
  padding: 16px;
}
.search-box {
  font-size: 18px;
}
</style>
