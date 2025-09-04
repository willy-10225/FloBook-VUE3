<template>
  <div class="red-dot-wrapper">
    <v-badge
      v-if="show"
      :content="count"
      :color="color"
      :class="{ 'red-dot-pointer': pointer }"
      class="red-dot-badge"
      inline
    >
      <!-- Badge content is handled by Vuetify's v-badge -->
    </v-badge>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  count?: string | number
  pointer?: boolean
  color?: string
}

withDefaults(defineProps<Props>(), {
  show: false,
  count: "",
  pointer: false,
  color: "#ff2a1b",
})
</script>

<style scoped>
.red-dot-wrapper {
  position: relative;
}

.red-dot-badge {
  position: absolute;
  top: -20px;
  right: -30px;
  user-select: none;
  cursor: default;
}

.red-dot-badge :deep(.v-badge__badge) {
  font-size: 14px !important;
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  font-weight: bold !important;
  color: #ffd3d3 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.red-dot-pointer {
  cursor: pointer;
}

.red-dot-pointer :deep(.v-badge__badge) {
  cursor: pointer !important;
}
</style>
