<template>
  <v-card class="group-card" elevation="5">
    <red-dot
      :show="showBrief && notificationCount > 0"
      :count="notificationCount"
      class="red-dot-position"
    />

    <v-card-text class="group-card-body">
      <!-- Brief Info Display -->
      <div v-if="!isEditing && !isCreating">
        <v-table class="group-info">
          <tbody>
            <tr>
              <td>{{ $t("setting.group") }}:</td>
              <td>{{ group.name }}</td>
            </tr>
            <tr v-if="showBrief">
              <td>{{ $t("setting.member") }}:</td>
              <td>{{ memberNames }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Leaving Request Display -->
      <div v-if="showLeavingByGroup" class="group-applying">
        {{ $t("setting.group-ask-leaving") }}
      </div>

      <!-- Detail Form -->
      <div class="form-wrapper">
        <v-form v-if="showDetail" ref="detailForm">
          <v-text-field
            v-model="name"
            :label="$t('setting.group')"
            disabled
            variant="outlined"
          />

          <v-row>
            <v-col cols="8">
              <v-select
                v-model="selectedMemberName"
                :label="$t('setting.invite-member')"
                :items="memberOptions.map(m => m.display_name)"
                variant="underlined"
              />
            </v-col>
            <v-col cols="4">
              <v-btn
                color="primary"
                @click="inviteNewMember(getSelectedMember())"
                :disabled="!selectedMemberName"
              >
                {{ $t("common.submit") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <!-- Create Group Form -->
        <v-form v-if="isCreating" ref="newGroupForm">
          <v-text-field
            v-model="groupForm.name"
            :label="$t('setting.group')"
            :rules="[rules.required]"
            variant="outlined"
            class="dark-text-field"
          />
          <v-select
            v-model="selectedMembers"
            :label="$t('setting.member')"
            :items="memberOptions"
            item-title="display_name"
            item-value="id"
            variant="underlined"
            chips
            multiple
          />
        </v-form>
      </div>

      <!-- Members Data Table -->
      <v-data-table
        v-if="showDetail"
        :headers="groupsHeaders"
        :items="memberObjects"
        :sort-by="sortBy"
        class="setting-member-table"
        density="compact"
        height="500"
        theme="dark"
        hide-default-footer
      >
        <template v-slot:item.id="{ item }">
          <div class="text-center">
            <span
              v-if="
                inByUser.includes(item.display_name) ||
                leaveByUser.includes(item.display_name)
              "
              class="text-error"
            >
              new
            </span>
            {{ item.id }}
          </div>
        </template>

        <template v-slot:item.display_name="{ item }">
          <div class="text-center">{{ item.display_name }}</div>
        </template>

        <template v-slot:item.status="{ item }">
          <div class="text-center" :style="item.statusStyle">
            {{ $t(item.status) }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="text-center">
            <v-btn
              v-if="
                inByGroup.includes(item.display_name) ||
                leaveByGroup.includes(item.display_name)
              "
              icon="mdi-cancel"
              variant="text"
              @click="kickMember(item)"
            >
              <i class="material-icons">cancel</i>
            </v-btn>
            <confirm-button
              v-else-if="
                !inByUser.includes(item.display_name) &&
                !leaveByUser.includes(item.display_name)
              "
              class="approve-button"
              icon="mdi-trash"
              smalls
              danger
              :message="$t('setting.confirm-kick')"
              @confirm="kickMember(item)"
              ><i class="material-icons">delete</i>
            </confirm-button>
          </div>
        </template>

        <template v-slot:item.apply="{ item }">
          <div v-if="inByUser.includes(item.display_name)" class="text-center">
            <confirm-button
              class="approve-button"
              danger
              small
              fab
              :message="$t('setting.confirm-deny')"
              @confirm="approveApply(item.display_name, false)"
            >
              {{ $t("setting.deny") }}
            </confirm-button>
            <confirm-button
              class="approve-button"
              small
              fab
              :message="$t('setting.confirm-approve')"
              @confirm="approveApply(item.display_name, true)"
            >
              {{ $t("setting.approve") }}
            </confirm-button>
          </div>
        </template>

        <template v-slot:item.leave="{ item }">
          <div
            v-if="leaveByUser.includes(item.display_name)"
            class="text-center"
          >
            <confirm-button
              class="approve-button"
              danger
              fab
              small
              :message="$t('setting.confirm-deny')"
              @confirm="approveApply(item.display_name, true)"
            >
              {{ $t("setting.deny") }}
            </confirm-button>
            <confirm-button
              class="approve-button"
              fab
              small
              :message="$t('setting.confirm-approve')"
              @confirm="approveApply(item.display_name, false)"
            >
              {{ $t("setting.approve") }}
            </confirm-button>
          </div>
        </template>

        <template v-slot:expanded-row="{ item }">
          <tr>
            <td colspan="6" class="pa-4">
              <ul>
                <li>email: {{ item.email }}</li>
                <li>admin: {{ item.admin ? "Yes" : "No" }}</li>
              </ul>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>

    <v-divider class="mx-4 mb-2" />

    <v-card-actions class="group-card-footer">
      <div v-if="!isCreating" class="w-100">
        <v-row justify="center">
          <v-btn
            v-if="showBrief"
            color="teal"
            base-color="teal"
            class="custom-btn"
            @click="beginManagement"
          >
            {{ $t("common.manage") }}
          </v-btn>
        </v-row>

        <v-btn
          v-if="showApplyButton"
          color="primary"
          variant="flat"
          @click="applyGroup"
        >
          {{ $t("setting.group-apply") }}
        </v-btn>

        <div v-if="!isInGroup && isInPendingByUser" class="group-applying">
          {{ $t("setting.group-applying") }}
        </div>

        <div v-if="showLeavingByGroup" class="d-flex ga-2 justify-center">
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmLeaveByGroup(false)"
          >
            {{ $t("setting.deny") }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmLeaveByGroup(true)"
          >
            {{ $t("common.confirm") }}
          </v-btn>
        </div>

        <div v-if="showInvitingByGroup" class="d-flex ga-2 justify-center">
          <v-btn color="error" @click="denyInviting">
            {{ $t("setting.deny") }}
          </v-btn>
          <v-btn color="primary" @click="applyGroup">
            {{ $t("common.agree") }}
          </v-btn>
        </div>

        <div v-if="showDetail" class="d-flex justify-space-between w-100">
          <confirm-button
            v-if="showDeleteButton"
            icon="mdi-delete"
            class="group-delete"
            variant="text"
            small
            fab
            danger
            :message="$t('setting.confirm-delete-group')"
            @confirm="deleteGroup()"
          >
            <i class="material-icons">delete</i>
          </confirm-button>

          <v-row justify="center" class="gap-4">
            <v-col cols="auto">
              <v-btn @click="isEditing = false" class="group-cancel">
                {{ $t("common.cancel") }}
              </v-btn>
            </v-col>

            <v-col cols="auto">
              <confirm-button
                color="error"
                danger
                fab
                class="group-leave"
                :message="$t('setting.confirm-leave')"
                @confirm="sendLeavingRequest()"
              >
                {{ $t("setting.group-leave") }}
              </confirm-button>
            </v-col>
          </v-row>
        </div>

        <div v-if="showLeavingApplying" class="group-applying">
          {{ $t("setting.group-leaving") }}
        </div>
      </div>

      <div v-if="isCreating" class="d-flex justify-center ga-2 w-100">
        <v-btn
          variant="flat"
          color="grey-darken-3"
          height="36"
          min-width="88"
          @click="$emit('pleaseCancelCreating')"
        >
          {{ $t("common.cancel") }}
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          height="36"
          min-width="88"
          @click="createGroup"
        >
          {{ $t("common.confirm") }}
        </v-btn>
      </div>
    </v-card-actions>

    <confirm-dialog
      :title="$t('error.groupSettingNotAllowedError')"
      :open-alert="showWrongManipulation"
      :safe-option="$t('common.cancel')"
      :danger-option="$t('common.confirm')"
      :sec="0"
      confirm-color="primary"
      @close-confirm-dialog="$emit('pleaseUpdateGroupCard')"
    />
  </v-card>
</template>

<script setup lang="ts">
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import ConfirmButton from "@/components/common/ConfirmButton.vue"
import RedDot from "@/components/common/RedDot.vue"
import { ref, computed, watch, onMounted } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import {
  apiGetAllMembers,
  apiSetGroupMember,
  apiCreateGroup,
  apiDeleteGroup,
} from "@/assets/ts/api"
import { shallowRef } from "vue"
// Types
interface Member {
  id: number
  display_name: string
  email: string
  admin: boolean
  status: string
  statusStyle?: {
    color: string
  }
}

interface Group {
  id: number
  name?: string
  members?: string
  inByGroup?: string
  inByUser?: string
  leaveByGroup?: string
  leaveByUser?: string
  isInPendingByGroup?: boolean
  isInPendingByUser?: boolean
  isLeavePendingByGroup?: boolean
  isLeavePendingByUser?: boolean
  isCreating?: boolean
}

interface GroupForm {
  name: string
  initialMembers: number[]
}

interface UserInfo {
  userId: string
  displayName: string
  name: string
  isAdmin: boolean
}

// Props
interface Props {
  group: Group
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  pleaseUpdateGroupCard: []
  pleaseCancelCreating: []
}>()

// Composables
const store = useStore()
const { t } = useI18n()
const route = useRoute()
const selectedMembers = ref<number[]>([])
const selectedMemberName = ref<string>("")
// Refs
const memberOptions = ref<Member[]>([])
const isEditing = ref(false)
const memberObjects = ref<Member[]>([])
const newMember = ref<Member | null>(null)

const sortBy = ref<Array<{ key: string; order?: "asc" | "desc" }>>([
  { key: "id", order: "asc" },
])
const detailForm = ref()
const newGroupForm = ref()

const groupForm = ref<GroupForm>({
  name: "",
  initialMembers: [],
})

// Computed
const userInfo = computed((): UserInfo => store.getters.userInfo)
const id = computed(() => props.group.id ?? null)

const name = computed({
  get: () => props.group.name ?? "",
  set: (val: string) => {
    if (props.group.name !== undefined) {
      props.group.name = val
    }
  },
})
const getSelectedMember = (): Member | null => {
  if (!selectedMemberName.value) return null
  return (
    memberOptions.value.find(
      m => m.display_name === selectedMemberName.value
    ) || null
  )
}

const inByGroup = computed(() =>
  props.group.inByGroup ? props.group.inByGroup.split(",") : []
)

const inByUser = computed(() =>
  props.group.inByUser ? props.group.inByUser.split(",") : []
)

const isInPendingByGroup = computed(
  () => props.group.isInPendingByGroup ?? false
)

const isInPendingByUser = computed(() => props.group.isInPendingByUser ?? false)

const isLeavePendingByGroup = computed(
  () => props.group.isLeavePendingByGroup ?? false
)

const isLeavePendingByUser = computed(
  () => props.group.isLeavePendingByUser ?? false
)

const leaveByGroup = computed(() =>
  props.group.leaveByGroup ? props.group.leaveByGroup.split(",") : []
)

const leaveByUser = computed(() =>
  props.group.leaveByUser ? props.group.leaveByUser.split(",") : []
)

const members = computed(() =>
  props.group.members ? props.group.members.split(",") : []
)

const memberNames = computed(() =>
  props.group.members ? props.group.members.replace(/,/g, ", ") : ""
)

const isCreating = computed({
  get: () => props.group.isCreating ?? false,
  set: (val: boolean) => {
    if (props.group.isCreating !== undefined) {
      props.group.isCreating = val
    }
  },
})

const isInGroup = computed(
  () =>
    userInfo.value.name === "Administrator" ||
    memberNames.value.includes(userInfo.value.displayName)
)

const notificationCount = computed(
  () => inByUser.value.length + leaveByUser.value.length
)

const showApplyButton = computed(
  () =>
    !isInGroup.value &&
    !isEditing.value &&
    !isCreating.value &&
    !isInPendingByUser.value &&
    !isInPendingByGroup.value &&
    !isLeavePendingByGroup.value
)

const showInvitingByGroup = computed(
  () =>
    !isInGroup.value &&
    !isEditing.value &&
    !isCreating.value &&
    !isInPendingByUser.value &&
    isInPendingByGroup.value &&
    !isLeavePendingByGroup.value
)

const showBrief = computed(
  () =>
    isInGroup.value &&
    !isEditing.value &&
    !isLeavePendingByUser.value &&
    !isLeavePendingByGroup.value
)

const showDetail = computed(
  () =>
    isInGroup.value &&
    isEditing.value &&
    !isLeavePendingByUser.value &&
    !isLeavePendingByGroup.value
)

const showLeavingApplying = computed(
  () => isInGroup.value && !isEditing.value && isLeavePendingByUser.value
)

const showLeavingByGroup = computed(() => {
  return isInGroup.value && !isEditing.value && isLeavePendingByGroup.value
})

const showWrongManipulation = computed(
  () => !isInGroup.value && isEditing.value
)

const showDeleteButton = computed(() => route.name === "Setting")

const groupsHeaders = computed(() => [
  {
    title: t("account.id"),
    key: "id",
    width: 80,
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("account.displayName"),
    key: "display_name",
    width: 200,
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("common.status"),
    key: "status",
    width: 136,
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("setting.group-kick"),
    key: "actions",
    width: 100,
    align: "center" as const,
    sortable: false,
  },
  {
    title: t("setting.group-applying"),
    key: "apply",
    width: 130,
    align: "center" as const,
    sortable: false,
  },
  {
    title: t("setting.group-leaving"),
    key: "leave",
    width: 130,
    align: "center" as const,
    sortable: false,
  },
])

// Validation rules
const rules = {
  required: (value: string) => !!value || t("validate.required"),
  requiredArray: (array: any[]) =>
    (Array.isArray(array) ? !!array.length : true) || t("validate.required"),
}

// Methods
const changeLoadingState = (state: any) => {
  store.dispatch("changeLoadingState", state)
}

const initMemberOptions = async (): Promise<void> => {
  try {
    const res = await apiGetAllMembers()
    memberOptions.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const initMemberObjects = (group: Group) => {
  let memberHere = group.members ? group.members.split(",") : []
  memberHere = memberHere.concat(inByGroup.value)
  memberHere = memberHere.concat(inByUser.value)

  let results = memberOptions.value.filter(m =>
    memberHere.includes(m.display_name)
  )

  results.forEach(m => {
    switch (true) {
      case leaveByGroup.value.includes(m.display_name):
        m.status = "setting.group-asked-leaving"
        m.statusStyle = { color: "#f44336" }
        break
      case leaveByUser.value.includes(m.display_name):
        m.status = "setting.group-leaving"
        m.statusStyle = { color: "#f44336" }
        break
      case inByGroup.value.includes(m.display_name):
        m.status = "setting.group-inviting"
        m.statusStyle = { color: "#5daeff" }
        break
      case inByUser.value.includes(m.display_name):
        m.status = "setting.group-applying"
        m.statusStyle = { color: "#5daeff" }
        break
      default:
        m.status = ""
        m.statusStyle = { color: "#5daeff" }
    }
  })

  // Sort priority: inByGroup, leaveByGroup, inByUser, leaveByUser
  const sortPriority = (member: Member): number => {
    if (inByUser.value.includes(member.display_name)) return 0
    if (leaveByUser.value.includes(member.display_name)) return 1
    if (inByGroup.value.includes(member.display_name)) return 2
    if (leaveByGroup.value.includes(member.display_name)) return 3
    return 4
  }

  results.sort((a, b) => sortPriority(a) - sortPriority(b))
  memberObjects.value = results
}

const requestSetGroupMember = async (payload: any) => {
  try {
    const res = await apiSetGroupMember(payload)
    if (res.data === "success") {
      emit("pleaseUpdateGroupCard")
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: true,
        showAction: true,
      })
    } else {
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
        error: "groupSettingError",
      })
    }
  } catch (err) {
    console.error(err)
  }
}

const applyGroup = () => {
  const payload = {
    groupNum: props.group.id,
    userId: parseInt(userInfo.value.userId),
    isIn: true,
    isUser: true,
    isAdmin: userInfo.value.isAdmin,
  }
  requestSetGroupMember(payload)
}

const denyInviting = () => {
  const payload = {
    groupNum: props.group.id,
    userId: parseInt(userInfo.value.userId),
    isIn: false,
    isUser: true,
    isAdmin: userInfo.value.isAdmin,
  }
  requestSetGroupMember(payload)
}

const beginManagement = () => {
  isEditing.value = true
}

const createGroup = async () => {
  const { valid } = await newGroupForm.value.validate()
  if (valid) {
    const payload = {
      name: groupForm.value.name,
      originalMembers: [...selectedMembers.value],
    }
    try {
      const res = await apiCreateGroup(payload)
      if (res.data) {
        emit("pleaseUpdateGroupCard")
        changeLoadingState({
          showDialog: true,
          isLoading: false,
          isSuccess: true,
          showAction: true,
        })
      } else {
        changeLoadingState({
          showDialog: true,
          isLoading: false,
          isSuccess: false,
          showAction: true,
          error: "groupSettingError",
        })
      }
    } catch (err) {
      console.error(err)
    }

    isCreating.value = false
  }
}

const inviteNewMember = (member: Member | null) => {
  if (!member) return

  if (!memberObjects.value.find(m => m.id === member.id)) {
    const payload = {
      groupNum: props.group.id,
      userId: member.id,
      isIn: true,
      isUser: false,
      isAdmin: userInfo.value.isAdmin,
    }

    requestSetGroupMember(payload)
    newMember.value = null
  } else {
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "alreadyInGroup",
    })
  }
}

const kickMember = (member: Member) => {
  if (member.id === parseInt(userInfo.value.userId)) {
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "groupSettingNotAllowedError",
    })
  } else if (inByGroup.value.includes(member.display_name)) {
    const payload = {
      groupNum: props.group.id,
      userId: member.id,
      isIn: false,
      isUser: true,
      isAdmin: userInfo.value.isAdmin,
    }
    requestSetGroupMember(payload)
  } else if (leaveByGroup.value.includes(member.display_name)) {
    const payload = {
      groupNum: props.group.id,
      userId: member.id,
      isIn: true,
      isUser: true,
      isAdmin: userInfo.value.isAdmin,
    }
    requestSetGroupMember(payload)
  } else {
    const payload = {
      groupNum: props.group.id,
      userId: member.id,
      isIn: false,
      isUser: false,
      isAdmin: userInfo.value.isAdmin,
    }
    requestSetGroupMember(payload)
  }
}

