<template>
  <div>
    <FormEditor v-if="isEditing" :form="form" />
    <FormViewer v-else :form="form" />
  </div>
</template>

<script>
import FormEditor from '@/components/Account/FormEditor'
import FormViewer from '@/components/Account/FormViewer'
export default {
  data() {
    return {
      form: {
        type: '',
        questions: []
      }
    }
  }
}
</script>

<style>
</style>