<template>
  <div>
    <!-- Edit Mode Form -->
    <v-form ref="abstractForm" v-model="isFormValid" v-if="isEditing">
      <v-row>
        <v-col cols="6">
          <v-select
            v-model="componentAbstract.deal"
            :items="selectOptions.dealOptions"
            :label="$t('track.deal')"
            :disabled="!isEditing"
            :rules="necessaryRules"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="componentAbstract.status"
            :items="selectOptions.statusOptions"
            :item-title="(item: string) => $t('track.' + item)"
            :item-value="(item: string) => item"
            :label="$t('track.projectState')"
            :disabled="!isEditing"
            :rules="necessaryRules"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-combobox
            v-model="componentAbstract.projectType"
            :items="selectOptions.projectTypeOptions"
            :label="$t('track.projectType')"
            :rules="necessaryRules"
            multiple
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="componentAbstract.security"
            :items="selectOptions.securityOptions"
            :label="$t('track.security')"
            :disabled="!isEditing"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-combobox
        v-model="componentAbstract.domain"
        :items="selectOptions.domainOptions"
        :label="$t('track.domain')"
        :rules="necessaryRules"
        multiple
        chips
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-combobox
        v-model="componentAbstract.industryType"
        :items="selectOptions.industryOptions"
        :label="$t('track.industryType')"
        :rules="necessaryRules"
        multiple
        chips
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-combobox
        v-model="componentAbstract.software"
        :items="selectOptions.softwareOptions"
        :label="$t('track.software')"
        :rules="necessaryRules"
        multiple
        chips
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="componentAbstract.startTime"
            :label="$t('track.duration')"
            :rules="startTimeRules"
            type="date"
            variant="outlined"
            density="comfortable"
            :disabled="!isEditing"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="componentAbstract.closeTime"
            :label="$t('track.to')"
            :rules="closeTimeRules"
            type="date"
            variant="outlined"
            density="comfortable"
            :disabled="!isEditing"
          />
        </v-col>
      </v-row>

      <v-combobox
        v-model="componentAbstract.customerName"
        :items="selectOptions.customerOptions"
        :label="$t('track.customerName')"
        :rules="necessaryRules"
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-text-field
        v-model="componentAbstract.projectName"
        :label="$t('track.projectName')"
        :rules="necessaryRules"
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-combobox
        v-model="componentAbstract.product"
        :items="selectOptions.productOptions"
        :label="$t('track.product')"
        :rules="necessaryRules"
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-row>
        <v-col cols="6">
          <v-combobox
            v-model="componentAbstract.executor"
            :items="selectOptions.engineerOptions"
            :label="$t('track.executor')"
            :rules="necessaryRules"
            variant="outlined"
            density="comfortable"
            :disabled="!isEditing"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="componentAbstract.projectCreater"
            :label="$t('track.manager')"
            :rules="necessaryRules"
            variant="outlined"
            density="comfortable"
            disabled
          />
        </v-col>
      </v-row>

      <v-combobox
        v-model="componentAbstract.teammates"
        :items="selectOptions.engineerOptions"
        :label="$t('track.teammates')"
        multiple
        chips
        variant="outlined"
        density="comfortable"
        :disabled="!isEditing"
      />

      <v-textarea
        v-model="componentAbstract.projectDescription"
        :label="$t('track.projectDescription')"
        :rules="necessaryRules"
        rows="10"
        variant="outlined"
        density="comfortable"
        :readonly="!isEditing"
      />
    </v-form>

    <!-- Read-only Mode -->
    <div class="detail-readable" v-else>
      <p class="text-body-1 mb-4">{{ componentAbstract.projectDescription }}</p>

      <v-table density="comfortable">
        <tbody>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.projectType") }}
            </td>
            <td>
              {{
                Array.isArray(componentAbstract.projectType)
                  ? componentAbstract.projectType.join(", ")
                  : componentAbstract.projectType
              }}
            </td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">{{ $t("track.domain") }}</td>
            <td>{{ componentAbstract.domain?.join(", ") || "" }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.industryType") }}
            </td>
            <td>{{ componentAbstract.industryType?.join(", ") || "" }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.software") }}
            </td>
            <td>{{ componentAbstract.software?.join(", ") || "" }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.duration") }}
            </td>
            <td>
              {{
                formatDateRange(
                  componentAbstract.startTime,
                  componentAbstract.closeTime
                )
              }}
            </td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.customerName") }}
            </td>
            <td>{{ componentAbstract.customerName }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">{{ $t("track.product") }}</td>
            <td>{{ componentAbstract.product }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.executor") }}
            </td>
            <td>{{ componentAbstract.executor }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">{{ $t("track.manager") }}</td>
            <td>{{ componentAbstract.projectCreater }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.teammates") }}
            </td>
            <td>{{ componentAbstract.teammates?.join(", ") || "" }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.security") }}
            </td>
            <td>{{ componentAbstract.security }}</td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">
              {{ $t("track.projectState") }}
            </td>
            <td>
              {{
                componentAbstract.status
                  ? $t("track." + componentAbstract.status)
                  : ""
              }}
            </td>
          </tr>
          <tr>
            <td class="td-title font-weight-bold">{{ $t("track.deal") }}</td>
            <td>{{ componentAbstract.deal }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"

// Types
interface AbstractData {
  deal: string
  status: string
  projectType: string[]
  security: string
  domain: string[]
  industryType: string[]
  software: string[]
  startTime: string
  closeTime: string
  customerName: string
  projectName: string
  product: string
  executor: string
  projectCreater: string
  teammates: string[]
  projectDescription: string
}

interface SelectOptions {
  dealOptions: string[]
  statusOptions: string[]
  projectTypeOptions: string[]
  securityOptions: string[]
  domainOptions: string[]
  industryOptions: string[]
  softwareOptions: string[]
  customerOptions: string[]
  productOptions: string[]
  engineerOptions: string[]
}

interface Props {
  abstract: AbstractData
  selectOptions: SelectOptions
  isEditing: boolean
}

interface Emits {
  (e: "changeAbstract", abstract: AbstractData): void
}

// Props and emits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t: $t } = useI18n()

// Refs
const abstractForm = ref()
const isFormValid = ref(false)

// Computed
const componentAbstract = computed({
  get(): AbstractData {
    return props.abstract
  },
  set(abstract: AbstractData) {
    emit("changeAbstract", abstract)
  },
})

// Validation rules
const necessaryRules = computed(() => [
  (val: any) => {
    if (Array.isArray(val)) {
      return val.length > 0 || $t("validate.required")
    }
    return !!val || $t("validate.required")
  },
])

const startTimeRules = computed(() => [
  (val: string) => !!val || $t("validate.required"),
  (val: string) => {
    if (!props.abstract.closeTime) return true
    const startDate = new Date(val)
    const closeDate = new Date(props.abstract.closeTime)
    return startDate <= closeDate || $t("validate.wrongDuration")
  },
])

const closeTimeRules = computed(() => [
  (val: string) => !!val || $t("validate.required"),
  (val: string) => {
    if (!props.abstract.startTime) return true
    const startDate = new Date(props.abstract.startTime)
    const closeDate = new Date(val)
    return closeDate >= startDate || $t("validate.wrongDuration2")
  },
])

// Methods
const formatDateRange = (startTime: string, closeTime: string): string => {
  if (!startTime || !closeTime) return ""
  const start = startTime.split(" ")[0]
  const close = closeTime.split(" ")[0]
  return `${start} ~ ${close}`
}

// Expose form validation method for parent component
defineExpose({
  validate: () => abstractForm.value?.validate(),
  resetValidation: () => abstractForm.value?.resetValidation(),
})
</script>

<style scoped>
.detail-readable p {
  text-align: justify;
  word-break: break-word;
}

.td-title {
  width: 160px;
  background-color: rgba(var(--v-theme-primary), 0.1);
}

:deep(.v-table .v-table__wrapper > table > tbody > tr:nth-child(even) > td) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}
</style>
