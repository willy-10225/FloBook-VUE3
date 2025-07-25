<template>
  <v-sheet
    class="form-container"
    elevation="5"
    @dragover.prevent="onDrag(true)"
    @drop="onDrag(false)"
  >
    <v-container>
      <v-row>
        <v-col cols="12">
          <h2>Job Submission</h2>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.name"
            :rules="[rules.required]"
            label="Job Name"
            dense
            outlined
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="form.type"
            :items="solverTypeList"
            :rules="[rules.required]"
            item-text="text"
            item-value="value"
            label="Solver Type"
            dense
            outlined
          />
        </v-col>
        <v-col cols="12" md="6" v-if="!isHyperWorks">
          <v-select
            v-model="form.version"
            :items="solverVersionList"
            :rules="[rules.required]"
            label="Version"
            dense
            outlined
          />
        </v-col>
        <v-col cols="12" md="6" v-if="!isHyperWorks">
          <v-checkbox-group
            v-model="form.licenses"
            :rules="[rules.required]"
            row
          >
            <v-checkbox
              v-for="license in licenseList"
              :key="license.feature"
              :label="license.feature"
              :value="license.feature"
              :disabled="!license.selectable"
              density="compact"
            />
          </v-checkbox-group>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.cpuNum"
            :rules="[rules.minMax(1, initial.maxCpu)]"
            label="CPU"
            type="number"
            dense
            outlined
          />
          <div class="max-count">Max CPU: {{ initial.maxCpu }}</div>
        </v-col>
        <v-col cols="12" md="6" v-if="!isHyperWorks">
          <v-text-field
            v-model="form.gpuNum"
            :rules="[rules.minMax(0, initial.maxGpu)]"
            label="GPU"
            type="number"
            dense
            outlined
          />
          <div class="max-count">Max GPU: {{ initial.maxGpu }}</div>
        </v-col>

        <v-col cols="12">
          <file-uploader
            :highlight="isDragging"
            :files="uploadFiles"
            @clear-files="clearUploadFiles"
          />
        </v-col>

        <v-col cols="12" md="6" v-if="form.type === solverTypeList[0].value">
          <v-text-field
            v-model="form.inputFile"
            label="Entry File"
            dense
            outlined
          />
        </v-col>

        <v-col cols="12">
          <v-btn color="primary" @click="submit">Submit</v-btn>
        </v-col>
      </v-row>

      <qi-progress :progress="progress" />
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import Axios from "axios"
import FileUploader from "@/components/common/FileUploader.vue"
import QiProgress from "@/components/common/QiProgress.vue"

import {
  apiInitialJobSubmission,
  apiAddJob,
  apiUploadJobFile,
  apiUploadJobFinished,
} from "@/assets/ts/api"

import { dryCheckIsFile, dryAnsysVersion } from "@/assets/ts/dry"

const router = useRouter()
const store = useStore()

const solverTypeList = [
  { text: "ANSYS Workbench APDL", value: "ANSYS Standalone" },
  { text: "ANSYS Workbench", value: "ANSYS Workbench" },
  { text: "HyperWorks", value: "HyperWorks" },
]

const defaultEntryFileName = "flobook.dat"
const rules = {
  required: (v: any) => !!v || "Required.",
  minMax: (min: number, max: number) => (v: any) =>
    (v >= min && v <= max) || `Must be between ${min} and ${max}`,
}
const form = ref({
  name: "",
  cpuNum: 4,
  gpuNum: 0,
  type: "",
  version: "",
  licenses: [] as string[],
  inputFile: defaultEntryFileName,
})

const initial = ref({
  maxCpu: 1,
  maxGpu: 0,
  latestSolverVersion: [] as any[],
})

const solverVersionList = ref<string[]>([])

const progress = ref({
  title: "",
  total: 100,
  done: 0,
  show: false,
})

const uploadFiles = ref<FileWithRelativePath[]>([])
const isDragging = ref(false)

const isHyperWorks = computed(() => form.value.type === "HyperWorks")

const licenseList = computed(() => {
  const solverVersion = dryAnsysVersion(form.value.version)
  return initial.value.latestSolverVersion.map(item => {
    item.selectable = dryAnsysVersion(item.latestVersion) >= solverVersion
    return item
  })
})

