<template>
  <v-navigation-drawer
    app
    class="qi-sidenav fixed-sidenav"
    :model-value="layout.isSidenavShown"
    :width="layout.sidenavWidth"
    :scrim="false"
    :temporary="isMobile"
  >
    <template #default>
      <div>
        <!-- LOGO 區 -->
        <router-link to="/" class="qi-sidenav-head">
          <v-img src="/img/Home/logo-flobook-wbg.png" alt="Home" width="170" />
        </router-link>

        <!-- 主選單項目 -->
        <v-list class="qi-sidenav-body">
          <SideNavItem
            v-for="(item, index) in items"
            :key="index"
            :item="item"
          />
        </v-list>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import SideNavItem from "@/components/layout/SideNavItem.vue"

const store = useStore()
const layout = computed(() => store.getters.layout)
const isMobile = ref(window.innerWidth < 768)

function handleResize() {
  isMobile.value = window.innerWidth < 768
}

const items = reactive([
  {
    text: "Monitor",
    icon: "mdi-monitor",
    childrens: [
      { text: "Monitor", routeName: "Monitor", icon: "mdi-chart-line" },
      { text: "Detail", routeName: "MonitorDetail", icon: "mdi-information" },
    ],
  },
  {
    text: "Track",
    icon: "mdi-trackpad",
    childrens: [
      {
        text: "Knowledge",
        routeName: "Knowledge Database",
        icon: "mdi-book-open",
      },
    ],
  },
  {
    text: "Solve",
    icon: "mdi-tools",
    childrens: [
      { text: "Job Submission", routeName: "JobSubmission", icon: "mdi-send" },
      {
        text: "Job Manager",
        routeName: "JobManager",
        icon: "mdi-clipboard-list",
      },
      { text: "Solve Config", routeName: "SolveConfig", icon: "mdi-cog" },
    ],
  },
])
onMounted(() => {
  window.addEventListener("resize", handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize)
})
</script>

<style scoped>
.qi-sidenav-head {
  position: relative;
  top: 0;
}
.qi-sidenav {
  background-color: #222;
}
.fixed-sidenav {
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh !important; /* 滿版高度 */
  overflow-y: auto; /* 側邊選單內部可滾動 */
  z-index: 1000; /* 確保在最上層 */
}
.qi-sidenav a {
  width: 100%;
  height: 52px;
  border: none;
  display: block;
  cursor: pointer;
  font-size: 20px;
  color: #818181;
  transition: 0.2s;
  text-align: left;
  text-decoration: none;
  overflow: hidden;
  background-color: inherit;
  padding: 10px 8px 8px 20px;
}
.qi-sidenav > a:first-child {
  padding: 5px;
}
.qi-sidenav a:hover {
  color: #f1f1f1;
  background-color: #888;
}
.qi-sidenav a img {
  width: 170px;
  display: block;
  margin: auto;
}
.qi-sidenav .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
  cursor: pointer;
}

.sidenav-footer {
  width: 100%;
  height: fit-content;
  position: absolute;
  bottom: 0;
}
.sidenav-footer a {
  padding: 5px;
  height: 55px;
  background: #333;
  bottom: 0;
}
.sidenav-footer a img {
  width: 145px;
  display: block;
  margin: auto;
  height: 100%;
}
@media screen and (max-height: 450px) {
  .qi-sidenav a {
    font-size: 18px;
  }
}
</style>