const deleteGroup = async () => {
  const payload = { id: props.group.id }
  try {
    const res = await apiDeleteGroup(payload)
    if (res.data === "success") {
      emit("pleaseUpdateGroupCard")
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: true,
        showAction: true,
      })
    } else {
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
        error: "groupSettingError",
      })
    }
  } catch (err) {
    console.error(err)
  }
  isEditing.value = false
}

const sendLeavingRequest = () => {
  const payload = {
    groupNum: props.group.id,
    userId: parseInt(userInfo.value.userId),
    isIn: false,
    isUser: true,
    isAdmin: userInfo.value.isAdmin,
  }

  if (
    members.value.length -
      leaveByGroup.value.length -
      leaveByUser.value.length >
    1
  ) {
    requestSetGroupMember(payload)
    isEditing.value = false
  } else {
    changeLoadingState({
      showDialog: true,
      isLoading: false,
      isSuccess: false,
      showAction: true,
      error: "groupSettingNotAllowedError",
    })
  }
}

const confirmLeaveByGroup = (wantToLeave: boolean) => {
  const payload = {
    groupNum: props.group.id,
    userId: parseInt(userInfo.value.userId),
    isIn: !wantToLeave,
    isUser: true,
    isAdmin: userInfo.value.isAdmin,
  }
  requestSetGroupMember(payload)
}

