<template>
  <v-card class="group-card" elevation="5">
    <v-card-text class="group-card-body">
      <!-- Display Mode -->
      <div v-if="!isEditing">
        <v-table class="permission-info no-color-table">
          <tbody>
            <tr>
              <td>{{ $t("setting.status") }}:</td>
              <td>{{ $t("track." + config.Status) }}</td>
            </tr>
            <tr>
              <td>{{ $t("setting.writable") }}:</td>
              <td>
                {{ whoCanWrite.length > 0 ? whoCanWrite.join(", ") : "None" }}
              </td>
            </tr>
            <tr>
              <td>{{ $t("setting.readable") }}:</td>
              <td>
                {{ whoCanRead.length > 0 ? whoCanRead.join(", ") : "None" }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Edit Mode -->
      <div class="form-wrapper" v-if="isEditing">
        <v-form ref="form">
          <!-- Status Selection -->
          <div class="mb-6">
            <v-select
              v-model="config.Status"
              :items="formOptions.status"
              :item-title="item => $t('track.' + item)"
              :item-value="item => item"
              :label="$t('setting.status')"
              variant="outlined"
              disabled
              class="dark-select"
            />
          </div>

          <!-- Permission Settings -->
          <v-row>
            <!-- Writable Permissions -->
            <v-col cols="12" md="6">
              <div class="permission-section">
                <h3 class="permission-title">{{ $t("setting.writable") }}:</h3>

                <v-switch
                  v-model="config.WriteExcutor"
                  :label="$t('setting.permission-executor')"
                  color="primary"
                  class="permission-switch"
                />

                <v-switch
                  v-model="config.WriteGroup"
                  :label="$t('setting.permission-group')"
                  color="primary"
                  class="permission-switch"
                />

                <v-switch
                  v-model="config.WriteManager"
                  :label="$t('setting.permission-manager')"
                  color="primary"
                  class="permission-switch"
                />

                <v-switch
                  v-model="config.WriteTeam"
                  :label="$t('setting.permission-team')"
                  color="primary"
                  class="permission-switch"
                />
              </div>
            </v-col>

            <!-- Readable Permissions -->
            <v-col cols="12" md="6">
              <div class="permission-section">
                <h3 class="permission-title">{{ $t("setting.readable") }}:</h3>

                <v-switch
                  v-model="config.ReadExcutor"
                  :label="$t('setting.permission-executor')"
                  color="primary"
                  class="permission-switch"
                />

                <v-switch
                  v-model="config.ReadGroup"
                  :label="$t('setting.permission-group')"
                  color="primary"
                  class="permission-switch"
                />

                <v-switch
                  v-model="config.ReadManager"
                  :label="$t('setting.permission-manager')"
                  color="primary"
                  class="permission-switch"
                />

                <v-switch
                  v-model="config.ReadTeam"
                  :label="$t('setting.permission-team')"
                  color="primary"
                  class="permission-switch"
                />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-card-text>

    <v-divider class="mx-4 mb-2" />

    <v-card-actions class="justify-center">
      <v-btn
        v-if="!isEditing"
        variant="flat"
        color="teal"
        @click="isEditing = true"
        height="36"
        min-width="88"
      >
        {{ $t("common.modify") }}
      </v-btn>

      <div v-if="isEditing" class="d-flex">
        <v-btn
          variant="flat"
          color="grey-darken-3"
          class="mr-4"
          height="36"
          min-width="88"
          @click="isEditing = false"
        >
          {{ $t("common.cancel") }}
        </v-btn>

        <v-btn
          variant="flat"
          color="primary"
          height="36"
          min-width="88"
          @click="confirmModifyPermission"
        >
          {{ $t("common.confirm") }}
        </v-btn>
      </div>
    </v-card-actions>

    <!-- Confirm Dialog -->
    <confirm-dialog
      :title="$t('setting.confirm-modify-permission')"
      :open-alert="showModifyConfirm"
      :safe-option="$t('common.cancel')"
      :danger-option="$t('common.confirm')"
      confirm-color="primary"
      @close-confirm-dialog="modifyPermissionSetting($event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useI18n } from "vue-i18n"
import { useStore } from "vuex"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import { apiModifyProjectPermission } from "@/assets/ts/api"

// Types
interface PermissionConfig {
  Status: string
  WriteExcutor: boolean
  WriteGroup: boolean
  WriteManager: boolean
  WriteTeam: boolean
  ReadExcutor: boolean
  ReadGroup: boolean
  ReadManager: boolean
  ReadTeam: boolean
}

// Props
interface Props {
  config: PermissionConfig
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  pleaseUpdatePermissionCard: []
}>()

// Composables
const { t } = useI18n()
const store = useStore()

// Refs
const form = ref()
const isEditing = ref<boolean>(false)
const showModifyConfirm = ref<boolean>(false)

// Computed
const formOptions = computed(() => ({
  status: ["PROCESSING", "CLOSED"],
}))

const whoCanWrite = computed(() => {
  const temp: string[] = []
  if (props.config.WriteExcutor) temp.push(t("setting.permission-executor"))
  if (props.config.WriteGroup) temp.push(t("setting.permission-group"))
  if (props.config.WriteManager) temp.push(t("setting.permission-manager"))
  if (props.config.WriteTeam) temp.push(t("setting.permission-team"))
  return temp
})

const whoCanRead = computed(() => {
  const temp: string[] = []
  if (props.config.ReadExcutor) temp.push(t("setting.permission-executor"))
  if (props.config.ReadGroup) temp.push(t("setting.permission-group"))
  if (props.config.ReadManager) temp.push(t("setting.permission-manager"))
  if (props.config.ReadTeam) temp.push(t("setting.permission-team"))
  return temp
})

// Methods
const changeLoadingState = (state: any) => {
  store.dispatch("changeLoadingState", state)
}

const confirmModifyPermission = () => {
  showModifyConfirm.value = true
}

const modifyPermissionSetting = async (isConfirmed: boolean) => {
  if (isConfirmed) {
    try {
      const response = await apiModifyProjectPermission(props.config)
      if (response.data === "success") {
        emit("pleaseUpdatePermissionCard")
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
    } catch (error) {
      console.error("Failed to modify permission:", error)
      changeLoadingState({
        showDialog: true,
        isLoading: false,
        isSuccess: false,
        showAction: true,
        error: "groupSettingError",
      })
    }
  }

  isEditing.value = false
  showModifyConfirm.value = false
}
</script>

<style scoped>
.v-btn {
  text-transform: none !important;
}
.no-color-table {
  background-color: transparent !important;
  color: white !important; /* 全表格字體白色 */
  border-collapse: collapse; /* 消除多餘邊框間距 */
  font-size: 18px; /* 整個表格字體放大 */
}

.no-color-table th,
.no-color-table td {
  background-color: transparent !important;
  color: inherit !important;
  border: none !important; /* 移除格線 */
}
.group-card {
  background: #777;
  border-radius: 10px;
  margin: 10px 2px;
}

.group-card-body {
  margin: 0 20px 20px 20px;
}

.permission-info {
  border-spacing: 10px;
}

.permission-info tr {
  text-align: left;
}

.permission-info tr td:first-child {
  width: 200px;
  padding-right: 10px;
  font-weight: 500;
}

.form-wrapper {
  padding: 20px 10px 25px 10px;
}

.permission-section {
  padding: 0 20px;
}

.permission-title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 20px 0 16px 0;
  text-align: center;
}

.permission-switch {
  margin-bottom: 8px;
}

.gap-2 {
  gap: 8px;
}

/* Dark theme styles for v-table */
.dark-table {
  background-color: #424242 !important;
}

.dark-table :deep(.v-table__wrapper) {
  background-color: #424242 !important;
}

.dark-table :deep(table) {
  background-color: #424242 !important;
  border: none !important;
}

.dark-table :deep(td),
.dark-table :deep(th) {
  color: #ffffff !important;
  background-color: #424242 !important;
  border: none !important;
  border-bottom: none !important;
}

.dark-table :deep(tbody tr) {
  border: none !important;
}

.dark-table :deep(tbody tr:hover) {
  background-color: #525252 !important;
}

/* Dark theme styles for v-select */
.dark-select :deep(.v-field__input) {
  color: #ffffff !important;
}

.dark-select :deep(.v-field__field) {
  color: #ffffff !important;
}

.dark-select :deep(.v-field--variant-outlined .v-field__outline) {
  color: #cccccc !important;
}

.dark-select :deep(.v-label) {
  color: #cccccc !important;
}

.dark-select :deep(.v-field--focused .v-field__outline) {
  color: #1976d2 !important;
}

.dark-select :deep(.v-field--disabled) {
  opacity: 0.6;
}

/* Dark theme styles for v-switch */
:deep(.v-switch .v-selection-control__wrapper) {
  color: #ffffff;
}

:deep(.v-switch .v-label) {
  color: #ffffff !important;
}

:deep(.v-switch .v-selection-control__input) {
  color: #ffffff;
}
</style>
