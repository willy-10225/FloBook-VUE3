<template>
  <div class="container123">
    <dynamic-text></dynamic-text>
    <div
      class="drag-zone"
      @dragenter="handleDragenter($event)"
      @dragleave="handleDragleave($event)"
    >
      <div class="input-wrapper">
        <input type="file" webkitdirectory multiple @drop="handleDrop($event)" />
        <ul>
          <li v-for="(t, index) in fileTree" :key="index">{{t}}</li>
        </ul>
      </div>
    </div>
    <br />
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3615.0135729194126!2d121.56329771407152!3d25.033613444896503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1szh-TW!2stw!4v1565235066689!5m2!1szh-TW!2stw"
      width="600"
      height="450"
      frameborder="0"
      style="border:0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import DynamicText from '@/components/lab/DynamicText'

export default {
  name: 'Lab2',
  components: { DynamicText },
  data() {
    return {
      startDate: '',
      cwd: null,
      fs: null,
      fileTree: ['將檔案拖曳過來'],
      tempEntry: null
    }
  },
  computed: {},
  mounted() {
    this.initFileSystem()
  },
  methods: {
    ...mapActions(['changeLoadingState']),
    handleConfirm(e) {
      console.log(e)
    },
    handleUpload(e) {
      console.log(e)
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
        vm.readDirectory(dirEntry, function(entries) {
          next()
          function next() {
            const entry = entries[i++]
            if (!entry) {
              resolve()
            } else {
              vm.getEntry(entry.fullPath, function(entry) {
                entry.isDirectory
                  ? entry.removeRecursively(function() {
                      next()
                    }, vm.onError)
                  : entry.remove(function() {
                      next()
                    }, vm.onError)
              })
            }
          }
        })
      })
    },
    handleDragenter(e) {
      e.target.classList.add('active')
    },
    handleDragleave(e) {
      e.target.classList.remove('active')
    },
    handleDrop(e) {
      const vm = this
      // vm.cwd = vm.fs.root
      vm.fileTree = []
      e.target.classList.remove('active')
      console.log(e)
      let items = e.dataTransfer.items
      // var files = e.dataTransfer.files
      const entryPromises = []

      for (var i = 0, item; (item = items[i]); ++i) {
        // Skip this one if we didn't get a file.
        if (item.kind != 'file') {
          console.log('Not a file: ', item)
          continue
        }

        if (item.getAsEntry) vm.tempEntry = item.getAsEntry()
        else vm.tempEntry = item.webkitGetAsEntry()

        entryPromises.push(
          vm.clearFileSystem(vm.fs.root).then(() => {
            vm.copyEntry(vm.tempEntry)
          })
        )
      }
      Promise.all(entryPromises)
        .then(() => {
          console.log(vm.fileTree)
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
            function() {
              vm.changeLoadingState({
                showDialog: true,
                isLoading: false,
                isSuccess: true,
                showAction: true
              })
              vm.renderImages(vm.fs.root)
              resolve()
            },
            vm.onError
          )
        } catch (err) {
          reject(err)
        }
      })
    },
    renderImages(dirEntry) {
      const vm = this
      vm.readDirectory(dirEntry, function(entries) {
        entries.forEach(function(entry) {
          if (entry.isDirectory) {
            vm.fileTree.push(entry.fullPath + '/')
            vm.getEntry(entry.fullPath, vm.renderImages)
          } else {
            vm.getEntry(entry.fullPath, function(entry) {
              vm.fileTree.push(entry.fullPath)
            })
          }
        })
      })
    },
    readDirectory(dirEntry, callback) {
      const vm = this
      const dirReader = dirEntry.createReader()
      let entries = []

      // Call the reader.readEntries() until no more results are returned.
      const readEntries = function() {
        dirReader.readEntries(results => {
          if (!results.length) {
            callback(entries)
          } else {
            entries = results
            readEntries()
          }
        }, vm.onError)
      }

      readEntries()
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
            error: 'fileUploadFailError'
          })
          break
        default:
          this.changeLoadingState({
            showDialog: true,
            isLoading: false,
            isSuccess: false,
            showAction: true,
            error: 'fileUploadFailError'
          })
          break
      }
    },
    getEntry(fullPath, callback) {
      const vm = this
      let fsUrl = this.fs.root.toURL() + fullPath
      window.resolveLocalFileSystemURL(fsUrl, function(entry) {
        if (entry.isDirectory) {
          vm.cwd = entry
        }
        callback(entry)
      })
    }
  }
}
</script>

<style scope>
.container {
  margin: auto;
  width: 800px;
  margin-top: 20px;
}
.drag-zone {
  position: relative;
  width: 600px;
  /* height: 600px; */
  background: rgb(224, 224, 224);
  margin: auto;
  display: flex;
}
.input-wrapper {
  display: block;
  margin: auto;
  margin-top: 50px;
  margin-bottom: 50px;
  align-items: center;
  justify-content: center;
  width: 70%;
  word-break: break-all;
  text-align: center;
  transition: 0.1s;
  color: black;
}
input[type='file']::-webkit-file-upload-button {
  visibility: hidden;
}
input[type='file'] {
  color: transparent;
  background: white;
  width: 100%;
  height: 100px;
  text-align: center;
  transition: 0.1s;
  border: 3px dashed gray;
}
input[type='file'].active,
.active input[type='file'] {
  border: 3px dashed teal;
}
</style>
