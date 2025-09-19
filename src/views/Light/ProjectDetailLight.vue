<template>
  <div>
    <div class="project-detail-container">
      <h2>{{ abstract.projectName }}</h2>
      <div class="panel-header">
        {{ $t('track.abstract') }}
        <mu-button v-if="!isEditing" color="teal" @click="takeSnapshot">{{
          $t('common.edit')
        }}</mu-button>
      </div>
      <div class="panel-body">
        <abstract
          ref="abstract"
          :abstract="abstract"
          :selectOptions="selectOptions"
          :isEditing="isEditing"
        ></abstract>
      </div>
      <div class="panel-modify">
        <mu-button
          v-if="isEditing"
          color="#aaa"
          @click="getBackSnapShot"
          style="margin-right:5px;"
          >{{ $t('common.cancel') }}</mu-button
        >
        <mu-button v-if="isEditing" color="primary" @click="validateForm">{{
          $t('common.confirm')
        }}</mu-button>
      </div>
    </div>
    <h2>
      {{ $t('light.more-features') }}
      <p class="contact" v-html="$t('common.cae-support')"></p>
    </h2>
    <img
      class="ad"
      src="@/assets/images/light/track.png"
      alt="Project Detail"
    />
  </div>
</template>

<script>
import Abstract from '@/components/Track/Abstract.vue'
import { mapGetters } from 'vuex'
import API from '@/assets/js/api'

