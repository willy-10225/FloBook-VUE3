<template>
  <v-container class="pa-4" fluid>
    <v-card elevation="10" class="pa-6 mb-6">
      <v-card-title>
        <span class="text-h5">{{ t("account.personal") }}</span>
        <div class="ml-auto d-flex align-center">
          <v-btn
            color="primary"
            variant="tonal"
            @click="isModifyingPassword = true"
            class="mr-2"
          >
            {{ t("account.modify-password") }}
          </v-btn>
          <v-btn
            v-if="!isEditing"
            color="teal"
            @click="beginEditing"
            class="mr-2"
          >
            {{ t("common.edit") }}
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="grey"
            @click="cancelEditing"
            class="mr-2"
          >
            {{ t("common.cancel") }}
          </v-btn>
          <v-btn v-if="isEditing" color="primary" @click="confirmEditing">
            {{ t("common.confirm") }}
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid">
          <v-row v-if="isEditing">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.account"
                :label="t('account.account')"
                :disabled="true"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.displayName"
                :label="t('account.displayName')"
                :rules="displayNameRules"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                :label="t('account.email')"
                :rules="emailRules"
              />
            </v-col>
          </v-row>

          <div v-else>
            <v-table>
              <tbody>
                <tr>
                  <td>
                    <strong>{{ t("account.account") }}</strong>
                  </td>
                  <td>{{ form.account }}</td>
                </tr>
                <tr>
                  <td>
                    <strong>{{ t("account.displayName") }}</strong>
                  </td>
                  <td>{{ form.displayName }}</td>
                </tr>
                <tr>
                  <td>
                    <strong>{{ t("account.email") }}</strong>
                  </td>
                  <td>{{ form.email }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import {
  apiModifyProfile,
  apiModifyPassword,
  apiGetAllGroups,
} from "@/assets/ts/api"

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const formRef = ref()
const valid = ref(false)
const isEditing = ref(false)
const isModifyingPassword = ref(false)

const form = reactive({
  displayName: "",
  account: "",
  email: "",
})

const userInfo = computed(() => store.getters.userInfo)

onMounted(() => {
  form.displayName = userInfo.value.displayName || ""
  form.account = userInfo.value.account || ""
  form.email = userInfo.value.email || ""
})

const beginEditing = () => {
  isEditing.value = true
}
const cancelEditing = () => {
  form.displayName = userInfo.value.displayName
  form.email = userInfo.value.email
  isEditing.value = false
}
const confirmEditing = async () => {
  const payload = {
    userId: userInfo.value.userId,
    displayName: form.displayName,
    email: form.email,
  }
  const res = await apiModifyProfile(payload)
  if (res.data === "success") {
    store.dispatch("setUserInfo", {
      displayName: form.displayName,
      email: form.email,
    })
    isEditing.value = false
  }
}

const displayNameRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    /^([\u4E00-\u9FFF]|\w|\s|[[\]])+$/.test(v) || t("validate.wrongNameFormat"),
]
const emailRules = [
  (v: string) => !!v || t("validate.required"),
  (v: string) =>
    /^[A-Za-z]\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/.test(
      v
    ) || t("validate.wrongMailFormat"),
]
</script>

<style scoped>
.info-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 20px;
  color: #fff; /* 根據你 UI 主題可改成黑或白 */
}

.info-table td {
  padding: 18px 70px;
  vertical-align: middle;
}

.info-table .label-td {
  width: 100px;
  color: #ccc;
  font-weight: 500;
  white-space: nowrap;
  text-align: right;
  padding-right: 10px;
}

.info-table .value-td {
  padding: 18px 90px;
  color: #fff;
  word-break: break-word;
}

.information {
  flex: 1 1 auto;
  margin-right: 20px;
  margin-top: 20px;
}
.profile {
  position: relative;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 64px;
}
.profile > :nth-child(1) {
  height: 250px;
  width: 100%;
  margin-bottom: 20px;
}
header {
  position: relative;
  background-image: url("/img/Account/default-header.svg");
  background-repeat: no-repeat;
  background-size: cover;
}
.avatar {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 150px;
  height: 150px;
  border-radius: 55%;
  border: 3px #2d303a solid;
  cursor: pointer;
  user-select: none;
}
.avatar:hover {
  filter: brightness(110%);
}
.button-wrapper {
  display: inline-block;
  position: absolute;
  bottom: 0;
  right: 0;
}
.button-wrapper button {
  margin: 10px;
}
.radar-section {
  flex: 1 2;
  flex-direction: column;
  flex-basis: 500px;
  display: flex;
  align-items: center;
}
.radar-block {
  width: 100%;
  height: 400px;
}
.module-card {
  max-width: 900px;
  padding: 30px;
  border-radius: 10px;
  margin: auto;
  margin-bottom: 30px;
  overflow: hidden;
}
.module-card input,
.module-card textarea {
  border-radius: 6px;
  padding: 10px;
  min-width: 59%;
  max-width: 100%;
  outline: 0;
  background: #d5d7de;
  border: 3px solid #d5d7de;
  border-radius: 3px;
}
.module-card > div {
  margin: 0 0 10px 0;
}
.module-card > h3 {
  text-align: left;
  border-bottom: 2px solid gray;
  padding-bottom: 10px;
  margin-bottom: 20px;
  position: relative;
}
.module-card label {
  padding: 20px 10px;
  width: 40%;
  float: left;
  text-align: right;
  line-height: 100%;
}
.module-card-list {
  text-align: left;
  letter-spacing: 2px;
  margin: 0; /* 移除多餘 margin */
  padding: 0; /* 移除多餘 padding */
  line-height: 1.2; /* 調小行高 */
}
label[for] {
  cursor: pointer;
}
.modify-password > :first-child {
  text-transform: none !important;
}
pre {
  font-family: sans-serif, Arial, "Microsoft JhengHei", "STHeiti";
}
</style>
