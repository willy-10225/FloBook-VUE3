<template>
  <div class="file-upload-wrapper">
    <!-- 刪除按鈕 -->
    <div class="file-upload-head" @click="removeFileUpload">
      <red-dot :show="true" :count="'✕'" pointer />
    </div>

    <v-row class="file-upload" align="center" justify="start" dense>
      <div class="firstrow">
        {{ fileCount + 1 }}.
        <label
          :for="'file-upload' + (fileCount + 1)"
          class="custom-file-upload"
        >
          {{ $t("track.file-upload") }}
        </label>
        <input
          :id="'file-upload' + (fileCount + 1)"
          type="file"
          @change="processFile"
        />

        <v-text-field v-model="fileName" :label="$t('track.file-name')" dense />
      </div>

      <v-text-field
        v-model="fileDescription"
        :label="$t('track.file-description')"
        class="mx-4"
        dense
        full-width
      />
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue"
import RedDot from "@/components/common/RedDot.vue"

export default defineComponent({
  name: "FileUpload",
  components: {
    RedDot,
  },
  props: {
    fileCount: {
      type: Number,
      required: true,
    },
  },
  emits: ["removeFileUpload"],
  setup(props, { emit }) {
    const fileName = ref("")
    const fileDescription = ref("")
    const originalName = ref("")
    const fileObj = ref<File | null>(null)
    const fileSize = ref(0)

    const processFile = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        fileObj.value = target.files[0]
        originalName.value = shortFileName(fileObj.value.name)
        fileName.value = fileName.value || fileObj.value.name
        fileSize.value = fileObj.value.size
      }
    }

    const shortFileName = (name: string) => {
      return name.length > 12 ? name.slice(0, 12) + "..." : name
    }

    const removeFileUpload = () => {
      emit("removeFileUpload", props.fileCount)
    }

    return {
      fileName,
      fileDescription,
      fileObj,
      originalName,
      fileSize,
      processFile,
      shortFileName,
      removeFileUpload,
    }
  },
})
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
}

.firstrow {
  margin-left: 10px;
  text-align: left;
  * {
    margin: 0 10px 0 10px;
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
}

.custom-file-upload:hover {
  background-color: #90a2b0;
}

.file-upload-head {
  position: relative;
  visibility: hidden;
  top: 30px;
  right: 30px;
}

.file-upload-wrapper:hover .file-upload-head {
  background: #ff2a1b;
  visibility: visible;
  border: none;
}
</style>
