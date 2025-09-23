<template>
  <div>
    <v-container class="project-detail-container">
      <h2>{{ abstract.projectName }}</h2>
      <div class="panel-header">
        {{ $t("track.abstract") }}
        <v-btn
          v-if="!isEditing"
          color="teal"
          variant="elevated"
          @click="takeSnapshot"
        >
          {{ $t("common.edit") }}
        </v-btn>
      </div>
      <div class="panel-body">
        <abstract
          ref="abstractRef"
          :abstract="abstract"
          :select-options="selectOptions"
          :is-editing="isEditing"
        />
      </div>
      <div class="panel-modify">
        <v-btn
          v-if="isEditing"
          color="grey"
          variant="outlined"
          class="me-2"
          @click="getBackSnapShot"
        >
          {{ $t("common.cancel") }}
        </v-btn>
        <v-btn
          v-if="isEditing"
          color="primary"
          variant="elevated"
          @click="validateForm"
        >
          {{ $t("common.confirm") }}
        </v-btn>
      </div>
    </v-container>

    <v-container>
      <h2>
        {{ $t("light.more-features") }}
        <p
          class="contact"
          style="white-space: pre-line"
          v-html="$t('common.cae-support')"
        ></p>
      </h2>
      <v-img class="ad" :src="trackImg" alt="Project Detail" max-width="1000" />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import Abstract from "@/components/Track/Abstract.vue"
import API from "@/assets/ts/api"
import trackImg from "@/assets/images/light/track.png"
// Props
interface Props {
  projectId: string
}

const props = defineProps<Props>()

// Composables
const store = useStore()
const { t } = useI18n()
const router = useRouter()

// Types
interface ProjectAbstract {
  id: number
  projectCreater: string
  projectType: string[]
  projectName: string
  projectDescription: string
  customerName: string
  domain: string[]
  industryType: string[]
  product: string
  executor: string
  teammates: string[]
  software: string[]
  status: string
  security: string
  deal: string
  startTime: string
  closeTime: string
  manager: string
}

interface SelectOptions {
  statusOptions: string[]
  securityOptions: string[]
  dealOptions: string[]
  projectTypeOptions: string[]
  softwareOptions: string[]
  engineerOptions: string[]
  customerOptions: string[]
  domainOptions: string[]
  industryOptions: string[]
  productOptions: string[]
  controlOptions: string[]
}

// Refs
const abstractRef = ref<InstanceType<typeof Abstract> | null>(null)
const isEditing = ref<boolean>(false)
const openDeleteProjectDialog = ref<boolean>(false)
const writable = ref<boolean>(false)
const readable = ref<boolean>(false)
const checkpoints = ref<any>(null)
const flow = ref<string>("")

// Computed (需要先定義，因為在 reactive data 中會用到)
const userInfo = computed(() => store.getters.userInfo)
const dataLoading = computed(() => t("common.data-loading"))

// Reactive data
const abstract = reactive<ProjectAbstract>({
  id: 0,
  projectCreater: "",
  projectType: [],
  projectName: "",
  projectDescription: "",
  customerName: "",
  domain: [],
  industryType: [],
  product: "",
  executor: "",
  teammates: [],
  software: [],
  status: "",
  security: "",
  deal: "",
  startTime: "",
  closeTime: "",
  manager: "",
})

const abstractBeforeModify = ref<ProjectAbstract>({} as ProjectAbstract)

const selectOptions = reactive<SelectOptions>({
  statusOptions: ["PROCESSING", "CLOSED"],
  securityOptions: ["無", "有"],
  dealOptions: [
    "成功導入",
    "客戶評估中",
    "短期內未能導入(因技術面)",
    "短期內未能導入(非技術面)",
    "不明",
  ],
  projectTypeOptions: [dataLoading.value],
  softwareOptions: [dataLoading.value],
  engineerOptions: [dataLoading.value],
  customerOptions: [dataLoading.value],
  domainOptions: [dataLoading.value],
  industryOptions: [dataLoading.value],
  productOptions: [dataLoading.value],
  controlOptions: [dataLoading.value],
})

