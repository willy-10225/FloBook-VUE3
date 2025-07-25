<template>
  <div class="side-nav-item">
    <!-- 有子選單 -->
    <div v-if="!item.routeName">
      <v-btn
        block
        variant="text"
        class="sidenav-accordion"
        :class="{ active: open }"
        @click="togglePanel"
        elevation="0"
        rounded="md"
        dense
      >
        <span class="text-start">{{ item.text }}</span>
        <v-icon class="ml-auto" :class="{ rotated: open }" size="20">
          mdi-chevron-right
        </v-icon>
      </v-btn>

      <v-expand-transition>
        <div v-show="open" class="sidenav-accordion-panel">
          <RouterLink
            v-for="(child, index) in item.childrens"
            :key="index"
            class="sub-link"
            :to="buildLink(child)"
          >
            {{ child.text }}
          </RouterLink>
        </div>
      </v-expand-transition>
    </div>

    <!-- 單一選單 -->
    <RouterLink
      v-else
      class="sidenav-accordion-self"
      :to="{ name: item.routeName }"
    >
      <v-btn
        block
        variant="text"
        class="text-start"
        elevation="0"
        rounded="md"
        dense
      >
        {{ item.text }}
      </v-btn>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
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

function togglePanel() {
  open.value = !open.value
}

function buildLink(obj: NavItem) {
  return obj.params
    ? { name: obj.routeName, params: obj.params }
    : { name: obj.routeName }
}
</script>

<style scoped>
.side-nav-item {
  width: 100%;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* 項目按鈕 */
.sidenav-accordion {
  text-transform: none;
  font-size: 16px;
  color: #bbb;
  justify-content: space-between;
  padding: 12px 20px;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-radius: 6px;
  user-select: none;
}
.sidenav-accordion.active,
.sidenav-accordion:hover {
  background-color: #555;
  color: #fff;
}
.sidenav-accordion .v-icon {
  transition: transform 0.3s ease;
  color: inherit;
}
.sidenav-accordion .v-icon.rotated {
  transform: rotate(90deg);
}

/* 子選單區域 */
.sidenav-accordion-panel {
  background-color: #2c2c2c;
  padding-top: 6px;
  padding-bottom: 6px;
  border-left: 1px solid #444;
  user-select: none;
}

/* 子選單連結 */
.sub-link {
  display: block;
  padding: 8px 0px;
  font-size: 14px;
  color: #ccc;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s ease, color 0.2s ease;
  user-select: none;
}
.sub-link:hover {
  background-color: #444;
  color: #fff;
  text-decoration: none;
}

/* 單一選單按鈕 */
.sidenav-accordion-self .v-btn {
  font-size: 16px;
  color: #bbb;
  text-transform: none;
  justify-content: flex-start;
  border-radius: 6px;
  user-select: none;
}
.sidenav-accordion-self .v-btn:hover {
  background-color: #555;
  color: #fff;
}
</style>
