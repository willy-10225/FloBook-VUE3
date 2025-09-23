<template>
  <confirm-dialog
    title="設定專案權限"
    safeOption="取消"
    dangerOption="確定"
    :openAlert="openSetting"
    confirmColor="teal"
    @closeConfirmDialog="confirmProjectSetting($event)"
  ></confirm-dialog>
</template>

<script>
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

export default {
  name: 'ProjectSetting',
  components: { ConfirmDialog },
  props: ['openSetting'],
  data() {
    return {
      title: 'hi'
    }
  },
  methods: {
    confirmProjectSetting(isConfirm) {
      if (isConfirm) console.log('Updated')
      else console.log('WTF')
      this.$emit('closeProjectSetting')
    }
  }
}
</script>

<style scoped>
.project-setting .mu-dialog {
  background-color: #555;
}
.project-setting .mu-flat-button {
  font-size: 18px;
}
</style>
