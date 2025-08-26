<template>
  <section ref="container" class="files-container">
    <aside :style="aside">
      <tree-view :itemList="treeItemList" />
    </aside>
    <div class="resizer" @mousedown="resizeTreeView($event)"></div>
    <div
      class="content-viewer"
      :class="{ borderLight: showBox }"
      :style="contentViewer"
      @dragover.prevent="handleDragOver($event)"
      @dragleave="showBox = false"
      @drop.prevent="handleDrop($event)"
    >
      <mu-row align-items="center">
        <mu-col span="4">
          <mu-auto-complete label="Search" full-width></mu-auto-complete>
        </mu-col>
        <mu-col span="6">
          <input
            type="file"
            directory
            webkitdirectory
            multiple
            @input="showIt"
          />
        </mu-col>
        <mu-col span="2">
          <mu-button @click="uploadJobFiles">Upload</mu-button>
        </mu-col>
      </mu-row>
      <br />
      <file-table :list="directory"></file-table>

      <div class="upload-messge-box" v-if="showBox">
        <div>拖曳資料夾或檔案到這裡會立即上傳到此資料夾:</div>
        <div>folderPath</div>
      </div>
    </div>
  </section>
</template>

<script>
import TreeView from "@/components/common/TreeView.vue"
import FileTable from "@/components/Track/FileTable.vue"
import TreeviewConverter from "@/assets/js/treeview_converter"
import { mapGetters, mapActions } from "vuex"
import {
  apiUploadJobFile,
  apiUploadJobFinished,
  apiUploadBigFile,
} from "@/assets/js/api.js"

