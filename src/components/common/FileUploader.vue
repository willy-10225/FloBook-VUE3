<template>
  <div class="file-uploader-wrapper">
    <section class="file-uploader-head" @click="clearFiles">
      <red-dot :show="true" :count="'&#10005;'" pointer></red-dot>
    </section>
    <mu-flex
      class="file-uploader"
      :class="{ hover: isHover, highlight: isHighlight }"
      @dragover.prevent="handleHighlight($event, true)"
      @dragleave="handleHighlight($event, false)"
      @drop.prevent="handleDrop"
    >
      <div
        v-if="!showTreeView"
        class="upload-message-box"
        :class="{ highlight: isHighlight }"
      >
        拖曳上傳資料夾或檔案
      </div>
      <div v-if="!showTreeView" class="upload-browser">
        <mu-menu cover placement="bottom">
          <mu-button color="#8498a7" style="font-size: 1rem">Upload</mu-button>
          <mu-list slot="content" style="background: #555">
            <label for="folder-picker">
              <mu-list-item button>
                <mu-list-item-title>Upload Folder</mu-list-item-title>
              </mu-list-item>
            </label>
            <label for="files-picker">
              <mu-list-item button>
                <mu-list-item-title>Upload Files</mu-list-item-title>
              </mu-list-item>
            </label>
          </mu-list>
        </mu-menu>
        <input
          id="folder-picker"
          type="file"
          webkitdirectory
          directory
          multiple
          @change="getFolder"
        />
        <input id="files-picker" type="file" multiple @change="getFiles" />
      </div>
      <tree-view v-else :itemList="treeviewItems" />
    </mu-flex>
  </div>
</template>

<script>
import RedDot from '@/components/common/RedDot.vue'
import TreeView from '@/components/common/TreeView.vue'
import TreeviewConverter from '@/assets/js/treeview_converter'
import { dryCheckIsFile } from '../../assets/js/dry'
import { mapActions } from 'vuex'

var treeviewItems = [
  {
    name: 'My Tree',
    children: [
      { name: 'hello' },
      { name: 'wat' },
      {
        name: 'empty folder',
        children: []
      },
      {
        name: 'child folder',
        children: [
          {
            name: 'child folder',
            children: [{ name: 'hello.txt' }, { name: 'wat.txt' }]
          },
          { name: 'hello.txt' },
          { name: 'wat.txt' },
          {
            name: 'child folder',
            children: [{ name: 'hello.txt' }, { name: 'wat.txt' }]
          },
          {
            name: 'empty folder',
            children: []
          }
        ]
      }
    ]
  }
]

