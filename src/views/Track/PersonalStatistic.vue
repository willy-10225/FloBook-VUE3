<template>
  <section class="porfile-container">
    <div>Personal Statistic</div>
    <mu-expansion-panel :expand="panel === 'panel1'" @change="togglePanel('panel1')">
      <div slot="header" class="panel-header">個人累積案量</div>
      <div class="panel-body">
        <img src="/img/demo/profile.png" alt="Personal Statistic">
      </div>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel2'" @change="togglePanel('panel2')">
      <div slot="header" class="panel-header">執行中專案</div>
      <div class="panel-body">執行中專案</div>
    </mu-expansion-panel>
  </section>
</template>

<script>
export default {
  name: 'PersonalStatistic',
  data() {
    return {
      panel: 'panel1'
    }
  },
  methods: {
    togglePanel(panel) {
      this.panel = panel === this.panel ? '' : panel
    }
  }
}
</script>

<style>
.porfile-container {
  padding: 10px;
  background-color: #444;
  width: 1000px;
  margin: auto;
  margin-bottom: 64px;
}
.panel-header {
  font-size: 25px;
}
.panel-body {
  margin-left: 20px;
  margin-right: 20px;
  color: white;
  text-align: center;
  font-size: 18px;
}
.panel-body img {
  width: 900px;
}
.mu-expansion-panel > .mu-expansion-panel-header {
  background-color: #555;
}
.mu-expansion-panel > .mu-expansion-panel-container {
  background-color: #6f6f6f;
}
</style>
