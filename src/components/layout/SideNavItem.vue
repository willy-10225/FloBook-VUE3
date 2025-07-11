<template>
  <div class="side-nav-item">
    <div v-if="!item.routeName">
      <a
        class="sidenav-accordion"
        @click="togglePanel"
        :class="{ active: open }"
      >
        {{ item.text }}
      </a>
      <transition name="slide-fade">
        <div class="sidenav-accordion-panel" ref="panelRef">
          <router-link
            v-for="(child, index) in item.childrens"
            :key="index"
            :to="buildLink(child)"
          >
            {{ child.text }}
          </router-link>
        </div>
      </transition>
    </div>

    <router-link
      class="sidenav-accordion-self"
      v-else
      :to="{ name: item.routeName }"
    >
      {{ item.text }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Value } from "sass"
import { ref } from "vue"

interface NavItem {
  text: string
  routeName?: string
  childrens?: NavItem[]
  params?: Record<string, any>
}

const props = defineProps<{
  item: NavItem
}>()

const open = ref(false)
const panelRef = ref<HTMLDivElement | null>(null)

function togglePanel() {
  open.value = !open.value
  const panel = panelRef.value
  if (panel) {
    if (open.value) {
      panel.style.maxHeight = panel.scrollHeight + "px"
    } else {
      panel.style.maxHeight = "0px"
    }
  }
}
function buildLink(obj: NavItem) {
  return obj.params
    ? { name: obj.routeName, params: obj.params }
    : { name: obj.routeName }
}
</script>
<style scoped>
.sidenav-accordion,
.sidenav-accordion-self,
.sidenav-accordion-panel a {
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
.sidenav-accordion:after {
  color: #818181;
  font-weight: bold;
  float: right;
  margin-left: 5px;
  content: "\2023";
  transform-origin: center;
  transform: rotate(180deg);
  transition: 0.2s;
}
.sidenav-accordion.active {
  background-color: #888;
  color: white;
}
.sidenav-accordion.active:after {
  color: white;
  content: "\2023";
  transform-origin: center;
  transform: rotate(90deg) translateY(-3px);
  transition: 0.2s;
}
.sidenav-accordion :focus {
  outline: none;
}
.sidenav-accordion-self a {
  color: #818181;
}
.sidenav-accordion-self:hover,
.sidenav-accordion:hover {
  color: #f1f1f1;
  background-color: #888;
}
.sidenav-accordion-self:hover a,
.sidenav-accordion:hover:after {
  color: #f1f1f1;
}
.sidenav-accordion-panel {
  background-color: #333;
  padding-left: 8px;
  max-height: 0px;
  overflow: hidden;
  transition: 0.2s;
}
.sidenav-accordion-panel a.sidenav-accordion:hover {
  background-color: #888;
  color: #f1f1f1;
}
.sidenav-accordion-panel a:hover {
  background-color: #333;
  color: #f1f1f1;
}
.slide-fade-enter-active {
  transition: all 0.3s;
}
.slide-fade-leave-active {
  transition: all 0.3s;
}
.slide-fade-enter,
.slide-fade-leave-active {
  transform: translateY(-30px);
  opacity: 0;
}
</style>
