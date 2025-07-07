<template>
  <li>
    <div
      class="item-body"
      @click="clickHandler"
    >
      <span>
        <img
          :src="pickIcon"
          width="16px"
        />
      </span>
      <span>{{ item.name }}</span>
      <span v-if="isFolder">[ {{ isOpen ? '-' : '+' }} ]</span>
    </div>
    <ul
      v-show="isOpen"
      v-if="isFolder"
    >
      <tree-view-item
        v-for="(child, index) in item.children"
        :key="index"
        class="tree-view-item"
        :item="child"
      ></tree-view-item>
    </ul>
  </li>
</template>

<script>
export default {
  name: 'TreeViewItem',
  props: {
    item: Object
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    isFolder() {
      return this.item.children
    },
    isEmpty() {
      return this.item.children && this.item.children.length == 0
    },
    pickIcon() {
      switch (true) {
        case this.isFolder && !this.isOpen:
          return '/img/folder-icons/001-folder.png'
        case this.isFolder && !this.isEmpty && this.isOpen:
          return '/img/folder-icons/002-folder-1.png'
        case this.isEmpty && this.isOpen:
          return '/img/folder-icons/003-folder-2.png'
        case !this.isFolder:
          return '/img/file-icons/007-txt.png'
        default:
          return '/img/file-icons/007-txt.png'
      }
    }
  },
  methods: {
    clickHandler() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      } else {
        this.$root.$emit('eventSelectFile', this.item.name)
      }
    }
  }
}
</script>

<style lang='less' scoped>
.tree-view-item {
  cursor: pointer;
}
ul {
  padding-left: 10px;
  line-height: 1.5em;
  list-style-type: none;
  width: 100%;
}
li {
  margin: 2px 0px;

  & > div {
    display: inline-flex;
    user-select: none;
  }
  & > div > span {
    margin: 0 2px;
  }
}
.item-body {
  width: 100%;
  &:hover {
    background: #777;
  }
}
</style>
