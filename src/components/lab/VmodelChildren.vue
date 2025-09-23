<template>
  <div>
    <input v-model="returnAbstract.value1">
    <input v-model="returnAbstract.value2">
  </div>
</template>

<script>
export default {
  props: ['abstract'],
  computed: {
    returnAbstract: {
      get() {
        return this.abstract
      },
      set(abstract) {
        this.$emit('changeAbstract', abstract)
      }
    }
  }
}
</script>

<style>
</style>