export default {
  name: 'FileUploader',
  components: {
    RedDot,
    TreeView
  },
  props: {
    highlight: Boolean,
    files: Array
  },
  data() {
    return {
      isHighlight: null,
      isHover: false,
      showTreeView: false,
      treeviewItems: treeviewItems,
      // Upload folder
      cwd: null,
      fs: null,
      fileTreeArray: []
    }
  },
  watch: {
    highlight(val) {
      this.isHighlight = val
    }
  },
  methods: {
    ...mapActions(['changeLoadingState']),
    clearFiles() {
      this.treeviewItems = []
      this.fileTreeArray = []
      this.$emit('clearFiles')
      this.showTreeView = false
    },
    handleHighlight(e, state) {
      if (dryCheckIsFile(e)) this.isHover = state
    },
    handleDrop(e) {
      const vm = this
      vm.isHover = false
      vm.fileTreeArray = []
      vm.treeviewItems = []
      vm.$emit('clearFiles')

      // Upload Files
      let items = e.dataTransfer.items

      for (let item of items) {
        // Skip this one if we didn't get a file.
        if (item.kind != 'file') {
          console.log('Not a file: ', item)
          return
        }
        let tempEntry = null
        if (item.getAsEntry) tempEntry = item.getAsEntry()
        else tempEntry = item.webkitGetAsEntry()

        if (tempEntry) {
          scanFiles(tempEntry, vm.fileTreeArray)
        }
      }
      setTimeout(() => {
        vm.treeviewItems = []
        const temp = TreeviewConverter.convertTreeView(vm.fileTreeArray)
        temp.forEach(t => {
          vm.treeviewItems.push(t)
        })
        vm.showTreeView = true
      }, 500)

      function scanFiles(currentEntry, fileTreeArray) {
        if (currentEntry.isDirectory) {
          let directoryReader = currentEntry.createReader()

          fileTreeArray.push(currentEntry.fullPath + '/')

          directoryReader.readEntries(
            entries => {
              entries.forEach(entry => {
                scanFiles(entry, fileTreeArray)
              })
            },
            err => {
              console.log(err)
            }
          )
        } else {
          fileTreeArray.push(currentEntry.fullPath)
          currentEntry.file(
            file => {
              let pathLayers = currentEntry.fullPath.match(/\/[^/]*/g)
              pathLayers.pop()
              //pathLayers.shift()
              file.relativePath = pathLayers.join('')
              vm.files.push(file)
            },
            err => {
              console.log(err)
            }
          )
        }
      }
    },
    getFolder(e) {
      const files = Array.from(e.target.files)
      const tempTreeArray = []
      files.forEach(file => {
        let fullPath = '/' + file.webkitRelativePath
        tempTreeArray.push(fullPath)
        let pathLayers = fullPath.match(/\/[^/]*/g)
        pathLayers.pop()
        pathLayers.shift()
        file.relativePath = pathLayers.join('')
        this.files.push(file)
      })
      this.fileTreeArray = fillLostFolder(tempTreeArray)
      this.showFileTree()

      // Fill the lost folder name because we can't get them from HTML input
      function fillLostFolder(tempTreeArray) {
        const originalLength = tempTreeArray.length
        for (let h = 0; h < originalLength; h++) {
          let pathLayers = tempTreeArray[h].match(/\/[^/]*/g)
          for (let i = 0; i < pathLayers.length; i++) {
            let folderPath = ''
            for (let j = 0; j < i; j++) {
              folderPath += pathLayers[j]
            }
            folderPath += '/'
            if (tempTreeArray.indexOf(folderPath) == -1) {
              tempTreeArray.push(folderPath)
            }
          }
        }
        tempTreeArray.splice(tempTreeArray.indexOf('/'), 1)
        tempTreeArray.sort((a, b) => {
          if (a > b) return 1
          else return -1
        })
        return tempTreeArray
      }
    },
    getFiles(e) {
      const files = Array.from(e.target.files)
      files.forEach(file => {
        file.relativePath = ''
        this.fileTreeArray.push('/' + file.name)
        this.files.push(file)
      })
      this.showFileTree()
    },
    showFileTree() {
      setTimeout(() => {
        this.treeviewItems = []
        const temp = TreeviewConverter.convertTreeView(this.fileTreeArray)
        temp.forEach(t => {
          this.treeviewItems.push(t)
        })
        this.showTreeView = true
      }, 500)
    }
  }
}
</script>

<style lang="less" scoped>
@upload-message-box: 50px;
.file-uploader-wrapper {
  position: relative;
}
.file-uploader {
  position: relative;
  color: white;
  border: gray 1px dashed;
  padding: 10px;
  min-height: 300px;
  &.hover {
    background: #777;
  }
  &.highlight {
    border: solid 3px teal;
  }
}
.file-uploader-head {
  position: relative;
  visibility: hidden;
  top: 26px;
  right: 35px;
  z-index: 1;
  border: none;
  .file-uploader-wrapper:hover & {
    visibility: visible;
  }
}
.upload-message-box {
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  width: 500px;
  height: @upload-message-box;
  border-radius: 5px;
  top: calc(50% - @upload-message-box / 2);
  line-height: @upload-message-box;
  font-size: 30px;
  text-align: center;
  pointer-events: none;
  &.highlight {
    background: teal;
    animation-name: bounce;
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
  }
}
.upload-browser {
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  top: 200px;
  width: 100%;
  text-align: center;
  cursor: pointer;
  input[type='file'] {
    // position: fixed;
    // right: 100%;
    // bottom: 100%;
    display: none;
  }
}
@keyframes bounce {
  from {
    top: calc(48% - @upload-message-box / 2);
  }
  to {
    top: calc(52% - @upload-message-box / 2);
  }
}
</style>
