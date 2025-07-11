<template>
  <div class="cp-container">
    <div class="mb-2">完成度 : {{ percentText }}</div>

    <v-progress-linear
      :model-value="percent"
      height="15"
      color="teal"
      rounded
    ></v-progress-linear>

    <div v-if="isEditing" class="mt-4">
      <div class="mb-2">新增查核項目 :</div>
      <v-card class="pa-2 cp-input-field">
        <v-text-field
          v-model="newItem"
          placeholder="輸入查核點名稱"
          hide-details
          variant="solo"
          append-inner-icon="mdi-plus"
          @click:append-inner="addNewItem"
          @keydown.enter="addNewItem"
        />
      </v-card>
    </div>

    <v-card class="mt-3">
      <v-list>
        <template
          v-for="(checkPoint, index) in checkList"
          :key="`checkPoint-${index}`"
        >
          <v-list-item
            :draggable="isEditing && writable"
            @dragstart="hDragStart(index)"
            @dragenter="hDragEnter(index)"
            @dragover.prevent="hDragOver(index)"
            @drop="hDrop(index)"
            :style="{ backgroundColor: styles[index].background }"
          >
            <template v-if="isEditing">
              <v-icon start size="small" class="me-2" color="grey-lighten-1"
                >mdi-drag</v-icon
              >
            </template>
            <v-checkbox
              v-model="done"
              :label="checkPoint"
              :value="checkPoint"
              :disabled="isEditing"
              color="teal"
              hide-details
              @change="complete"
            />
            <v-btn
              icon
              size="x-small"
              v-if="isEditing"
              @click="removeItem(index)"
            >
              <v-icon color="red">mdi-close</v-icon>
            </v-btn>
          </v-list-item>
          <v-divider />
        </template>
      </v-list>
    </v-card>

    <div class="panel-modify mt-4">
      <v-btn v-if="!isEditing && writable" color="teal" @click="takeSnapshot"
        >編輯</v-btn
      >
      <v-btn v-if="isEditing" color="grey" class="me-2" @click="cancelEdition"
        >取消</v-btn
      >
      <v-btn v-if="isEditing" color="primary" @click="confirmEdition"
        >確定</v-btn
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { apiModifyCheckPoint } from "@/assets/ts/api"

interface CheckPoint {
  checkPointName: string
  isDone: boolean
}

const props = defineProps<{
  checkPoints: CheckPoint[]
  writable: boolean
}>()

const checkList = ref<string[]>([])
const done = ref<string[]>([])
const styles = ref<{ background: string }[]>([])
const isEditing = ref(false)
const modifySnapshot = ref<string[]>([])
const newItem = ref("")
const draggingIndex = ref(-1)

const percent = computed(() => {
  return Math.round((done.value.length / checkList.value.length) * 100)
})

const percentText = computed(() => {
  return isNaN(percent.value) ? "無查核點" : `${percent.value} %`
})

watch(
  () => props.checkPoints,
  val => {
    if (val) {
      checkList.value = val.map(item => item.checkPointName)
      done.value = val
        .filter(item => item.isDone)
        .map(item => item.checkPointName)
      styles.value = val.map(() => ({ background: "#424242" }))
    } else {
      complete()
    }
  },
  { immediate: true }
)

function complete() {
  const payload = {
    userName: sessionStorage.getItem("userName"),
    projectId: sessionStorage.getItem("projectId"),
    checkPoints: checkList.value.map(name => ({
      checkPointName: name,
      isDone: done.value.includes(name),
    })),
  }

  if (props.writable) {
    apiModifyCheckPoint(payload)
      .then(res => console.log(res))
      .catch(err => console.error(err))
  }
}

function takeSnapshot() {
  isEditing.value = true
  modifySnapshot.value = [...checkList.value]
}

function confirmEdition() {
  complete()
  isEditing.value = false
}

function cancelEdition() {
  checkList.value = [...modifySnapshot.value]
  isEditing.value = false
}

function addNewItem() {
  if (newItem.value.trim()) {
    checkList.value.push(newItem.value.trim())
    newItem.value = ""
  }
}

function removeItem(index: number) {
  const item = checkList.value[index]
  done.value = done.value.filter(d => d !== item)
  checkList.value.splice(index, 1)
}

function hDragStart(index: number) {
  draggingIndex.value = index
}

function hDragEnter(index: number) {
  styles.value[index].background = "gray"
}

function hDragOver(index: number) {
  styles.value.forEach((style, i) => {
    if (i !== index) style.background = "#424242"
  })
}

function hDrop(index: number) {
  const dragged = checkList.value.splice(draggingIndex.value, 1)[0]
  checkList.value.splice(index, 0, dragged)
  styles.value[index].background = "#424242"
  draggingIndex.value = -1
}
</script>

<style scoped>
.cp-container {
  padding: 16px;
}
.cp-input-field {
  background-color: #999;
}
.panel-modify {
  margin-top: 10px;
}
</style>
