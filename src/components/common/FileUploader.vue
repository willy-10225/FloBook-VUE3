<template>
  <div class="file-uploader-wrapper">
    <!-- Close button -->
    <v-btn
      v-show="showCloseButton"
      class="file-uploader-close"
      icon="mdi-close"
      variant="text"
      color="error"
      size="small"
      @click="clearFiles"
    />

    <!-- Main upload area -->
    <v-card
      class="file-uploader"
      :class="{
        'file-uploader--hover': isHover,
        'file-uploader--highlight': isHighlight,
      }"
      variant="outlined"
      @dragover.prevent="handleHighlight($event, true)"
      @dragleave="handleHighlight($event, false)"
      @drop.prevent="handleDrop"
    >
      <!-- Upload message and controls -->
      <div v-if="!showTreeView" class="upload-content">
        <div
          class="upload-message-box"
          :class="{ 'upload-message-box--highlight': isHighlight }"
        >
          拖曳上傳資料夾或檔案
        </div>

        <div class="upload-browser">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                variant="elevated"
                size="large"
              >
                Upload
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="triggerFolderPicker">
                <v-list-item-title>Upload Folder</v-list-item-title>
              </v-list-item>
              <v-list-item @click="triggerFilesPicker">
                <v-list-item-title>Upload Files</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Hidden file inputs -->
          <input
            ref="folderPicker"
            type="file"
            webkitdirectory
            directory
            multiple
            style="display: none"
            @change="getFolder"
          />
          <input
            ref="filesPicker"
            type="file"
            multiple
            style="display: none"
            @change="getFiles"
          />
        </div>
      </div>

      <!-- Tree view -->
      <TreeView v-else :items="treeviewItems" />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
import TreeView from "@/components/common/TreeView.vue"
import TreeviewConverter from "@/assets/ts/treeview_converter"
import { dryCheckIsFile } from "@/assets/ts/dry"

// Types
interface TreeItem {
  name: string
  children?: TreeItem[]
}

interface FileWithPath extends File {
  relativePath?: string
}

interface FileSystemEntry {
  name: string
  fullPath: string
  isDirectory: boolean
  isFile: boolean
  getAsEntry?: () => FileSystemEntry
  webkitGetAsEntry?: () => FileSystemEntry
  createReader?: () => FileSystemDirectoryReader
  file?: (
    successCallback: (file: File) => void,
    errorCallback: (error: Error) => void
  ) => void
}

interface FileSystemDirectoryReader {
  readEntries: (
    successCallback: (entries: FileSystemEntry[]) => void,
    errorCallback: (error: Error) => void
  ) => void
}

// Props
interface Props {
  highlight?: boolean
  files?: FileWithPath[]
}

const props = withDefaults(defineProps<Props>(), {
  highlight: false,
  files: () => [],
})

// Emits
const emit = defineEmits<{
  clearFiles: []
}>()

// Template refs
const folderPicker = ref<HTMLInputElement>()
const filesPicker = ref<HTMLInputElement>()

// Reactive state
const isHighlight = ref<boolean>(false)
const isHover = ref<boolean>(false)
const showTreeView = ref<boolean>(false)
const treeviewItems = ref<TreeItem[]>([])
const fileTreeArray = ref<string[]>([])
const uploadedFiles = ref<FileWithPath[]>([])

// Computed
const showCloseButton = computed(
  () => showTreeView.value || uploadedFiles.value.length > 0
)

// Watch props
watch(
  () => props.highlight,
  val => {
    isHighlight.value = val
  }
)

// Methods
const clearFiles = () => {
  treeviewItems.value = []
  fileTreeArray.value = []
  uploadedFiles.value = []
  showTreeView.value = false

  // Clear file inputs
  if (folderPicker.value) folderPicker.value.value = ""
  if (filesPicker.value) filesPicker.value.value = ""

  emit("clearFiles")
}

const handleHighlight = (e: DragEvent, state: boolean) => {
  if (dryCheckIsFile(e)) {
    isHover.value = state
  }
}

const handleDrop = (e: DragEvent) => {
  isHover.value = false
  fileTreeArray.value = []
  treeviewItems.value = []
  uploadedFiles.value = []
  emit("clearFiles")

  const items = e.dataTransfer?.items
  if (!items) return

  for (const item of items) {
    if (item.kind !== "file") continue

    let entry: FileSystemEntry | null = null
    if ((item as any).getAsEntry) {
      entry = (item as any).getAsEntry()
    } else if ((item as any).webkitGetAsEntry) {
      entry = (item as any).webkitGetAsEntry()
    }

    if (entry) {
      scanFiles(entry, fileTreeArray.value)
    }
  }

  setTimeout(() => {
    showFileTree()
  }, 500)
}