export default {
  name: 'ProjectDetailLight',
  props: { projectId: Number },
  components: { Abstract },
  data() {
    return {
      // Abstract
      abstract: {
        id: 0,
        projectCreater: '',
        projectType: [],
        projectName: '',
        projectDescription: '',
        customerName: '',
        domain: [],
        industryType: [],
        product: '',
        executor: '',
        teammates: [],
        software: [],
        status: '',
        security: '',
        deal: '',
        startTime: '',
        closeTime: '',
        manager: ''
      },
      isEditing: false,
      abstractBeforeModify: {},
      openDeleteProjectDialog: false,
      // Modify Project
      selectOptions: {
        statusOptions: ['PROCESSING', 'CLOSED'],
        securityOptions: ['無', '有'],
        dealOptions: [
          '成功導入',
          '客戶評估中',
          '短期內未能導入(因技術面)',
          '短期內未能導入(非技術面)',
          '不明'
        ],
        projectTypeOptions: [this.dataLoading],
        softwareOptions: [this.dataLoading],
        engineerOptions: [this.dataLoading],
        customerOptions: [this.dataLoading],
        domainOptions: [this.dataLoading],
        industryOptions: [this.dataLoading],
        productOptions: [this.dataLoading],
        controlOptions: [this.dataLoading]
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    dataLoading() {
      return this.$t('common.data-loading')
    },
    statusStyle() {
      return {
        'project-state-normal': this.abstract.status == 'PROCESSING',
        'project-state-close': this.abstract.status != 'CLOSED'
      }
    },
    dealStateStyle() {
      return {
        'project-state-close-dealt':
          this.abstract.deal == this.selectOptions.dealOptions[0]
      }
    }
  },
  mounted() {
    this.getProjectDetail()
    this.getInitialOptions()
  },
  methods: {
    // Get Data
    getProjectDetail() {
      this.isEditing = false
      this.$store.dispatch('changeLoadingState', true)
      // Avoid the situation that user cannot get the id if they reload the page.
      if (!isNaN(this.projectId))
        sessionStorage.setItem('projectId', this.projectId)
      let payload = {
        id: parseInt(sessionStorage.getItem('projectId')),
        userId: this.userInfo.userId
      }
      API.apiGetProjectById(payload)
        .then(res => {
          this.writable = res.data.writable
          this.readable = res.data.readable

          this.abstract.id = res.data.id
          this.abstract.projectCreater = res.data.manager
          this.abstract.projectType = res.data.type
            .split(',')
            .map(x => x.replace(/%2C/g, ','))
          this.abstract.projectDescription = res.data.describe
          this.abstract.executor = res.data.executor
          this.abstract.status = res.data.status
          this.abstract.security = res.data.security
          this.abstract.projectName = res.data.subject.replace(/%2C/g, ',')
          this.abstract.customerName = res.data.client.replace(/%2C/g, ',')
          this.abstract.product = res.data.product.replace(/%2C/g, ',')
          this.abstract.domain = res.data.field
            .split(',')
            .map(x => x.replace(/%2C/g, ','))
          this.abstract.industryType = res.data.industry
            .split(',')
            .map(x => x.replace(/%2C/g, ','))
          this.abstract.teammates = res.data.team
            .split(',')
            .map(x => x.replace(/%2C/g, ','))
          this.abstract.software = res.data.software
            .split(',')
            .map(x => x.replace(/%2C/g, ','))
          this.abstract.deal =
            res.data.deal == '' ? this.$t('common.unknown') : res.data.deal
          this.abstract.startTime = res.data.start_time
          this.abstract.closeTime = res.data.close_time
          this.abstract.manager = sessionStorage.getItem('userName')

          this.checkpoints =
            res.data.checkpoint && JSON.parse(res.data.checkpoint)
          this.flow = res.data.flow

          this.$store.dispatch('changeLoadingState', false)
        })
        .catch(err => {
          console.log(err)
        })
    },
    // Modify Project
    getInitialOptions() {
      this.$store.dispatch('changeLoadingState', true)
      API.apiAddProjectInit()
        .then(res => {
          this.controlOptions = res.data.control
          let keyword = res.data.keyword
          this.selectOptions.projectTypeOptions = keyword.type
          this.selectOptions.customerOptions = keyword.client.map(str =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.domainOptions = keyword.field.map(str =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.industryOptions = keyword.industry.map(str =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.productOptions = keyword.product.map(str =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.softwareOptions = keyword.software.map(str =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.engineerOptions = res.data.member.map(str =>
            str.replace(/%2C/g, ',')
          )

          this.$store.dispatch('changeLoadingState', false)
        })
        .catch(err => {
          console.log(err)
        })
    },
    takeSnapshot() {
      this.isEditing = true
      this.abstractBeforeModify = Object.assign({}, this.abstract)
    },
    getBackSnapShot() {
      this.isEditing = false
      this.abstract = Object.assign({}, this.abstractBeforeModify)
    },
    validateForm() {
      if (
        JSON.stringify(this.abstractBeforeModify) ==
        JSON.stringify(this.abstract)
      ) {
        this.isEditing = false
      } else {
        let componentAbstract = this.$refs.abstract
        componentAbstract.$refs.abstract.validate().then(isValidated => {
          if (isValidated) this.modifyProject()
        })
      }
    },
    modifyProject() {
      this.$store.dispatch('changeLoadingState', true)

      let payload = Object.assign({}, this.abstract)
      payload.domain = payload.domain.map(x => x.replace(/,/g, '%2C'))
      payload.industryType = payload.industryType.map(x =>
        x.replace(/,/g, '%2C')
      )
      payload.software = payload.software.map(x => x.replace(/,/g, '%2C'))
      payload.teammates = payload.teammates.map(x => x.replace(/,/g, '%2C'))
      payload.customerName = payload.customerName.replace(/,/g, '%2C')
      payload.projectName = payload.projectName.replace(/,/g, '%2C')
      payload.product = payload.product.replace(/,/g, '%2C')
      function logPayloadTypes(payload) {
        for (let key in payload) {
          if (payload.hasOwnProperty(key)) {
            console.log(`${key}: ${typeof payload[key]}`)
          }
        }
      }
      logPayloadTypes(payload)
      API.apiModifyProject(payload)
        .then(() => {
          this.isEditing = false
          this.$store.dispatch('changeLoadingState', {
            showDialog: true,
            isLoading: false,
            isSuccess: true,
            showAction: true
          })
        })
        .catch(err => {
          console.log(err)
          this.$store.dispatch('changeLoadingState', {
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true
          })
        })
    },
    deleteProject(isConfirm) {
      this.openDeleteProjectDialog = false

      if (isConfirm) {
        this.$store.dispatch('changeLoadingState', true)
        let payload = {
          id: this.projectId,
          userName: sessionStorage.getItem('userName')
        }
        API.apiDeleteProject(payload)
          .then(res => {
            console.log(res)
            this.$store.dispatch('changeLoadingState', false)
            setTimeout(() => {
              this.$router.push({
                name: 'Knowledge Database'
              })
            }, 500)
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    openConfirmDialog(dialogStatus) {
      this[dialogStatus] = true
    }
  }
}
</script>

<style>
.project-detail-container {
  background-color: #444;
  max-width: 1000px;
  margin: auto;
  padding: 30px;
  padding-top: 10px;
  margin-bottom: 64px;
  margin-top: 20px;
  border-radius: 10px;
}
.mu-input.disabled .mu-input-content {
  cursor: default;
}
.project-detail-container .mu-input,
.project-detail-container .mu-chip {
  font-size: 20px !important;
}
.project-detail-textarea {
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow-y: auto;
}
.project-detail-textarea.disabled {
  border: none;
  padding: 0px;
  border-bottom: 2px dotted rgba(255, 255, 255, 0.3);
}
h2 {
  color: white;
}
h3 {
  color: white;
  text-align: left;
  margin-bottom: 10px;
}
.mu-form-item-label {
  font-size: 20px;
}
.emphasis .mu-form-item-label {
  color: #43c5b8;
}
.project-state-normal {
  color: #3ad840;
}
.project-state-close {
  color: #e4c362;
}
.project-state-close-dealt {
  color: #367ec5;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  font-size: 26px;
  margin-left: 10px;
}
.panel-body {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 20px;
  color: white;
  text-align: left;
  font-size: 18px;
}
.panel-modify {
  width: 100%;
  margin-right: 10px;
  color: white;
  text-align: right;
  font-size: 18px;
}
img.ad {
  max-width: 1000px;
  margin: auto;
  padding: 30px;
}
.contact {
  color: deepskyblue;
  margin: 20px 0;
  font-size: inherit;
}
</style>
