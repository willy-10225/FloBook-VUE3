<template>
  <VBtn
    class="add-file-button"
    variant="outlined"
    color="white"
    size="large"
    elevation="0"
    ripple
    @click="handleClick"
  >
    +
  </VBtn>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue"

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void
}>()

function handleClick(e: MouseEvent) {
  emit("click", e)
}
</script>

<style scoped>
.add-file-button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 -8px 20px -8px;
  height: 70px;
  font-size: 30px;
  cursor: pointer;
  border-style: dashed;
  border-color: gray;
  user-select: none;
  color: white;
}

.add-file-button:hover {
  background-color: #aaa;
  opacity: 0.9;
}
</style>
