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
          :items="searchItems"
          :label="$t('track.search')"
          hide-details
          @update:model-value="search"
          @keyup="searchByKeyup"
          clearable
          variant="outlined"
        />
      </v-col>
      <v-col cols="2" class="d-flex justify-end">
        <v-btn
          icon="mdi-plus"
          color="primary"
          :to="{ name: 'Create Project' }"
          variant="elevated"
        />
      </v-col>
    </v-row>

    <v-data-table
      :headers="columns"
      :items="paginatedItems"
      :items-per-page="entriesPerPage"
      v-model:sort-by="sortBy"
      class="knowledge-table"
      :loading="isLoading"
      expand-on-click
      hide-default-footer
    >
      <template #item.actions="{ item }">
        <v-btn
          @click.stop="openDeleteProjectAlert(item.id)"
          color="red"
          variant="text"
          v-if="checkDeletePermission(item)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
      <template #item.projectId="{ item }">
        <div>{{ item.id }}</div>
      </template>

      <template #item.customerName="{ item }">
        <div v-for="name in item.customerName" :key="name">{{ name }}</div>
      </template>

      <template #item.domain="{ item }">
        <div v-for="(name, index) in item.domain" :key="name">
          {{ index + 1 }}. {{ name }}12324
        </div>
      </template>

      <template #item.industryType="{ item }">
        {{ item.industryType.join(", ") }}
      </template>

      <template #item.duration="{ item }">
        {{ item.startTime }} ~ {{ item.closeTime }}
      </template>

      <template #item.projectState="{ item }">
        {{ $t("track." + item.projectState) }}
      </template>

      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="text-left pa-4 pl-16">
            <div class="expanded-content">
              <div class="detail-item">
                <strong>{{ $t("track.product") }}:</strong> {{ item.product }}
              </div>
              <div class="detail-item">
                <strong>{{ $t("track.deal") }}:</strong> {{ item.deal }}
              </div>
              <div class="detail-item">
                <strong>{{ $t("track.security") }}:</strong> {{ item.security }}
              </div>
              <div class="detail-item">
                <strong>{{ $t("track.software") }}:</strong>
                {{ item.software.join(", ") }}
              </div>
              <div class="detail-item">
                <strong>{{ $t("track.manager") }}:</strong> {{ item.manager }}
              </div>
              <div class="detail-item">
                <strong>{{ $t("track.teammates") }}:</strong>
                {{ item.teammates.join(", ") }}
              </div>
              <div class="detail-item">
                <strong>{{ $t("track.projectDescription") }}:</strong>
                {{ item.projectDescription }}
              </div>
              <div class="detail-item mt-3">
                <v-btn
                  color="primary"
                  @click.stop.prevent="navigateToDetail(item.id)"
                  variant="elevated"
                >
                  {{ $t("track.detail") }}
                </v-btn>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-dialog v-model="alertDeleteProject" max-width="300">
      <v-card>
        <v-card-title class="text-h5">
          {{ $t("track.confirm-delete") }}
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteProject(false)">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteProject(true)">
            {{ $t("common.delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row justify="center" class="mt-4">
      <v-pagination
        v-model="currentPage"
        :length="Math.ceil(displayList.length / entriesPerPage)"
        @update:model-value="changePage"
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { apiProjectListInit, apiDeleteProject } from "@/assets/ts/api"
import { drySort } from "@/assets/ts/dry"
import { useI18n } from "vue-i18n"

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

interface SortItem {
  key: string
  order: "asc" | "desc"
}

const store = useStore()
const router = useRouter()

// Reactive data
const sortBy = ref<SortItem[]>([{ key: "id", order: "asc" }])
const dataList = ref<Project[]>([])
const displayList = ref<Project[]>([])
const results = ref<string[]>([])
const currentPage = ref(1)
const entriesPerPage = ref(10)
const searchWord = ref("")
const alertDeleteProject = ref(false)
const deleteProjectId = ref(-1)
const isLoading = ref(false)

const currentUser = ref(sessionStorage.getItem("userName") || "")

// Computed properties
const searchItems = computed(() =>
  results.value.map(item =>
    item.length < 70 ? item : item.slice(0, 70) + "..."
  )
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return displayList.value.slice(start, start + entriesPerPage.value)
})
const { t } = useI18n()
const columns = computed(() => [
  {
    title: t("common.delete"),
    key: "actions",
    width: 100,
    sortable: false,
    align: "center" as const,
  },
  {
    title: t("track.id"),
    key: "projectId",
    width: 100,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.ip"),
    key: "ip",
    width: 100,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.projectType"),
    key: "projectType",
    width: 120,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.projectName"),
    key: "projectName",
    width: 350,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.customerName"),
    key: "customerName",
    width: 200,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.domain"),
    key: "domain",
    width: 250,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.industryType"),
    key: "industryType",
    width: 200,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.executor"),
    key: "executor",
    width: 200,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.duration"),
    key: "duration",
    width: 240,
    sortable: true,
    align: "center" as const,
  },
  {
    title: t("track.projectState"),
    key: "projectState",
    width: 150,
    sortable: true,
    align: "center" as const,
  },
])

// Helper functions
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
function navigateToDetail(itemId: number) {
  router.push({
    name: "ProjectDetailLight",
    query: { projectId: itemId.toString() },
  })
}
function getProjectListInit() {
  isLoading.value = true
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
      displayList.value = [...raw]
      resultsInit()
    })
    .catch(err => {
      console.error(err)
    })
    .finally(() => {
      isLoading.value = false
      store.dispatch("changeLoadingState", false)
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
  if (!value) {
    displayList.value = [...dataList.value]
    return
  }

  const searchValue = value.replace(/\\/g, "\\\\").replace(/\[/g, "\\[")
  displayList.value = dataList.value.filter(item =>
    Object.values(item).some(v =>
      v?.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )
  currentPage.value = 1
}

function searchByKeyup(e: KeyboardEvent) {
  const target = e.target as HTMLInputElement
  searchWord.value = target.value
  search(searchWord.value)
}

function changePage(page: number) {
  currentPage.value = page
}

function detialLink(project: Project) {
  router.push({
    name: "Project Detail",
    query: {
      project: JSON.stringify(project),
    },
  })
}

function checkDeletePermission(project: Project) {
  // return (
  //   currentUser.value === project.executor ||
  //   project.teammates.includes(currentUser.value)
  // )
  return true
}

function openDeleteProjectAlert(id: number) {
  console.log("Opening delete dialog for ID:", id)
  alertDeleteProject.value = true
  deleteProjectId.value = id
}

function deleteProject(isConfirm: boolean) {
  if (!isConfirm) {
    alertDeleteProject.value = false
    return
  }

  isLoading.value = true
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
      isLoading.value = false
      store.dispatch("changeLoadingState", false)
      alertDeleteProject.value = false
    })
}

// Watch for sort changes
watch(
  sortBy,
  newSort => {
    if (newSort.length > 0) {
      const sortItem = newSort[0]
      displayList.value = drySort(
        displayList.value,
        sortItem.key as keyof Project,
        sortItem.order
      )
    }
  },
  { deep: true }
)

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

:deep(.v-table__wrapper tbody tr:last-child),
:deep(.v-table__wrapper tbody tr:last-child) {
  border-right: 1px solid gray;
}
:deep(.v-table__wrapper tbody tr:first-child),
:deep(.v-table__wrapper tbody tr:first-child) {
  border-left: 1px solid gray;
}
:deep(.v-table__wrapper tbody tr:nth-child(even)) {
  background-color: #444;
}
:deep(.v-table__wrapper tbody tr:nth-child(odd)) {
  background-color: #333;
}
</style>
