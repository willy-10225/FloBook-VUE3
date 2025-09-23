<template>
  <mu-paper round :z-depth="1" style="background: #333">
    <mu-data-table
      stripe
      selectable
      select-all
      :selects.sync="selects"
      checkbox
      :columns="columns"
      :sort.sync="sort"
      @sort-change="handleSortChange"
      :data="list.slice(0, 6)"
      style="background: #555"
    >
      <template slot-scope="scope">
        <td>{{ scope.row.name }}</td>
        <td class="is-right">{{ scope.row.calories }}</td>
        <td class="is-right">{{ scope.row.fat }}</td>
        <td class="is-right">{{ scope.row.carbs }}</td>
        <td class="is-right">{{ scope.row.protein }}</td>
        <td class="is-right">{{ scope.row.iron }}%</td>
      </template>
    </mu-data-table>
    <mu-flex align-items="center" style="padding: 8px" wrap="wrap">
      selects:
      <mu-chip
        delete
        v-for="selectIndex in selects"
        @delete="removeSelect(selectIndex)"
        style="margin: 8px"
        color="teal"
        :key="selectIndex"
        >{{ list[selectIndex].name }}</mu-chip
      >
    </mu-flex>
  </mu-paper>
</template>

<script>
import { drySort } from "@/assets/ts/dry"

export default {
  name: "FileTable",
  props: ["list"],
  data() {
    return {
      selects: [],
      sort: {
        name: "",
        order: "asc",
      },
      columns: [
        { title: "Property1", width: 200, name: "name" },
        {
          title: "Property2",
          name: "calories",
          width: 126,
          align: "center",
          sortable: true,
        },
        {
          title: "Property3",
          name: "fat",
          width: 126,
          align: "center",
          sortable: true,
        },
        {
          title: "Property4",
          name: "carbs",
          width: 126,
          align: "center",
          sortable: true,
        },
        {
          title: "Property5",
          name: "protein",
          width: 126,
          align: "center",
          sortable: true,
        },
        {
          title: "Property6",
          name: "iron",
          width: 126,
          align: "center",
          sortable: true,
        },
      ],
    }
  },
  methods: {
    handleSortChange({ name, order }) {
      drySort(this.list, name, order)
    },
    removeSelect(selectIndex) {
      const index = this.selects.indexOf(selectIndex)
      this.selects.splice(index, 1)
    },
  },
}
</script>

<style></style>
