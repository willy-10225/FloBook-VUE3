<template>
  <section class="team-statistic">
    <div>Admin</div>
    <mu-expansion-panel :expand="panel === 'panel1'" @change="togglePanel('panel1')">
      <div slot="header" class="panel-header">甘特圖</div>
      <div class="panel-body">
        <img src="/img/demo/gantt.png" alt="gantt">
      </div>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel2'" @change="togglePanel('panel2')">
      <div slot="header" class="panel-header">案量總覽</div>
      <div class="panel-body">
        <!-- <img src="/img/demo/projects.png" alt="projects"> -->
      </div>
      <multi-radar></multi-radar>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel3'" @change="togglePanel('panel3')">
      <div slot="header" class="panel-header">稼動率</div>
      <div class="panel-body">
        <img src="/img/demo/oee.png" alt="oee">
      </div>
    </mu-expansion-panel>
    <mu-expansion-panel :expand="panel === 'panel4'" @change="togglePanel('panel4')">
      <div slot="header" class="panel-header">團隊成員</div>
      <div class="panel-body">團隊成員</div>
    </mu-expansion-panel>
  </section>
</template>

<script>
import MultiRadar from '@/components/Track/MultiRadar.vue'

export default {
  name: 'TeamStatistic',
  components: { MultiRadar },
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
.team-statistic {
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
