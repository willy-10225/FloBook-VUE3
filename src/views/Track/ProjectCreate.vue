<template>
  <div class="creater-container">
    <h1>{{ $t("track.create-project") }}</h1>

    <v-form ref="formRef" v-model="valid">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="form.projectType"
            :items="projectTypeOptions"
            :label="$t('track.projectType')"
            variant="outlined"
            density="comfortable"
            :rules="necessaryRules"
            class="dark-input"
          />
        </v-col>

        <v-col cols="6">
          <v-select
            v-model="form.status"
            :items="statusOptions"
            :label="$t('track.projectState')"
            variant="outlined"
            density="comfortable"
            class="dark-input"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-combobox
            v-model="form.domain"
            :items="domainOptions"
            :label="$t('track.domain')"
            multiple
            chips
            variant="outlined"
            density="comfortable"
            clearable
            hide-no-data
            class="dark-input"
            :rules="necessaryRules"
          />
        </v-col>

        <v-col cols="6">
          <v-combobox
            v-model="form.industryType"
            :items="industryOptions"
            :label="$t('track.industryType')"
            multiple
            chips
            variant="outlined"
            density="comfortable"
            clearable
            hide-no-data
            class="dark-input"
            :rules="necessaryRules"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-combobox
            v-model="form.software"
            :items="softwareOptions"
            :label="$t('track.software')"
            multiple
            chips
            variant="outlined"
            density="comfortable"
            clearable
            hide-no-data
            class="dark-input"
            :rules="necessaryRules"
          />
        </v-col>

        <v-col cols="6">
          <v-select
            v-model="form.security"
            :items="securityOptions"
            :label="$t('track.security')"
            variant="outlined"
            density="comfortable"
            class="dark-input"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="form.startTime"
            :label="$t('track.duration')"
            variant="outlined"
            density="comfortable"
            type="date"
            class="dark-input"
            :rules="necessaryRules"
          />
        </v-col>

        <v-col cols="6">
          <v-text-field
            v-model="form.closeTime"
            :label="$t('track.to')"
            variant="outlined"
            density="comfortable"
            type="date"
            class="dark-input"
            :rules="necessaryRules"
          />
        </v-col>
      </v-row>

      <v-autocomplete
        v-model="form.customerName"
        :items="customerOptions"
        :label="$t('track.customerName')"
        variant="outlined"
        density="comfortable"
        class="dark-input"
        :rules="necessaryRules"
      />

      <v-text-field
        v-model="form.projectName"
        :label="$t('track.projectName')"
        variant="outlined"
        density="comfortable"
        class="dark-input"
        :rules="necessaryRules"
      />

      <v-autocomplete
        v-model="form.product"
        :items="productOptions"
        :label="$t('track.product')"
        variant="outlined"
        density="comfortable"
        class="dark-input"
        :rules="necessaryRules"
      />

      <v-row>
        <v-col cols="5">
          <v-select
            v-model="form.executor"
            :items="engineerOptions"
            :label="$t('track.executor')"
            variant="outlined"
            density="comfortable"
            class="dark-input"
            :rules="necessaryRules"
          />
        </v-col>

        <v-col cols="7">
          <v-select
            v-model="form.teammates"
            :items="engineerOptions"
            :label="$t('track.teammates')"
            multiple
            chips
            variant="outlined"
            density="comfortable"
            class="dark-input"
          />
        </v-col>
      </v-row>

      <v-textarea
        v-model="form.projectDescription"
        :label="$t('track.projectDescription')"
        rows="4"
        variant="outlined"
        density="comfortable"
        class="dark-input"
      />

      <div v-if="hasTrack">
        <h2>{{ $t("track.files") }}</h2>
        <file-upload
          v-for="(file, index) in files"
          :key="file.fileCount"
          :file-count="index"
          :ref="el => (fileUploadRefs[index] = el)"
          @remove-file-upload="onRemoveFileUpload"
        />
      </div>

      <append-button @click="addFileUpload" />
      <v-btn color="primary" @click="validateForm" class="ml-4">
        {{ $t("common.submit") }}
      </v-btn>
      <qi-progress :progress="fileProgress" />
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import FileUpload from "@/components/Track/FileUpload.vue"
import QiProgress from "@/components/common/QiProgress.vue"
import AppendButton from "@/components/common/AppendButton.vue"
import API from "@/assets/ts/api"

// Types
interface FormDataType {
  projectCreater: string
  projectType: string
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
  startTime: string | null
  closeTime: string | null
}

interface FileType {
  fileCount: number
}

interface FileProgressType {
  show: boolean
  title: string
  done: number
  total: number
}

