<template>
  <div class="dynamic-text">
    <span class="text">{{ joinText }}</span>
    <span class="blink">|</span>
  </div>
</template>

<script>
export default {
  name: 'DynamicText',
  data() {
    return {
      text: 'Cadmen FloBook...',
      textArray: [],
      index: 0,
      timer: null,
      stepQueue: []
    }
  },
  computed: {
    joinText() {
      return this.textArray.join('')
    }
  },
  mounted() {
    this.normal(100)
      .sleep(500)
      .inverse(200)
      .repeat()
  },
  methods: {
    async once() {
      for (const step of this.stepQueue) {
        await step()
      }
    },
    async repeat() {
      let i = 0
      while (this.stepQueue.length > 0) {
        const step = this.stepQueue[i++]
        await step()
        if (i == this.stepQueue.length) i = 0
      }
    },
    normal(duration) {
      const step = () => {
        return new Promise(resolve => {
          this.index = 0
          this.timer = setInterval(() => {
            this.textArray.push(this.text[this.index++])
            if (this.index > this.text.length - 1) {
              clearInterval(this.timer)
              resolve(this)
            }
          }, duration)
        })
      }
      this.stepQueue.push(step)
      return this
    },
    sleep(duration) {
      const step = () => {
        return new Promise(resolve => {
          this.timer = setTimeout(() => {
            clearInterval(this.timer)
            resolve(this)
          }, duration)
        })
      }
      this.stepQueue.push(step)
      return this
    },
    inverse(duration) {
      const step = () => {
        return new Promise(resolve => {
          this.index = this.text.length - 1
          this.timer = setInterval(() => {
            this.textArray.pop()
            this.index--
            if (this.index < 0) {
              clearInterval(this.timer)
              resolve(this)
            }
          }, duration)
        })
      }
      this.stepQueue.push(step)
      return this
    }
  }
}
</script>

<style lang="less" scoped>
.dynamic-text {
  margin-left: 100px;
  text-align: left;
  font-size: 40px;
  .blink {
    opacity: 0;
    animation: blink 1s step-start infinite;
  }
  @keyframes blink {
    49% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }
}
</style>
