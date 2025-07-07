<template>
  <mu-dialog :title="title" class="confirm" width="600" max-width="80%" :esc-press-close="false" :overlay-close="false" :open.sync="openAlert">
    <slot name="body"></slot>
    <mu-button slot="actions" color="gray" @click="emitConfirm(false)">{{safeOption}}</mu-button>
    <mu-button slot="actions" :color="confirmColor" :disabled="disableDisagree" @click="emitConfirm(true)">{{dangerOption}}{{counterText}}</mu-button>
  </mu-dialog>
</template>

<script>
export default {
  props: {
    title: String,
    openAlert: Boolean,
    safeOption: {
      type: String,
      default: 'Cancel'
    },
    dangerOption: {
      type: String,
      default: 'OK'
    },
    confirmColor: {
      type: String,
      default: 'error'
    },
    sec: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      disableDisagree: true,
      counterText: '',
      counter: 3,
      timer: undefined
    }
  },
  watch: {
    openAlert(value) {
      if (value) {
        this.disableDisagree = true
        this.counter = this.sec
        this.counterText = ` (${this.counter})`
        countDown.call(this)
        this.timer = setInterval(() => {
          countDown.call(this)
        }, 1000)
      } else {
        clearInterval(this.timer)
      }
      function countDown() {
        if (this.counter > 0) {
          this.counter--
          this.counterText = ` (${this.counter})`
        } else {
          this.disableDisagree = false
          this.counterText = ''
          clearInterval(this.timer)
        }
      }
    }
  },
  methods: {
    emitConfirm(isConfirm) {
      this.$emit('closeConfirmDialog', isConfirm)
    }
  }
}
</script>

<style>
.confirm .mu-dialog {
  background-color: #555;
}
.confirm .mu-flat-button {
  font-size: 18px;
}
.confirm .mu-flat-button.disabled {
  color: rgba(255, 255, 255, 0.5);
}
</style>
