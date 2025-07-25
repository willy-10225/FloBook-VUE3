<template>
  <v-app>
    <SideNav />
    <v-main>
      <TopNav />
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import TopNav from "@/components/layout/TopNav.vue"
import SideNav from "@/components/layout/SideNav.vue"

// Vuex Store
const store = useStore()

// Resize 時觸發 sideNav 收合動作（連續兩次）
const resizeHandler = () => {
  store.dispatch("toggleSideNav")
}

onMounted(() => {
  window.addEventListener("resize", resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler)
})
</script>

<style scoped>
.flobook-master {
  position: relative;
  top: 0;
  width: 100%;
  height: 100%;
}

.main-container {
  position: relative;
  margin: auto;
  padding-top: 52px;
  transition: 0.1s ease;
  height: 100%;
}
</style>
