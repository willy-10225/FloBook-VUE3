<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-6" elevation="10">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">{{ t("account.personal") }}</span>
        <div>
          <v-btn
            v-if="!isEditing"
            color="primary"
            @click="isEditing = true"
            class="mr-2"
          >
            {{ t("common.edit") }}
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="default"
            variant="tonal"
            @click="cancelEdit"
            class="mr-2"
          >
            {{ t("common.cancel") }}
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="primary"
            variant="elevated"
            @click="confirmEdit"
          >
            {{ t("common.confirm") }}
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :label="t('account.account')"
                v-model="form.account"
                :disabled="true"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :label="t('account.displayName')"
                v-model="form.displayName"
                :rules="displayNameRules"
                :disabled="!isEditing"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :label="t('account.email')"
                v-model="form.email"
                :rules="emailRules"
                :disabled="!isEditing"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"

const { t } = useI18n()
const store = useStore()

const formRef = ref()
const valid = ref(false)
const isEditing = ref(false)

const form = reactive({
  account: "",
  displayName: "",
  email: "",
})

const userInfo = computed(() => store.getters.userInfo)

onMounted(() => {
  form.account = userInfo.value.account || ""
  form.displayName = userInfo.value.displayName || ""
  form.email = userInfo.value.email || ""
})

const displayNameRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    /^([\u4E00-\u9FFF]|\w|\s|[[\]])+$/.test(v) || t("validate.wrongNameFormat"),
]

const emailRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v) ||
    t("validate.wrongMailFormat"),
]

const cancelEdit = () => {
  isEditing.value = false
  form.displayName = userInfo.value.displayName || ""
  form.email = userInfo.value.email || ""
}

const confirmEdit = () => {
  if (!formRef.value?.validate()) return
  store.dispatch("setUserInfo", {
    displayName: form.displayName,
    email: form.email,
  })
  isEditing.value = false
}
</script>

<style>
.v-card {
  max-width: 960px;
  margin: auto;
}

.v-card-title {
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-btn {
  min-width: 100px;
  text-transform: none;
}

@media (max-width: 600px) {
  .v-btn {
    font-size: 0.8rem;
    min-width: 80px;
  }
}
</style>
