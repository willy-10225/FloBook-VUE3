<template>
  <v-container fluid class="pa-0">
    <v-tabs
      v-model="activeTab"
      slider-color="yellow"
      bg-color="grey-darken-3"
      fixed-tabs
    >
      <v-tab class="setting-tab">{{ $t("setting.account-list") }}</v-tab>
      <v-tab class="setting-tab">{{ $t("setting.account-approval") }}</v-tab>
      <v-tab class="setting-tab">{{ $t("setting.admin-setting") }}</v-tab>
      <v-tab class="setting-tab">{{ $t("setting.group-management") }}</v-tab>
      <v-tab class="setting-tab">{{ $t("setting.permission-setting") }}</v-tab>
      <v-tab class="setting-tab">{{ $t("setting.list-setting") }}</v-tab>
      <v-tab class="setting-tab">{{ $t("setting.monitoring") }}</v-tab>
    </v-tabs>

    <v-tab-item v-if="activeTab === 0">
      <v-card class="setting-function-card" elevation="5">
        <h2 class="text-white my-5">{{ $t("setting.account-list") }}</h2>
        <v-data-table
          striped="even"
          class="setting-member-table"
          :headers="membersHead"
          :items="members"
          :sort-by="[{ key: 'id', order: 'asc' }]"
          height="500"
          theme="dark"
          hide-default-footer
        >
          <template #item.id="{ item }">
            <div class="text-center">{{ item.id }}</div>
          </template>
          <template #item.display_name="{ item }">
            <div class="text-center">{{ item.display_name }}</div>
          </template>
          <template #item.email="{ item }">
            <div class="text-center">{{ item.email }}</div>
          </template>
          <template #item.admin="{ item }">
            <div class="text-center">{{ item.admin ? "yes" : "-" }}</div>
          </template>
          <template #item.reset="{ item }">
            <div class="text-center">
              <v-btn
                size="small"
                color="primary"
                @click="openResetPasswordAlert(item.id)"
              >
                {{ $t("common.reset") }}
              </v-btn>
            </div>
          </template>
          <template #item.delete="{ item }">
            <div class="text-center">
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="openRemoveAccountAlert(item.id)"
              />
            </div>
          </template>
        </v-data-table>

        <confirm-dialog
          :title="$t('setting.confirm-reset-password')"
          :open-alert="alertResetPassword"
          :safe-option="$t('common.cancel')"
          :danger-option="$t('common.confirm')"
          confirm-color="primary"
          @close-confirm-dialog="resetPassword($event)"
        />
        <confirm-dialog
          :title="$t('setting.confirm-delete')"
          :open-alert="alertRemoveAccount"
          :safe-option="$t('common.cancel')"
          :danger-option="$t('common.confirm')"
          @close-confirm-dialog="removeAccount($event)"
        />
      </v-card>
    </v-tab-item>

    <v-tab-item v-if="activeTab === 1">
      <v-card class="setting-function-card" elevation="5">
        <h2 class="text-white my-5">{{ $t("setting.account-approval") }}</h2>
        <v-table class="setting-account-table">
          <thead>
            <tr>
              <th>{{ $t("account.id") }}</th>
              <th>{{ $t("account.displayName") }}</th>
              <th>{{ $t("account.email") }}</th>
              <th colspan="2">{{ $t("setting.approval") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pendingApproval" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.display_name }}</td>
              <td>{{ item.email }}</td>
              <td>
                <v-btn color="error" @click="onRejectClick(item.id)">
                  {{ $t("setting.deny") }}
                </v-btn>
              </td>
              <td>
                <v-btn color="primary" @click="onApproveClick(item.id)">
                  {{ $t("setting.approve") }}
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <confirm-dialog
          :title="$t('setting.confirm-approve')"
          :open-alert="showApproveConfirm"
          :safe-option="$t('common.cancel')"
          :danger-option="$t('common.confirm')"
          confirm-color="primary"
          @close-confirm-dialog="approveAccount($event, selectedUserId, true)"
        />
        <confirm-dialog
          :title="$t('setting.confirm-deny')"
          :open-alert="showRejectConfirm"
          :safe-option="$t('common.cancel')"
          :danger-option="$t('common.confirm')"
          @close-confirm-dialog="approveAccount($event, selectedUserId, false)"
        />
      </v-card>
    </v-tab-item>

    <v-tab-item v-if="activeTab === 2">
      <v-card class="setting-function-card" elevation="5">
        <section>
          <h2 class="text-white my-5">{{ $t("setting.admin-setting") }}</h2>
          <span class="text-white my-5"
            >{{ $t("setting.administrators") }}:</span
          >
          <div
            class="text-white my-5"
            style="display: inline-block; width: 80%"
            v-if="isAdminEditing"
          >
            <v-select
              v-if="isAdminEditing"
              v-model="form.administrators"
              :items="userOptions"
              item-title="display_name"
              item-value="id"
              return-object
              multiple
              chips
              variant="outlined"
            />
          </div>
          <span
            class="text-white my-5"
            v-else
            style="display: inline-block; width: 80%; text-align: left"
          >
            {{ form.administrators.map(m => m.display_name).join(", ") }}
          </span>
          <br /><br />
          <v-btn color="teal" v-if="!isAdminEditing" @click="beginModifyAdmin">
            {{ $t("common.modify") }}
          </v-btn>
          <v-btn v-if="isAdminEditing" @click="cancelModifyAdmin">
            {{ $t("common.cancel") }}
          </v-btn>
          <div style="display: inline-flex; width: 20px"></div>
          <v-btn
            color="primary"
            v-if="isAdminEditing"
            @click="showAdminConfirm = true"
          >
            {{ $t("common.confirm") }}
          </v-btn>
        </section>
        <confirm-dialog
          :title="$t('setting.confirm-modify')"
          :open-alert="showAdminConfirm"
          :safe-option="$t('common.cancel')"
          :danger-option="$t('common.confirm')"
          confirm-color="primary"
          @close-confirm-dialog="modifyAdmin($event)"
        />
      </v-card>
    </v-tab-item>

    <v-tab-item v-if="activeTab === 3">
      <v-card class="setting-function-card" elevation="5">
        <h2 class="text-white my-5">{{ $t("setting.group-management") }}</h2>
        <section class="group-card-wrapper">
          <group-card
            v-for="(group, index) in groups"
            :key="'group' + index"
            :group="group"
            @please-update-group-card="getAdminConfig"
            @please-cancel-creating="cancelCreating"
          />
        </section>
        <div class="setting-add-item-button" @click="createGroupCard">
          <v-ripple>+</v-ripple>
        </div>
      </v-card>
    </v-tab-item>

    <v-tab-item v-if="activeTab === 4">
      <v-card class="setting-function-card" elevation="5">
        <h2 class="text-white my-5">{{ $t("setting.permission-setting") }}</h2>
        <permission-card
          v-for="(item, index) in permissionConfigs"
          :key="'config' + index"
          :config="item"
          @please-update-permission-card="getAdminConfig"
        />
      </v-card>
    </v-tab-item>

    <v-tab-item v-if="activeTab === 5">
      <!-- 输入框弹出框 -->
      <v-overlay v-model="showInputBox" class="align-center justify-center">
        <v-card class="input-box">
          <v-card-text>
            <v-text-field
              v-model="listtablenewItem.Range"
              :label="$t('setting.InputBoxip')"
              variant="outlined"
            />
            <v-text-field
              v-model="listtablenewItem.RangeName"
              :label="$t('setting.InputBoxname')"
              variant="outlined"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showInputBox = false">
              {{ $t("common.cancel") }}
            </v-btn>
            <v-btn
              :disabled="
                listtablenewItem.Range.trim() === '' ||
                listtablenewItem.RangeName.trim() === ''
              "
              @click="addItem"
            >
              {{ $t("common.confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>

      <v-card class="setting-function-card" elevation="5">
        <h2 class="text-white my-5">{{ $t("setting.list-setting") }}</h2>
        <v-data-table
          class="setting-member-table"
          :headers="listHead"
          :items="listtableData"
          height="500"
          theme="dark"
          hide-default-footer
        >
          <template #item.ip="{ item }">
            <div class="text-center">{{ item.Range }}</div>
          </template>
          <template #item.name="{ item }">
            <div class="text-center">{{ item.RangeName }}</div>
          </template>
          <template #item.delete="{ item }">
            <div class="text-center">
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="listRemove(item.Range)"
              />
            </div>
          </template>
        </v-data-table>
        <div class="setting-add-item-button" @click="showInputBox = true">
          <v-ripple>+</v-ripple>
        </div>
      </v-card>
    </v-tab-item>

    <v-tab-item v-if="activeTab === 6">
      <!-- 输入框弹出框 -->
      <v-overlay
        v-model="monitorshowInputBox"
        class="align-center justify-center"
      >
        <v-card class="input-box">
          <v-card-text>
            <v-text-field
              v-model="addmonitorItem.Ip"
              @input="validateIP"
              :label="$t('setting.InputBoxip')"
              variant="outlined"
              :error-messages="ipError"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="monitorshowInputBox = false">
              {{ $t("common.cancel") }}
            </v-btn>
            <v-btn @click="addmonitor" :disabled="!!ipError">
              {{ $t("common.confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>

      <v-card class="setting-function-card" elevation="5">
        <h2 class="text-white my-5">{{ $t("setting.list-setting") }}</h2>
        <v-data-table
          class="setting-member-table"
          :headers="monitorlistHead"
          :items="monitorlisttableData"
          height="500"
          theme="dark"
          hide-default-footer
        >
          <template #item.ip="{ item }">
            <div class="text-center">{{ item.Ip }}</div>
          </template>
          <template #item.delete="{ item }">
            <div class="text-center">
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="monitorlistRemove(item.Ip)"
              />
            </div>
          </template>
        </v-data-table>
        <div
          class="setting-add-item-button"
          @click="monitorshowInputBox = true"
        >
          <v-ripple>+</v-ripple>
        </div>
        <v-btn
          class="line-join-button"
          color="primary"
          @click="showLineQR = true"
        >
          <v-icon start>mdi-account-group</v-icon>
          {{ $t("setting.linebutton") }}
        </v-btn>

        <!-- QR Code 彈窗 -->
        <v-dialog v-model="showLineQR" width="360">
          <v-card :title="$t('setting.linedialogtitle')">
            <v-card-text class="text-center pa-4">
              <v-img
                src="/img/LINEGroup/73234.jpg"
                width="250"
                height="250"
                class="mx-auto"
              />
              <p class="mt-2 text-grey">
                {{ $t("setting.linedialogoperate") }}
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="showLineQR = false">
                {{ $t("common.cancel") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-tab-item>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useStore } from "vuex"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import GroupCard from "@/components/Account/GroupCard.vue"
import PermissionCard from "@/components/Account/PermissionCard.vue"

import API from "@/assets/ts/api"
import { drySort } from "@/assets/ts/dry"

// Types
interface Member {
  id: number
  display_name: string
  email: string
  admin: boolean
}

interface Group {
  id: number
  name: string
  domains: string[]
  leader: string
  members: string
  inByUser: string
  isCreating: boolean
}

interface ListItem {
  Range: string
  RangeName: string
}

interface MonitorItem {
  Ip: string
}

interface UserInfo {
  userId: number
  displayName: string
  name: string
  isAdmin: boolean
}

interface FlobookLicense {
  TrackData?: {
    UserNumber: number
  }
}

// Composables
const store = useStore()
const { t } = useI18n()
const router = useRouter()

// Reactive data
const activeTab = ref(0)
const isAdminEditing = ref(false)
const form = ref({
  administrators: [] as Member[],
})
const userOptions = ref<Member[]>([])
const groups = ref<Group[]>([])
const permissionConfigs = ref<any[]>([])
const members = ref<Member[]>([])
const pendingApproval = ref<Member[]>([])
const showRejectConfirm = ref(false)
const showApproveConfirm = ref(false)
const showAdminConfirm = ref(false)
const selectedUserId = ref(-1)
const alertResetPassword = ref(false)
const alertRemoveAccount = ref(false)
const administratorsSnapshot = ref<Member[]>([])
const adminModifyCounter = ref(0)

// List related
const showInputBox = ref(false)
const listtablenewItem = ref<ListItem>({ Range: "", RangeName: "" })
const listtableData = ref<ListItem[]>([])

// Monitor related
const monitorshowInputBox = ref(false)
const addmonitorItem = ref<MonitorItem>({ Ip: "" })
const monitorlisttableData = ref<MonitorItem[]>([])
const ipError = ref("")
const showLineQR = ref(false)

// Computed
const userInfo = computed((): UserInfo => store.getters.userInfo)
const flobookLicense = computed(
  (): FlobookLicense => store.getters.flobookLicense
)

const administrators = computed({
  get: () => form.value.administrators,
  set: (val: Member[]) => {
    form.value.administrators = val
  },
})

const membersNumber = computed(() => members.value.length)

const membersHead = computed(() => [
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
    title: t("account.email"),
    key: "email",
    width: 200,
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("setting.isAdmin"),
    key: "admin",
    width: 80,
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("account.reset-password"),
    key: "reset",
    width: 150,
    align: "center" as const,
    sortable: false,
  },
  {
    title: t("common.delete"),
    key: "delete",
    align: "center" as const,
    sortable: false,
  },
])

const listHead = computed(() => [
  {
    title: "IP",
    key: "ip",
    align: "center" as const,
    sortable: true,
  },
  {
    title: "NAME",
    key: "name",
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("common.delete"),
    key: "delete",
    align: "center" as const,
    sortable: false,
  },
])

const monitorlistHead = computed(() => [
  {
    title: "IP",
    key: "ip",
    align: "center" as const,
    sortable: true,
  },
  {
    title: t("common.delete"),
    key: "delete",
    align: "center" as const,
    sortable: false,
  },
])

// Validation rules
const necessaryRules = [
  {
    validate: (array: any[]) => (Array.isArray(array) ? !!array.length : true),
    message: t("validate.required"),
  },
  {
    validate: (val: any) => !!val,
    message: t("validate.required"),
  },
]

// Methods
const changeLoadingState = (state: any) => {
  store.dispatch("changeLoadingState", state)
}

const removeUserInfo = () => {
  store.dispatch("removeUserInfo")
}

const ipValidator = (ip: string): boolean => {
  // IPv4
  const ipv4Regex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.|$)){4}$/

  // IPv6 (簡化版，允許 8 組十六進制，支援 ::)
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/

  // CIDR (IPv4/IPv6 + /mask)
  const cidrRegex =
    /^(((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.|$)){4}|([0-9a-fA-F:]+))\/([0-9]|[1-2]\d|3[0-2])$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || cidrRegex.test(ip)
}

const validateIP = () => {
  if (!ipValidator(addmonitorItem.value.Ip)) {
    ipError.value = t("setting.IpErrorMessage")
  } else {
    ipError.value = ""
  }
}

const addmonitor = () => {
  validateIP()
  if (ipError.value) return

  // 呼叫 API 或更新列表
  API.apiAddmonitorList({ ...addmonitorItem.value })
  monitorlisttableData.value.push({ ...addmonitorItem.value })

  // 清空輸入
  addmonitorItem.value.Ip = ""
  monitorshowInputBox.value = false
}

const addItem = () => {
  API.apiAddList({ ...listtablenewItem.value })

  if (listtablenewItem.value.Range && listtablenewItem.value.RangeName) {
    listtableData.value.push({ ...listtablenewItem.value })
    listtablenewItem.value.Range = ""
    listtablenewItem.value.RangeName = ""
    showInputBox.value = false
  }
}

const listRemove = (ip: string) => {
  API.apiDeleteList(String(ip))
  // 過濾掉 listtableData 中 ip 等於參數的項目
  listtableData.value = listtableData.value.filter(item => item.Range !== ip)
}

const monitorlistRemove = (ip: string) => {
  API.apiDeleteMonitorList(ip)
  // 過濾掉 monitorlisttableData 中 ip 等於參數的項目
  monitorlisttableData.value = monitorlisttableData.value.filter(
    item => item.Ip !== ip
  )
}

const getListData = () => {
  API.apiGetList()
    .then(res => {
      listtableData.value = res.data || []
    })
    .catch(error => {
      console.error("API apiGetList error:", error)
    })
}

const getmonitorListData = () => {
  API.apiGetMonitorList()
    .then(res => {
      monitorlisttableData.value = res.data || []
    })
    .catch(error => {
      console.error("API apiGetMonitorList error:", error)
    })
}

const getAdminConfig = () => {
  if (userInfo.value.isAdmin) {
    API.apiAdminConfig()
      .then(res => {
        members.value = res.data.members
        pendingApproval.value = res.data.pendingApproval
        userOptions.value = res.data.members
        administrators.value = members.value.filter(
          m => m.admin && m.display_name !== "Administrator"
        )
        groups.value = res.data.allGroups.map((group: any) => {
          return Object.assign(group, {
            isCreating: false,
          })
        })
        permissionConfigs.value = res.data.permission

        return API.apiGetAllGroups({
          userId: userInfo.value.userId,
        })
      })
      .catch(err => {
        console.error("Error in API:", err)
      })
  }
}

const tagOnBlur = (form: any, refName: string) => {
  // Note: This method needs to be adapted for Vue 3 template refs
  // if (this.$refs[refName].searchValue != '') {
  //   let property = refName.split('Ref')[0]
  //   form[property].push(this.$refs[refName].searchValue)
  //   this.$refs[refName].searchValue = ''
  // }
}
const onRejectClick = (id: number) => {
  showRejectConfirm.value = true
  selectedUserId.value = id
}

const onApproveClick = (id: number) => {
  showApproveConfirm.value = true
  selectedUserId.value = id
}

const beginModifyAdmin = () => {
  isAdminEditing.value = true
  administratorsSnapshot.value = [...administrators.value]
}

const cancelModifyAdmin = () => {
  administrators.value = [...administratorsSnapshot.value]
  isAdminEditing.value = false
}

const modifyAdmin = (isConfirmed: boolean) => {
  if (isConfirmed) {
    const newAdmins = administrators.value.filter(
      user =>
        !administratorsSnapshot.value.some(snapshot => snapshot.id === user.id)
    )
    const removeAdmins = administratorsSnapshot.value.filter(
      user => !administrators.value.some(admin => admin.id === user.id)
    )
    const adminNumber =
      administratorsSnapshot.value.length +
      newAdmins.length -
      removeAdmins.length
    const requestCount = newAdmins.length + removeAdmins.length
    const hasRemovedSelf = removeAdmins.some(
      user => user.id == userInfo.value.userId
    )

    if (adminNumber > 0) {
      removeAdmins.forEach(user => {
        API.apiSetAdmin({
          userId: parseInt(String(user.id)),
          isAdmin: false,
        })
          .then(res => {
            if (res.data == "success") {
              getAdminConfig()
              adminModifyCounter.value++
            }
            if (hasRemovedSelf && adminModifyCounter.value == requestCount) {
              removeUserInfo()
              router.push({ name: "Login" })
            }
          })
          .catch(err => {
            console.log(err)
          })
      })

      newAdmins.forEach(user => {
        API.apiSetAdmin({
          userId: parseInt(String(user.id)),
          isAdmin: true,
        })
          .then(res => {
            if (res.data == "success") {
              getAdminConfig()
              adminModifyCounter.value++
            }
            if (hasRemovedSelf && adminModifyCounter.value == requestCount) {
              removeUserInfo()
              router.push({ name: "Login" })
            }
          })
          .catch(err => {
            console.log(err)
          })
      })
    } else {
      administrators.value = [...administratorsSnapshot.value]
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
        message: t("setting.atleast-one-admin"),
      })
    }
  } else {
    administrators.value = [...administratorsSnapshot.value]
  }
  isAdminEditing.value = false
  showAdminConfirm.value = false
}

const createGroupCard = () => {
  console.log("createGroupCard")
  groups.value.push({
    id: groups.value.length + 1,
    name: "",
    domains: [],
    leader: "",
    members: "",
    inByUser: "",
    isCreating: true,
  })
}

const cancelCreating = () => {
  const index = groups.value.length - 1
  groups.value.splice(index, 1)
}

const approveAccount = (
  isConfirm: boolean,
  id: number,
  isApproved: boolean
) => {
  const sentRequest = () => {
    if (isConfirm) {
      const payload = {
        id: parseInt(String(id)),
        approved: isApproved,
      }
      API.apiApproveAccount(payload)
        .then(res => {
          if (res.data === "success") {
            getAdminConfig()
          } else {
            changeLoadingState({
              showDialog: true,
              isLoading: false,
              isSuccess: false,
              showAction: true,
              error: "connectionError",
            })
          }
        })
        .catch(err => {
          console.log(err)
        })
    } else if (
      isConfirm &&
      flobookLicense.value.TrackData &&
      membersNumber.value >= flobookLicense.value.TrackData.UserNumber
    ) {
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
        error: "trackUserNumberError",
      })
    }
  }

  if (
    flobookLicense.value.TrackData &&
    membersNumber.value < flobookLicense.value.TrackData.UserNumber
  ) {
    sentRequest()
  } else {
    sentRequest()
  }

  showRejectConfirm.value = false
  showApproveConfirm.value = false
  selectedUserId.value = -1
}

const handleSortChange = ({ name, order }: { name: string; order: string }) => {
  drySort(members.value, name as keyof Member, order as "asc" | "desc")
}

const openResetPasswordAlert = (id: number) => {
  alertResetPassword.value = true
  selectedUserId.value = id
}

const resetPassword = (isConfirm: boolean) => {
  if (isConfirm) {
    const payload = {
      userId: parseInt(String(selectedUserId.value)),
    }
    API.apiModifyPassword(payload)
      .then(res => {
        if (
          res.data == "success" &&
          userInfo.value.userId == selectedUserId.value
        ) {
          removeUserInfo()
          router.push({ name: "Login" })
        }
        selectedUserId.value = -1
      })
      .catch(err => {
        console.log(err)
        selectedUserId.value = -1
      })
  }
  alertResetPassword.value = false
}

const openRemoveAccountAlert = (id: number) => {
  alertRemoveAccount.value = true
  selectedUserId.value = id
}

const removeAccount = (isConfirm: boolean) => {
  const payload = {
    id: parseInt(String(selectedUserId.value)),
    approved: false,
  }
  if (isConfirm) {
    API.apiApproveAccount(payload).then(res => {
      if (res.data === "success") {
        getAdminConfig()
      } else {
        changeLoadingState({
          showDialog: true,
          isLoading: false,
          isSuccess: false,
          showAction: true,
          error: "connectionError",
        })
      }
    })
  }
  alertRemoveAccount.value = false
  selectedUserId.value = -1
}

// Lifecycle
onMounted(() => {
  getAdminConfig()
  getListData()
  getmonitorListData()
})
</script>

<style>
.v-tab,
.v-btn {
  text-transform: none !important;
}
/* 針對特定表格 */
.setting-account-table {
  background-color: transparent !important; /* 無背景 */
  color: white !important; /* 白字 */
}

/* 表頭文字置中 */
.setting-account-table th div {
  text-align: center !important;
  color: white !important;
}

/* 表格格子文字置中 */
.setting-account-table td {
  text-align: center !important;
  color: white !important;
  background-color: transparent !important;
  border-color: rgba(255, 255, 255, 0.3);
}
.setting-add-item-button {
  cursor: pointer;
  padding: 10px;
  background: #007bff;
  color: white;
  display: inline-block;
  margin-bottom: 10px;
}
.input-box {
  border: 1px solid #444; /* 深灰色边框 */
  padding: 20px;
  background: #333; /* 暗灰色背景 */
  display: inline-block;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); /* 深色阴影 */
  border-radius: 8px; /* 圆角效果 */
  width: 300px; /* 固定宽度 */
  color: white; /* 字体颜色设为白色 */
}

.input-box button {
  padding: 8px 15px;
  background-color: #555; /* 深灰色背景 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 5px 10px 0 0;
  transition: background-color 0.3s;
}

.input-box button:hover {
  background-color: #444; /* 悬停时背景变暗 */
}

.input-box button:last-child {
  background-color: #d32f2f; /* 红色背景（取消按钮） */
}

.input-box button:last-child:hover {
  background-color: #b71c1c; /* 悬停时深红色 */
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* 更暗的遮罩层背景 */
  z-index: 1000;
}

.setting-function-card {
  padding: 10px 30px 30px 30px;
  width: 900px;
  margin: 30px auto;
  background: rgb(85, 85, 85) !important;
  border-radius: 5px;
}
.setting-function-card .label {
  margin-right: 10px;
}
.setting-add-item-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  padding: 5px;
  margin: 0 2px;
  margin-bottom: 20px;
  cursor: pointer;
  border: dashed 1px gray;
  color: white;
  user-select: none;
}
.setting-add-item-button:hover {
  background-color: #aaa;
  opacity: 0.9;
}
.setting-account-table {
  width: 80%;
  margin: auto;
  border: solid 1px gray;
  border-collapse: collapse;
}
.setting-account-table th,
.setting-account-table td {
  text-align: center !important; /* 水平置中 */
  font-size: 20px;
  border: solid 1px gray;
}
.setting-member-table table {
  font-size: 14px;
}
.setting-member-table .mu-table-header {
  background-color: #1f1f1f;
  color: white;
  font-size: 14px;
}
.setting-member-table.mu-table th {
  font-size: 14px;
}
.setting-member-table.mu-table td {
  font-size: 14px;
  cursor: pointer;
}
.setting-member-table.mu-table th.is-sortable {
  padding-left: 10px;
}
.setting-tab {
  font-size: 20px;
}
.tab-content {
  padding: 16px;
}
.tab-content p {
  margin: 8px 0;
}
</style>
