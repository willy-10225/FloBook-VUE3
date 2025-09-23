<template>
  <mu-papper></mu-papper>
</template>

<script>
export default {
  data() {
    return {
      form: {
        type: '',
        questions: [new Question('專案名稱', 'Text', true, true)]
      }
    }
  }
}
</script>

<style>
</style>