<template>
  <v-sheet rounded elevation="1" class="pa-4" style="background: #333">
    <v-data-table
      :headers="columns"
      :items="list"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      show-select
      :items-per-page="6"
      @update:sort-by="val => (sortBy = val)"
      @update:sort-desc="val => (sortDesc = val)"
      @update:select="onSelect"
      class="bg-grey-darken-3"
    >
      <template #item.name="{ item }">
        {{ item.name }}
      </template>
      <template #item.calories="{ item }">
        <div class="text-center">{{ item.calories }}</div>
      </template>
      <template #item.fat="{ item }">
        <div class="text-center">{{ item.fat }}</div>
      </template>
      <template #item.carbs="{ item }">
        <div class="text-center">{{ item.carbs }}</div>
      </template>
      <template #item.protein="{ item }">
        <div class="text-center">{{ item.protein }}</div>
      </template>
      <template #item.iron="{ item }">
        <div class="text-center">{{ item.iron }}%</div>
      </template>
    </v-data-table>

    <div class="d-flex flex-wrap align-center mt-4" style="gap: 8px">
      <span class="mr-2" style="color: white">selects:</span>
      <v-chip
        v-for="selectedItem in selectedItems"
        :key="selectedItem.name"
        color="teal"
        close
        @click:close="removeSelect(selectedItem)"
      >
        {{ selectedItem.name }}
      </v-chip>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

interface DataItem {
  name: string
  calories: number
  fat: number
  carbs: number
  protein: number
  iron: number
}

const props = defineProps<{
  list: DataItem[]
}>()

interface SortItem {
  key: string
  order?: "asc" | "desc"
}

const sortBy = ref<SortItem[]>([])
const sortDesc = ref<boolean>(false)

type AlignType = "start" | "center" | "end"

interface Column {
  text: string
  value: string
  sortable: boolean
  align?: AlignType
}

const columns: Column[] = [
  { text: "Property1", value: "name", sortable: true, align: "start" },
  { text: "Property2", value: "calories", sortable: true, align: "center" },
  { text: "Property3", value: "fat", sortable: true, align: "center" },
  { text: "Property4", value: "carbs", sortable: true, align: "center" },
  { text: "Property5", value: "protein", sortable: true, align: "center" },
  { text: "Property6", value: "iron", sortable: true, align: "center" },
]

// 選取的資料列表
const selects = ref<DataItem[]>([])

const selectedItems = computed(() => selects.value)

// 選取變動事件
function onSelect(selected: DataItem[]) {
  selects.value = selected
}

// 移除選取
function removeSelect(item: DataItem) {
  selects.value = selects.value.filter(i => i.name !== item.name)
}
</script>

<style scoped>
.bg-grey-darken-3 {
  background-color: #555 !important;
}
</style>
