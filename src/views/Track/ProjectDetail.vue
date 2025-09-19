<template>
  <div class="project-detail-container">
    <h2>{{ abstract.projectName }}</h2>

    <v-expansion-panels v-model="panel" multiple>
      <!-- Abstract Panel -->
      <v-expansion-panel value="panel1">
        <v-expansion-panel-title class="panel-header">
          {{ $t("track.abstract") }}
          <template v-slot:actions>
            <div class="panel-modify">
              <v-btn
                v-if="!isEditing && writable"
                color="teal"
                @click="takeSnapshot"
              >
                {{ $t("common.edit") }}
              </v-btn>
              <v-btn
                v-if="isEditing"
                color="grey"
                @click="getBackSnapShot"
                class="me-2"
              >
                {{ $t("common.cancel") }}
              </v-btn>
              <v-btn v-if="isEditing" color="primary" @click="validateForm">
                {{ $t("common.confirm") }}
              </v-btn>
            </div>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="panel-body">
            <abstract
              ref="abstractRef"
              :abstract="abstract"
              :selectOptions="selectOptions"
              :isEditing="isEditing"
            />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Progress Panel -->
      <v-expansion-panel value="panel2">
        <v-expansion-panel-title class="panel-header">
          {{ $t("track.progress") }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <check-points :checkPoints="checkpoints" :writable="writable" />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Log Panel -->
      <v-expansion-panel value="panel3">
        <v-expansion-panel-title class="panel-header">
          {{ $t("track.log") }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <flow-log :flow="flow" />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Files Panel -->
      <v-expansion-panel value="panel4">
        <v-expansion-panel-title class="panel-header">
          {{ $t("track.files") }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row class="file-list" @click="loseFileFocus">
            <v-col
              cols="2"
              v-for="(fileInfo, index) in fileInfos"
              :key="index"
              @click="previewFile(index)"
              @dragover="allowDrop(index, $event)"
            >
              <div
                class="file-list-item"
                :class="{
                  focus: fileFocus && fileIndex === index,
                  'while-drag': fileInfo.placehold,
                }"
                :title="fileInfo.Subject"
              >
                <img
                  :src="chooseFileIcon(fileInfo.Type)"
                  width="50px"
                  draggable="true"
                  @dragend="drop(index)"
                  @dragstart="drag(index)"
                />
                <div style="font-size: 16px">
                  {{ shortFileName(fileInfo.Subject) }}
                </div>
                <div
                  v-if="writable"
                  class="file-remove"
                  @click.stop="openRemoveFileDialog(index, fileInfo.Subject)"
                >
                  x
                </div>
              </div>
            </v-col>
          </v-row>

          <confirm-dialog
            :title="
              $t('track.confirm-delete-file', {
                fileName: removeFileDialog.fileName,
              })
            "
            :safeOption="$t('common.cancel')"
            :dangerOption="$t('common.delete')"
            :openAlert="removeFileDialog.isOpened"
            @closeConfirmDialog="removeFile(removeFileDialog.index, $event)"
          />

          <v-table class="file-list-detail">
            <thead>
              <tr>
                <th style="width: 40%">{{ $t("track.file-name") }}</th>
                <th style="width: 40%">{{ $t("track.file-description") }}</th>
                <th style="width: 20%">{{ $t("track.file-download") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="fileIndex !== null">
                <td>{{ fileInfos[fileIndex].Subject }}</td>
                <td>{{ fileInfos[fileIndex].Describe }}</td>
                <td>
                  <a
                    :href="fileInfos[fileIndex].DownloadLink"
                    download
                    target="_blank"
                    style="color: #0006ff; border-bottom: solid 1px #0006ff"
                  >
                    Download
                  </a>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div v-if="isDisplay">
            <pre class="text-viewer" v-if="currentFile.type === 'txt'">{{
              currentFile.text
            }}</pre>
            <div class="ppt-viewer" v-if="currentFile.type === 'ppt'">
              <v-carousel
                ref="carouselRef"
                :cycle="false"
                hide-delimiters
                v-model="carouselPage"
                @update:model-value="changePageByCarousel"
              >
                <v-carousel-item v-for="name in reportNames" :key="name">
                  <img :src="name" />
                </v-carousel-item>
              </v-carousel>
              <v-row justify="center">
                <v-pagination
                  :length="reportNames.length"
                  v-model="currPage"
                  @update:model-value="changePageByPagination"
                />
              </v-row>
            </div>
          </div>

          <iframe
            class="pdf-viewer"
            v-if="currentFile.type === 'pdf'"
            :src="currentFile.url"
          >
            {{ $t("track.no-pdf") }}
          </iframe>

          <img
            class="img-viewer"
            v-if="currentFile.type === 'img'"
            :src="currentFile.url"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- File Upload Panel -->
      <v-expansion-panel v-if="writable" value="panel5">
        <v-expansion-panel-title class="panel-header">
          {{ $t("track.file-upload") }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="panel-body">
            <file-upload
              v-for="(file, index) in files"
              :key="file.fileCount"
              :fileCount="index"
              :ref="setFileUploadRef"
              @removeFileUpload="onRemoveFileUpload"
            />
            <append-button @click="addFileUpload" />
          </div>
          <v-btn color="primary" @click="uploadFile">
            {{ $t("common.submit") }}
          </v-btn>
          <qi-progress :progress="fileProgress" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import Abstract from "@/components/Track/Abstract.vue"
import CheckPoints from "@/components/Track/CheckPoints.vue"
import FlowLog from "@/components/Track/FlowLog.vue"
import FileUpload from "@/components/Track/FileUpload.vue"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import QiProgress from "@/components/common/QiProgress.vue"
import AppendButton from "@/components/common/AppendButton.vue"
import API from "@/assets/ts/api"
import { useRoute } from "vue-router"

// Props
const route = useRoute()
const projectId = route.query.projectId || route.params.projectId
console.log("projectId", projectId)
// Composables
const store = useStore()
const { t } = useI18n()

// Types
interface FileInfo {
  Id: number
  Subject: string
  Describe: string
  Type: string
  DownloadLink: string
  Previewable: boolean
  placehold?: boolean
}

interface AbstractData {
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
  manager?: string
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
  controlOptions: any[]
}

interface CurrentFile {
  type: string
  text?: string
  url?: string
  folder?: string
  pic_num?: number
}

interface FileProgress {
  show: boolean
  title: string
  done: number
  total: number
}

interface RemoveFileDialog {
  isOpened: boolean
  index: number
  fileName: string
}

interface FileItem {
  fileCount: number
}

// Refs
const abstractRef = ref<InstanceType<typeof Abstract> | null>(null)
const carouselRef = ref<any>(null)
const fileUploadRefs = ref<InstanceType<typeof FileUpload>[]>([])

// Reactive data
const writable = ref<boolean>(false)
const readable = ref<boolean>(false)
const panel = ref<string[]>(["panel1"])

const abstract = ref<AbstractData>({
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
})

const isEditing = ref<boolean>(false)
const abstractBeforeModify = ref<AbstractData>({} as AbstractData)

// File Preview
const fileInfos = ref<FileInfo[]>([])
const originFileInfos = ref<FileInfo[]>([])
const fileFocus = ref<boolean>(false)
const fileIndex = ref<number | null>(null)
const dropTargetId = ref<number | null>(null)
const dragTargetId = ref<number | null>(null)
const isDragging = ref<boolean>(false)
const isDisplay = ref<boolean>(false)
const reportNames = ref<string[]>([])
const currPage = ref<number>(1)
const carouselPage = ref<number>(0)
const currentFile = ref<CurrentFile>({ type: "" })

const removeFileDialog = ref<RemoveFileDialog>({
  isOpened: false,
  index: 0,
  fileName: "",
})

// Select Options
const selectOptions = ref<SelectOptions>({
  statusOptions: ["PROCESSING", "CLOSED"],
  securityOptions: ["無", "有"],
  dealOptions: [
    "成功導入",
    "客戶評估中",
    "短期內未能導入(因技術面)",
    "短期內未能導入(非技術面)",
    "不明",
  ],
  projectTypeOptions: [],
  softwareOptions: [],
  engineerOptions: [],
  customerOptions: [],
  domainOptions: [],
  industryOptions: [],
  productOptions: [],
  controlOptions: [],
})

// Check Point & Flow
const checkpoints = ref<any[]>([])
const flow = ref<any>({})

// File Upload
const files = ref<FileItem[]>([{ fileCount: 1 }])
const fileCount = ref<number>(1)
const fileProgress = ref<FileProgress>({
  show: false,
  title: "Please wait",
  done: 0,
  total: 0,
})

// Computed
const userInfo = computed(() => store.getters.userInfo)
const loadingDialog = computed(() => store.getters.loadingDialog)

const statusStyle = computed(() => ({
  "project-state-normal": abstract.value.status === "PROCESSING",
  "project-state-close": abstract.value.status === "CLOSED",
}))

const dealStateStyle = computed(() => ({
  "project-state-close-deal":
    abstract.value.deal === selectOptions.value.dealOptions[0],
}))

// Methods
const setFileUploadRef = (el: any) => {
  if (el) {
    fileUploadRefs.value.push(el)
  }
}

const changeLoadingState = (payload: any) => {
  store.dispatch("changeLoadingState", payload)
}

const getProjectDetail = (isInit?: boolean) => {
  isEditing.value = false
  if (isInit) {
    changeLoadingState(true)
  } else {
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      showAction: true,
    })
  }

  if (!projectId) {
    sessionStorage.setItem("projectId", projectId)
  }

  const payload = {
    id: parseInt(sessionStorage.getItem("projectId") || "0"),
    userId: userInfo.value.userId,
  }
  console.log("apiGetProjectById", payload)
  API.apiGetProjectById(payload)
    .then(res => {
      writable.value = res.data.writable
      readable.value = res.data.readable

      abstract.value.id = res.data.id
      abstract.value.projectCreater = res.data.manager
      abstract.value.projectType = res.data.type
        .split(",")
        .map((x: string) => x.replace(/%2C/g, ","))
      abstract.value.projectDescription = res.data.describe
      abstract.value.executor = res.data.executor
      abstract.value.status = res.data.status
      abstract.value.security = res.data.security
      abstract.value.projectName = res.data.subject.replace(/%2C/g, ",")
      abstract.value.customerName = res.data.client.replace(/%2C/g, ",")
      abstract.value.product = res.data.product.replace(/%2C/g, ",")
      abstract.value.domain = res.data.field
        .split(",")
        .map((x: string) => x.replace(/%2C/g, ","))
      abstract.value.industryType = res.data.industry
        .split(",")
        .map((x: string) => x.replace(/%2C/g, ","))
      abstract.value.teammates = res.data.team
        .split(",")
        .map((x: string) => x.replace(/%2C/g, ","))
      abstract.value.software = res.data.software
        .split(",")
        .map((x: string) => x.replace(/%2C/g, ","))
      abstract.value.deal =
        res.data.deal === "" ? t("common.unknown") : res.data.deal
      abstract.value.startTime = res.data.start_time
      abstract.value.closeTime = res.data.close_time
      abstract.value.manager = sessionStorage.getItem("userName") || ""

      clearFilesComma(res.data.Files)

      checkpoints.value = res.data.checkpoint && JSON.parse(res.data.checkpoint)
      flow.value = res.data.flow

      if (isInit) changeLoadingState(false)
    })
    .catch(err => {
      if (err.config?.data?.id == null) {
        // this.$router.push({ name: 'Knowledge Database' })
      } else {
        console.log(err)
      }
    })
}

const getInitialOptions = () => {
  changeLoadingState(true)
  API.apiAddProjectInit()
    .then(res => {
      selectOptions.value.controlOptions = res.data.control
      const keyword = res.data.keyword
      selectOptions.value.projectTypeOptions = keyword.type
      selectOptions.value.customerOptions = keyword.client.map((str: string) =>
        str.replace(/%2C/g, ",")
      )
      selectOptions.value.domainOptions = keyword.field.map((str: string) =>
        str.replace(/%2C/g, ",")
      )
      selectOptions.value.industryOptions = keyword.industry.map(
        (str: string) => str.replace(/%2C/g, ",")
      )
      selectOptions.value.productOptions = keyword.product.map((str: string) =>
        str.replace(/%2C/g, ",")
      )
      selectOptions.value.softwareOptions = keyword.software.map(
        (str: string) => str.replace(/%2C/g, ",")
      )
      selectOptions.value.engineerOptions = res.data.member.map((str: string) =>
        str.replace(/%2C/g, ",")
      )

      changeLoadingState(false)
    })
    .catch(err => {
      console.log(err)
    })
}

// File Preview Methods
const shortFileName = (name: string): string => {
  if (name.length > 10) return name.slice(0, 9) + "..."
  else return name
}

const chooseFileIcon = (type: string): string => {
  switch (type) {
    case "ppt":
      return "/img/file-icons/012-powerpoint.png"
    case "txt":
      return "/img/file-icons/007-txt.png"
    case "pdf":
      return "/img/file-icons/002-pdf.png"
    case "img":
      return "/img/file-icons/image.png"
    default:
      return "/img/file-icons/019-document-1.png"
  }
}

const loseFileFocus = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.classList.contains("v-row")) fileFocus.value = false
}

const drag = (index: number) => {
  dragTargetId.value = index
}

const allowDrop = (index: number, e: DragEvent) => {
  e.preventDefault()
  if (dropTargetId.value !== index) {
    dropTargetId.value = index
    if (originFileInfos.value.length !== 0 && isDragging.value) {
      fileInfos.value = Object.assign([], originFileInfos.value)
    } else {
      originFileInfos.value = Object.assign([], fileInfos.value)
      isDragging.value = true
    }

    dragItem(fileInfos.value, dragTargetId.value!, dropTargetId.value, true)
  }
}

const dragItem = (
  files: FileInfo[],
  dragTargetIndex: number,
  dropTargetIndex: number,
  placeholdState: boolean
) => {
  const temp: FileInfo[] = Object.assign([], files)
  const dragTarget: FileInfo[] = temp.splice(dragTargetIndex, 1)
  const leftArray = temp.splice(0, dropTargetIndex)
  const rightArray = temp
  dragTarget[0].placehold = placeholdState
  leftArray.push(dragTarget[0])
  Object.assign(files, leftArray.concat(rightArray))
}

const drop = (index: number) => {
  if (originFileInfos.value.length !== 0) {
    fileInfos.value = Object.assign([], originFileInfos.value)
  }

  dragItem(fileInfos.value, index, dropTargetId.value!, false)
  storeFileOrder()

  dropTargetId.value = -1
  isDragging.value = false
}

const storeFileOrder = () => {
  const payload = {
    projectId: abstract.value.id,
    userName: sessionStorage.getItem("userName")!,
    files: fileInfos.value.map(x => x.Id),
  }
  API.apiModifyFile(payload)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
}

const sortFileInfos = (files: FileInfo[]) => {
  fileInfos.value = Object.assign([], files)
  // For Development Mode
  if ((window as any).webpackHotUpdate) {
    fileInfos.value.forEach(x => (x.DownloadLink = x.DownloadLink))
  }
}

const reportNamesInit = (file: CurrentFile) => {
  reportNames.value = []
  if (file.pic_num) {
    for (let i = 0; i < file.pic_num; i++) {
      reportNames.value[i] = file.folder + "page" + (i + 1) + ".png"
    }
  }
}

const previewFile = (index: number) => {
  if (fileIndex.value !== index) {
    fileFocus.value = true
    currPage.value = 1
    carouselPage.value = 0
  } else {
    fileFocus.value = !fileFocus.value
  }

  if (fileInfos.value[index].Previewable) {
    changeLoadingState(true)
    API.apiGetFilePreview({ id: fileInfos.value[index].Id })
      .then(res => {
        currentFile.value = res.data
        // For Development Mode
        if ((window as any).webpackHotUpdate) {
          currentFile.value.folder = currentFile.value.folder
          currentFile.value.url = currentFile.value.url
        }
        reportNamesInit(currentFile.value)

        changeLoadingState(false)
      })
      .catch(err => {
        console.log(err)
        changeLoadingState({
          showDialog: true,
          isLoading: false,
          showAction: true,
          message: t("這個檔案無法預覽"),
        })
      })
    isDisplay.value = true
    fileIndex.value = index
  } else {
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      showAction: true,
      message: t("這個檔案無法預覽"),
    })
  }
}

