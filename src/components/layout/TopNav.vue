<template>
  <v-app-bar
    :elevation="4"
    color="primary"
    app
    class="top-nav"
    :class="{ 'top-nav-hidden': hideTopnav }"
  >
    <v-app-bar-nav-icon @click="toggleSideNav" />
    <v-toolbar-title>{{ currentRouteName }}</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn v-if="userInfo.isAdmin" icon :to="{ name: 'Setting' }">
      <v-icon>mdi-cog</v-icon>
    </v-btn>

    <v-btn icon :to="{ name: 'Profile' }">
      <v-icon>mdi-account-circle</v-icon>
      <span class="ml-2">{{ userInfo.displayName }}</span>
    </v-btn>

    <v-btn text @click="logoutAlert = true">
      {{ loginState }}
    </v-btn>

    <v-menu v-model="openLangMenu" location="bottom">
      <template #activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-earth</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLang(lang.code)"
        >
          <v-list-item-title>{{ lang.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <ConfirmDialog
      :title="$t('account.confirm-logout')"
      :openAlert="logoutAlert"
      :sec="0"
      confirmColor="primary"
      @closeConfirmDialog="logout"
    />
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"

// 若使用 Vuex，改為 import { useStore } from 'vuex'
// 若用 Pinia，請改成 import { useUserStore } from '@/stores/user'
import { useStore } from "vuex"

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const openLangMenu = ref(false)
const logoutAlert = ref(false)
const hideTopnav = ref(false)
const prevScrollTop = ref(0)

const userInfo = computed(() => store.getters.userInfo)
const layout = computed(() => store.getters.layout)

const loginState = computed(() =>
  localStorage.getItem("login_token") ? "Logout" : "Login"
)

const currentRouteName = computed(() => route.name as string)

const languages = [
  { code: "en-us", label: t("lang.en-us") },
  { code: "zh-tw", label: t("lang.zh-tw") },
  { code: "zh-cn", label: t("lang.zh-cn") },
]

function changeLang(lang: string) {
  openLangMenu.value = false
  store.dispatch("changeLanguage", lang)
  locale.value = lang
}

function logout(isConfirm: boolean) {
  if (loginState.value === "Logout" && isConfirm) {
    store.dispatch("removeUserInfo")
    router.push({ name: "Login" })
  }
  logoutAlert.value = false
}

function toggleSideNav() {
  store.dispatch("toggleSideNav")
}

function onScroll() {
  const currScrollTop = window.pageYOffset
  hideTopnav.value = currScrollTop > prevScrollTop.value
  prevScrollTop.value = currScrollTop
}

onMounted(() => {
  window.addEventListener("scroll", onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll)
})
</script>

<style scoped>
.top-nav-hidden {
  top: -60px !important;
  transition: top 0.3s ease;
}
.ml-2 {
  margin-left: 8px;
}
</style>