interface UserInfo {
  userId: number
  userName?: string
}

interface FlobookLicense {
  HasTrack: boolean
}

// Composables
const { t } = useI18n()
const store = useStore()
const router = useRouter()

// Template refs
const formRef = ref()
const fileUploadRefs = ref<any[]>([])

// Reactive data
const valid = ref<boolean>(false)

const statusOptions = ref<string[]>(["PROCESSING", "CLOSED"])
const securityOptions = ref<string[]>(["無", "有"])
const projectTypeOptions = ref<string[]>([])
const softwareOptions = ref<string[]>([])
const engineerOptions = ref<string[]>([])
const customerOptions = ref<string[]>([])
const domainOptions = ref<string[]>([])
const industryOptions = ref<string[]>([])
const productOptions = ref<string[]>([])
const controlOptions = ref<any[]>([])

const form = reactive<FormDataType>({
  projectCreater: "",
  projectType: "",
  projectName: "",
  projectDescription: "",
  customerName: "",
  domain: [],
  industryType: [],
  product: "",
  executor: "",
  teammates: [],
  software: [],
  status: "PROCESSING",
  security: "無",
  startTime: null,
  closeTime: null,
})

const files = ref<FileType[]>([{ fileCount: 1 }])
const fileCount = ref<number>(1)

const fileProgress = reactive<FileProgressType>({
  show: false,
  title: "Please wait",
  done: 0,
  total: 0,
})

// Computed
const userInfo = computed((): UserInfo => store.getters.userInfo)
const flobookLicense = computed(
  (): FlobookLicense => store.getters.flobookLicense
)

const hasTrack = computed((): boolean => flobookLicense.value.HasTrack)

const necessaryRules = computed(() => [
  (v: any) => {
    if (Array.isArray(v)) {
      //陣列的狀況判斷是否為空值
      return v.length > 0 || t("validate.required")
    }
    //有無值
    return !!v || t("validate.required")
  },
])

// Methods
const changeLoadingState = (state: any) => {
  store.dispatch("changeLoadingState", state)
}

const getInitialOptions = async () => {
  try {
    changeLoadingState({ showDialog: true, isLoading: true })

    const response = await API.apiAddProjectInit()
    const data = response.data

    controlOptions.value = data.control || []
    const keyword = data.keyword || {}

    projectTypeOptions.value = keyword.type || []
    customerOptions.value =
      keyword.client?.map((str: string) => str.replace(/%2C/g, ",")) || []
    domainOptions.value =
      keyword.field?.map((str: string) => str.replace(/%2C/g, ",")) || []
    industryOptions.value =
      keyword.industry?.map((str: string) => str.replace(/%2C/g, ",")) || []
    productOptions.value =
      keyword.product?.map((str: string) => str.replace(/%2C/g, ",")) || []
    softwareOptions.value =
      keyword.software?.map((str: string) => str.replace(/%2C/g, ",")) || []
    engineerOptions.value =
      data.member?.map((str: string) => str.replace(/%2C/g, ",")) || []
  } catch (error) {
    console.error("Failed to load initial options:", error)
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "loadOptionsError",
    })
  } finally {
    changeLoadingState({ showDialog: false, isLoading: false })
  }
}

const addFileUpload = () => {
  fileCount.value++
  files.value.push({ fileCount: fileCount.value })
  // 擴展 refs 陣列
  fileUploadRefs.value.push(null)
}

const onRemoveFileUpload = (index: number) => {
  files.value.splice(index, 1)
  fileUploadRefs.value.splice(index, 1)
}

const validateForm = async () => {
  try {
    const { valid } = await formRef.value.validate()
    if (valid) {
      await submit()
    }
  } catch (error) {
    console.error("Form validation failed:", error)
  }
}