const removeFile = (index: number, isConfirm: boolean) => {
  removeFileDialog.value.isOpened = false
  if (isConfirm) {
    fileInfos.value.splice(index, 1)
    storeFileOrder()
  }
}

const openRemoveFileDialog = (index: number, fileName: string) => {
  removeFileDialog.value.isOpened = true
  removeFileDialog.value.fileName = fileName
  removeFileDialog.value.index = index
}

const changePageByKey = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight") {
    currPage.value =
      currPage.value >= reportNames.value.length
        ? reportNames.value.length
        : currPage.value + 1
    carouselPage.value = currPage.value - 1
  }
  if (e.key === "ArrowLeft") {
    currPage.value = currPage.value <= 1 ? 1 : currPage.value - 1
    carouselPage.value = currPage.value - 1
  }
}

const changePageByPagination = () => {
  carouselPage.value = currPage.value - 1
}

const changePageByCarousel = (index: number) => {
  currPage.value = index + 1
}

// File Upload Methods
const addFileUpload = () => {
  fileCount.value++
  files.value.push({ fileCount: fileCount.value })
}

const onRemoveFileUpload = (index: number) => {
  files.value.splice(index, 1)
}

const uploadFile = () => {
  fileProgress.value.done = 0
  fileProgress.value.total = 0
  const sliceSize = 100 * 1024 * 1024 // 100 MB

  fileUploadRefs.value.forEach((fileUploadRef, fileId) => {
    const fileForm = {
      fileName: "",
      fileNames: "",
      fileDescription: "",
      patches: [] as Blob[],
      index: 0,
      total: 0,
    }

    if (fileUploadRef.fileName !== "") {
      fileProgress.value.show = true
      const size = fileUploadRef.fileSize

      fileForm.fileName = fileUploadRef.fileName
      fileForm.fileNames = fileForm.fileName
      fileForm.fileDescription = fileUploadRef.fileDescription

      fileForm.total = Math.ceil(size / sliceSize)
      fileProgress.value.total += fileForm.total

      for (let sliceIndex = 0; sliceIndex < fileForm.total; sliceIndex++) {
        const start = sliceIndex * sliceSize
        const end = Math.min(size, start + sliceSize)
        if (fileUploadRef.fileObj) {
          fileForm.patches.push(fileUploadRef.fileObj.slice(start, end))
        } else {
          console.warn("fileObj is null")
        }
      }

      sentFileRequest(fileForm)
    } else {
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        showAction: true,
        message: t("track.no-file"),
      })
    }
  })

  function sentFileRequest(fileForm: any) {
    const formData = new FormData()
    formData.append("total", fileForm.total.toString())
    formData.append("index", fileForm.index.toString())
    formData.append("file", fileForm.patches[fileForm.index])
    formData.append("fileNames", fileForm.fileNames)
    formData.append("fileDescriptions", fileForm.fileDescription)
    formData.append("id", abstract.value.id.toString())
    formData.append("manager", abstract.value.manager || "")

    API.apiUploadBigFile(formData)
      .then(res => {
        if (res.data === "wait" && fileForm.index < fileForm.total - 1) {
          fileForm.index++
          fileProgress.value.done++
          return sentFileRequest(fileForm)
        } else if (res.data === "success") {
          fileProgress.value.done++
          console.log("success")
          setTimeout(() => {
            if (fileProgress.value.done === fileProgress.value.total) {
              files.value = []
              addFileUpload()
              fileProgress.value.show = false
              changeLoadingState({
                showDialog: true,
                isLoading: false,
                isSuccess: true,
                showAction: true,
                error: "",
              })
              getProjectDetail()
            }
          }, 500)
        } else if (res.data === "error") {
          throw new Error("Lose file patch")
        }
      })
      .catch(err => {
        console.log(err)
        fileProgress.value.show = false
        changeLoadingState({
          showDialog: true,
          isLoading: false,
          isSuccess: false,
          showAction: true,
          error: "loseFilePatchError",
        })
      })
  }
}

