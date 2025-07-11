<template>
  <v-form v-if="isEditing" ref="formRef" v-model="isValid">
    <v-row>
      <v-col cols="6">
        <v-select
          v-model="form.deal"
          :items="selectOptions.dealOptions"
          label="Deal"
          :disabled="!isEditing"
        />
      </v-col>

      <v-col cols="6">
        <v-select
          v-model="form.status"
          :items="selectOptions.statusOptions"
          :item-title="status => $t(`track.${status}`)"
          label="Project Status"
          :disabled="!isEditing"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <v-combobox
          v-model="form.projectType"
          :items="selectOptions.projectTypeOptions"
          label="Project Type"
          :rules="necessaryRules"
          :disabled="!isEditing"
        />
      </v-col>

      <v-col cols="6">
        <v-select
          v-model="form.security"
          :items="selectOptions.securityOptions"
          label="Security"
          :disabled="!isEditing"
        />
      </v-col>
    </v-row>

    <v-combobox
      v-model="form.domain"
      :items="selectOptions.domainOptions"
      label="Domain"
      multiple
      chips
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-combobox
      v-model="form.industryType"
      :items="selectOptions.industryOptions"
      label="Industry Type"
      multiple
      chips
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-combobox
      v-model="form.software"
      :items="selectOptions.softwareOptions"
      label="Software"
      multiple
      chips
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-row>
      <v-col cols="6">
        <v-date-picker
          v-model="form.startTime"
          label="Start Date"
          :rules="startTimeRules"
        />
      </v-col>
      <v-col cols="6">
        <v-date-picker
          v-model="form.closeTime"
          label="End Date"
          :rules="closeTimeRules"
        />
      </v-col>
    </v-row>

    <v-combobox
      v-model="form.customerName"
      :items="selectOptions.customerOptions"
      label="Customer"
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-text-field
      v-model="form.projectName"
      label="Project Name"
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-combobox
      v-model="form.product"
      :items="selectOptions.productOptions"
      label="Product"
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-combobox
      v-model="form.executor"
      :items="selectOptions.engineerOptions"
      label="Executor"
      :rules="necessaryRules"
      :disabled="!isEditing"
    />

    <v-text-field v-model="form.projectCreater" label="Manager" disabled />

    <v-combobox
      v-model="form.teammates"
      :items="selectOptions.engineerOptions"
      label="Teammates"
      multiple
      chips
      :disabled="!isEditing"
    />

    <v-textarea
      v-model="form.projectDescription"
      label="Description"
      :rows="5"
      :disabled="!isEditing"
    />
  </v-form>

  <div v-else class="detail-readable">
    <p>{{ form.projectDescription }}</p>
    <table>
      <tr>
        <td>Project Type</td>
        <td>{{ form.projectType }}</td>
      </tr>
      <tr>
        <td>Domain</td>
        <td>{{ form.domain.join(", ") }}</td>
      </tr>
      <tr>
        <td>Industry</td>
        <td>{{ form.industryType.join(", ") }}</td>
      </tr>
      <tr>
        <td>Software</td>
        <td>{{ form.software.join(", ") }}</td>
      </tr>
      <tr>
        <td>Duration</td>
        <td>{{ form.startTime }} ~ {{ form.closeTime }}</td>
      </tr>
      <tr>
        <td>Customer</td>
        <td>{{ form.customerName }}</td>
      </tr>
      <tr>
        <td>Product</td>
        <td>{{ form.product }}</td>
      </tr>
      <tr>
        <td>Executor</td>
        <td>{{ form.executor }}</td>
      </tr>
      <tr>
        <td>Manager</td>
        <td>{{ form.projectCreater }}</td>
      </tr>
      <tr>
        <td>Teammates</td>
        <td>{{ form.teammates.join(", ") }}</td>
      </tr>
      <tr>
        <td>Security</td>
        <td>{{ form.security }}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>{{ $t("track." + form.status) }}</td>
      </tr>
      <tr>
        <td>Deal</td>
        <td>{{ form.deal }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

interface FormData {
  deal: string
  status: string
  projectType: string
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

const props = defineProps<{
  abstract: FormData
  selectOptions: SelectOptions
  isEditing: boolean
}>()

const emit = defineEmits(["changeAbstract"])

const form = computed({
  get: () => props.abstract,
  set: val => emit("changeAbstract", val),
})

const isValid = ref(false)

const necessaryRules = [(v: any) => !!v || "Required"]

const startTimeRules = [
  (v: string) => !!v || "Start time required",
  (v: string) =>
    !form.value.closeTime ||
    new Date(v) <= new Date(form.value.closeTime) ||
    "Invalid start time",
]

const closeTimeRules = [
  (v: string) => !!v || "Close time required",
  (v: string) =>
    !form.value.startTime ||
    new Date(v) >= new Date(form.value.startTime) ||
    "Invalid close time",
]
</script>

<style scoped>
.detail-readable p {
  text-align: justify;
  word-break: break-word;
}
.detail-readable table {
  width: 100%;
  border-collapse: collapse;
}
.detail-readable td {
  border: 1px solid #ccc;
  padding: 6px;
}
.detail-readable tr:nth-child(even) {
  background: #f5f5f5;
}
</style>