function onDrag(state: boolean) {
  isDragging.value = state
}

onMounted(() => {
  apiInitialJobSubmission().then(res => {
    initial.value = res.data
  })

  Axios.get("/config/versions.json").then(res => {
    solverVersionList.value = res.data.reverse()
  })
})

function validateForm(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!form.value.name || !form.value.type) {
      reject("Please fill all required fields.")
    } else {
      resolve()
    }
  })
}

function validateFile(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!uploadFiles.value.length) {
      reject("You must upload at least one file.")
    } else {
      resolve()
    }
  })
}

function submit() {
  validateForm()
    .then(validateFile)
    .then(() => {
      const userName = sessionStorage.getItem("userName") ?? ""
      const payload = {
        user: userName,
        name: form.value.name,
        cpuNum: form.value.cpuNum,
        gpuNum: form.value.gpuNum,
        type: form.value.type,
        version: form.value.version,
        licenses: form.value.licenses.join(","),
        inputFile:
          form.value.type === solverTypeList[0].value
            ? form.value.inputFile || defaultEntryFileName
            : "",
      }

      return apiAddJob(payload)
    })
    .then(res => {
      if (res.data.status === "success") {
        uploadJobFiles(res.data.jobId)
      } else {
        showError(res.data.errorMessage)
      }
    })
    .catch(showError)
}

function uploadJobFiles(jobId: string) {
  const queue = getJobFileQueue(jobId)
  progress.value.title = "Files uploading..."
  progress.value.show = true
  progress.value.total = queue.length
  progress.value.done = 0

  const uploadNext = () => {
    if (!queue.length) return

    apiUploadJobFile(queue.shift()!)
      .then(res => {
        if (res.data !== "error") {
          progress.value.done++
          if (progress.value.done === progress.value.total) {
            apiUploadJobFinished({ jobId: Number(jobId) }).then(res => {
              progress.value.show = false
              if (res.data === "success") {
                uploadFiles.value = []
                store.dispatch("changeLoadingState", {
                  showDialog: true,
                  isLoading: false,
                  isSuccess: true,
                  showAction: true,
                })
                router.push({ name: "JobManager" })
              } else {
                showError(res.data)
              }
            })
          } else {
            uploadNext()
          }
        } else {
          showError(res.data.errorMessage)
        }
      })
      .catch(showError)
  }

  if (queue.length > 0) uploadNext()
  else console.warn("No files to upload.")
}

function getJobFileQueue(jobId: string) {
  const queue: FormData[] = []
  const sliceSize = 20 * 1024 * 1024

  uploadFiles.value.forEach(file => {
    const totalSlices = Math.ceil(file.size / sliceSize)
    for (let i = 0; i < totalSlices; i++) {
      const start = i * sliceSize
      const end = Math.min(file.size, start + sliceSize)
      const formData = new FormData()
      formData.append("jobId", jobId)
      formData.append("total", totalSlices.toString())
      formData.append("index", i.toString())
      formData.append("path", file.relativePath)
      formData.append("fileName", file.name)
      formData.append("file", file.slice(start, end))
      queue.push(formData)
    }
  })

  return queue
}

function showError(err: string | Error) {
  store.dispatch("changeLoadingState", {
    showDialog: true,
    isLoading: false,
    isSuccess: false,
    showAction: true,
    message: typeof err === "string" ? err : err.message,
  })
}

function clearUploadFiles() {
  uploadFiles.value = []
}

interface FileWithRelativePath extends File {
  relativePath: string
}
</script>

<style scoped>
.hover-margin {
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.form-container {
  background-color: #444;
  padding: 10px 100px 30px 100px;
  margin: auto;
  max-width: 900px;
  box-sizing: border-box;
  border-radius: 8px;
  color: white;
}

.select-control-row {
  display: block;
  padding: 10px 10px 10px 0;
}

.max-count {
  margin-left: 20px;
  font-size: 0.9rem;
  color: #ccc;
}

.mu-form-item {
  margin-bottom: 20px;
}

.mu-button {
  margin-top: 30px;
}

.mu-checkbox {
  margin-right: 10px;
}
</style>