const clearFilesComma = (files: FileInfo[]) => {
  files.forEach(o => (o.Subject = o.Subject.replace(/%2C/g, ",")))
  files.forEach(o => (o.Describe = o.Describe.replace(/%2C/g, ",")))
  sortFileInfos(files)
}

// Modify Project Methods
const takeSnapshot = () => {
  isEditing.value = true
  abstractBeforeModify.value = Object.assign({}, abstract.value)
}

const getBackSnapShot = () => {
  isEditing.value = false
  abstract.value = Object.assign({}, abstractBeforeModify.value)
}

const validateForm = () => {
  if (
    JSON.stringify(abstractBeforeModify.value) ===
    JSON.stringify(abstract.value)
  ) {
    isEditing.value = false
  } else {
    const componentAbstract = abstractRef.value
    const abstractInner = componentAbstract?.$refs.abstract as {
      validate: () => Promise<boolean>
    }

    abstractInner?.validate().then(isValidated => {
      if (isValidated) modifyProject()
    })
  }
}

const modifyProject = () => {
  changeLoadingState(true)

  const payload = Object.assign({}, abstract.value)
  payload.domain = payload.domain.map((x: string) => x.replace(/,/g, "%2C"))
  payload.industryType = payload.industryType.map((x: string) =>
    x.replace(/,/g, "%2C")
  )
  payload.software = payload.software.map((x: string) => x.replace(/,/g, "%2C"))
  payload.teammates = payload.teammates.map((x: string) =>
    x.replace(/,/g, "%2C")
  )
  payload.customerName = payload.customerName.replace(/,/g, "%2C")
  payload.projectName = payload.projectName.replace(/,/g, "%2C")
  payload.product = payload.product.replace(/,/g, "%2C")

  API.apiModifyProject(payload)
    .then(() => {
      isEditing.value = false
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: true,
        showAction: true,
      })
    })
    .catch(err => {
      console.log(err)
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
      })
    })
}