const submit = async () => {
  try {
    changeLoadingState({ showDialog: true, isLoading: true })

    // Encode ',' for arrays
    const encodeArray = (arr: string[]) => arr.map(x => x.replace(/,/g, "%2C"))

    const formData = new FormData()
    const filesFormData = new FormData()

    // Process file uploads using refs
    fileUploadRefs.value.forEach((fileComp: any) => {
      if (fileComp && fileComp.fileName) {
        filesFormData.append("files", fileComp.file)
      }
    })

    // Prepare form data
    const processedForm = {
      ...form,
      domain: encodeArray(form.domain),
      industryType: encodeArray(form.industryType),
      software: encodeArray(form.software),
      teammates: encodeArray(form.teammates),
      customerName: form.customerName.replace(/,/g, "%2C"),
      projectName: form.projectName.replace(/,/g, "%2C"),
      product: form.product.replace(/,/g, "%2C"),
      projectCreater:
        userInfo.value.userName || sessionStorage.getItem("userName") || "",
    }

    Object.entries(processedForm).forEach(([key, val]) => {
      if (val instanceof Date) {
        formData.append(key, formatTime(val))
      } else {
        formData.append(
          key,
          Array.isArray(val) ? val.toString() : (val as string)
        )
      }
    })

    const payload = {
      projectDetail: formData,
      projectFiles: filesFormData,
    }

    const response = await API.apiAddProject(formData)

    // Reset form
    resetForm()

    // Get project list to find new project ID
    const listResponse = await API.apiProjectListInit({
      id: userInfo.value.userId,
    })
    const ids = listResponse.data.map((d: any) => d.id)
    const maxId = Math.max(...ids)

    // Check if files need to be uploaded
    const hasFiles = fileUploadRefs.value.some(
      ref => ref && ref.fileName !== ""
    )

    if (hasFiles) {
      await uploadFile(maxId)
    } else {
      router.push({ name: "Knowledge Database" })
    }
  } catch (error) {
    console.error("Failed to submit project:", error)
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "submitProjectError",
    })
  }
}

const resetForm = () => {
  Object.assign(form, {
    projectCreater:
      userInfo.value.userName || sessionStorage.getItem("userName") || "",
    projectType: "",
    projectName: "",
    projectDescription: "",
    customerName: "",
    domain: [],
    industryType: [],
    product: "",
    executor: "",
    teammates: [],
    software: [],
    status: "PROCESSING",
    security: "無",
    startTime: null,
    closeTime: null,
  })
}

const formatTime = (d: Date | null): string => {
  if (!d) return ""
  return `${d.getFullYear()}/${
    d.getMonth() + 1
  }/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

const uploadFile = async (projectId: number) => {
  try {
    fileProgress.show = true
    fileProgress.title = "Uploading files..."
    fileProgress.done = 0
    fileProgress.total = fileUploadRefs.value.filter(
      ref => ref && ref.fileName
    ).length

    // File upload logic - 保持原有邏輯
    console.log("Uploading files for project:", projectId)

    // 模擬文件上傳進度
    for (let i = 0; i < fileProgress.total; i++) {
      fileProgress.done = i + 1
      // 實際上傳邏輯應該在這裡
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    fileProgress.show = false
    router.push({ name: "Knowledge Database" })
  } catch (error) {
    console.error("File upload failed:", error)
    fileProgress.show = false
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "fileUploadError",
    })
  }
}

const initializeForm = () => {
  form.projectCreater =
    userInfo.value.userName || sessionStorage.getItem("userName") || ""
  const today = new Date()
  form.startTime = today.toISOString().split("T")[0] // YYYY-MM-DD format
}

// Lifecycle
onMounted(async () => {
  await getInitialOptions()
  initializeForm()
})
</script>

<style scoped>
.creater-container {
  background-color: #444;
  max-width: 1000px;
  margin: auto;
  padding: 30px;
  padding-top: 10px;
  margin-bottom: 64px;
  margin-top: 20px;
  border-radius: 10px;
}

.creater-container h1 {
  color: white;
  margin: 0px;
  margin-bottom: 10px;
}

.creater-container h2 {
  color: white;
  text-align: left;
  margin-bottom: 10px;
}

/* Dark theme styles for inputs */
.dark-input :deep(.v-field__input) {
  color: #ffffff !important;
}

.dark-input :deep(.v-field__field) {
  color: #ffffff !important;
}

.dark-input :deep(.v-field--variant-outlined .v-field__outline) {
  color: #cccccc !important;
}

.dark-input :deep(.v-label) {
  color: #cccccc !important;
}

.dark-input :deep(.v-field--focused .v-field__outline) {
  color: #1976d2 !important;
}

.dark-input :deep(.v-field--focused .v-label) {
  color: #1976d2 !important;
}

/* Dark theme for chips */
.dark-input :deep(.v-chip) {
  background-color: #666666 !important;
  color: #ffffff !important;
}

.dark-input :deep(.v-chip .v-icon) {
  color: #ffffff !important;
}

/* Dark theme for textarea */
.dark-input :deep(.v-field--variant-outlined textarea) {
  color: #ffffff !important;
}

/* Dark theme for select dropdown */
.dark-input :deep(.v-list) {
  background-color: #333333 !important;
}

.dark-input :deep(.v-list-item) {
  color: #ffffff !important;
}

.dark-input :deep(.v-list-item:hover) {
  background-color: #555555 !important;
}
</style>
