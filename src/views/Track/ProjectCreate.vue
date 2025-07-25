<template>
  <div class="creater-container">
    <h1>{{ $t('track.create-project') }}</h1>
    <mu-form
      ref="form"
      :model="form"
      :label-position="'left'"
      label-width="120"
    >
      <mu-row gutter>
        <mu-col span="6">
          <mu-form-item
            :label="$t('track.projectType')"
            class="required"
            prop="projectType"
            :rules="necessaryRules"
          >
            <mu-auto-complete
              :data="projectTypeOptions"
              open-on-focus
              :max-search-results="5"
              v-model="form.projectType"
            ></mu-auto-complete>
          </mu-form-item>
        </mu-col>
        <mu-col span="6">
          <mu-form-item :label="$t('track.projectState')" class="required">
            <mu-select v-model="form.status">
              <mu-option
                v-for="option in statusOptions"
                :key="option"
                :label="$t('track.' + option)"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <mu-row gutter>
        <mu-col span="6">
          <mu-form-item
            :label="$t('track.domain')"
            class="required"
            prop="domain"
            :rules="necessaryRules"
          >
            <mu-select
              ref="domainRef"
              v-model="form.domain"
              chips
              multiple
              tags
              prop="domain"
              @blur="tagOnBlur('domainRef')"
            >
              <mu-option
                v-for="option in domainOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
        <mu-col span="6">
          <mu-form-item
            :label="$t('track.industryType')"
            class="required"
            prop="industryType"
            :rules="necessaryRules"
          >
            <mu-select
              ref="industryTypeRef"
              v-model="form.industryType"
              chips
              multiple
              tags
              prop="industryType"
              @blur="tagOnBlur('industryTypeRef')"
            >
              <mu-option
                v-for="option in industryOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <mu-row gutter>
        <mu-col span="6">
          <mu-form-item
            :label="$t('track.software')"
            class="required"
            :help-text="$t('track.software-help-text')"
            prop="software"
            :rules="necessaryRules"
          >
            <mu-select
              ref="softwareRef"
              v-model="form.software"
              chips
              multiple
              tags
              prop="software"
              @blur="tagOnBlur('softwareRef')"
            >
              <mu-option
                v-for="option in softwareOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
        <mu-col span="6">
          <mu-form-item :label="$t('track.security')" class="required">
            <mu-select v-model="form.security">
              <mu-option
                v-for="option in securityOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <mu-row gutter>
        <mu-col span="6">
          <mu-form-item
            :label="$t('track.duration')"
            class="required"
            prop="startTime"
            :rules="startTimeRules"
          >
            <mu-date-input
              prop="startTime"
              v-model="form.startTime"
              color="blueGrey900"
              display-color="blueGrey900"
              underline-color="blueGrey900"
              format="YYYY/MM/DD"
              full-width
            ></mu-date-input>
          </mu-form-item>
        </mu-col>
        <mu-col span="6">
          <mu-form-item
            :label="$t('track.to')"
            prop="closeTime"
            :rules="closeTimeRules"
          >
            <mu-date-input
              prop="closeTime"
              v-model="form.closeTime"
              color="blueGrey900"
              display-color="blueGrey900"
              underline-color="blueGrey900"
              format="YYYY/MM/DD"
              full-width
            ></mu-date-input>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <mu-form-item
        :label="$t('track.customerName')"
        class="required"
        prop="customerName"
        :rules="necessaryRules"
      >
        <mu-auto-complete
          v-model="form.customerName"
          :data="customerOptions"
          :max-search-results="5"
          open-on-focus
          :placeholder="$t('track.customer-placeholder')"
          prop="customerName"
        ></mu-auto-complete>
      </mu-form-item>
      <mu-form-item
        :label="$t('track.projectName')"
        class="required"
        prop="projectName"
        :rules="necessaryRules"
      >
        <mu-text-field
          v-model="form.projectName"
          prop="projectName"
        ></mu-text-field>
      </mu-form-item>
      <mu-form-item
        :label="$t('track.product')"
        class="required"
        prop="product"
        :rules="necessaryRules"
      >
        <mu-auto-complete
          v-model="form.product"
          :data="productOptions"
          :max-search-results="5"
          prop="product"
          open-on-focus
        ></mu-auto-complete>
      </mu-form-item>
      <mu-row gutter>
        <mu-col span="5">
          <mu-form-item
            :label="$t('track.executor')"
            class="required"
            prop="executor"
            :rules="necessaryRules"
          >
            <mu-select v-model="form.executor" tags prop="executor">
              <mu-option
                v-for="option in engineerOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
        <mu-col span="7">
          <mu-form-item :label="$t('track.teammates')">
            <mu-select v-model="form.teammates" chips multiple tags>
              <mu-option
                v-for="option in engineerOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <mu-form-item
        :label="$t('track.projectDescription')"
        class="required"
        prop="projectDescription"
        :rules="necessaryRules"
      >
        <textarea
          class="mu-text-field-input mu-text-field-textarea project-create-textarea"
          v-model.lazy="form.projectDescription"
          rows="4"
          prop="projectDescription"
        ></textarea>
      </mu-form-item>
      <div v-if="hasTrack">
        <h2>{{ $t('track.files') }}</h2>
        <file-upload
          v-for="(file, index) in files"
          :key="file.fileCount"
          :fileCount="index"
          :ref="'fuArray'"
          @removeFileUpload="onRemoveFileUpload"
        ></file-upload>
      </div>
      <append-button @click="addFileUpload" />
      <mu-button color="primary" @click="validateForm">{{
        $t('common.submit')
      }}</mu-button>
      <qi-progress :progress="fileProgress"></qi-progress>
    </mu-form>
  </div>
