<template>
  <div
    class="file-upload-wrapper"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <section
      class="file-upload-head"
      :class="{ visible: hover }"
      @click="removeFileUpload"
    >
      <v-icon color="red lighten-1" class="remove-icon" size="24"
        >mdi-close-circle</v-icon
      >
    </section>

    <v-row class="file-upload" align="center" no-gutters>
      <div class="firstrow">
        {{ fileCount + 1 }}.
        <label
          :for="'file-upload' + (fileCount + 1)"
          class="custom-file-upload"
          >{{ $t("track.file-upload") }}</label
        >
        <input
          :id="'file-upload' + (fileCount + 1)"
          type="file"
          @change="processFile"
        />
        <v-text-field
          :label="$t('track.file-name')"
          v-model="fileName"
          dense
          hide-details
          style="max-width: 300px"
        />
      </div>

      <v-text-field
        :label="$t('track.file-description')"
        v-model="fileDescription"
        dense
        hide-details
        class="mx-4"
        style="flex-grow: 1"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue"
import { VIcon } from "vuetify/components"

const props = defineProps<{
  fileCount: number
}>()

const emit = defineEmits<{
  (e: "removeFileUpload", index: number): void
}>()

const hover = ref(false)

const fileName = ref("")
const fileDescription = ref("")
const originalName = ref("")
const fileObj = ref<File | null>(null)

function processFile(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    fileObj.value = target.files[0]
    originalName.value = shortFileName(fileObj.value.name)
    if (!fileName.value) {
      fileName.value = fileObj.value.name
    }
    // 你之前有fileSize，没用到，这里可存
    // const fileSize = fileObj.value.size
  }
}

function shortFileName(name: string): string {
  return name.length > 12 ? name.slice(0, 12) + "..." : name
}

function removeFileUpload() {
  emit("removeFileUpload", props.fileCount)
}
</script>

<style scoped lang="less">
input[type="file"] {
  position: fixed;
  right: 100%;
  bottom: 100%;
}
.file-upload {
  color: white;
  border: gray 1px dashed;
  padding: 10px;
  width: 100%;
}
.firstrow {
  margin-left: 10px;
  text-align: left;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  > * {
    margin: 0 10px;
  }
}
.custom-file-upload {
  background-color: #8498a7;
  display: inline-block;
  height: 36px;
  line-height: 40px;
  padding: 0 16px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #90a2b0;
  }
}
.file-upload-head {
  position: relative;
  top: 30px;
  right: 30px;
  visibility: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  &.visible {
    visibility: visible;
    background: #ff2a1b;
    border-radius: 50%;
  }
}
.remove-icon {
  user-select: none;
}
</style>
