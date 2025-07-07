<template>
  <div class="ctrl">
    <div
      class="ctrl__button ctrl__button--decrement"
      @click="decrement"
    >&ndash;</div>
    <div
      class="ctrl__counter"
      @mouseenter="activeTextbox"
    >
      <input
        class="ctrl__counter-input"
        maxlength="5"
        type="text"
        v-model="counter"
        v-show="isInput"
        @input="validate"
        @blur="inactiveTextbox"
      />
      <div
        class="ctrl__counter-num"
        v-show="!isInput"
      >{{ counter }}</div>
    </div>
    <div
      class="ctrl__button ctrl__button--increment"
      @click="increment"
    >+</div>
  </div>
</template>

<script>
export default {
  name: 'QiNumber',
  props: {
    value: Number,
    max: {
      type: Number,
      default: 9999
    },
    min: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      counter: this.value,
      isInput: false
    }
  },
  watch: {
    value(val) {
      this.counter = val
    }
  },
  methods: {
    decrement() {
      var nextCounter = this.counter > this.min ? --this.counter : this.counter
      this.counter = nextCounter

      this.$emit('input', this.counter)
    },
    increment() {
      var nextCounter = this.counter < this.max ? ++this.counter : this.counter
      this.counter = nextCounter

      this.$emit('input', this.counter)
    },
    activeTextbox() {
      this.isInput = true
    },
    inactiveTextbox() {
      this.isInput = false
      if (this.counter == '') this.counter = this.min

      this.$emit('input', this.counter)
    },
    validate(e) {
      var parseValue = parseInt(e.target.value)
      if (!isNaN(parseValue)) {
        if (parseValue >= this.min && parseValue <= this.max)
          this.counter = parseValue
        else if (parseValue > this.max) this.counter = this.max
        else if (parseValue < this.min) this.counter = this.min

        this.$emit('input', this.counter)
      }
    }
  }
}
</script>

<style scoped>
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  box-sizing: border-box;
}
.ctrl {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.87);
  -webkit-box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.ctrl__counter {
  position: relative;
  width: 50px;
  height: 30px;
  color: #333c48;
  text-align: center;
  overflow: hidden;
}
.ctrl__counter-input {
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 2;
  box-shadow: none;
  outline: none;
  border: none;
  color: #333c48;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
}
.ctrl__counter-num {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 5;
  line-height: 30px;
  transition: opacity 300ms ease-in;
}
.ctrl__button {
  width: 30px;
  line-height: 30px;
  text-align: center;
  color: #fff;
  cursor: pointer;
  background-color: #8498a7;
  transition: background-color 100ms ease-in;
}
.ctrl__button:hover {
  background-color: #90a2b0;
  transition: background-color 100ms ease-in;
}
.ctrl__button:active {
  background-color: #778996;
  transition: background-color 100ms ease-in;
}
.ctrl__button--decrement {
  border-radius: 5px 0 0 5px;
}
.ctrl__button--increment {
  border-radius: 0 5px 5px 0;
}
</style>
