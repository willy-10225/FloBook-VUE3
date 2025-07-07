<template>
  <mu-date-input
    v-model="date"
    color="blueGrey900"
    display-color="blueGrey900"
    underline-color="blueGrey900"
    format="YYYY/MM/DD"
    placeholder="YYYY/MM/DD"
    :label="label"
    :type="type"
    :container="container"
    :disabled="disabled"
    @change="changeType(type)"
    @close="dontClose($event)"
  ></mu-date-input>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: Date
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      date: this.value,
      type: 'year'
    }
  },
  computed: {
    ...mapGetters(['isMobile']),
    container() {
      return this.isMobile ? 'bottomSheet' : 'popover'
    }
  },
  methods: {
    changeType(t) {
      switch (t) {
        case 'year':
          this.type = 'month'
          setTimeout(() => {
            this.$children[0].open = true
          }, 100)
          break
        case 'month':
          this.type = 'date'
          setTimeout(() => {
            this.$children[0].open = true
          }, 100)
          break
        case 'date':
          this.type = 'year'
          this.$emit('input', this.date)
          break
      }
    }
  }
}
</script>

<style>
</style>
