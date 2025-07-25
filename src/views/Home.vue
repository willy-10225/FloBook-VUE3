<template>
  <v-container>
    <LogoHead />

    <v-row class="my-8" justify="center" align="center">
      <v-col cols="12" md="3"></v-col>

      <v-col cols="12" md="2">
        <RouterLink
          v-if="versionOption.beta"
          :to="{ name: 'Track' }"
          class="d-flex flex-column align-center no-style-link"
        >
          <div id="icon-knowledge" class="link-icon"></div>
          <span>Track</span>
        </RouterLink>

        <RouterLink
          v-else
          :to="{ name: 'KnowledgeDatabase' }"
          class="d-flex flex-column align-center no-style-link"
        >
          <div id="icon-knowledge" class="link-icon"></div>
          <span>Track</span>
        </RouterLink>

        <div
          class="d-flex flex-column align-center"
          @click="comingSoon"
          style="cursor: pointer"
        >
          <div id="icon-booking" class="link-icon"></div>
          <span>Booking</span>
        </div>
      </v-col>

      <v-col cols="12" md="2"></v-col>

      <v-col cols="12" md="2">
        <RouterLink
          :to="{ name: 'Monitor' }"
          class="d-flex flex-column align-center no-style-link"
        >
          <div id="icon-monitor" class="link-icon"></div>
          <span>Monitor</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'JobManager' }"
          class="d-flex flex-column align-center no-style-link"
        >
          <div id="icon-solve" class="link-icon"></div>
          <span>Solve</span>
        </RouterLink>
      </v-col>

      <v-col cols="12" md="3"></v-col>
    </v-row>

    <v-dialog v-model="showDialog" width="360">
      <div class="text-center" style="color: white">Coming soon...</div>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue"
import { useStore } from "vuex"
import { RouterLink } from "vue-router"
import LogoHead from "@/components/layout/LogoHead.vue"

const store = useStore()

// 取得 versionOption 由 Vuex store
const versionOption = computed(() => store.getters.versionOption)

// Dialog 開關
const showDialog = ref(false)

function comingSoon() {
  showDialog.value = true
}
</script>

<style scoped>
#icon-knowledge {
  background-image: url("/img/Home/icon-knowledge.png");
}
#icon-booking {
  background-image: url("/img/Home/icon-booking.png");
}
#icon-monitor {
  background-image: url("/img/Home/icon-monitor.png");
}
#icon-solve {
  background-image: url("/img/Home/icon-solve.png");
}
.link-icon {
  width: 130px;
  height: 130px;
  background-size: contain;
  background-repeat: no-repeat;
  margin: auto;
  margin-top: 20px;
  border-radius: 10px;
}
/* 選擇 router-link 底下 span 或直接用 router-link */
.no-style-link,
.no-style-link > span {
  color: inherit !important;
  background-color: transparent !important;
  text-decoration: none !important;
}
</style>
