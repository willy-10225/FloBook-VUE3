<template>
  <v-dialog v-model="open" persistent max-width="600">
    <v-card class="confirm-dialog">
      <v-card-title class="text-h6 text-white">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot name="body">
          {{ $t("Are you sure you want to proceed?") }}
        </slot>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="grey" @click="emitConfirm(false)">
          {{ safeOption }}
        </v-btn>

        <v-btn
          :color="confirmColor"
          :disabled="disableConfirm"
          @click="emitConfirm(true)"
        >
          {{ dangerOption }}{{ counterText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from "vue"

interface Props {
  title: string
  openAlert: boolean
  safeOption?: string
  dangerOption?: string
  confirmColor?: string
  sec?: number
}

const props = withDefaults(defineProps<Props>(), {
  safeOption: "Cancel",
  dangerOption: "OK",
  confirmColor: "error",
  sec: 3,
})

const emit = defineEmits<{
  (e: "closeConfirmDialog", isConfirm: boolean): void
}>()

const open = ref(props.openAlert)
const counter = ref(props.sec)
const counterText = ref(` (${counter.value})`)
const disableConfirm = ref(true)

let timer: number | null = null

watch(
  () => props.openAlert,
  val => {
    open.value = val
  }
)

watch(open, val => {
  if (val) {
    disableConfirm.value = true
    counter.value = props.sec
    counterText.value = ` (${counter.value})`

    timer = window.setInterval(() => {
      if (counter.value > 0) {
        counter.value--
        counterText.value = ` (${counter.value})`
      } else {
        disableConfirm.value = false
        counterText.value = ""
        if (timer) clearInterval(timer)
      }
    }, 1000)
  } else {
    if (timer) clearInterval(timer)
  }
})

function emitConfirm(isConfirm: boolean) {
  open.value = false
  emit("closeConfirmDialog", isConfirm)
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.confirm-dialog {
  background-color: #333;
  color: white;
}
</style>