var treeItemList = [
  {
    name: "My Tree",
    children: [
      { name: "hello" },
      { name: "wat" },
      {
        name: "empty folder",
        children: [],
      },
      {
        name: "child folder",
        children: [
          {
            name: "child folder",
            children: [{ name: "hello.txt" }, { name: "wat.txt" }],
          },
          { name: "hello.txt" },
          { name: "wat.txt" },
          {
            name: "child folder",
            children: [{ name: "hello.txt" }, { name: "wat.txt" }],
          },
          {
            name: "empty folder",
            children: [],
          },
        ],
      },
    ],
  },
]
const list = [
  {
    name: "File1.txt",
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    iron: 1,
  },
  {
    name: "File2.txt",
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    iron: 1,
  },
  {
    name: "File3.txt",
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
    iron: 7,
  },
  {
    name: "File4.txt",
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    iron: 8,
  },
  {
    name: "File5.txt",
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
    iron: 16,
  },
  {
    name: "File6.txt",
    calories: 375,
    fat: 0.0,
    carbs: 94,
    protein: 0.0,
    iron: 0,
  },
  {
    name: "File7.txt",
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    iron: 2,
  },
]
export default {
  name: "Files",
  components: { TreeView, FileTable },
  data() {
    return {
      treeItemList: treeItemList,
      treeviewWidth: 200,
      showBox: false,
      // Upload folder
      cwd: null,
      fs: null,
      fileTreeArray: ["將檔案拖曳過來"],
      tempEntry: null,
      directory: list,
      files: [],
    }
  },
  computed: {
    ...mapGetters(["layout"]),
    aside() {
      return {
        width: this.treeviewWidth + "px",
      }
    },
    resizer() {
      return {
        left: this.treeviewWidth + "px",
      }
    },
    contentViewer() {
      const resizerWidth = 5
      const isShown = this.layout.isSidenavShown
      const sw = this.layout.sidenavWidth
      let containerWidth =
        (this.$refs.container && this.$refs.container.innerWidth) ||
        window.innerWidth - 18
      let sidebarWidth = isShown ? sw : 0
      return {
        width:
          containerWidth -
          sidebarWidth -
          this.treeviewWidth -
          resizerWidth +
          "px",
      }
    },
  },
  mounted() {
    this.initFileSystem()
  },
  methods: {
    showIt(e) {
      console.log(e)
      let rootPathName = e.target.files[0].webkitRelativePath.split("/")[0]
      // 1024 * 1024 = 1MB
      console.log(rootPathName)
      window.requestFileSystem(
        window.TEMPORARY || 0,
        1024 * 1024,
        fs => {
          createDirectory(fs.root, "Document/Embeded/".split("/"))
          fs.root.getDirectory(
            rootPathName,
            { create: true },
            dirEntry => {
              var dirReader = dirEntry.createReader()
              dirReader.readEntries(entries => {
                for (var i = 0; i < entries.length; i++) {
                  var entry = entries[i]
                  if (entry.isDirectory) {
                    console.log("Directory: " + entry.fullPath)
                  } else if (entry.isFile) {
                    console.log("File: " + entry.fullPath)
                  }
                }
              }),
                err => {
                  console.dir(err)
                }
            },
            err => {
              console.dir(err)
            }
          )
        },
        err => {
          console.log(err)
        }
      )

      function createDirectory(rootDir, folders) {
        rootDir.getDirectory(
          folders[0],
          { create: true },
          function (dirEntry) {
            if (folders.length) {
              createDirectory(dirEntry, folders.slice(1))
            }
            console.log(dirEntry)
          },
          err => {
            console.log(err)
          }
        )
      }
    },
    ...mapActions(["changeLoadingState"]),
    resizeTreeView(e) {
      const vm = this
      let x = e.x

      window.addEventListener("mousemove", handler1)
      window.addEventListener("mouseup", handler2)

      function handler1(e) {
        if (e.x != x) {
          const isShown = vm.layout.isSidenavShown
          const sw = vm.layout.sidenavWidth
          let sidebarWidth = isShown ? sw : 0
          let calculatedWidth = e.x - sidebarWidth

          // Handle the non-expected 0 width when dragend
          if (e.x == 0) return
          else if (calculatedWidth < 200) vm.treeviewWidth = 200
          else if (calculatedWidth > 400) vm.treeviewWidth = 400
          else vm.treeviewWidth = calculatedWidth
        }
      }

      function handler2() {
        window.removeEventListener("mousemove", handler1)
        window.removeEventListener("mousemove", handler2)
      }
    },
    handleDragOver(e) {
      // console.log(e)
      if (e.fromElement == null) {
        this.showBox = true
      }
    },
    initFileSystem() {
      window.requestFileSystem =
        window.requestFileSystem || window.webkitRequestFileSystem
      window.resolveLocalFileSystemURL =
        window.resolveLocalFileSystemURL ||
        window.webkitResolveLocalFileSystemURL
      const vm = this

      window.requestFileSystem(
        window.TEMPORARY || 0,
        1024 * 1024,
        fileSystem => {
          vm.fs = fileSystem
          vm.cwd = vm.fs.root
          vm.clearFileSystem(vm.cwd)
        },
        vm.onError
      )
    },
    clearFileSystem(dirEntry) {
      const vm = this
      let i = 0
      return new Promise(resolve => {
        vm.readDirectory(dirEntry, function (entries) {
          next()
          function next() {
            const entry = entries[i++]
            if (!entry) {
              resolve()
            } else {
              vm.getEntry(entry.fullPath, function (entry) {
                entry.isDirectory
                  ? entry.removeRecursively(function () {
                      next()
                    }, vm.onError)
                  : entry.remove(function () {
                      next()
                    }, vm.onError)
              })
            }
          }
        })
      })
    },
    handleDrop(e) {
      const vm = this
      vm.showBox = false
      // vm.cwd = vm.fs.root
      vm.fileTreeArray = []

      let items = e.dataTransfer.items
      // var files = e.dataTransfer.files
      const entryPromises = []

      for (let item of items) {
        // Skip this one if we didn't get a file.
        if (item.kind != "file") {
          console.log("Not a file: ", item)
          continue
        }

        if (item.getAsEntry) vm.tempEntry = item.getAsEntry
        else vm.tempEntry = item.webkitGetAsEntry()

        entryPromises.push(
          vm.clearFileSystem(vm.fs.root).then(() => {
            return vm.copyEntry(vm.tempEntry)
          })
        )
      }
      Promise.all(entryPromises)
        .then(() => {
          setTimeout(() => {
            vm.treeItemList = []
            const temp = TreeviewConverter.convertTreeView(vm.fileTreeArray)
            temp.forEach(t => {
              vm.treeItemList.push(t)
            })
            vm.changeLoadingState({
              showDialog: true,
              isLoading: false,
              isSuccess: true,
              showAction: true,
            })
            console.log(this.files)
          }, 500)
        })
        .catch(err => {
          console.log(err)
        })
    },
    copyEntry(entry) {
      const vm = this
      return new Promise((resolve, reject) => {
        // Copy the dropped DirectoryEntry over to our local filesystem.
        try {
          entry.copyTo(
            vm.fs.root,
            null,
            function () {
              vm.recursiveOperation(vm.fs.root)
              resolve()
            },
            vm.onError
          )
        } catch (err) {
          reject(err)
        }
      })
    },
    recursiveOperation(dirEntry) {
      const vm = this
      vm.readDirectory(dirEntry, function (entries) {
        entries.forEach(async function (entry) {
          if (entry.isDirectory) {
            vm.fileTreeArray.push(entry.fullPath + "/")
            vm.getEntry(entry.fullPath, vm.recursiveOperation)
          } else {
            let file = await vm.getFile(entry)
            let trimFirstSlash = dirEntry.fullPath.slice(1)
            let firstSlashIndex = trimFirstSlash.indexOf("/")
            if (firstSlashIndex < 0) {
              file.relativePath = ""
            } else {
              file.relativePath = trimFirstSlash.slice(firstSlashIndex)
            }
            // console.log(dirEntry)
            // console.log(entry)
            vm.files.push(file)
            vm.getEntry(entry.fullPath, function (entry) {
              vm.fileTreeArray.push(entry.fullPath)
            })
          }
        })
      })
    },
    async getFile(fileEntry) {
      try {
        return await new Promise((resolve, reject) =>
          fileEntry.file(resolve, reject)
        )
      } catch (err) {
        console.log(err)
      }
    },
    readDirectory(dirEntry, callback) {
      const vm = this
      const dirReader = dirEntry.createReader()
      let entries = []

      // Call the reader.readEntries() until no more results are returned.
      readEntries()

      function readEntries() {
        dirReader.readEntries(results => {
          if (!results.length) {
            callback(entries)
          } else {
            entries = results
            readEntries()
          }
        }, vm.onError)
      }
    },
    onError(e) {
      console.dir(e)
      switch (e.code) {
        case DOMException.INVALID_MODIFICATION_ERR:
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            error: "fileUploadFailError",
          })
          break
        default:
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            error: "fileUploadFailError",
          })
          break
      }
    },
    getEntry(fullPath, callback) {
      const vm = this
      let fsUrl = this.fs.root.toURL() + fullPath
      window.resolveLocalFileSystemURL(fsUrl, function (entry) {
        if (entry.isDirectory) {
          vm.cwd = entry
        }
        callback(entry)
      })
    },
    uploadBigFile(fileForm) {
      const formData = new FormData()
      formData.append("jobId", 12)
      formData.append("total", 1)
      formData.append("index", 0)
      formData.append("path", "")
      formData.append("fileName", "CADMEN_service_flow_v1.html")
      formData.append("file", this.files[0])

      apiUploadBigFile(formData)
        .then(res => {
          console.log(res.data)

          if (res.data == "wait" && fileForm.index < fileForm.total - 1) {
            fileForm.index++
            this.fileProgress.done++
            return this.uploadBigFile.call(this, fileForm)
          } else if (res.data == "success") {
            this.fileProgress.done++
            console.log("success")
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
                  error: "",
                })
                this.getProjectDetail()
              }
            }, 500)
          } else if (res.data == "error") {
            console.log(res.data)
            throw "Lose file patch"
          }
        })
        .catch(err => {
          console.log(err)
          this.fileProgress.show = false
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            error: "loseFilePatchError",
          })
        })
    },
    uploadJobFiles() {
      let jobId = 13
      const requestQueue = this.getJobFileQueue(jobId)
      console.log(requestQueue)

      let queueSize = requestQueue.length
      let successCount = 0

      if (queueSize > 0) uploadNext(requestQueue)
      else console.log("No File to upload!")

      function uploadNext(queue) {
        apiUploadJobFile(queue.shift())
          .then(res => {
            if (res.data != "error") {
              successCount++
              if (successCount == queueSize) {
                apiUploadJobFinished({ jobId: jobId }).then(res => {
                  console.log(res.data)
                  console.log("Job Upload Finished")
                })
              } else {
                uploadNext(queue)
              }
            } else {
              console.log(res.data)
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    getJobFileQueue(jobId) {
      const queue = []
      let sliceSize = 20 * 1024 * 1024

      for (let fileIndex = 0; fileIndex < this.files.length; fileIndex++) {
        let sliceTotal = Math.ceil(this.files[fileIndex].size / sliceSize)
        for (let sliceIndex = 0; sliceIndex < sliceTotal; sliceIndex++) {
          let fileSize = this.files[fileIndex].size
          let fileName = this.files[fileIndex].name
          let start = sliceIndex * sliceSize
          let end = Math.min(fileSize, start + sliceSize)

          const formData = new FormData()
          formData.append("jobId", jobId)
          formData.append("total", sliceTotal)
          formData.append("index", sliceIndex)
          formData.append("path", this.files[fileIndex].relativePath)
          formData.append("fileName", fileName)
          formData.append("file", this.files[fileIndex].slice(start, end))

          queue.push(formData)
        }
      }

      return queue
    },
  },
}
</script>

<style scoped>
.files-container {
  margin: auto;
  position: relative;
  height: 100%;
  width: 100%;
}
aside {
  position: relative;
  width: 20%;
  height: 100%;
  float: left;
  text-align: left;
  background: #2f2f2f;
  overflow: auto;
  font-size: 16px;
}
.content-viewer {
  position: relative;
  padding: 10px;
  width: 80%;
  height: 100%;
  float: left;
}
.content-viewer * {
  user-select: none;
}
.resizer {
  height: 100%;
  width: 5px;
  background: #2f2f2f;
  float: left;
  cursor: col-resize;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
.upload-messge-box {
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  background: teal;
  width: 500px;
  border-radius: 5px;
  top: 85%;
  animation-name: bounce;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
}
@keyframes bounce {
  from {
    top: 83%;
  }
  to {
    top: 85%;
  }
}
.borderLight {
  border: solid 3px teal;
}
</style>
