<template>
  <v-container class="py-8">
    <v-card class="pa-6" elevation="4">
      <v-card-title class="text-h5">Solve Config</v-card-title>

      <v-form ref="formRef" v-model="valid" class="mt-4" fast-fail>
        <v-divider class="mb-4" />
        <h4 class="text-subtitle-1 font-weight-medium">Cluster Config</h4>

        <!-- Compute Mode -->
        <v-radio-group
          v-model="form.computeMode"
          :inline="true"
          label="Compute Mode"
        >
          <v-radio
            v-for="mode in Object.keys(computeModes)"
            :key="mode"
            :label="mode"
            :value="computeModes[mode]"
          />
        </v-radio-group>

        <!-- ANSYS Inc Path -->
        <v-text-field
          v-model="form.ansysIncFolderPath"
          label="ANSYS Inc Folder Path"
          required
        />

        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model.number="form.maxCpu"
              label="Max CPU"
              type="number"
              :min="1"
              required
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="form.maxGpu"
              label="Max GPU"
              type="number"
              :min="0"
            />
          </v-col>
        </v-row>

        <!-- File Server -->
        <v-text-field v-model="form.fileServer" label="File Server" required />

        <!-- Cluster IPs -->
        <v-row
          v-for="(ip, index) in form.clusterIps"
          :key="'ip-' + index"
          align="center"
        >
          <v-col cols="11">
            <v-text-field
              v-model="form.clusterIps[index]"
              label="Cluster IP"
              required
            />
          </v-col>
          <v-col cols="1">
            <v-btn icon @click="removeClusterIp(index)">
              <v-icon color="red">mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-btn @click="addClusterIp" color="primary" variant="text"
          >+ Add Cluster IP</v-btn
        >

        <!-- Latest Solver Version -->
        <h4 class="text-subtitle-1 mt-6 font-weight-medium">
          Latest Solver Version
        </h4>
        <v-row
          v-for="(item, index) in form.latestSolverVersion"
          :key="'solver-' + index"
        >
          <v-col cols="5">
            <v-select
              v-model="item.latestVersion"
              :items="solverVersionList"
              label="Version"
              required
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="item.feature"
              :items="allSolverProduct"
              label="Feature"
              required
            />
          </v-col>
          <v-col cols="1">
            <v-btn icon @click="removeFeature(index)">
              <v-icon color="red">mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-btn @click="addFeature" color="primary" variant="text"
          >+ Add Feature</v-btn
        >

        <!-- Submit -->
        <v-btn class="mt-6" color="primary" @click="submit">Update</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import axios from "axios"

interface LatestSolverVersion {
  latestVersion: string
  feature: string
}

interface SolveConfigForm {
  computeMode: string
  ansysIncFolderPath: string
  maxCpu: number
  maxGpu: number
  clusterIps: string[]
  fileServer: string
  latestSolverVersion: LatestSolverVersion[]
}

const computeModes = {
  Single: "Single",
  WindowsHPC: "WindowsHPC",
  PBSPro: "PBSPro",
}

const valid = ref(false)
const formRef = ref()
const solverVersionList = ref<string[]>([])
const allSolverProduct = ref<string[]>([])

const form = reactive<SolveConfigForm>({
  computeMode: "",
  ansysIncFolderPath: "",
  maxCpu: 1,
  maxGpu: 0,
  clusterIps: [],
  fileServer: "",
  latestSolverVersion: [{ latestVersion: "", feature: "" }],
})

function addClusterIp() {
  form.clusterIps.push("")
}

function removeClusterIp(index: number) {
  form.clusterIps.splice(index, 1)
}

function addFeature() {
  form.latestSolverVersion.push({ latestVersion: "", feature: "" })
}

function removeFeature(index: number) {
  form.latestSolverVersion.splice(index, 1)
}

function validateForm() {
  const emptyIp = form.clusterIps.includes("")
  const duplicateIp = new Set(form.clusterIps).size !== form.clusterIps.length

  const emptySolver = form.latestSolverVersion.some(
    item => !item.latestVersion || !item.feature
  )
  const duplicateFeature =
    new Set(form.latestSolverVersion.map(i => i.feature)).size !==
    form.latestSolverVersion.length

  if (emptyIp || duplicateIp || emptySolver || duplicateFeature) {
    console.warn("Validation failed")
    return false
  }
  return true
}

async function submit() {
  if (!formRef.value?.validate() || !validateForm()) return

  const payload = {
    ...form,
    clusterIps: form.clusterIps.join(","),
  }

  try {
    const res = await axios.post("/api/setSolveConfig", payload)
    console.log("Response:", res.data)
    // Optional: dialog/snackbar
  } catch (err) {
    console.error("API Error:", err)
  }
}

async function initPage() {
  const { data } = await axios.get("/api/getSolveConfig")
  Object.assign(form, data)
  form.latestSolverVersion = data.latestSolverVersion.map((item: any) => ({
    latestVersion: item.latestVersion,
    feature: item.feature,
  }))
  allSolverProduct.value = data.allSolverProduct

  const versionRes = await axios.get("/config/versions.json")
  solverVersionList.value = versionRes.data.reverse()
}

onMounted(() => {
  initPage()
})
</script>

<style scoped>
.remove-button {
  cursor: pointer;
  user-select: none;
}
</style>