const approveApply = (name: string, isApproved: boolean) => {
  const member = memberOptions.value.find(u => u.display_name === name)
  if (!member) return

  const payload = {
    groupNum: props.group.id,
    userId: member.id,
    isIn: isApproved,
    isUser: false,
    isAdmin: userInfo.value.isAdmin,
  }
  requestSetGroupMember(payload)
}

// Watchers
watch(
  () => props.group,
  value => {
    initMemberObjects(value)
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  await initMemberOptions()
  initMemberObjects(props.group)
})
</script>

<style scoped>
.red-dot-position {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}
/* 針對 v-select 的 input 背景 */
:deep(.v-field__input input) {
  background-color: transparent !important; /* 背景透明 */
  color: white !important; /* 文字白色 */
  border: none !important; /* 去掉邊框 */
}

/* optional: 去掉整個 v-input__control 背景 */
:deep(.v-input__control) {
  background-color: transparent !important;
}

/* label 白色 */
:deep(.v-field-label) {
  color: white !important;
}

.group-cancel {
  background-color: black !important;
  color: white !important;
  width: 88px;
}
.group-leave {
  position: absolute;
  display: inline-block;
  right: 20px;
  width: 88px;
}
.group-delete {
  position: absolute;
  display: inline-block;
  left: 20px;
}
.custom-btn {
  width: 88px; /* 自訂寬度 */
  height: 36px; /* 自訂高度 */
  color: white !important; /* 文字白色 */
  font-weight: bold; /* 粗體（可選） */
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: center; /* 水平置中 */
  background-color: #009688;
}
.group-card {
  background: #777;
  width: 100%;
  border-radius: 10px;
  margin: 10px 2px;
  overflow: visible; /*加入後能使red-dot不被覆蓋*/
}

.group-card-head {
  position: relative;
  height: 30px;
  right: 20px;
}

.group-card-body {
  margin: 0 20px 20px 20px;
}

.group-info {
  border-spacing: 10px;
  background-color: transparent !important; /* 透明背景 */
  color: white;
  font-size: 18px;
}
.group-info table,
.group-info th,
.group-info td {
  border: none !important;
}

.group-info tr {
  text-align: left;
}

.group-info tr td:first-child {
  width: 120px;
}

.group-applying {
  color: white;
  display: inline-block;
  background: #999;
  height: 40px;
  border-radius: 10px;
  line-height: 40px;
  padding: 0 10px;
}

.form-wrapper {
  padding: 0 10px 25px 10px;
}

.approve-button {
  margin: 5px 0;
}

.setting-member-table :deep(td) {
  word-break: break-word;
  cursor: pointer;
}
</style>
