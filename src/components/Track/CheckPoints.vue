<template>
  <div class="cp-container">
    <!-- 完成度顯示 -->
    <div class="d-flex align-center mb-2">
      <span class="text-subtitle-1 mr-4">完成度：{{ percentText }}</span>
    </div>

    <v-progress-linear
      :model-value="percent"
      height="15"
      color="teal"
      rounded
      class="mb-4"
    />

    <!-- 新增查核項目 -->
    <div v-if="isEditing" class="mb-4">
      <div class="text-subtitle-1 mb-2">新增查核項目：</div>
      <v-card variant="outlined" class="pa-2">
        <v-text-field
          v-model="newItem"
          placeholder="輸入查核點名稱"
          variant="solo-filled"
          hide-details
          density="comfortable"
          @keypress.enter="addNewItem"
          ref="newItemInput"
        >
          <template v-slot:append-inner>
            <v-btn
              color="primary"
              variant="elevated"
              size="small"
              @click="addNewItem"
              :disabled="!newItem.trim()"
            >
              新增
            </v-btn>
          </template>
        </v-text-field>
      </v-card>
    </div>

    <!-- 查核點列表 -->
    <v-card variant="outlined" class="mb-4">
      <v-list class="pa-0">
        <template v-if="checkList.length === 0">
          <v-list-item>
            <v-list-item-title class="text-center text-grey">
              <v-icon class="mr-2">mdi-clipboard-list-outline</v-icon>
              尚無查核點
            </v-list-item-title>
          </v-list-item>
        </template>

        <div
          v-for="(checkPoint, index) in checkList"
          :key="`checkPoint-${index}`"
          :style="styles[index]"
          :draggable="isEditing && writable"
          @dragstart="hDragStart(index)"
          @dragenter="hDragEnter(index)"
          @dragover="hDragOver($event, index)"
          @drop="hDrop(index)"
          @dragleave="hDragLeave(index)"
          class="checkpoint-item"
        >
          <v-list-item class="cp-item pa-0">
            <!-- 拖拽手柄 -->
            <template v-slot:prepend v-if="isEditing">
              <v-icon color="grey-lighten-1" class="drag-handle mr-2" size="20">
                mdi-drag
              </v-icon>
            </template>

            <!-- 查核點核選框 -->
            <div class="flex-grow-1">
              <v-checkbox
                :model-value="done.includes(checkPoint)"
                :label="checkPoint"
                @update:model-value="toggleCheckpoint(checkPoint, $event)"
                color="teal"
                :disabled="isEditing"
                density="comfortable"
                hide-details
                class="cp-checkbox"
              />
            </div>

            <!-- 刪除按鈕 -->
            <template v-slot:append v-if="isEditing">
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="removeItem(index)"
                class="cp-remove"
              />
            </template>
          </v-list-item>

          <v-divider v-if="index < checkList.length - 1" />
        </div>
      </v-list>
    </v-card>

    <!-- 操作按鈕 -->
    <div class="panel-modify d-flex gap-2">
      <v-btn
        v-if="!isEditing && writable"
        color="teal"
        variant="elevated"
        @click="takeSnapshot"
        prepend-icon="mdi-pencil"
      >
        編輯
      </v-btn>

      <template v-if="isEditing">
        <v-btn
          color="grey"
          variant="outlined"
          @click="cancelEdition"
          prepend-icon="mdi-close"
        >
          取消
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          @click="confirmEdition"
          prepend-icon="mdi-check"
          :loading="saving"
        >
          確定
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
// import { apiModifyCheckPoint } from '@/assets/ts/api'

// 類型定義
interface CheckPoint {
  checkPointName: string
  isDone: boolean
}

interface Props {
  checkPoints?: CheckPoint[]
  writable?: boolean
}

interface ModifyPayload {
  checkPoints: CheckPoint[]
  userName?: string
  projectId?: string
}

// Props
const props = withDefaults(defineProps<Props>(), {
  checkPoints: () => [],
  writable: true,
})

// Refs
const newItemInput = ref()
const checkList = ref<string[]>([
  "需求定義",
  "模型建立",
  "前處理",
  "網格處理",
  "分析求解",
  "後處理",
  "成果交付",
])
const done = ref<string[]>([])
const styles = ref<Array<{ background: string }>>([])
const isEditing = ref(false)
const modifySnapshot = ref<string[]>([])
const newItem = ref("")
const draggingIndex = ref(-1)
const saving = ref(false)

// Computed
const percent = computed(() => {
  return checkList.value.length > 0
    ? Math.round((done.value.length / checkList.value.length) * 100)
    : 0
})

const percentText = computed(() => {
  return checkList.value.length > 0 ? `${percent.value} %` : "無查核點"
})

// Watch
watch(
  () => props.checkPoints,
  val => {
    if (val && val.length > 0) {
      checkList.value = val.map(item => item.checkPointName)
      done.value = val
        .filter(item => item.isDone)
        .map(item => item.checkPointName)
      styles.value = val.map(() => ({ background: "transparent" }))
    } else {
      // 如果沒有傳入查核點，保持預設值並觸發完成狀態更新
      complete()
    }
  },
  { immediate: true }
)

