<template>
  <div style="margin:30px">
    <mu-container>
      <div style="margin-bottom:100px">
        <router-link to="/Lab2">Lab2</router-link>
      </div>
      <router-link :to="{ name: 'Lab2', params: { b2a: 123 } }">
        <button>b->a</button>
      </router-link>

      <button style="position:fixed;top:0;left:0" @click="testAlet('1')">
        1
      </button>
      <button style="position:fixed;top:0;left:0" @click="testAlet('2')">
        2
      </button>

      <vmodel-parent></vmodel-parent>
      <br />
      <br />
      <mu-button color="primary" @click="openLocalApp"
        >開啟本地端應用程式</mu-button
      >
      <mu-button color="primary" @click="openRemoteFolder"
        >開啟遠端資料夾</mu-button
      >
      <br />
      <br />
      <mu-button color="primary" @click="auth">jwt驗證</mu-button>
      <br />
      <br />
      <input type="file" ref="myFile" />
      <mu-button @click="uploadBigFile">上傳</mu-button>
      <span>{{ doneCount }}/{{ totalCount }}</span>
    </mu-container>

    <gantt></gantt>
  </div>
</template>

<script>
import Gantt from '@/components/Track/Gantt.vue'
import VmodelParent from '@/components/lab/VmodelParent.vue'
import auth from '@/assets/js/auth.js'
import { apiUploadBigFile } from '@/assets/js/api'

export default {
  name: 'Lab1',
  components: {
    Gantt,
    VmodelParent
  },
  data() {
    return {
      totalCount: 0,
      doneCount: 0
    }
  },
  methods: {
    openRemoteFolder() {
      window.location.href = 'OpenRemoteFolder:\\'
    },
    openLocalApp() {
      window.location.href = 'LaunchApp:\\'
    },
    auth() {
      let token = auth.createToken({ a: 123, b: 456, c: new Date() })
      console.log(token)
      auth
        .verifyToken(token)
        .then(decoded => {
          console.log(decoded)
        })
        .catch(err => {
          console.log(err)
        })
    },
    testAlet(str) {
      alert(str)
    },
    uploadBigFile() {
      // Initialization
      this.doneCount = 0
      this.totalCount = 0

      let file = this.$refs.myFile.files[0]
      let size = file.size
      let name = file.name
      let sliceSize = 1 * 1024 * 1024
      let totalCount = Math.ceil(size / sliceSize)
      this.totalCount = totalCount

      for (let i = 0; i < totalCount; i++) {
        let start = i * sliceSize
        let end = Math.min(size, start + sliceSize)
        let fileSlices = file.slice(start, end)
        let formData = new FormData()
        formData.append('index', i)
        formData.append('total', totalCount)
        formData.append('file' + 0, fileSlices)
        formData.append('fileNames', [name])
        formData.append('fileDescriptions', [])
        formData.append('id', 52)
        formData.append('manager', 'Star Wang[王星翔]')
        formData.append('fileName', name)
        console.log(formData)
        apiUploadBigFile(formData).then(res => {
          if (res.data == 'wait') this.doneCount++
          if (res.data == 'success') this.doneCount = this.totalCount
        })
      }
    }
  }
}
</script>

<style></style>
