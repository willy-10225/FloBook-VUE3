<template>
  <div class="confirm-button">
    <v-btn
      @click="isOpened = true"
      :color="color"
      :size="small ? 'small' : undefined"
      :variant="fab ? 'flat' : 'text'"
      :icon="icon"
    >
      <slot></slot>
    </v-btn>

    <ConfirmDialog
      :title="message"
      :open-alert="isOpened"
      :safe-option="$t('common.cancel')"
      :danger-option="$t('common.confirm')"
      :sec="consideringTime"
      :confirm-color="color"
      @close-confirm-dialog="emitConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import ConfirmDialog from "./ConfirmDialog.vue"

const props = withDefaults(defineProps<Props>(), {
  message: "",
  danger: false,
  small: false,
  fab: false,
  icon: false,
  transferData: undefined,
})

// Props 定义
interface Props {
  message?: string
  danger?: boolean
  small?: boolean
  fab?: boolean
  icon?: boolean | string
  transferData?: Record<string, any>
}

// Emits 定义
interface Emits {
  confirm: [data?: { transferData: Record<string, any> }]
  denyConfirm: []
}

const emit = defineEmits<Emits>()

// 响应式数据
const isOpened = ref(false)

// 计算属性
const consideringTime = computed(() => {
  return props.danger ? 3 : 0
})

const color = computed(() => {
  return props.danger ? "red" : "primary"
})

// 方法
const emitConfirm = (isConfirm: boolean) => {
  if (isConfirm) {
    if (props.transferData === undefined) {
      emit("confirm")
    } else {
      emit("confirm", {
        transferData: props.transferData,
      })
    }
  } else {
    emit("denyConfirm")
  }

  isOpened.value = false
}
</script>

<style scoped>
.v-btn {
  text-transform: none !important;
}
.confirm-button {
  display: inline-block;
}
</style>