// Methods
const toggleCheckpoint = (checkPoint: string, isChecked: boolean | null) => {
  if (isChecked) {
    if (!done.value.includes(checkPoint)) {
      done.value.push(checkPoint)
    }
  } else {
    const index = done.value.findIndex(item => item === checkPoint)
    if (index !== -1) {
      done.value.splice(index, 1)
    }
  }
  complete()
}

const complete = async () => {
  const payload: ModifyPayload = {
    checkPoints: checkList.value.map(name => ({
      checkPointName: name,
      isDone: done.value.includes(name),
    })),
  }

  // 從 sessionStorage 獲取用戶資訊
  if (typeof window !== "undefined") {
    payload.userName = sessionStorage.getItem("userName") || undefined
    payload.projectId = sessionStorage.getItem("projectId") || undefined
  }

  await modifyCheckPoint(payload)
}

const modifyCheckPoint = async (payload: ModifyPayload) => {
  if (!props.writable) return

  try {
    saving.value = true
    // TODO: 取消註解以使用實際的 API
    // const res = await apiModifyCheckPoint(payload)
    // console.log('API response:', res)

    // 模擬 API 呼叫
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log("模擬 API 呼叫:", payload)
  } catch (error) {
    console.error("API 錯誤:", error)
  } finally {
    saving.value = false
  }
}

const takeSnapshot = () => {
  isEditing.value = true
  modifySnapshot.value = [...checkList.value]

  // 自動聚焦到新增輸入框
  nextTick(() => {
    newItemInput.value?.focus()
  })
}

const confirmEdition = async () => {
  await complete()
  isEditing.value = false
  newItem.value = ""
}

const cancelEdition = () => {
  checkList.value = [...modifySnapshot.value]
  isEditing.value = false
  newItem.value = ""

  // 重設樣式
  styles.value = styles.value.map(() => ({ background: "transparent" }))
}

const addNewItem = () => {
  const trimmedItem = newItem.value.trim()
  if (trimmedItem && !checkList.value.includes(trimmedItem)) {
    checkList.value.push(trimmedItem)
    styles.value.push({ background: "transparent" })
    newItem.value = ""

    // 重新聚焦輸入框
    nextTick(() => {
      newItemInput.value?.focus()
    })
  }
}

const removeItem = (index: number) => {
  const checkPointName = checkList.value[index]
  const doneIndex = done.value.findIndex(item => item === checkPointName)

  if (doneIndex !== -1) {
    done.value.splice(doneIndex, 1)
  }

  checkList.value.splice(index, 1)
  styles.value.splice(index, 1)
}

// 拖拽處理
const hDragStart = (index: number) => {
  draggingIndex.value = index
}

const hDragEnter = (index: number) => {
  if (draggingIndex.value !== index) {
    styles.value[index].background = "rgba(var(--v-theme-primary), 0.1)"
  }
}

const hDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()

  // 重設其他項目的背景色
  styles.value.forEach((style, i) => {
    if (i !== index) {
      style.background = "transparent"
    }
  })

  if (draggingIndex.value !== index) {
    styles.value[index].background = "rgba(var(--v-theme-primary), 0.1)"
  }
}

const hDragLeave = (index: number) => {
  styles.value[index].background = "transparent"
}

const hDrop = (index: number) => {
  if (draggingIndex.value === -1 || draggingIndex.value === index) {
    return
  }

  // 重設背景色
  styles.value[index].background = "transparent"

  // 移動項目
  const draggedItem = checkList.value.splice(draggingIndex.value, 1)[0]
  const draggedStyle = styles.value.splice(draggingIndex.value, 1)[0]

  checkList.value.splice(index, 0, draggedItem)
  styles.value.splice(index, 0, draggedStyle)

  draggingIndex.value = -1
}
</script>

<style scoped>
.cp-container {
  width: 100%;
}

.checkpoint-item {
  transition: background-color 0.2s ease;
  border-radius: 4px;
}

.checkpoint-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.checkpoint-item[draggable="true"] {
  cursor: grab;
}

.checkpoint-item[draggable="true"]:active {
  cursor: grabbing;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.cp-item {
  min-height: 56px;
  padding: 8px 16px;
}

.cp-checkbox :deep(.v-selection-control) {
  min-height: auto;
}

.cp-checkbox :deep(.v-label) {
  white-space: normal;
  word-break: break-word;
}

.cp-remove {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.cp-remove:hover {
  opacity: 1;
}

.panel-modify {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 拖拽時的視覺回饋 */
.checkpoint-item[style*="rgba(var(--v-theme-primary), 0.1)"] {
  border: 1px dashed rgb(var(--v-theme-primary));
}

/* 響應式設計 */
@media (max-width: 600px) {
  .cp-item {
    padding: 4px 8px;
  }

  .panel-modify {
    flex-direction: column;
  }

  .panel-modify .v-btn {
    width: 100%;
  }
}
</style>