// Lifecycle
onMounted(() => {
  getProjectDetail(true)
  getInitialOptions()
  window.addEventListener("keyup", changePageByKey)
})

onUnmounted(() => {
  window.removeEventListener("keyup", changePageByKey)
})
</script>

<style>
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
.mu-input.disabled .mu-input-content {
  cursor: default;
}
.project-detail-container .mu-input,
.project-detail-container .mu-chip {
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
.project-detail-fab-btn {
  float: left;
  margin-left: 15px;
}
.project-detail-fab-btn .mu-icon {
  font-size: 24px !important;
}
.mu-form-item-label {
  font-size: 20px;
}
.emphasis .mu-form-item-label {
  color: #43c5b8;
}
.project-state-normal {
  color: #3ad840;
}
.project-state-close {
  color: #e4c362;
}
.project-state-close-deal {
  color: #367ec5;
}
.panel-header {
  font-size: 25px;
}
.panel-body {
  margin-left: 10px;
  margin-right: 10px;
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
}
.mu-expansion-panel-header {
  background-color: #555;
}
.mu-expansion-panel-container {
  background-color: #6f6f6f;
}
.file-list {
  max-height: 200px;
  border: solid 2px gray;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.file-list-item.focus {
  background-color: #aaa;
}
.file-list-item {
  cursor: pointer;
  margin-bottom: 10px;
}
.file-remove {
  position: absolute;
  display: none;
  top: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
  background-color: #ffb3b3;
}
.file-list-item:hover .file-remove {
  display: block;
}
.file-remove:hover {
  background-color: #ff4d4d;
}
.file-list-item:hover {
  background-color: #aaa;
}
.while-drag {
  opacity: 0.2;
}
.file-list-detail {
  margin-bottom: 20px;
  width: 100%;
  border: solid 2px gray;
  padding: 10px;
}
.ppt-viewer {
  height: 80vh;
  margin: auto;
}
.ppt-viewer img {
  width: auto;
  height: auto;
  max-width: 90%;
  max-height: 100%;
}
.mu-carousel {
  height: 97%;
}
.mu-carousel-item img {
  min-width: unset;
}
.text-viewer {
  margin: auto;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  width: 90%;
  height: 70vh;
  text-align: left;
  background-color: #555;
  border: solid 2px gray;
}
.pdf-viewer {
  width: 90%;
  height: 70vh;
}
.img-viewer {
  width: 100%;
}
</style>