</template>

<script>
import FileUpload from '@/components/Track/FileUpload.vue'
import QiProgress from '@/components/common/QiProgress.vue'
import AppendButton from '@/components/common/AppendButton.vue'
import { mapActions, mapGetters } from 'vuex'
import API from '@/assets/js/api'

export default {
  name: 'ProjectCrate',
  components: { FileUpload, QiProgress, AppendButton },
  data() {
    return {
      statusOptions: ['PROCESSING', 'CLOSED'],
      securityOptions: ['無', '有'],
      projectTypeOptions: [],
      softwareOptions: [],
      engineerOptions: [],
      customerOptions: [],
      domainOptions: [],
      industryOptions: [],
      productOptions: [],
      controlOptions: [],
      form: {
        projectCreater: '',
        projectType: '',
        projectName: '',
        projectDescription: '',
        customerName: '',
        domain: [],
        industryType: [],
        product: '',
        executor: '',
        teammates: [],
        software: [],
        status: 'PROCESSING',
        security: '無',
        startTime: '',
        closeTime: '',
      },
      files: [{ fileCount: 1 }],
      fileCount: 1,
      fileProgress: {
        show: false,
        title: 'Please wait',
        done: 0,
        total: 0,
      },
      // Validation
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'flobookLicense']),
    control() {
      if (this.form.projectType.length == 0) {
        return {}
      } else {
        let thisControl = this.controlOptions.find(
          (item) => item.type == this.form.projectType[0]
        )
        return {
          type: thisControl.type,
          customerName: thisControl.client,
          domain: thisControl.field,
          industryType: thisControl.industry,
          product: thisControl.product,
        }
      }
    },
    necessaryRules() {
      return [
        {
          validate: (array) => (Array.isArray(array) ? !!array.length : true),
          message: this.$t('validate.required'),
        },
        {
          validate: (val) => !!val,
          message: this.$t('validate.required'),
        },
      ]
    },
    customerNameRules() {
      return [
        {
          validate: (val) => (this.control.customerName > 1 ? !!val : true),
          message: this.$t('validate.required'),
        },
      ]
    },
    domainRules() {
      return [
        {
          validate: (val) => (this.control.domain > 1 ? !!val : true),
          message: this.$t('validate.required'),
        },
      ]
    },
    industryTypeRules() {
      return [
        {
          validate: (val) => (this.control.industryType > 1 ? !!val : true),
          message: this.$t('validate.required'),
        },
      ]
    },
    productRules() {
      return [
        {
          validate: (val) => (this.control.product > 1 ? !!val : true),
          message: this.$t('validate.required'),
        },
      ]
    },
    startTimeRules() {
      return [
        { validate: (val) => !!val, message: this.$t('validate.required') },
        {
          validate: (val) =>
            !this.form.closeTime
              ? true
              : val.getTime() <= this.form.closeTime.getTime(),
          message: this.$t('validate.wrongDuration'),
        },
      ]
    },
    closeTimeRules() {
      return [
        { validate: (val) => !!val, message: this.$t('validate.required') },
        {
          validate: (val) =>
            !this.form.startTime
              ? true
              : val.getTime() >= this.form.startTime.getTime(),
          message: this.$t('validate.wrongDuration2'),
        },
      ]
    },
    hasTrack() {
      return this.flobookLicense.HasTrack
    },
  },
  created() {
    this.getInitialOptions()
    this.form.projectCreater = sessionStorage.getItem('userName')
    this.form.startTime = new Date(new Date().setHours(0, 0, 0, 0))
  },
  methods: {
    ...mapActions(['changeLoadingState']),
    getInitialOptions() {
      this.changeLoadingState(true)
      API.apiAddProjectInit()
        .then((res) => {
          this.controlOptions = res.data.control
          let keyword = res.data.keyword
          this.projectTypeOptions = keyword.type
          this.customerOptions = keyword.client
            ? keyword.client.map((str) => str.replace(/%2C/g, ','))
            : []
          this.domainOptions = keyword.field
            ? keyword.field.map((str) => str.replace(/%2C/g, ','))
            : []
          this.industryOptions = keyword.industry
            ? keyword.industry.map((str) => str.replace(/%2C/g, ','))
            : []
          this.productOptions = keyword.product
            ? keyword.product.map((str) => str.replace(/%2C/g, ','))
            : []
          this.softwareOptions = keyword.software
            ? keyword.software.map((str) => str.replace(/%2C/g, ','))
            : []
          this.engineerOptions = res.data.member
            ? res.data.member.map((str) => str.replace(/%2C/g, ','))
            : []

          this.changeLoadingState(false)
        })
        .catch((err) => {
          console.log(err)
          this.changeLoadingState(false)
        })
    },
    tagOnBlur(refName) {
      if (this.$refs[refName].searchValue != '') {
        let property = refName.split('Ref')[0]
        this.form[property].push(this.$refs[refName].searchValue)
        this.$refs[refName].searchValue = ''
      }
    },
    keyupHandler(event) {
      console.log(event)
    },
    addFileUpload() {
      this.fileCount++
      this.files.push({ fileCount: this.fileCount })
    },
    onRemoveFileUpload(index) {
      this.files.splice(index, 1)
    },
    submit() {
      this.$store.dispatch('changeLoadingState', true)
      this.form.domain = this.form.domain.map((x) => x.replace(/,/g, '%2C'))
      this.form.industryType = this.form.industryType.map((x) =>
        x.replace(/,/g, '%2C')
      )
      this.form.software = this.form.software.map((x) => x.replace(/,/g, '%2C'))
      this.form.teammates = this.form.teammates.map((x) =>
        x.replace(/,/g, '%2C')
      )
      this.form.customerName = this.form.customerName.replace(/,/g, '%2C')
      this.form.projectName = this.form.projectName.replace(/,/g, '%2C')
      this.form.product = this.form.product.replace(/,/g, '%2C')

      let formData = new FormData()
      formData.append('projectCreater', this.form.projectCreater)
      formData.append('projectType', this.form.projectType)
      formData.append('projectName', this.form.projectName)
      formData.append('projectDescription', this.form.projectDescription)
      formData.append('customerName', this.form.customerName)
      formData.append('domain', this.form.domain)
      formData.append('industryType', this.form.industryType)
      formData.append('product', this.form.product)
      formData.append('executor', this.form.executor)
      formData.append('teammates', this.form.teammates)
      formData.append('software', this.form.software)
      formData.append('status', this.form.status)
      formData.append('security', this.form.security)
      formData.append('startTime', formmatTime(this.form.startTime))
      formData.append('closeTime', formmatTime(this.form.closeTime))

      function formmatTime(d) {
        return !d
          ? ''
          : `${d.getFullYear()}/${
              d.getMonth() + 1
            }/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
      }
      API.apiAddProject(formData)
        .then((res) => {
          console.log(res)
          this.form = {
            projectCreater: sessionStorage.getItem('userName'),
            projectType: '',
            projectName: '',
            projectDescription: '',
            customerName: '',
            domain: [],
            industryType: [],
            product: '',
            executor: '',
            teammates: [],
            software: [],
            status: 'PROCESSING',
            security: '無',
            startTime: '',
            closeTime: '',
          }
          return API.apiProjectListInit({ id: this.userInfo.userId })
        })
        .then((res) => {
          let ids = res.data.map((data) => data.id)
          let maxId = Math.max.apply(this, ids)
          if (
            this.$refs.fuArray != undefined &&
            this.$refs.fuArray[0].fileName != ''
          ) {
            this.uploadFile(maxId)
          } else {
            this.$router.push({
              name: 'KnowledgeDatabase',
            })
          }
        })
        .catch((err) => {
          console.log(err)
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
          })
        })
    },
    uploadFile(projectId) {
      this.fileProgress.done = 0
      this.fileProgress.total = 0
      let sliceSize = 100 * 1024 * 1024 // 100 MB

      for (let fileId in this.$refs.fuArray) {
        const fileForm = {
          fileName: '',
          fileNames: '',
          fileDescription: '',
          patches: [],
          index: 0,
          total: 0,
        }
        if (this.$refs.fuArray[fileId].fileName != '') {
          this.fileProgress.show = true
          let size = this.$refs.fuArray[fileId].fileSize

          fileForm.fileName = this.$refs.fuArray[fileId].fileName
          fileForm.fileNames = fileForm.fileName
          fileForm.fileDescription = this.$refs.fuArray[fileId].fileDescription

          fileForm.total = Math.ceil(size / sliceSize)
          this.fileProgress.total += fileForm.total

          for (let sliceIndex = 0; sliceIndex < fileForm.total; sliceIndex++) {
            let start = sliceIndex * sliceSize
            let end = Math.min(size, start + sliceSize)
            fileForm.patches.push(
              this.$refs.fuArray[fileId].fileObj.slice(start, end)
            )
          }

          sentFileRequest.call(this, fileForm)
        } else {
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            showAction: true,
            message: this.$t('track.no-file'),
          })
        }
      }

      function sentFileRequest(fileForm) {
        const formData = new FormData()
        formData.append('total', fileForm.total)
        formData.append('index', fileForm.index)
        formData.append('file', fileForm.patches[fileForm.index])
        formData.append('fileNames', fileForm.fileNames)
        formData.append('fileDescriptions', fileForm.fileDescription)
        formData.append('id', projectId)
        formData
          .append('manager', this.form.projectCreater)
          .APIapiUploadBigFile(formData)
          .then((res) => {
            if (res.data == 'wait' && fileForm.index < fileForm.total - 1) {
              fileForm.index++
              this.fileProgress.done++
              return sentFileRequest.call(this, fileForm)
            } else if (res.data == 'success') {
              this.fileProgress.done++
              console.log('success')
              setTimeout(() => {
                if (this.fileProgress.done == this.fileProgress.total) {
                  this.files = []
                  this.addFileUpload()
                  this.fileProgress.show = false
                  this.changeLoadingState({
                    showDialog: true,
                    isLoading: false,
                    isSuccess: true,
                    showAction: true,
                    error: '',
                  })
                  this.$router.push({
                    name: 'KnowledgeDatabase',
                  })
                }
              }, 500)
            } else if (res.data == 'error') {
              console.log(res.data)
              throw 'Lose file patch'
            }
          })
          .catch((err) => {
            console.log(err)
            this.fileProgress.show = false
            this.changeLoadingState({
              showDialog: true,
              isLoading: false,
              isSuccess: false,
              showAction: true,
              error: 'loseFilePatchError',
            })
          })
      }
    },
    validateForm() {
      this.$refs.form.validate().then((isValidated) => {
        if (isValidated) this.submit()
      })
    },
  },
}
</script>

<style>
.creater-container {
  background-color: #444;
  max-width: 1000px;
  margin: auto;
  padding: 30px;
  padding-top: 10px;
  margin-bottom: 64px;
  margin-top: 20px;
  border-radius: 10px;
}
.mu-form-item-label {
  font-size: 20px;
  color: white;
  text-align: left;
}
.required::before {
  content: '*';
  display: inline;
  margin-right: 5px;
  color: red;
}
.creater-container .mu-input,
.creater-container .mu-chip {
  font-size: 20px !important;
}
.project-create-textarea {
  padding: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}
.creater-container h1 {
  color: white;
  margin: 0px;
  margin-bottom: 10px;
}
.creater-container h2 {
  color: white;
  text-align: left;
  margin-bottom: 10px;
}
</style>
