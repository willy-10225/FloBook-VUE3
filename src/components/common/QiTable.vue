<template>
  <table class="qi-table">
    <thead>
      <th v-for="(head) in heads" :key="head">
        <span :class="active">{{head}}</span>
      </th>
    </thead>
    <tbody>
      <tr v-for="(data, index) in body" :key="'body'+index"></tr>
    </tbody>
    <tfoot></tfoot>
  </table>
</template>

<script>
export default {
  props: ['heads', 'body', 'foot'],
  data() {
    return {}
  }
}
</script>

<style scoped>
thead {
  display: table-header-group;
  vertical-align: middle;
  border-color: inherit;
}
</style>
