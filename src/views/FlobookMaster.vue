<template>
  <v-app>
    <SideNav
      :drawer="drawer"
      :isMobile="isMobile"
      @update:drawer="drawer = $event"
    />
    <TopNav
      :drawer="drawer"
      :isMobile="isMobile"
      @toggle-drawer="drawer = !drawer"
    />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import TopNav from "@/components/layout/TopNav.vue"
import SideNav from "@/components/layout/SideNav.vue"

const drawer = ref(false)
const isMobile = ref(window.innerWidth < 768)
// Vuex Store

// Resize 時觸發 sideNav 收合動作（連續兩次）
const resizeHandler = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) drawer.value = false
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
