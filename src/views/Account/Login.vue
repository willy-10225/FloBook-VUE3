<template>
  <section>
    <LogoHead />

    <div class="login-block">
      <div class="login-block-head">
        <!-- 語言選單 -->
        <v-menu
          v-model="openLangMenu"
          :close-on-content-click="false"
          offset-y
          transition="scale-transition"
        >
          <template #activator="{ props }">
            <v-btn icon v-bind="props" color="primary">
              <v-icon>mdi-earth</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLang(lang.code)"
              style="cursor: pointer"
            >
              <v-list-item-title>{{ $t(lang.label) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-form
        ref="loginFormRef"
        v-model="valid"
        class="login-form"
        lazy-validation
      >
        <v-text-field
          v-if="versionOption.official"
          v-model="loginForm.account"
          :label="$t('account.account')"
          :rules="accountRules"
          variant="outlined"
          density="comfortable"
          autocomplete="current-password"
          prepend-inner-icon="mdi-account"
          class="mb-4 rounded-lg shadow-sm"
          required
        ></v-text-field>
        <v-text-field
          v-model="loginForm.password"
          :label="$t('account.password')"
          :type="visibility ? 'text' : 'password'"
          :append-icon="visibility ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append="toggleVisibility"
          :rules="passwordRules"
          variant="outlined"
          density="comfortable"
          autocomplete="current-password"
          prepend-inner-icon="mdi-lock"
          class="mb-4 rounded-lg shadow-sm"
          @keyup.enter="login"
          required
        ></v-text-field>
      </v-form>

      <div class="login-block-footer">
        <v-btn
          v-if="versionOption.official"
          color="grey darken-1"
          class="mr-2"
          @click="signUp"
          tabindex="-1"
        >
          {{ $t("account.signUp") }}
        </v-btn>

        <v-btn color="primary" class="mr-2" @click="login">
          {{ $t("account.logIn") }}
        </v-btn>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import LogoHead from "@/components/layout/LogoHead.vue"
import { apiLogin } from "@/assets/ts/api"
import { useI18n } from "vue-i18n"
import type { VForm } from "vuetify/components"

const { t, locale } = useI18n()
const store = useStore()
const router = useRouter()

// 語言切換
const openLangMenu = ref(false)
const languages = [
  { code: "en-us", label: "lang.en-us" },
  { code: "zh-tw", label: "lang.zh-tw" },
  { code: "zh-cn", label: "lang.zh-cn" },
]

// 表單資料
const loginForm = reactive({
  account: "",
  password: "",
  eventId: "",
})
const visibility = ref(false)
const valid = ref(false)
const loginFormRef = ref<VForm | null>(null)

// Vuex getter
const versionOption = computed(() => store.getters.versionOption)

// 驗證規則
const accountRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    (v && v.length >= 3 && v.length <= 20) || t("validate.wrongAccountLength"),
  (v: string) =>
    /^[a-zA-Z0-9]+([_ -.][a-zA-Z0-9]+)*$/.test(v) ||
    t("validate.wrongAccountFormat"),
]
const passwordRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    (v && v.length >= 4 && v.length <= 32) || t("validate.wrongPasswordFormat"),
]

// 密碼顯示
function toggleVisibility() {
  visibility.value = !visibility.value
}

// 語言切換
function changeLang(lang: string) {
  locale.value = lang
  localStorage.setItem("lang", lang)
  openLangMenu.value = false
  store.dispatch("changeLanguage", lang)
}

function signUp() {
  router.push({ name: "SignUp" })
}

async function login() {
  const isValid = await loginFormRef.value?.validate()
  if (!isValid) return

  store.dispatch("changeLoadingState", true)

  const payload = {
    AccountName: loginForm.account,
    Password: loginForm.password,
  }

  try {
    const res = await apiLogin(payload)
    const data = res.data
    if (data[0] === "Reject" || data === "Reject") {
      throw new Error("wrongLogInput")
    }

    store.dispatch("changeLoadingState", false)
    loginSuccess(data)
  } catch (err) {
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "wrongLogInput",
    })
    console.error(err)
  }
}

function loginSuccess(data: any) {
  const payload = {
    userId: Number(data.id),
    displayName: data.display_name,
    account: data.computeraccount,
    name: loginForm.account,
    roles: data.admin ? ["admin"] : [],
    isAdmin: data.isAdmin,
    email: data.email,
  }

  store.dispatch("setUserInfo", payload)
  router.push("/home")
}
</script>

<style scoped>
.login-block {
  width: 50vw;
  margin: auto;
  margin-top: 15vh;
  padding: 20px;
  border-radius: 10px;
  background-color: #333;
  color: white;
}
@media only screen and (max-width: 600px) {
  .login-block {
    width: 400px;
  }
}
.login-form {
  width: 100%;
  margin: auto;
  max-width: 700px;
  text-align: center;
}
.login-block-head {
  position: relative;
  margin-bottom: 50px;
  display: flex;
  justify-content: flex-end;
}
.login-block-footer {
  position: relative;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
