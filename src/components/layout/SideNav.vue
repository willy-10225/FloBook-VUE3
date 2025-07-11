<template>
  <aside class="qi-sidenav" :style="qiSidenavShown">
    <router-link to="/" class="qi-sidenav-head">
      <img src="/img/Home/logo-flobook-wbg.png" alt="Home" />
    </router-link>

    <section class="qi-sidenav-body">
      <SideNavItem v-for="(item, index) in items" :key="index" :item="item" />
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue"
import { useStore } from "vuex"
import SideNavItem from "@/components/layout/SideNavItem.vue"

const props = defineProps<{
  showSideNav?: boolean
}>()

const store = useStore()
const layout = computed(() => store.getters.layout)

const qiSidenavShown = computed(() => ({
  width: layout.value.isSidenavShown ? layout.value.sidenavWidth + "px" : "0px",
}))

const items = reactive([
  {
    text: "Monitor",
    childrens: [
      { text: "Monitor", routeName: "Monitor" },
      { text: "Detail", routeName: "Monitor Detail" },
    ],
  },
  {
    text: "Track",
    childrens: [{ text: "Knowledge", routeName: "Knowledge Database" }],
  },
  {
    text: "Solve",
    childrens: [
      { text: "Job Submission", routeName: "Job Submission" },
      { text: "Job Manager", routeName: "Job Manager" },
      { text: "Solve Config", routeName: "Solve Config" },
    ],
  },
])
</script>

<style scoped>
.qi-sidenav-head {
  position: relative;
  top: 0;
}
.qi-sidenav {
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  position: fixed;
  z-index: 20190225;
  transition: 0.1s ease;
  overflow-x: hidden;
  background-color: #222;
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
