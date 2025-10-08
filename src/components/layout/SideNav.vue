<template>
  <v-navigation-drawer
    class="qi-sidenav fixed-sidenav"
    v-model="localDrawer"
    app
    :width="layout.sidenavWidth"
    :clipped="$vuetify.display.mdAndUp"
    :temporary="props.isMobile"
    location="start"
  >
    <template #default>
      <div>
        <!-- LOGO 區 -->
        <router-link to="/" class="qi-sidenav-head" aria-label="首頁">
          <img
            src="/img/Home/logo-flobook-wbg.png"
            alt="FloBook"
            width="170"
            decoding="async"
            loading="lazy"
            fetchpriority="high"
          />
        </router-link>

        <!-- 主選單項目 -->
        <v-list
          class="qi-sidenav-body"
          role="menu"
          aria-label="側邊選單"
          density="comfortable"
        >
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
import { ref, computed, watch } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import SideNavItem from "@/components/layout/SideNavItem.vue"

const props = defineProps<{
  drawer: boolean
  isMobile?: boolean
}>()

// 發送事件
const emit = defineEmits<{
  (e: "update:drawer", value: boolean): void
}>()

// 狀態控制
const localDrawer = ref(props.drawer)
const store = useStore()
const layout = computed(() => store.getters.layout)

// 父子雙向同步
watch(
  () => props.drawer,
  val => (localDrawer.value = val)
)
watch(localDrawer, val => emit("update:drawer", val))

const { t } = useI18n()

const items = computed(() => [
  {
    text: t("sidenav.monitor"),
    icon: "mdi-monitor",
    childrens: [
      {
        text: t("sidenav.monitor"),
        routeName: "Monitor",
        icon: "mdi-chart-line",
      },
      {
        text: t("sidenav.detail"),
        routeName: "MonitorDetail",
        icon: "mdi-information",
      },
    ],
  },
  {
    text: t("sidenav.track"),
    icon: "mdi-trackpad",
    childrens: [
      {
        text: t("sidenav.knowledge"),
        routeName: "Knowledge Database",
        icon: "mdi-book-open",
      },
    ],
  },
  {
    text: t("sidenav.solve"),
    icon: "mdi-tools",
    childrens: [
      {
        text: t("sidenav.jobsubmission"),
        routeName: "JobSubmission",
        icon: "mdi-send",
      },
      {
        text: t("sidenav.jobmanager"),
        routeName: "JobManager",
        icon: "mdi-clipboard-list",
      },
      {
        text: t("sidenav.solveconfig"),
        routeName: "SolveConfig",
        icon: "mdi-cog",
      },
    ],
  },
])
</script>

<style scoped>

.fixed-sidenav {
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh !important;
  overflow-y: auto;
  z-index: 1000;
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
</style>
