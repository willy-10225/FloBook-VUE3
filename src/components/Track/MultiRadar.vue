<template>
  <v-chart class="radar" :options="option" auto-resize></v-chart>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts'

export default {
  name: 'MultiRadar',
  components: { 'v-chart': ECharts },
  data() {
    return {
      option: {
        backgroundColor: {
          type: 'radial',
          x: 0.5,
          y: 0.4,
          r: 0.3,
          colorStops: [
            {
              offset: 0,
              color: '#895355',
            },
            {
              offset: 0.2,
              color: '#593640',
            },
            {
              offset: 1,
              color: '#333',
            },
          ],
          globalCoord: false,
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0,0,250,0.2)',
        },
        legend: {
          show: true,
          bottom: 5,
          left: 16,
          itemWidth: 14,
          itemHeight: 10,
          itemGap: 48,
          width: '100%',
          height: 80,
          align: 'auto',
          data: [],
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          selectedMode: true,
          orient: 'horizontal',
        },
        textStyle: {
          color: '#4ac7f5',
          fontSize: 16,
        },
        radar: {
          center: ['50%', '40%'],
          radius: 160,
          startAngle: 90,
          nameGap: 16,
          splitNumber: 4,
          shape: 'polygon',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#564d8e',
              width: 1,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#4b476f',
              width: 1,
            },
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: '#2c2949',
            },
          },
          indicator: [
            {
              text: 'Consultant',
              max: 100,
            },
            {
              text: 'Bench Mark',
              max: 100,
            },
            {
              text: 'Demo Material',
              max: 100,
            },
            {
              text: 'Training Material',
              max: 100,
            },
            {
              text: 'Case Study',
              max: 100,
            },
          ],
        },
        series: {
          name: 'Projects Statistic',
          type: 'radar',
          symbol: 'none',
          areaStyle: {
            normal: {
              opacity: 0,
            },
            emphasis: {
              opacity: 0.3,
            },
          },
          lineStyle: {
            normal: {
              width: 0.8,
            },
          },
          data: [],
        },
      },
    }
  },
  mounted() {
    this.randomData()
  },
  methods: {
    randomData() {
      let newData = []
      for (let u = 0; u < 10; u++) {
        let name = 'user' + u
        let value = []
        for (let i = 0; i < 5; i++) {
          value[i] = Math.round(Math.random() * 100)
        }
        newData[u] = {
          name: name,
          value: value,
        }
      }
      this.option.legend.data = newData.map((x) => x.name)
      this.option.series.data = newData
    },
  },
}
</script>

<style scoped>
.radar {
  width: 100%;
  height: 600px;
}
</style>
