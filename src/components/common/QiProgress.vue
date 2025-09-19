<template>
  <v-dialog v-model="progress.show" max-width="380" persistent>
    <v-card>
      <v-card-title class="text-h6">{{ progress.title }}</v-card-title>

      <v-card-text>
        <v-progress-linear
          :value="percent"
          height="8"
          color="primary"
          rounded
        ></v-progress-linear>
      </v-card-text>

      <v-card-actions class="justify-end">
        <span>{{ percent }} %</span>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue"

interface Progress {
  show: boolean
  title: string
  done: number
  total: number
}

export default defineComponent({
  name: "QiProgress",
  props: {
    progress: {
      type: Object as PropType<Progress>,
      required: true,
    },
  },
  setup(props) {
    const percent = computed(() => {
      // 保留你原本的算法：done / total * 90 + 10
      return Math.round((props.progress.done / props.progress.total) * 90) + 10
    })

    return { percent }
  },
})
</script>

<style scoped>
.v-card-actions {
  justify-content: flex-end;
}
</style>
