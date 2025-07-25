<template>
  <div class="project-detail-container">
    <h2>{{abstract.projectName}}</h2>
    <mu-expansion-panel :expand="panel === 'panel1'" @change="togglePanel('panel1')">
      <div slot="header" class="panel-header">{{$t('track.abstract')}}</div>
      <div slot="action" class="panel-modify">
        <mu-button
          v-if="!isEditing && writable"
          color="teal"
          @click="takeSnapshot"
        >{{$t('common.edit')}}</mu-button>
        <mu-button
          v-if="isEditing"
          color="#aaa"
          @click="getBackSnapShot"
          style="margin-right:5px;"
        >{{$t('common.cancel')}}</mu-button>
        <mu-button v-if="isEditing" color="primary" @click="validateForm">{{$t('common.confirm')}}</mu-button>
      </div>
      <div class="panel-body">
        <abstract
          ref="abstract"
          :abstract="abstract"
          :selectOptions="selectOptions"
          :isEditing="isEditing"
        ></abstract>
      </div>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel2'" @change="togglePanel('panel2')">
      <div slot="header" class="panel-header">{{$t('track.progress')}}</div>
      <check-points :checkPoints="checkpoints" :writable="writable"></check-points>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel3'" @change="togglePanel('panel3')">
      <div slot="header" class="panel-header">{{$t('track.log')}}</div>
      <flow-log :flow="flow"></flow-log>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel4'" @change="togglePanel('panel4')">
      <div slot="header" class="panel-header">{{$t('track.files')}}</div>
      <mu-row class="file-list" @click="loseFileFocus">
        <mu-col
          span="2"
          v-for="(fileInfo, index) in fileInfos"
          :key="index"
          @click="previewFile(index)"
          @dragover="allowDrop(index, $event)"
        >
          <div
            class="file-list-item"
            :class="{focus:fileFocus&&fileIndex==index,'while-drag':fileInfo.placehold}"
            :title="fileInfo.Subject"
          >
            <img
              :src="chooseFileIcon(fileInfo.Type)"
              width="50px"
              draggable="true"
              @dragend="drop(index)"
              @dragstart="drag(index)"
            />
            <div style="font-size:16px">{{shortFileName(fileInfo.Subject)}}</div>
            <div
              v-if="writable"
              class="file-remove"
              @click.stop="openRemoveFileDialog(index, fileInfo.Subject)"
            >x</div>
          </div>
        </mu-col>
        <confirm-dialog
          :title="$t('track.confirm-delete-file', {fileName:RemoveFileDialog.fileName})"
          :safeOption="$t('common.cancel')"
          :dangerOption="$t('common.delete')"
          :openAlert="RemoveFileDialog.isOpened"
          @closeConfirmDialog="removeFile(RemoveFileDialog.index, $event)"
        ></confirm-dialog>
      </mu-row>
      <table class="file-list-detail">
        <tr>
          <th style="width:40%">{{$t('track.file-name')}}</th>
          <th style="width:40%">{{$t('track.file-description')}}</th>
          <th style="width:20%">{{$t('track.file-download')}}</th>
        </tr>
        <tr v-if="fileIndex!=null">
          <td>{{fileInfos[fileIndex].Subject}}</td>
          <td>{{fileInfos[fileIndex].Describe}}</td>
          <td>
            <a
              :href="fileInfos[fileIndex].DownloadLink"
              download
              target="_blank"
              style="color:#0006ff;border-bottom:solid 1px #0006ff"
            >Download</a>
          </td>
        </tr>
      </table>
      <div v-if="isDispay">
        <pre class="text-viewer" v-if="currentFile.type=='txt'">{{currentFile.text}}</pre>
        <div class="ppt-viewer" v-if="currentFile.type=='ppt'">
          <mu-carousel
            ref="carousel"
            :cycle="false"
            :hide-indicators="true"
            :active="carouselPage"
            @change="changePageByCarousel"
          >
            <mu-carousel-item v-for="name in reportNames" :key="name">
              <img :src="name" />
            </mu-carousel-item>
          </mu-carousel>
          <mu-row justify-content="center">
            <mu-pagination
              :total="reportNames.length*10"
              :current.sync="currPage"
              @change="changePageByPagination"
            ></mu-pagination>
          </mu-row>
        </div>
      </div>
      <iframe
        class="pdf-viewer"
        v-if="currentFile.type=='pdf'"
        :src="currentFile.url"
      >{{$t('track.no-pdf')}}</iframe>
      <img class="img-viewer" v-if="currentFile.type=='img'" :src="currentFile.url" />
    </mu-expansion-panel>
    <mu-expansion-panel
      v-if="writable"
      :expand="panel === 'panel5'"
      @change="togglePanel('panel5')"
    >
      <div slot="header" class="panel-header">{{$t('track.file-upload')}}</div>
      <div class="panel-body">
        <file-upload
          v-for="(file,index) in files"
          :key="file.fileCount"
          :fileCount="index"
          :ref="'fuArray'"
          @removeFileUpload="onRemoveFileUpload"
        ></file-upload>

        <append-button @click="addFileUpload" />
      </div>
      <mu-button color="primary" @click="uploadFile">{{$t('common.submit')}}</mu-button>
      <qi-progress :progress="fileProgress"></qi-progress>
    </mu-expansion-panel>
  </div>
