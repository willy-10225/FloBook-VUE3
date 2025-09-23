<template>
  <div class="info-panel" :class="{ isDisplay: infoPanel.show }">
    <div class="info-panel-header">
      <div class="info-panel-header-close">
        <mu-button icon color="white" @click="hideInfoPanel">
          <i class="material-icons">keyboard_arrow_down</i>
        </mu-button>
      </div>
    </div>

    <table class="single-data-table">
      <tr>
        <td>Id</td>
        <td>{{ infoPanel.row.id }}</td>
      </tr>
      <tr>
        <td>Job Name</td>
        <td>{{ infoPanel.row.name }}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>{{ infoPanel.row.status }}</td>
      </tr>
      <tr>
        <td>User</td>
        <td>{{ infoPanel.row.user }}</td>
      </tr>
      <tr>
        <td>CPU</td>
        <td>{{ infoPanel.row.cpu }}</td>
      </tr>
      <tr>
        <td>GPU</td>
        <td>{{ infoPanel.row.gpu }}</td>
      </tr>
      <tr>
        <td>Type</td>
        <td>{{ infoPanel.row.type }}</td>
      </tr>
      <tr>
        <td>Version</td>
        <td>{{ infoPanel.row.version }}</td>
      </tr>
      <tr>
        <td>PID</td>
        <td>{{ infoPanel.row.pid }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'InfoPanel',
  props: {
    infoPanel: Object
  },
  methods: {
    hideInfoPanel() {
      this.infoPanel.show = false
    }
  }
}
</script>

<style lang="less" scoped>
.info-panel {
  position: fixed;
  height: 0;
  bottom: 0;
  left: 200px;
  right: 0;
  margin: 0 20px;
  overflow: auto;
  background: #777;
  transition: 0.2s;
}
.info-panel.isDisplay {
  height: 40vh;
  padding: 15px 0;
  border-top: 2px solid #aaa;
  border-left: 2px solid #aaa;
  border-right: 2px solid #aaa;
  border-radius: 10px 10px 0 0;
  transition: 0.2s;
}
ul {
  padding: 0;
  li {
    list-style: none;
  }
}
.info-panel-header {
  position: relative;
}
.info-panel-header-close {
  position: absolute;
  top: 0px;
  right: 30px;
}

.single-data-table {
  width: 50%;
  margin: auto;
  text-align: justify;
  font-size: 16px;
  word-break: break-word;
  border-collapse: collapse;
  margin: auto;
  border: 1px solid #aaa;
  td,
  th {
    border: 1px solid #999;
  }
  td {
    padding: 5px 10px 5px 20px;
  }
  td:first-child {
    width: 160px;
  }
  tr:nth-child(odd) {
    background-color: #606060;
  }
}
.td-title {
  width: 160px;
}
</style>
