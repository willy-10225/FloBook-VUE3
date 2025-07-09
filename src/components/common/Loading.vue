<template>
  <v-dialog
    v-model="loadingDialog.showDialog"
    max-width="400"
    persistent
    class="custom-dialog"
  >
    <v-card :class="dialogClass" class="pa-4 text-center">
      <div v-if="loadingDialog.isLoading">
        <div class="dialog-message">{{ title || $t("common.wait") }}</div>
        <v-progress-circular indeterminate color="white" size="36" />
      </div>

      <div v-else>
        <div v-if="loadingDialog.isSuccess" class="text-white text-h6">
          {{ $t("common.success") }}
        </div>
        <div v-else class="text-white text-h6">
          {{ $t("common.fail") }}
        </div>
        <pre
          v-if="loadingDialog.error"
          class="error-message text-white text-left"
          >{{ errorMessage }}</pre
        >
        <pre
          v-if="loadingDialog.message"
          class="error-message text-white text-left"
          >{{ message }}</pre
        >
        <div
          v-if="!loadingDialog.isSuccess"
          class="cae-support text-white mt-6"
          v-html="$t('common.cae-support')"
        ></div>
      </div>

      <v-card-actions v-if="loadingDialog.showAction" class="justify-center">
        <v-btn
          ref="loadingClose"
          color="white"
          variant="text"
          class="dialog-button"
          @click="closeLoadingDialog"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"

const store = useStore()
const { t } = useI18n()

const loadingDialog = computed(() => store.getters.loadingDialog)

const title = computed(() => loadingDialog.value.title)
const isSuccess = computed(
  () => !loadingDialog.value.isLoading && loadingDialog.value.isSuccess
)
const isFail = computed(
  () =>
    !loadingDialog.value.isLoading && loadingDialog.value.isSuccess === false
)

const errorMessage = computed(() => {
  const key = "error." + loadingDialog.value.error
  return key !== "error." ? t(key) : ""
})

const message = computed(() => loadingDialog.value.message)

const dialogClass = computed(() => {
  if (isSuccess.value) return "upload-success"
  if (isFail.value) return "upload-fail"
  return ""
})

const closeLoadingDialog = () => {
  store.dispatch("changeLoadingState", false)
}
</script>

<style scoped>
.custom-dialog >>> .v-overlay__content {
  text-align: center;
}

.upload-success {
  background-color: #1ea296;
}
.upload-fail {
  background-color: rgb(180, 57, 57);
}
.dialog-message {
  font-weight: bold;
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
}
.dialog-button {
  font-size: large;
}
.error-message {
  margin-top: 10px;
  font-size: 20px;
  word-break: break-word;
  font-family: "Microsoft JhengHei", Arial, sans-serif;
  white-space: pre-wrap;
}
.cae-support {
  font-size: 18px;
  margin-top: 40px;
}
</style>
