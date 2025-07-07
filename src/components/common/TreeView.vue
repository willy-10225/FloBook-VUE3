<template>
  <ul>
    <tree-view-item
      v-for="(item, index) in itemList"
      :key="'treeview' + index"
      :item="item"
    ></tree-view-item>
  </ul>
</template>

<script>
import TreeViewItem from '@/components/common/TreeViewItem.vue'

export default {
  name: 'TreeView',
  components: { TreeViewItem },
  props: { itemList: Array }
}
</script>

<style scoped>
ul {
  margin: 28px 0;
  padding-left: 10px;
  line-height: 1.5em;
  list-style-type: none;
  cursor: pointer;
  width: 100%;
}
</style>