// 其他 computed properties
const statusStyle = computed(() => ({
  "project-state-normal": abstract.status === "PROCESSING",
  "project-state-close": abstract.status !== "CLOSED",
}))

const dealStateStyle = computed(() => ({
  "project-state-close-dealt": abstract.deal === selectOptions.dealOptions[0],
}))

// Methods
const getProjectDetail = async (): Promise<void> => {
  isEditing.value = false
  store.dispatch("changeLoadingState", true)

  // Avoid the situation that user cannot get the id if they reload the page.
  if (!isNaN(Number(props.projectId))) {
    sessionStorage.setItem("projectId", props.projectId.toString())
  }

  const payload = {
    id: parseInt(sessionStorage.getItem("projectId") || "0"),
    userId: userInfo.value.userId,
  }

  try {
    const res = await API.apiGetProjectById(payload)

    writable.value = res.data.writable
    readable.value = res.data.readable

    abstract.id = res.data.id
    abstract.projectCreater = res.data.manager
    abstract.projectType = res.data.type
      .split(",")
      .map((x: string) => x.replace(/%2C/g, ","))
    abstract.projectDescription = res.data.describe
    abstract.executor = res.data.executor
    abstract.status = res.data.status
    abstract.security = res.data.security
    abstract.projectName = res.data.subject.replace(/%2C/g, ",")
    abstract.customerName = res.data.client.replace(/%2C/g, ",")
    abstract.product = res.data.product.replace(/%2C/g, ",")
    abstract.domain = res.data.field
      .split(",")
      .map((x: string) => x.replace(/%2C/g, ","))
    abstract.industryType = res.data.industry
      .split(",")
      .map((x: string) => x.replace(/%2C/g, ","))
    abstract.teammates = res.data.team
      .split(",")
      .map((x: string) => x.replace(/%2C/g, ","))
    abstract.software = res.data.software
      .split(",")
      .map((x: string) => x.replace(/%2C/g, ","))
    abstract.deal = res.data.deal === "" ? t("common.unknown") : res.data.deal
    abstract.startTime = res.data.start_time
    abstract.closeTime = res.data.close_time
    abstract.manager = sessionStorage.getItem("userName") || ""

    checkpoints.value = res.data.checkpoint && JSON.parse(res.data.checkpoint)
    flow.value = res.data.flow

    store.dispatch("changeLoadingState", false)
  } catch (err) {
    console.error(err)
    store.dispatch("changeLoadingState", false)
  }
}

const getInitialOptions = async (): Promise<void> => {
  store.dispatch("changeLoadingState", true)

  try {
    const res = await API.apiAddProjectInit()

    selectOptions.controlOptions = res.data.control
    const keyword = res.data.keyword

    selectOptions.projectTypeOptions = keyword.type
    selectOptions.customerOptions = keyword.client.map((str: string) =>
      str.replace(/%2C/g, ",")
    )
    selectOptions.domainOptions = keyword.field.map((str: string) =>
      str.replace(/%2C/g, ",")
    )
    selectOptions.industryOptions = keyword.industry.map((str: string) =>
      str.replace(/%2C/g, ",")
    )
    selectOptions.productOptions = keyword.product.map((str: string) =>
      str.replace(/%2C/g, ",")
    )
    selectOptions.softwareOptions = keyword.software.map((str: string) =>
      str.replace(/%2C/g, ",")
    )
    selectOptions.engineerOptions = res.data.member.map((str: string) =>
      str.replace(/%2C/g, ",")
    )

    store.dispatch("changeLoadingState", false)
  } catch (err) {
    console.error(err)
    store.dispatch("changeLoadingState", false)
  }
}

const takeSnapshot = (): void => {
  isEditing.value = true
  abstractBeforeModify.value = { ...abstract }
}

const getBackSnapShot = (): void => {
  isEditing.value = false
  Object.assign(abstract, abstractBeforeModify.value)
}

