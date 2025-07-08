<template>
  <div id="app" v-shortkey="shortkeys" @shortkey="shortkeyAction">
    <router-view />
    <loading />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue"
import { useStore } from "vuex"
import Loading from "@/components/common/Loading.vue"

export default defineComponent({
  name: "App",
  components: { Loading },
  setup() {
    const store = useStore()

    const shortkeys = reactive({
      showSidenav1: ["meta", "b"],
      showSidenav2: ["ctrl", "b"],
    })

    const shortkeyAction = (e: any) => {
      switch (e.srcKey) {
        case "showSidenav1":
        case "showSidenav2":
          store.dispatch("toggleSideNav")
          break
      }
    }

    onMounted(() => {
      store.dispatch("checkMobileAndTablet")
    })

    return {
      shortkeys,
      shortkeyAction,
    }
  },
})
</script>

<style>
html {
  height: 100%;
}
body {
  background-color: #1b1b1b !important;
  color: white;
  min-height: 100%;
}
#app {
  font-family: sans-serif, Arial, "Microsoft JhengHei", "STHeiti";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 20px;
  position: absolute;
  width: 100%;
  height: 100%;
}
/* Change the white to any color ;) */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  box-shadow: 0 0 0 30px #333 inset !important;
  -webkit-box-shadow: 0 0 0 30px #333 inset !important;
  -webkit-text-fill-color: #fff;
}
:-ms-input-placeholder {
  color: #ccc !important;
}
.mu-form-item-label {
  font-size: 20px !important;
}
.mu-input,
.mu-chip {
  font-size: 20px !important;
}
.mu-button > :first-child {
  text-transform: none;
}
.mu-switch-track {
  background-color: #555 !important;
  opacity: 0.9;
}
.mu-switch-checked .mu-switch-track {
  background-color: #135699 !important;
}
.mu-switch-checked {
  color: #135699 !important;
}
</style>
