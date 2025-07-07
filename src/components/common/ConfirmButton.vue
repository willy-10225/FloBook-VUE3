<template>
  <div class="confirm-buttton">
    <mu-button @click="isOpened = true" :color="color" :small="small" :fab="fab" :icon="icon">
      <slot></slot>
    </mu-button>
    <confirm-dialog
      :title="message"
      :openAlert="isOpened"
      :safeOption="$t('common.cancel')"
      :dangerOption="$t('common.confirm')"
      :sec="consideringTime"
      :confirmColor="color"
      @closeConfirmDialog="emitConfirm($event)"
    ></confirm-dialog>
  </div>
</template>

<script>
import ConfirmDialog from './ConfirmDialog'

export default {
  name: 'ConfirmButton',
  components: { ConfirmDialog },
  props: {
    message: String,
    danger: Boolean,
    small: Boolean,
    fab: Boolean,
    icon: Boolean,
    transferData: Object
  },
  data() {
    return {
      isOpened: false
    }
  },
  computed: {
    consideringTime() {
      return this.danger ? 3 : 0
    },
    color() {
      return this.danger ? 'error' : 'primary'
    }
  },
  methods: {
    emitConfirm(isConfirm) {
      if (isConfirm) {
        if (this.transferData == undefined) {
          this.$emit('confirm')
        } else {
          this.$emit('confirm', {
            transferData: this.transferData
          })
        }
      } else {
        this.$emit('denyConfirm')
      }

      this.isOpened = false
    }
  }
}
</script>

<style scoped>
.confirm-buttton {
  display: inline-block;
}
</style>
