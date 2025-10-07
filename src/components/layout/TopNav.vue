<template>
  <v-app-bar
    app
    dark
    class="qi-topnav"
    :class="{ 'qi-topnav-hidden': hideTopnav }"
  >
    <!-- 左邊 -->
    <template #prepend>
      <v-toolbar>
        <v-btn icon @click="toggleSideNav" aria-label="Toggle Side Navigation">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <span
          class="text-white text-h6 ml-2"
          :style="{
            backgroundColor: 'teal',
            display: 'block',
            width: '100%',
            height: '100%',
            lineHeight: '64px' /* 或 v-app-bar 的高度 */,
            textAlign: 'center',
            padding: '0px 15px 0px 15px',
          }"
          >{{ routeName }}</span
        >
      </v-toolbar>
    </template>

    <!-- 右邊 -->
    <template #append>
      <v-btn variant="text" class="qi-topnav-item" to="../Account/Profile">
        <v-icon start>mdi-account-circle</v-icon>
        {{ userInfo.displayName }}
      </v-btn>

      <v-btn variant="text" class="qi-topnav-item" @click="logoutAlert = true">
        {{ loginState }}
      </v-btn>

      <v-btn
        v-if="userInfo.isAdmin"
        variant="text"
        class="qi-topnav-item"
        to="../Account/setting"
        aria-label="Settings"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>

      <!-- 語言選單 -->
      <v-menu v-model="openLangMenu" location="bottom">
        <template #activator="{ props }">
          <v-btn icon v-bind="props" aria-label="Change Language">
            <v-icon>mdi-earth</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item role="menuitem" @click="changeLang('en-us')">
            <v-list-item-title>{{ $t("lang.en-us") }}</v-list-item-title>
          </v-list-item>
          <v-list-item role="menuitem" @click="changeLang('zh-tw')">
            <v-list-item-title>{{ $t("lang.zh-tw") }}</v-list-item-title>
          </v-list-item>
          <v-list-item role="menuitem" @click="changeLang('zh-cn')">
            <v-list-item-title>{{ $t("lang.zh-cn") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- 登出對話框 -->
    <v-dialog v-model="logoutAlert" max-width="360">
      <v-card>
        <v-card-title>{{ $t("account.confirm-logout") }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="logoutAlert = false">取消</v-btn>
          <v-btn color="primary" text @click="logout(true)">確認</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import { useRouter, useRoute } from "vue-router"
import i18n from "@/assets/ts/i18n"
import { color } from "echarts"

const store = useStore()
const router = useRouter()
const route = useRoute()

const openLangMenu = ref(false)
const logoutAlert = ref(false)
const hideTopnav = ref(false)
let prevScrollTop = 0

const userInfo = computed(() => store.getters.userInfo)
const layout = computed(() => store.getters.layout)

const routeName = computed(() => route.name)
const isMobile = ref(window.innerWidth < 1024)

function handleResize() {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  window.addEventListener("resize", handleResize)
  window.addEventListener("scroll", displayOnScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize)
  window.removeEventListener("scroll", displayOnScroll)
})

const loginState = computed(() =>
  localStorage.getItem("login_token") ? "Logout" : "Login"
)

function logout(isConfirm) {
  if (loginState.value === "Logout" && isConfirm) {
    store.dispatch("removeUserInfo")
    router.push({ name: "Login" })
  }
  logoutAlert.value = false
}

function changeLang(lang: "zh-tw" | "en-us" | "zh-cn") {
  openLangMenu.value = false
  store.dispatch("changeLanguage", lang)

  // ✅ Vue3 vue-i18n 的正確寫法
  i18n.global.locale.value = lang
}

function toggleSideNav() {
  store.dispatch("toggleSideNav")
}

function displayOnScroll() {
  const currScrollTop = window.pageYOffset
  hideTopnav.value = currScrollTop > prevScrollTop
  prevScrollTop = currScrollTop
}
</script>

<style scoped>
.qi-topnav {
  z-index: 10190225;
  transition: 0.1s ease;
}
.qi-topnav-hidden {
  top: -60px !important;
  transition: 0.3s ease;
}
.qi-topnav-item {
  color: #f2f2f2;
  font-size: 17px;
  text-transform: none;
  letter-spacing: 1px;
}
.qi-topnav-item:hover {
  color: #0b9c9c;
}
</style>
