<template>
  <div
    class="add-file-button"
    @click="onClick"
  >
    <mu-ripple>+</mu-ripple>
  </div>
</template>

<script>
export default {
  name: 'AppendButton',
  methods: {
    onClick(e) {
      this.$emit('click', e)
    }
  }
}
</script>

<style scoped>
.add-file-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 -8px;
  height: 70px;
  font-size: 30px;
  text-align: center;
  padding: 5px;
  margin-bottom: 20px;
  cursor: pointer;
  border: dashed 1px gray;
  color: white;
  user-select: none;
}
.add-file-button:hover {
  background-color: #aaa;
  opacity: 0.9;
}
</style>