<template>
  <div class="red-dot-wrapper">
    <div
      class="red-dot"
      :class="{'red-dot-pointer': pointer}"
      v-if="show"
    >
      <span v-html="count" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'RedDot',
  props: {
    show: Boolean,
    count: String,
    pointer: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style>
.red-dot-wrapper {
  position: relative;
}
.red-dot {
  position: absolute;
  top: -20px;
  right: -30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: gray;
  user-select: none;
  font-size: 18px;
  background: #ff2a1b;
  cursor: default;
  color: #ffd3d3;
  font-weight: bold;
}
.red-dot-pointer {
  cursor: pointer;
}
</style>