const scanFiles = (currentEntry: FileSystemEntry, fileTreeArray: string[]) => {
  if (currentEntry.isDirectory) {
    const directoryReader = currentEntry.createReader?.()
    if (!directoryReader) return

    fileTreeArray.push(currentEntry.fullPath + "/")

    directoryReader.readEntries(
      (entries: FileSystemEntry[]) => {
        entries.forEach(entry => {
          scanFiles(entry, fileTreeArray)
        })
      },
      (err: Error) => {
        console.error("Error reading directory:", err)
      }
    )
  } else {
    fileTreeArray.push(currentEntry.fullPath)
    currentEntry.file?.(
      (file: File) => {
        const pathLayers = currentEntry.fullPath.match(/\/[^/]*/g) || []
        pathLayers.pop()
        const fileWithPath = file as FileWithPath
        fileWithPath.relativePath = pathLayers.join("")
        uploadedFiles.value.push(fileWithPath)
      },
      (err: Error) => {
        console.error("Error reading file:", err)
      }
    )
  }
}

const triggerFolderPicker = () => {
  folderPicker.value?.click()
}

const triggerFilesPicker = () => {
  filesPicker.value?.click()
}

const getFolder = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || []) as FileWithPath[]
  const tempTreeArray: string[] = []

  files.forEach(file => {
    const fullPath = "/" + (file as any).webkitRelativePath
    tempTreeArray.push(fullPath)

    const pathLayers = fullPath.match(/\/[^/]*/g) || []
    pathLayers.pop()
    pathLayers.shift()
    file.relativePath = pathLayers.join("")
    uploadedFiles.value.push(file)
  })

  fileTreeArray.value = fillLostFolder(tempTreeArray)
  showFileTree()
}

const getFiles = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || []) as FileWithPath[]

  files.forEach(file => {
    file.relativePath = ""
    fileTreeArray.value.push("/" + file.name)
    uploadedFiles.value.push(file)
  })

  showFileTree()
}

const fillLostFolder = (tempTreeArray: string[]): string[] => {
  const originalLength = tempTreeArray.length

  for (let h = 0; h < originalLength; h++) {
    const pathLayers = tempTreeArray[h].match(/\/[^/]*/g) || []

    for (let i = 0; i < pathLayers.length; i++) {
      let folderPath = ""
      for (let j = 0; j < i; j++) {
        folderPath += pathLayers[j]
      }
      folderPath += "/"

      if (tempTreeArray.indexOf(folderPath) === -1) {
        tempTreeArray.push(folderPath)
      }
    }
  }

  const rootIndex = tempTreeArray.indexOf("/")
  if (rootIndex !== -1) {
    tempTreeArray.splice(rootIndex, 1)
  }

  return tempTreeArray.sort((a, b) => a.localeCompare(b))
}

const showFileTree = async () => {
  await nextTick()

  setTimeout(() => {
    treeviewItems.value = []
    const converted = TreeviewConverter.convertTreeView(fileTreeArray.value)
    treeviewItems.value = converted
    showTreeView.value = true
  }, 100)
}
</script>

<style scoped>
.file-uploader-wrapper {
  position: relative;
}

.file-uploader {
  position: relative;
  min-height: 300px;
  transition: all 0.3s ease;
}

.file-uploader--hover {
  background-color: rgb(var(--v-theme-surface-variant));
}

.file-uploader--highlight {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 3px !important;
}

.file-uploader-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-uploader-wrapper:hover .file-uploader-close {
  opacity: 1;
}

.upload-content {
  position: relative;
  height: 100%;
  min-height: 300px;
}

.upload-message-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-width: 90%;
  height: 50px;
  line-height: 50px;
  font-size: 1.5rem;
  text-align: center;
  pointer-events: none;
  border-radius: 8px;
  color: rgb(var(--v-theme-on-surface-variant));
  transition: all 0.3s ease;
}

.upload-message-box--highlight {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  animation: bounce 0.5s ease-in-out infinite alternate;
}

.upload-browser {
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

@keyframes bounce {
  from {
    transform: translate(-50%, -52%);
  }
  to {
    transform: translate(-50%, -48%);
  }
}

/* Dark theme adjustments */
.v-theme--dark .upload-message-box {
  color: rgb(var(--v-theme-on-surface));
}
</style>
