<template>
  <v-container class="sign-up-container" max-width="md">
    <v-card class="pa-6" elevation="10">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">{{ t("account.signupH2") }}</span>
        <v-menu v-model="openLangMenu" location="bottom">
          <template #activator="{ props }">
            <v-btn icon color="primary" v-bind="props">
              <v-icon>mdi-earth</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(label, key) in langs"
              :key="key"
              @click="changeLang(key)"
            >
              <v-list-item-title>{{ label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submit">
        <v-text-field
          v-model="form.displayName"
          :label="t('account.displayName')"
          :rules="displayNameRules"
          required
        />
        <v-text-field
          v-model="form.account"
          :label="t('account.account')"
          :rules="accountRules"
          required
        />
        <v-text-field
          v-model="form.computeraccount"
          :label="t('account.computeraccount')"
          :rules="accountRules"
          required
          append-inner-icon="mdi-information"
          @click:append-inner="dialog = true"
        />
        <v-dialog v-model="dialog" max-width="500">
          <v-card>
            <v-card-title>{{ t("account.accounttitle") }}</v-card-title>
            <v-card-text v-html="t('account.accountInfoDescription')" />
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="dialog = false">
                {{ t("account.close") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-text-field
          v-model="form.email"
          :label="t('account.email')"
          :rules="emailRules"
          required
        />
        <v-text-field
          v-model="form.password"
          :label="t('account.password')"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :rules="passwordRules"
          required
        />
        <v-text-field
          v-model="form.confirmPassword"
          :label="t('account.passwordConfirm')"
          :type="showConfirm ? 'text' : 'password'"
          :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showConfirm = !showConfirm"
          :rules="confirmPasswordRules"
          required
        />

        <v-btn type="submit" color="primary" class="mt-4">{{
          t("common.submit")
        }}</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { apiCreateAccount, apiIsAccountNameUsable } from "@/assets/ts/api"

const { t, locale } = useI18n()
const router = useRouter()
const store = useStore()

const dialog = ref(false)
const openLangMenu = ref(false)
const isFormValid = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const formRef = ref()

const langs = {
  "en-us": t("lang.en-us"),
  "zh-tw": t("lang.zh-tw"),
  "zh-cn": t("lang.zh-cn"),
}

const form = reactive({
  displayName: "",
  account: "",
  computeraccount: "",
  email: "",
  password: "",
  confirmPassword: "",
})

const displayNameRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    /^[\u4E00-\u9FFF\w\s[\]]+$/.test(v) || t("validate.wrongNameFormat"),
]

const accountRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    (v.length >= 3 && v.length <= 20) || t("validate.wrongAccountLength"),
  (v: string) =>
    /^[a-zA-Z0-9]+([_ -.][a-zA-Z0-9]+)*$/.test(v) ||
    t("validate.wrongAccountFormat"),
]

const emailRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    /^[A-Za-z]\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/.test(
      v
    ) || t("validate.wrongMailFormat"),
]

const passwordRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    (v.length >= 4 && v.length <= 32) || t("validate.wrongPasswordFormat"),
]

const confirmPasswordRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) => v === form.password || t("validate.differentPassword"),
]

function changeLang(lang: string) {
  openLangMenu.value = false
  locale.value = lang
  store.dispatch("changeLanguage", lang)
}

async function submit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const usable = await apiIsAccountNameUsable({ account: form.account }).then(
    res => res.data
  )
  if (!usable) {
    console.log("Account not usable")
    return
  }

  const payload = {
    displayName: form.displayName,
    account: form.account,
    computeraccount: form.computeraccount,
    email: form.email,
    password: form.password,
  }

  const res = await apiCreateAccount(payload)
  if (res.data === "success") {
    store.dispatch("changeLoadingState", {
      showDialog: true,
      isLoading: false,
      isSuccess: true,
      showAction: true,
      message: t("account.submitSuccess"),
    })

    setTimeout(() => {
      router.push({ name: "Login" })
    }, 1000)
  }
}
</script>

<style scoped>
.sign-up-container {
  margin-top: 60px;
  margin-bottom: 64px;
}
</style>
