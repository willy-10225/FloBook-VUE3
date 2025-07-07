<template>
  <section>
    <LogoHead />
    <div class="login-block">
      <div class="login-block-head">
        <mu-menu
          cover
          class="menu-wrapper"
          v-model:open="openLangMenu"
          popover-class="menu"
        >
          <mu-button fab small color="primary">
            <i class="material-icons">language</i>
          </mu-button>
          <mu-list slot="content">
            <mu-list-item button @click="closeLangMenu('en-us')">
              <mu-list-item-title>{{ $t("lang.en-us") }}</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="closeLangMenu('zh-tw')">
              <mu-list-item-title>{{ $t("lang.zh-tw") }}</mu-list-item-title>
            </mu-list-item>
            <mu-list-item button @click="closeLangMenu('zh-cn')">
              <mu-list-item-title>{{ $t("lang.zh-cn") }}</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>
      </div>
      <mu-form
        ref="loginForm"
        :model="loginForm"
        class="login-form"
        :label-position="'left'"
        label-width="120"
      >
        <mu-form-item
          prop="account"
          :label="$t('account.account')"
          v-if="versionOption.official"
          :rules="accountRules"
        >
          <mu-text-field
            v-model="loginForm.account"
            prop="account"
            v-focus
          ></mu-text-field>
        </mu-form-item>
        <mu-form-item
          prop="password"
          :label="$t('account.password')"
          :rules="passwordRules"
        >
          <mu-text-field
            v-model="loginForm.password"
            :action-icon="visibility ? 'visibility_off' : 'visibility'"
            :action-click="() => (visibility = !visibility)"
            :type="visibility ? 'text' : 'password'"
            @keydown.enter="login"
            prop="password"
          ></mu-text-field>
        </mu-form-item>
      </mu-form>
      <div class="login-block-footer">
        <mu-button
          color="blueGrey500"
          @click="signUp"
          style="margin-right: 10px"
          v-if="versionOption.official"
          tabindex="-1"
          >{{ $t("account.signUp") }}</mu-button
        >
        <mu-button color="primary" @click="login">
          {{ $t("account.logIn") }}
        </mu-button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, reactive, computed, nextTick } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { apiLogin } from "@/assets/ts/api"
import LogoHead from "@/components/layout/LogoHead.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const router = useRouter()
const store = useStore()

const openLangMenu = ref(false)
const visibility = ref(false)

const loginForm = reactive({
  account: "",
  password: "",
  eventId: "",
})

const loginFormRef = ref()

const versionOption = computed(() => store.getters.versionOption)

const accountRules = computed(() => [
  { validate: (val: string) => !!val, message: t("validate.required") },
  {
    validate: (val: string) => val.length >= 3 && val.length <= 20,
    message: t("validate.wrongAccountLength"),
  },
  {
    validate: (val: string) => /^[a-zA-Z0-9]+([_ .-]?[a-zA-Z0-9])*$/g.test(val),
    message: t("validate.wrongAccountFormat"),
  },
])

const passwordRules = computed(() => [
  { validate: (val: string) => !!val, message: t("validate.required") },
  {
    validate: (val: string) => val.length >= 4 && val.length <= 32,
    message: t("validate.wrongPasswordFormat"),
  },
])

const signUp = () => {
  router.push({ name: "Sign Up" })
}

const login = () => {
  loginFormRef.value.validate().then((isValidated: boolean) => {
    if (isValidated) {
      store.dispatch("changeLoadingState", true)

      const payload = {
        AccountName: loginForm.account,
        Password: loginForm.password,
      }

      apiLogin(payload)
        .then(res => {
          return new Promise((resolve, reject) => {
            if (res.data[0] === "Reject" || res.data === "Reject")
              reject("wrongLogInput")
            else resolve(res.data)
          })
        })
        .then((data: any) => {
          store.dispatch("changeLoadingState", false)
          loginSuccess(data)
        })
        .catch(err => {
          store.dispatch("changeLoadingState", {
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            error: "wrongLogInput",
          })
          console.log(err)
        })
    }
  })
}

const loginSuccess = (data: any) => {
  const payload = {
    userId: parseInt(data.id),
    displayName: data.display_name,
    account: data.computeraccount,
    name: loginForm.account,
    roles: [] as string[],
    isAdmin: data.isAdmin,
    email: data.email,
  }
  if (data.admin) payload.roles.push("admin")

  store.dispatch("setUserInfo", payload)

  nextTick(() => {
    router.push("/home")
  })
}

const closeLangMenu = (lang: string) => {
  openLangMenu.value = false
  store.dispatch("changeLanguage", lang)
  // @ts-ignore
  $i18n.locale = lang
}
</script>
<style scoped>
.cursor-loading {
  cursor: progress;
}
.login-block {
  width: 50vw;
  margin: auto;
  margin-top: 15vh;
  padding: 20px;
  border-radius: 10px;
  background-color: #333;
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
.login-form .mu-form-item-label {
  font-size: 16px;
}
.help-message {
  margin-top: 3px;
  margin-bottom: 5px;
  width: 460px;
  font-size: 24px;
}
.login-block-head {
  position: relative;
  margin-bottom: 50px;
}
.login-block-footer {
  position: relative;
}
.login-block-footer .right-down-button {
  position: absolute;
  right: 0;
}
.menu-wrapper {
  position: absolute;
  right: 0;
}
.mu-popover.menu .mu-list {
  background: #1976d2;
}
</style>
