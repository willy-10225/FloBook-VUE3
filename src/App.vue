<template>
  <v-app
    id="app"
    class="dark-background"
    v-shortkey="shortkeys"
    @shortkey="shortkeyAction"
  >
    <router-view />
    <loading />
  </v-app>
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
/* ===== 全局背景與文字色調設定 ===== */
html,
body,
#app,
.v-application,
.v-main {
  background-color: #1b1b1b !important;
  color: white !important;
  min-height: 100%;
  height: 100%;
}

/* ===== App 本體排版與字型設定 ===== */
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

/* ===== 自訂 Vuetify 組件樣式（根據暗色主題設計） ===== */
.v-app-bar {
  background-color: #2a2a2a !important;
  color: white !important;
}

.v-navigation-drawer {
  background-color: #2a2a2a !important;
  color: white !important;
}

.v-footer {
  background-color: #2a2a2a !important;
  color: white !important;
}

/* ===== 輸入框 / Autofill 權限設定 ===== */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  box-shadow: 0 0 0 30px #333 inset !important;
  -webkit-box-shadow: 0 0 0 30px #333 inset !important;
  -webkit-text-fill-color: #fff !important;
}

/* ===== placeholder 字體設定（舊版 IE）===== */
:-ms-input-placeholder {
  color: #ccc !important;
}

/* ===== Material-UI 類組件字體統一（如果你同時用了 Mu UI） ===== */
.mu-form-item-label,
.mu-input,
.mu-chip {
  font-size: 20px !important;
  color: white !important;
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
