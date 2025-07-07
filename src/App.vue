<template>
  <v-dialog v-model="showDialog" max-width="400">
    <v-card>
      <v-card-text class="text-center">
        <template v-if="isLoading">
          <v-progress-circular indeterminate color="primary" size="40" />
          <div class="mt-3">Loading, please wait...</div>
        </template>
        <template v-else>
          <v-icon color="success" size="48">mdi-check-circle</v-icon>
          <div class="mt-3">Load successful!</div>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

// 假設用 props 或 Vuex 之類方式控制，這裡示範簡單內部狀態
const showDialog = ref(false)
const isLoading = ref(true)

// 模擬 3 秒後 loading 完成
setTimeout(() => {
  isLoading.value = false
}, 3000)

function closeDialog() {
  showDialog.value = false
}

// 這裡可用 watch 外部狀態控制 showDialog，例如 Vuex
watch(isLoading, newVal => {
  if (newVal) {
    showDialog.value = true
  }
})
</script>

<style scoped>
.mt-3 {
  margin-top: 1rem;
}
.text-center {
  text-align: center;
}
</style>
