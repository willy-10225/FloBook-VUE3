<template>
  <v-card class="group-card" elevation="5">
    <!-- Header -->
    <v-card-title class="group-card-head">
      <RedDot
        :show="showBrief && Number(notificationCount) > 0"
        :count="notificationCount"
      />
    </v-card-title>

    <!-- Body -->
    <v-card-text class="group-card-body">
      <!-- 簡略資訊 -->
      <div v-if="!isEditing && !isCreating">
        <v-simple-table class="group-info">
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
        </v-simple-table>
      </div>

      <!-- 申請中 / 離開中 -->
      <div v-if="showLeavingByGroup" class="group-applying">
        {{ $t("setting.group-ask-leaving") }}
      </div>

      <!-- 編輯表單 -->
      <div v-if="showDetail || isCreating">
        <v-form ref="groupFormRef" v-if="showDetail">
          <v-text-field
            v-model="group.name"
            :label="$t('setting.group') + ':'"
            :rules="necessaryRules"
            disabled
          ></v-text-field>

          <v-row>
            <v-col cols="8">
              <v-select
                v-model="newMember"
                :items="memberOptions"
                item-title="display_name"
                item-value="id"
                :label="$t('setting.invite-member') + ':'"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" @click="inviteNewMember(newMember)">
                {{ $t("common.submit") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-form ref="newGroup" v-if="isCreating">
          <v-text-field
            v-model="groupForm.name"
            :label="$t('setting.group') + ':'"
            :rules="necessaryRules"
          ></v-text-field>

          <v-select
            v-model="groupForm.initialMembers"
            :items="memberOptions"
            item-title="display_name"
            item-value="id"
            multiple
            chips
            :label="$t('setting.member') + ':'"
          ></v-select>
        </v-form>
      </div>

      <!-- 成員表格 -->
      <v-data-table
        v-if="showDetail"
        :headers="groupsHead"
        :items="memberObjects"
        class="setting-member-table"
        height="500"
        item-key="id"
        show-expand
        :sort-by.sync="sort.sortBy"
      >
        <template v-slot:item.data-table-expand="{ item }">
          <ul style="margin-left: 60px">
            <li>email: {{ item.email }}</li>
            <li>admin: {{ item.admin ? "Yes" : "No" }}</li>
          </ul>
        </template>

        <template #item.id="{ item }">
          <span
            style="color: #f44336"
            v-if="
              inByUser.includes(item.display_name) ||
              leaveByUser.includes(item.display_name)
            "
            >new</span
          >
          {{ item.id }}
        </template>

        <template #item.display_name="{ item }">
          {{ item.display_name }}
        </template>

        <template #item.status="{ item }">
          <span :style="item.statusStyle">{{ $t(item.status ?? "") }}</span>
        </template>

        <template #item.action="{ item }">
          <v-btn
            v-if="
              inByGroup.includes(item.display_name) ||
              leaveByGroup.includes(item.display_name)
            "
            icon
            color="#666"
            @click="kickMember(item)"
          >
            <v-icon>mdi-cancel</v-icon>
          </v-btn>

          <v-btn v-else icon color="error" @click="kickMember(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
    <v-divider
      style="
        width: 95%;
        margin: auto;
        margin-bottom: 10px;
        background-color: #888;
      "
    ></v-divider>
    <!-- Footer -->
    <v-card-actions class="group-card-footer">
      <v-btn
        v-if="!isCreating && showBrief"
        style="background-color: teal; color: white"
        @click="beginManagement"
      >
        {{ $t("common.manage") }}
      </v-btn>
      <v-btn v-if="showApplyButton" color="primary" @click="applyGroup">
        {{ $t("setting.group-apply") }}
      </v-btn>

      <v-btn v-if="isCreating" @click="$emit('pleaseCancelCreating')">{{
        $t("common.cancel")
      }}</v-btn>
      <v-btn v-if="isCreating" color="primary" @click="createGroup">{{
        $t("common.confirm")
      }}</v-btn>
    </v-card-actions>

    <!-- 確認對話框 -->
    <ConfirmDialog
      :title="$t('error.groupSettingNotAllowedError')"
      :openAlert="showWrongManipulation"
      :safeOption="$t('common.cancel')"
      :dangerOption="$t('common.confirm')"
      @closeConfirmDialog="$emit('pleaseUpdateGroupCard')"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue"
import { useStore } from "vuex"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import RedDot from "@/components/common/RedDot.vue"
import {
  apiGetAllMembers,
  apiSetGroupMember,
  apiCreateGroup,
} from "@/assets/ts/api"

interface MemberOption {
  id: number
  display_name: string
  email?: string
  admin?: boolean
  status?: string
  statusStyle?: Record<string, string>
}

interface Group {
  id?: number
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

const props = defineProps<{ group: Group }>()
const emit = defineEmits<{
  (e: "pleaseUpdateGroupCard"): void
  (e: "pleaseCancelCreating"): void
}>()

const store = useStore()

const memberOptions = ref<MemberOption[]>([])
const memberObjects = ref<MemberOption[]>([])
const newMember = ref<MemberOption | null>(null)
const sort = reactive<{ sortBy: { key: string; order: "asc" | "desc" }[] }>({
  sortBy: [{ key: "id", order: "asc" }],
})
const groupForm = reactive<GroupForm>({ name: "", initialMembers: [] })
const isEditing = ref(false)

const userInfo = computed(() => store.getters.userInfo)

const inByGroup = computed(() => props.group.inByGroup?.split(",") ?? [])
const inByUser = computed(() => props.group.inByUser?.split(",") ?? [])
const leaveByGroup = computed(() => props.group.leaveByGroup?.split(",") ?? [])
const leaveByUser = computed(() => props.group.leaveByUser?.split(",") ?? [])
const members = computed(() => props.group.members?.split(",") ?? [])
const memberNames = computed(
  () => props.group.members?.replace(/,/g, ", ") ?? ""
)
const isCreating = computed({
  get: () => props.group.isCreating ?? false,
  set: (val: boolean) => (props.group.isCreating = val),
})
const isInGroup = computed(
  () =>
    userInfo.value.name === "Administrator" ||
    memberNames.value.includes(userInfo.value.displayName)
)
const notificationCount = computed(() =>
  String(inByUser.value.length + leaveByUser.value.length)
)
const showApplyButton = computed(
  () =>
    !isInGroup.value &&
    !isEditing.value &&
    !isCreating.value &&
    !props.group.isInPendingByUser &&
    !props.group.isInPendingByGroup &&
    !props.group.isLeavePendingByGroup
)
const showBrief = computed(
  () =>
    isInGroup.value &&
    !isEditing.value &&
    !props.group.isLeavePendingByUser &&
    !props.group.isLeavePendingByGroup
)
const showDetail = computed(
  () =>
    isInGroup.value &&
    isEditing.value &&
    !props.group.isLeavePendingByUser &&
    !props.group.isLeavePendingByGroup
)
const showWrongManipulation = computed(
  () => !isInGroup.value && isEditing.value
)
const showLeavingByGroup = computed(
  () => leaveByGroup.value.length > 0 && inByGroup.value.length === 0
)

const groupsHead = [
  { title: "ID", key: "id", sortable: true },
  { title: "Name", key: "display_name", sortable: true },
  { title: "Status", key: "status" },
  { title: "Action", key: "action" },
]
const necessaryRules = [(v: any) => !!v || "Required"]

onMounted(() => {
  initMemberOptions().then(() => {
    initMemberObjects(props.group)
  })
})

watch(
  () => props.group,
  newVal => {
    initMemberObjects(newVal)
  },
  { deep: true }
)

async function initMemberOptions() {
  try {
    const res = await apiGetAllMembers()
    memberOptions.value = res.data
  } catch (err) {
    console.error(err)
  }
}

function initMemberObjects(group: Group) {
  const memberHere = [...members.value, ...inByGroup.value, ...inByUser.value]
  const results = memberOptions.value.filter(m =>
    memberHere.includes(m.display_name)
  )
  results.forEach(m => {
    if (leaveByGroup.value.includes(m.display_name)) {
      m.status = "setting.group-asked-leaving"
      m.statusStyle = { color: "#f44336" }
    } else if (leaveByUser.value.includes(m.display_name)) {
      m.status = "setting.group-leaving"
      m.statusStyle = { color: "#f44336" }
    } else if (inByGroup.value.includes(m.display_name)) {
      m.status = "setting.group-inviting"
      m.statusStyle = { color: "#5daeff" }
    } else if (inByUser.value.includes(m.display_name)) {
      m.status = "setting.group-applying"
      m.statusStyle = { color: "#5daeff" }
    } else {
      m.status = ""
      m.statusStyle = { color: "#5daeff" }
    }
  })
  memberObjects.value = results
}

function requestSetGroupMember(payload: any) {
  apiSetGroupMember(payload)
    .then(res => {
      if (res.data === "success") {
        emit("pleaseUpdateGroupCard")
      }
    })
    .catch(err => console.error(err))
}

function inviteNewMember(newMember: MemberOption | null) {
  if (!newMember) return
  const exists = memberObjects.value.find(m => m.id === newMember?.id)
  if (!exists) {
    requestSetGroupMember({
      groupNum: props.group.id,
      userId: newMember.id,
      isIn: true,
    })
    newMember = null
  } else {
    console.warn("Already in group")
  }
}

function kickMember(member: MemberOption) {
  if (!props.group.id || !member.id) return
  requestSetGroupMember({
    groupNum: props.group.id,
    userId: member.id,
    isIn: false,
  })
}

function beginManagement() {
  memberObjects.value = [...memberObjects.value]
  isEditing.value = true
}

function applyGroup() {
  if (!props.group.id || !userInfo.value.userId) return
  requestSetGroupMember({
    groupNum: props.group.id,
    userId: userInfo.value.userId,
    isIn: true,
  })
}

function createGroup() {
  if (!groupForm.name) return
  apiCreateGroup({
    name: groupForm.name,
    originalMembers: groupForm.initialMembers,
  }).then(() => {
    emit("pleaseUpdateGroupCard")
    isCreating.value = false
  })
}
</script>

<style scoped>
.group-card {
  background: #777;
  padding: 10px 0 20px 0;
  margin: 10px 2px 10px 2px;
  border-radius: 10px;
  width: 100%;
}
.group-card-head {
  position: relative;
  height: 30px;
  right: 20px;
}
.group-card-body {
  color: #ffffff;
  margin: 0 20px 20px 20px;
}
.group-info {
  border-spacing: 10px;
}
.group-info tr {
  text-align: left;
}
.group-info tr td:first-child {
  width: 120px;
}
.group-applying {
  display: inline-block;
  background: #999;
  height: 40px;
  border-radius: 10px;
  font-stretch: 100%;
  line-height: 40px;
  padding: 0 10px 0 10px;
}
.group-card-footer {
  position: relative;
}
.group-leave {
  position: absolute;
  display: inline-block;
  top: 0;
  right: 20px;
}
.group-delete {
  position: absolute;
  display: inline-block;
  top: 0;
  left: 20px;
}
.form-wrapper {
  padding: 0 10px 25px 10px;
}
.approve-button {
  margin: 5px 0;
}
.setting-member-table td {
  word-break: break-word;
  cursor: pointer;
}
</style>
