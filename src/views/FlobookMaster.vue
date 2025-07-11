<template>
  <section class="flobook-master">
    <TopNav />
    <SideNav />

    <section class="main-container" :style="qiSidenavStyle">
      <router-view />
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import TopNav from "@/components/layout/TopNav.vue"
import SideNav from "@/components/layout/SideNav.vue"

// Vuex Store
const store = useStore()

// layout 資料
const layout = computed(() => store.getters.layout)

// 動態計算 Sidenav 是否顯示
const qiSidenavStyle = computed(() => {
  return {
    marginLeft: layout.value.isSidenavShown
      ? `${layout.value.sidenavWidth}px`
      : "0px",
  }
})

// Resize 時觸發 sideNav 收合動作（連續兩次）
const resizeHandler = () => {
  store.dispatch("toggleSideNav")
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
