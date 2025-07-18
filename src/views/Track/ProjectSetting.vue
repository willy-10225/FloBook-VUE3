<template>
  <ConfirmDialog
    title="設定專案權限"
    safeOption="取消"
    dangerOption="確定"
    :openAlert="openSetting"
    confirmColor="teal"
    @closeConfirmDialog="confirmProjectSetting"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"

// 定義 props 型別
const props = defineProps<{
  openSetting: boolean
}>()

// 定義 emit 事件型別
const emit = defineEmits<{
  (e: "closeProjectSetting"): void
}>()

function confirmProjectSetting(isConfirm: boolean) {
  if (isConfirm) console.log("Updated")
  else console.log("WTF")
  emit("closeProjectSetting")
}
</script>

<style scoped>
.project-setting .mu-dialog {
  background-color: #555;
}
.project-setting .mu-flat-button {
  font-size: 18px;
}
</style>
