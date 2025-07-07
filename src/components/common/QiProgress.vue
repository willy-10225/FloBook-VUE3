<template>
  <mu-dialog width="380" :overlay-close="false" :esc-press-close="false" :open.sync="progress.show">
    <h2>{{progress.title}}</h2>
    <progress class="qi-progress" :value="percent" max="100"></progress>
    <div class="dialog-footer">
      <span>{{percent}} %</span>
    </div>
  </mu-dialog>
</template>

<script>
export default {
  name: 'QiProgress',
  props: {
    progress: Object
  },
  computed: {
    percent() {
      return Math.round((this.progress.done / this.progress.total) * 90) + 10
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
.qi-progress {
  width: 100%;
}
</style>
