<template>
  <vmodel-children :abstract="parentData" @changeAbstract="onChangeAbstract($event)"></vmodel-children>
</template>

<script>
import VmodelChildren from '@/components/lab/VmodelChildren'
export default {
  components: { VmodelChildren },
  data() {
    return {
      parentData: {
        value1: '123',
        value2: '456'
      }
    }
  },
  methods: {
    onChangeAbstract(event) {
      console.log(event)
    }
  }
}
</script>

<style>
</style>
