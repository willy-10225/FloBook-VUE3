<template>
  <section class="profile">
    <header v-if="versionOption.beta">
      <img class="avatar" :src="avatar.img" />
    </header>
    <section class="radar-section" v-if="versionOption.beta">
      <div class="radar-block">
        <single-radar></single-radar>
      </div>
    </section>
    <section class="information">
      <v-card class="module-card" elevation="10">
        <v-card-title>
          {{ $t("account.personal") }}
          <div class="button-wrapper">
            <v-btn
              class="modify-password"
              color="primary"
              @click="isModifyingPassword = true"
            >
              {{ $t("account.modify-password") }}
            </v-btn>
            <v-btn color="teal" v-if="!isEditing" @click="beginEditing">
              {{ $t("common.edit") }}
            </v-btn>
            <v-btn color="grey" v-if="isEditing" @click="cancelEditing">
              {{ $t("common.cancel") }}
            </v-btn>
            <v-btn color="primary" v-if="isEditing" @click="confirmEditing">
              {{ $t("common.confirm") }}
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <div v-if="isEditing">
            <v-form ref="infoForm" v-model="isFormValid">
              <v-text-field
                v-model="info.account"
                :label="$t('account.account')"
                :rules="necessaryRules"
                disabled
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="info.displayName"
                :label="$t('account.displayName')"
                :rules="displayNameRules"
                variant="outlined"
                density="comfortable"
                autofocus
              />
              <v-text-field
                v-model="info.email"
                :label="$t('account.email')"
                :rules="emailRules"
                type="email"
                variant="outlined"
                density="comfortable"
              />
            </v-form>
          </div>

          <div v-if="!isEditing" class="module-card-list">
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label-td">{{ $t("account.account") }}</td>
                  <td class="value-td">{{ info.account }}</td>
                </tr>
                <tr>
                  <td class="label-td">{{ $t("account.displayName") }}</td>
                  <td class="value-td">{{ info.displayName }}</td>
                </tr>
                <tr>
                  <td class="label-td">{{ $t("account.email") }}</td>
                  <td class="value-td">{{ info.email }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="module-card" elevation="5">
        <v-card-title>{{ $t("setting.group-management") }}</v-card-title>
        <v-card-text>
          <section class="group-card-wrapper">
            <group-card
              v-for="(group, index) in groups"
              :key="'group' + index"
              :group="group"
              :index="index"
              @pleaseUpdateGroupCard="getGroupCardData"
            />
          </section>
        </v-card-text>
      </v-card>

      <!-- Password Modification Dialog -->
      <ConfirmDialog
        :title="$t('account.modify-password')"
        :openAlert="isModifyingPassword"
        :safeOption="$t('common.cancel')"
        :dangerOption="$t('common.confirm')"
        confirmColor="primary"
        @closeConfirmDialog="modifyPassword"
      >
        <template #body>
          <v-form ref="passwordForm" v-model="isFormValid" lazy-validation>
            <!-- 舊密碼 -->
            <v-text-field
              v-model="info.oldPassword"
              :label="$t('account.old-password')"
              :type="visibility.old ? 'text' : 'password'"
              :append-inner-icon="visibility.old ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="passwordRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              autofocus
              @click:append-inner="visibility.old = !visibility.old"
            />

            <!-- 新密碼 -->
            <v-text-field
              v-model="info.newPassword"
              :label="$t('account.new-password')"
              :type="visibility.new ? 'text' : 'password'"
              :append-inner-icon="visibility.new ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="passwordRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              @click:append-inner="visibility.new = !visibility.new"
            />

            <!-- 確認密碼 -->
            <v-text-field
              v-model="info.confirmPassword"
              :label="$t('account.passwordConfirm')"
              :type="visibility.con ? 'text' : 'password'"
              :append-inner-icon="visibility.con ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="confirmPasswordRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              @click:append-inner="visibility.con = !visibility.con"
            />
          </v-form>
        </template>
      </ConfirmDialog>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import SingleRadar from "@/components/Track/SingleRadar.vue"
import GroupCard from "@/components/Account/GroupCard.vue"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import {
  apiModifyProfile,
  apiModifyPassword,
  apiGetAllGroups,
} from "@/assets/ts/api"

// Types
interface UserInfo {
  displayName: string
  account: string
  email: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
  isAdmin: boolean
  userId?: string | number
}

export interface Group {
  id: number
  name: string
  members?: string

  inByGroup?: string
  leaveByGroup?: string
  inByUser?: string
  leaveByUser?: string

  isInPendingByUser?: boolean
  isLeavePendingByUser?: boolean
  isInPendingByGroup?: boolean
  isLeavePendingByGroup?: boolean
}

type ValidationResult = string | boolean
type ValidationRule = (value: any) => ValidationResult

// Composables
const { t } = useI18n()
const store = useStore()
const router = useRouter()

// Reactive data
const avatar = ref({
  img: "/img/Account/default-user.png",
})

const info = ref<UserInfo>({
  displayName: "",
  account: "",
  email: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
  isAdmin: false,
})

const infoSnapshot = ref<UserInfo>({} as UserInfo)
const isEditing = ref(false)
const isModifyingPassword = ref(false)
const isFormValid = ref(false)
const isPasswordFormValid = ref(false)

const visibility = ref({
  old: false,
  new: false,
  con: false,
})

const groups = ref<Group[]>()

// Form refs
const infoForm = ref()
const passwordForm = ref()

// Computed properties
const userInfo = computed(() => store.getters.userInfo)
const versionOption = computed(() => store.getters.versionOption)

const necessaryRules = computed((): ValidationRule[] => [
  (val: any) => {
    if (Array.isArray(val)) {
      return !!val.length || t("validate.required")
    }
    return !!val || t("validate.required")
  },
])

const displayNameRules = computed((): ValidationRule[] => [
  (val: string) => !!val || t("validate.required"),
  (val: string) =>
    /^([\u4E00-\u9FFF]|\w|\s|[[\]])+$/.test(val) ||
    t("validate.wrongNameFormat"),
])

const emailRules = computed((): ValidationRule[] => [
  (val: string) => !!val || t("validate.required"),
  (val: string) =>
    /^[A-Za-z]\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/.test(
      val
    ) || t("validate.wrongMailFormat"),
])

const passwordRules = computed((): ValidationRule[] => [
  (val: string) => !!val || t("validate.required"),
  (val: string) =>
    (val.length >= 4 && val.length <= 32) || t("validate.wrongPasswordFormat"),
])

const confirmPasswordRules = computed((): ValidationRule[] => [
  (val: string) => !!val || t("validate.required"),
  (val: string) =>
    val === info.value.newPassword || t("validate.differentPassword"),
])

// Methods
const getUserInformation = (): void => {
  info.value.displayName = userInfo.value.displayName || ""
  info.value.account = userInfo.value.account || ""
  info.value.email = userInfo.value.email || ""
  info.value.isAdmin = userInfo.value.isAdmin || false
}

const beginEditing = (): void => {
  infoSnapshot.value = { ...info.value }
  isEditing.value = true
}

const cancelEditing = (): void => {
  info.value = { ...infoSnapshot.value }
  isEditing.value = false
}

const confirmEditing = async (): Promise<void> => {
  const isValid = await infoForm.value?.validate()

  if (isValid?.valid) {
    const payload = {
      userId: userInfo.value.userId,
      displayName: info.value.displayName,
      email: info.value.email,
    }

    try {
      const res = await apiModifyProfile(payload)
      if (res.data === "success") {
        store.dispatch("setUserInfo", {
          displayName: info.value.displayName,
          email: info.value.email,
        })
      }
      isEditing.value = false
    } catch (error) {
      console.error("Failed to modify profile:", error)
    }
  }
}

const modifyPassword = async (isConfirmed: boolean): Promise<void> => {
  if (isConfirmed) {
    const validation = await passwordForm.value?.validate()

    if (validation?.valid) {
      const payload = {
        userId: parseInt(userInfo.value.userId as string),
        oldPassword: info.value.oldPassword,
        newPassword: info.value.newPassword,
      }

      try {
        const res = await apiModifyPassword(payload)
        if (res.data !== "Reject") {
          store.dispatch("changeLoadingState", {
            showDialog: true,
            isLoading: false,
            isSuccess: true,
            showAction: true,
            message: t("account.modifyPasswordSuccess"),
          })
          isModifyingPassword.value = false
          store.dispatch("removeUserInfo")
          router.push({ name: "Login" })
        } else {
          store.dispatch("changeLoadingState", {
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            message: t("account.modifyPasswordFail"),
          })
        }
      } catch (error) {
        console.error("Failed to modify password:", error)
      }
    }
  } else {
    isModifyingPassword.value = false
    // Clear password fields
    info.value.oldPassword = ""
    info.value.newPassword = ""
    info.value.confirmPassword = ""
  }
}

const getGroupCardData = async (): Promise<void> => {
  try {
    const res = await apiGetAllGroups({ userId: userInfo.value.userId })
    groups.value = res.data
  } catch (err) {
    console.error("Failed to get group data:", err)
  }
}

// Lifecycle
onMounted(() => {
  getUserInformation()
  getGroupCardData()
})
</script>

<style scoped>
.v-btn {
  text-transform: none !important;
}
.info-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 20px;
  color: #fff;
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
  transform: translateX(-50%);
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

.button-wrapper .v-btn {
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
  background: #424242;
  max-width: 900px;
  padding: 30px;
  border-radius: 10px;
  margin: auto;
  margin-bottom: 30px;
  overflow: hidden;
}

.module-card :deep(.v-input input),
.module-card :deep(.v-input textarea) {
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

.module-card :deep(.v-card-title) {
  color: #fff;
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
  margin: 0;
  padding: 0;
  line-height: 1.2;
  font-family: sans-serif, Arial, "Microsoft JhengHei", "STHeiti";
}

label[for] {
  cursor: pointer;
}

.modify-password :deep(.v-btn__content) {
  text-transform: none !important;
}

.group-card-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