const validateForm = async (): Promise<void> => {
  if (JSON.stringify(abstractBeforeModify.value) === JSON.stringify(abstract)) {
    isEditing.value = false
  } else {
    if (abstractRef.value) {
      try {
        // Assuming the Abstract component has a validate method
        const isValidated = await (abstractRef.value as any).validate()
        if (isValidated) {
          await modifyProject()
        }
      } catch (err) {
        console.error("Validation failed:", err)
      }
    }
  }
}

const modifyProject = async (): Promise<void> => {
  store.dispatch("changeLoadingState", true)

  const payload = { ...abstract }
  payload.domain = payload.domain.map(x => x.replace(/,/g, "%2C"))
  payload.industryType = payload.industryType.map(x => x.replace(/,/g, "%2C"))
  payload.software = payload.software.map(x => x.replace(/,/g, "%2C"))
  payload.teammates = payload.teammates.map(x => x.replace(/,/g, "%2C"))
  payload.customerName = payload.customerName.replace(/,/g, "%2C")
  payload.projectName = payload.projectName.replace(/,/g, "%2C")
  payload.product = payload.product.replace(/,/g, "%2C")

  const logPayloadTypes = (payload: any) => {
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        console.log(`${key}: ${typeof payload[key]}`)
      }
    }
  }
  logPayloadTypes(payload)

  try {
    await API.apiModifyProject(payload)
    isEditing.value = false
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isLoading: false,
      isSuccess: true,
      showAction: true,
    })
  } catch (err) {
    console.error(err)
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
    })
  }
}

const deleteProject = async (isConfirm: boolean): Promise<void> => {
  openDeleteProjectDialog.value = false

  if (isConfirm) {
    store.dispatch("changeLoadingState", true)
    const payload = {
      id: Number(props.projectId),
      userName: sessionStorage.getItem("userName") || "",
    }

    try {
      const res = await API.apiDeleteProject(payload)
      console.log(res)
      store.dispatch("changeLoadingState", false)
      setTimeout(() => {
        router.push({ name: "Knowledge Database" })
      }, 500)
    } catch (err) {
      console.error(err)
      store.dispatch("changeLoadingState", false)
    }
  }
}

const openConfirmDialog = (dialogStatus: string): void => {
  ;(window as any)[dialogStatus] = true
}

// Lifecycle
onMounted(async () => {
  await getProjectDetail()
  await getInitialOptions()
})

// Expose methods for template refs
defineExpose({
  getProjectDetail,
  getInitialOptions,
  takeSnapshot,
  getBackSnapShot,
  validateForm,
  modifyProject,
  deleteProject,
  openConfirmDialog,
})
</script>

<style scoped>
.project-detail-container {
  background-color: #444;
  max-width: 1000px;
  margin: auto;
  padding: 30px;
  padding-top: 10px;
  margin-bottom: 64px;
  margin-top: 20px;
  border-radius: 10px;
}

.project-detail-container :deep(.v-field--disabled) {
  cursor: default;
}

.project-detail-container :deep(.v-field),
.project-detail-container :deep(.v-chip) {
  font-size: 20px !important;
}

.project-detail-textarea {
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow-y: auto;
}

.project-detail-textarea.disabled {
  border: none;
  padding: 0px;
  border-bottom: 2px dotted rgba(255, 255, 255, 0.3);
}

h2 {
  color: white;
}

h3 {
  color: white;
  text-align: left;
  margin-bottom: 10px;
}

:deep(.v-label) {
  font-size: 20px;
}

.emphasis :deep(.v-label) {
  color: #43c5b8;
}

.project-state-normal {
  color: #3ad840;
}

.project-state-close {
  color: #e4c362;
}

.project-state-close-dealt {
  color: #367ec5;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26px;
  margin-left: 10px;
  color: white;
}

.panel-body {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 20px;
  color: white;
  text-align: left;
  font-size: 18px;
}

.panel-modify {
  width: 100%;
  margin-right: 10px;
  color: white;
  text-align: right;
  font-size: 18px;
  margin-top: 20px;
}

.ad {
  max-width: 1000px;
  margin: auto;
  padding: 30px;
}

.contact {
  color: deepskyblue;
  margin: 20px 0;
  font-size: inherit;
}
</style>
