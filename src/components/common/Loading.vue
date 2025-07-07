<template>
  <mu-dialog
    width="380"
    :overlay-close="false"
    :esc-press-close="false"
    v-model:open="loadingDialog.showDialog"
    class="custom-dialog"
    :dialog-class="{ 'upload-success': isSuccess, 'upload-fail': isFail }"
  >
    <div style="text-align: center">
      <div class="loading-body" v-if="loadingDialog.isLoading">
        <div class="dialog-message">{{ title || t("common.wait") }}</div>
        <mu-circular-progress :size="36"></mu-circular-progress>
      </div>
      <div v-else class="loading-body">
        <div v-if="loadingDialog.isSuccess">{{ t("common.success") }}</div>
        <div v-else>{{ t("common.fail") }}</div>
        <pre v-if="loadingDialog.error !== ''" class="error-message">{{
          errorMessage
        }}</pre>
        <pre v-if="loadingDialog.message !== ''" class="error-message">{{
          loadingDialog.message
        }}</pre>
      </div>
    </div>
    <p v-if="isFail" class="cae-support" v-html="t('common.cae-support')"></p>
    <mu-button
      v-focus
      ref="loadingClose"
      slot="actions"
      class="dialog-button"
      flat
      color="white"
      @click="closeLoadingDialog"
      v-if="loadingDialog.showAction"
    >
      OK
    </mu-button>
  </mu-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"

// 自訂指令 focus
import { Directive } from "vue"
const focus: Directive = {
  mounted(el) {
    el.focus()
  },
}

// Vuex store
const store = useStore()

// 取得 loadingDialog 狀態（假設你的 getter 名稱還是 loadingDialog）
const loadingDialog = computed(() => store.getters.loadingDialog)

// i18n
const { t } = useI18n()

// 計算屬性
const title = computed(() => loadingDialog.value.title)

const isSuccess = computed(
  () => !loadingDialog.value.isLoading && loadingDialog.value.isSuccess
)
const isFail = computed(
  () => !loadingDialog.value.isLoading && !loadingDialog.value.isSuccess
)

const errorMessage = computed(() => {
  const key = "error." + loadingDialog.value.error
  if (loadingDialog.value.error) {
    return t(key)
  }
  return ""
})

// methods
function closeLoadingDialog() {
  store.dispatch("changeLoadingState", false)
}

// ref for button (可用於後續操作)
const loadingClose = ref<InstanceType<typeof HTMLElement> | null>(null)
</script>

<script lang="ts">
// 註冊自訂指令 focus
import { defineComponent } from "vue"
export default defineComponent({
  directives: {
    focus,
  },
})
</script>

<style scoped>
.custom-dialog.mu-dialog {
  text-align: center;
  background-color: rgb(112, 112, 112);
}
.upload-success.mu-dialog {
  text-align: center;
  background-color: #1ea296;
}
.upload-fail.mu-dialog {
  text-align: center;
  background-color: rgb(180, 57, 57);
}
.loading-body {
  font-size: 30px;
  color: white;
}
.dialog-message {
  font-weight: bold;
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
}
.dialog-button {
  font-size: x-large;
}
.error-message {
  margin-top: 10px;
  font-size: 20px;
  text-align: left;
  word-break: break-word;
  font-family: "Microsoft JhengHei", Arial, sans-serif;
}
a.contact {
  text-decoration: underline;
  color: #4fb4e6;
  font-size: 20px;
  margin: 30px 0;
}
.cae-support {
  margin-top: 40px;
  margin-bottom: 0px;
  text-align: center;
}
</style>