</template>

<script>
import Abstract from '@/components/Track/Abstract.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import CheckPoints from '@/components/Track/CheckPoints'
import FlowLog from '@/components/Track/FlowLog'
import FileUpload from '@/components/Track/FileUpload'
import QiProgress from '@/components/common/QiProgress.vue'
import AppendButton from '@/components/common/AppendButton.vue'
import { mapGetters, mapActions } from 'vuex'
import API from '@/assets/js/api'

export default {
  name: 'ProjectDetail',
  props: { projectId: Number },
  components: {
    Abstract,
    ConfirmDialog,
    FileUpload,
    CheckPoints,
    FlowLog,
    QiProgress,
    AppendButton,
  },
  data() {
    return {
      // UI Control
      writable: false,
      readable: false,
      panel: 'panel1',
      // Abstract
      abstract: {
        id: '',
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
      },
      isEditing: false,
      abstractBeforeModify: {},
      openDeleteProjectDialog: false,
      // File Preview
      fileInfos: [],
      originFileInfos: [],
      fileFocus: false,
      fileIndex: null,
      dropTargetId: null,
      dragTargetId: null,
      isDragging: false,
      isDispay: false,
      reportNames: [],
      currPage: 1,
      carouselPage: 0,
      currentFile: {
        type: '',
      },
      RemoveFileDialog: {
        isOpened: false,
        index: null,
        fileName: '',
      },
      // Modify Project
      selectOptions: {
        statusOptions: ['PROCESSING', 'CLOSED'],
        securityOptions: ['無', '有'],
        dealOptions: [
          '成功導入',
          '客戶評估中',
          '短期內未能導入(因技術面)',
          '短期內未能導入(非技術面)',
          '不明',
        ],
        projectTypeOptions: [],
        softwareOptions: [],
        engineerOptions: [],
        customerOptions: [],
        domainOptions: [],
        industryOptions: [],
        productOptions: [],
        controlOptions: [],
      },
      // Check Point
      checkpoints: [],
      // Flow
      flow: {},
      // File Upload
      files: [{ fileCount: 1 }],
      fileCount: 1,
      fileProgress: {
        show: false,
        title: 'Please wait',
        done: 0,
        total: 0,
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'loadingDialog']),
    statusStyle() {
      return {
        'project-state-normal': this.abstract.status == 'PROCESSING',
        'project-state-close': this.abstract.status != 'CLOSED',
      }
    },
    dealStateStyle() {
      return {
        'project-state-close-deal':
          this.abstract.deal == this.selectOptions.dealOptions[0],
      }
    },
  },
  mounted() {
    this.getProjectDetail()
    this.getInitialOptions()
  },
  created() {
    window.addEventListener('keyup', this.changePageByKey)
  },
  destroyed() {
    window.removeEventListener('keyup', this.changePageByKey)
  },
  methods: {
    ...mapActions(['changeLoadingState']),
    // Get Data
    getProjectDetail(isInit) {
      this.isEditing = false
      if (isInit) this.changeLoadingState(true)
      else
        this.changeLoadingState({
          showDialog: true,
          isLoading: false,
          showAction: true,
        })
      // Avoid the situation that user cannot get the id if they reload the page.
      if (!isNaN(this.projectId))
        sessionStorage.setItem('projectId', this.projectId)

      let payload = {
        id: parseInt(sessionStorage.getItem('projectId')),
        userId: this.userInfo.userId,
      }
      API.apiGetProjectById(payload)
        .then((res) => {
          this.writable = res.data.writable
          this.readable = res.data.readable

          this.abstract.id = res.data.id
          this.abstract.projectCreater = res.data.manager
          this.abstract.projectType = res.data.type
            .split(',')
            .map((x) => x.replace(/%2C/g, ','))
          this.abstract.projectDescription = res.data.describe
          this.abstract.executor = res.data.executor
          this.abstract.status = res.data.status
          this.abstract.security = res.data.security
          this.abstract.projectName = res.data.subject.replace(/%2C/g, ',')
          this.abstract.customerName = res.data.client.replace(/%2C/g, ',')
          this.abstract.product = res.data.product.replace(/%2C/g, ',')
          this.abstract.domain = res.data.field
            .split(',')
            .map((x) => x.replace(/%2C/g, ','))
          this.abstract.industryType = res.data.industry
            .split(',')
            .map((x) => x.replace(/%2C/g, ','))
          this.abstract.teammates = res.data.team
            .split(',')
            .map((x) => x.replace(/%2C/g, ','))
          this.abstract.software = res.data.software
            .split(',')
            .map((x) => x.replace(/%2C/g, ','))
          this.abstract.deal =
            res.data.deal == '' ? this.$t('common.unknown') : res.data.deal
          this.abstract.startTime = res.data.start_time
          this.abstract.closeTime = res.data.close_time
          this.abstract.manager = sessionStorage.getItem('userName')
          this.clearFilesComma(res.data.Files)

          this.checkpoints =
            res.data.checkpoint && JSON.parse(res.data.checkpoint)
          this.flow = res.data.flow

          if (isInit) this.changeLoadingState(false)
        })
        .catch((err) => {
          if (err.config.data.id == null) {
            this.$router.push({ name: 'KnowledgeDatabase' })
          } else {
            console.log(err)
          }
        })
    },
    // File Preview
    shortFileName(name) {
      if (name.length > 10) return name.slice(0, 9) + '...'
      else return name
    },
    chooseFileIcon(type) {
      switch (type) {
        case 'ppt':
          return '/img/file-icons/012-powerpoint.png'
        case 'txt':
          return '/img/file-icons/007-txt.png'
        case 'pdf':
          return '/img/file-icons/002-pdf.png'
        case 'img':
          return '/img/file-icons/image.png'
        default:
          return '/img/file-icons/019-document-1.png'
      }
    },
    loseFileFocus(e) {
      if (e.target.classList.contains('row')) this.fileFocus = false
    },
    drag(index) {
      this.dragTargetId = index
    },
    allowDrop(index, e) {
      e.preventDefault()
      if (this.dropTargetId != index) {
        this.dropTargetId = index
        if (this.originFileInfos.length != 0 && this.isDragging) {
          this.fileInfos = Object.assign([], this.originFileInfos)
        } else {
          this.originFileInfos = Object.assign([], this.fileInfos)
          this.isDragging = true
        }

        this.dragItem(
          this.fileInfos,
          this.dragTargetId,
          this.dropTargetId,
          true
        )
      }
    },
    dragItem(fileInfos, dragTargetId, dropTargetId, placeholdState) {
      let temp = Object.assign([], fileInfos)
      let dragTarget = temp.splice(dragTargetId, 1)
      let leftArray = temp.splice(0, dropTargetId)
      let rightArray = temp
      dragTarget[0].placehold = placeholdState
      leftArray.push(dragTarget[0])
      Object.assign(fileInfos, leftArray.concat(rightArray))
    },
    drop(index) {
      // Initialization
      if (this.originFileInfos.length != 0) {
        this.fileInfos = Object.assign([], this.originFileInfos)
      }

      this.dragItem(this.fileInfos, index, this.dropTargetId, false)
      this.storeFileOrder()

      // Final
      this.dropTargetId = -1
      this.isDragging = false
    },
    storeFileOrder() {
      let payload = {
        projectId: this.abstract.id,
        userName: sessionStorage.getItem('userName'),
        files: this.fileInfos.map((x) => x.Id),
      }
      API.apiModifyFile(payload)
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    sortFileInfos(files) {
      this.fileInfos = Object.assign([], files)
      // For Development Mode
      if (window.webpackHotUpdate)
        this.fileInfos.forEach(
          (x) => (x.DownloadLink = API.DUTY_URL + x.DownloadLink)
        )
    },
    reportNamesInit(file) {
      this.reportNames = []
      for (let i = 0; i < file.pic_num; i++) {
        this.reportNames[i] = file.folder + 'page' + (i + 1) + '.png'
      }
    },
    previewFile(index) {
      if (this.fileIndex != index) {
        this.fileFocus = true
        this.currPage = 1
        this.carouselPage = 0
      } else {
        this.fileFocus = !this.fileFocus
      }

      if (this.fileInfos[index].Previewable) {
        this.changeLoadingState(true)
        API.apiGetFilePreview({ id: this.fileInfos[index].Id })
          .then((res) => {
            this.currentFile = res.data
            // For Development Mode
            if (window.webpackHotUpdate) {
              this.currentFile.folder = API.DUTY_URL + this.currentFile.folder
              this.currentFile.url = API.DUTY_URL + this.currentFile.url
            }
            this.reportNamesInit(this.currentFile)

            this.changeLoadingState(false)
          })
          .catch((err) => {
            console.log(err)
            this.changeLoadingState({
              showDialog: true,
              isLoading: false,
              showAction: true,
              message: this.$t('這個檔案無法預覽'),
            })
          })
        this.isDispay = true
        this.fileIndex = index
      } else {
        this.changeLoadingState({
          showDialog: true,
          isLoading: false,
          showAction: true,
          message: this.$t('這個檔案無法預覽'),
        })
      }
    },
    removeFile(index, isConfirm) {
      this.RemoveFileDialog.isOpened = false
      if (isConfirm) {
        this.fileInfos.splice(index, 1)
        this.storeFileOrder()
      }
    },
    togglePanel(panel) {
      this.panel = panel === this.panel ? '' : panel
    },
    changePageByKey(e) {
      if (e.key == 'ArrowRight') {
        this.currPage =
          this.currPage >= this.reportNames.length
            ? this.reportNames.length
            : (this.currPage += 1)
        this.carouselPage = this.currPage - 1
      }
      if (e.key == 'ArrowLeft') {
        this.currPage = this.currPage <= 1 ? 1 : (this.currPage -= 1)
        this.carouselPage = this.currPage - 1
      }
    },
    changePageByPagination() {
      this.carouselPage = this.currPage - 1
    },
    changePageByCarousel(index) {
      this.currPage = index + 1
      if (this.$refs.carousel.activeIndex != this.carouselPage)
        this.carouselPage = this.$refs.carousel.activeIndex
    },
    // File Upload
    addFileUpload() {
      this.fileCount++
      this.files.push({ fileCount: this.fileCount })
    },
    onRemoveFileUpload(index) {
      this.files.splice(index, 1)
    },
    uploadFile() {
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
        formData.append('id', this.abstract.id)
        formData.append('manager', this.abstract.manager)

        API.apiUploadBigFile(formData)
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
                  this.getProjectDetail()
                }
              }, 500)
            } else if (res.data == 'error') {
              
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
    clearFilesComma(files) {
      files.forEach((o) => (o.Subject = o.Subject.replace(/%2C/g, ',')))
      files.forEach((o) => (o.Describe = o.Describe.replace(/%2C/g, ',')))
      this.sortFileInfos(files)
    },
    // Modify Project
    getInitialOptions() {
      this.changeLoadingState(true)
      API.apiAddProjectInit()
        .then((res) => {
          this.controlOptions = res.data.control
          let keyword = res.data.keyword
          this.selectOptions.projectTypeOptions = keyword.type
          this.selectOptions.customerOptions = keyword.client.map((str) =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.domainOptions = keyword.field.map((str) =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.industryOptions = keyword.industry.map((str) =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.productOptions = keyword.product.map((str) =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.softwareOptions = keyword.software.map((str) =>
            str.replace(/%2C/g, ',')
          )
          this.selectOptions.engineerOptions = res.data.member.map((str) =>
            str.replace(/%2C/g, ',')
          )

          this.changeLoadingState(false)
        })
        .catch((err) => {
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
        componentAbstract.$refs.abstract.validate().then((isValidated) => {
          if (isValidated) this.modifyProject()
        })
      }
    },
    modifyProject() {
      this.changeLoadingState(true)

      let payload = Object.assign({}, this.abstract)
      payload.domain = payload.domain.map((x) => x.replace(/,/g, '%2C'))
      payload.industryType = payload.industryType.map((x) =>
        x.replace(/,/g, '%2C')
      )
      payload.software = payload.software.map((x) => x.replace(/,/g, '%2C'))
      payload.teammates = payload.teammates.map((x) => x.replace(/,/g, '%2C'))
      payload.customerName = payload.customerName.replace(/,/g, '%2C')
      payload.projectName = payload.projectName.replace(/,/g, '%2C')
      payload.product = payload.product.replace(/,/g, '%2C')

      API.apiModifyProject(payload)
        .then(() => {
          this.isEditing = false
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: true,
            showAction: true,
          })
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
    deleteProject(isConfirm) {
      this.closeConfirmDialog('openDeleteProjectDialog')

      if (isConfirm) {
        this.changeLoadingState(true)
        let payload = {
          id: this.projectId,
          userName: sessionStorage.getItem('userName'),
        }
        API.apiDeleteProject(payload)
          .then((res) => {
            console.log(res)
            this.changeLoadingState(false)
            setTimeout(() => {
              this.$router.push({
                name: 'KnowledgeDatabase',
              })
            }, 500)
          })
          .catch((err) => {
            console.log(err)
          })
      }
    },
    openConfirmDialog(dialogStatus) {
      this[dialogStatus] = true
    },
    closeConfirmDialog(dialogStatus) {
      this[dialogStatus] = false
    },
    openRemoveFileDialog(index, fileName) {
      this.RemoveFileDialog.isOpened = true
      this.RemoveFileDialog.fileName = fileName
      this.RemoveFileDialog.index = index
    },
  },
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
.project-detail-fab-btn {
  float: left;
  margin-left: 15px;
}
.project-detail-fab-btn .mu-icon {
  font-size: 24px !important;
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
.project-state-close-deal {
  color: #367ec5;
}
.panel-header {
  font-size: 25px;
}
.panel-body {
  margin-left: 10px;
  margin-right: 10px;
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
.mu-expansion-panel-header {
  background-color: #555;
}
.mu-expansion-panel-container {
  background-color: #6f6f6f;
}
.file-list {
  max-height: 200px;
  border: solid 2px gray;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.file-list-item.focus {
  background-color: #aaa;
}
.file-list-item {
  cursor: pointer;
  margin-bottom: 10px;
}
.file-remove {
  position: absolute;
  display: none;
  top: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;
  background-color: #ffb3b3;
}
.file-list-item:hover .file-remove {
  display: block;
}
.file-remove:hover {
  background-color: #ff4d4d;
}
.file-list-item:hover {
  background-color: #aaa;
}
.while-drag {
  opacity: 0.2;
}
.file-list-detail {
  margin-bottom: 20px;
  width: 100%;
  border: solid 2px gray;
  padding: 10px;
}
.ppt-viewer {
  height: 80vh;
  margin: auto;
}
.ppt-viewer img {
  width: auto;
  height: auto;
  max-width: 90%;
  max-height: 100%;
}
.mu-carousel {
  height: 97%;
}
.mu-carousel-item img {
  min-width: unset;
}
.text-viewer {
  margin: auto;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  width: 90%;
  height: 70vh;
  text-align: left;
  background-color: #555;
  border: solid 2px gray;
}
.pdf-viewer {
  width: 90%;
  height: 70vh;
}
.img-viewer {
  width: 100%;
}
</style>
