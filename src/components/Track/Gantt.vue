<template>
  <div class="gantt-wrapper" ref="ganttWrapper">
    <table class="gantt-head sticky" ref="ganttHead">
      <tr>
        <th class="year" :colspan="year.colspan" v-for="(year,index) in head.years" :key="'tlYear'+index">{{year.value}}</th>
      </tr>
      <tr>
        <th class="month" :colspan="month.colspan" v-for="(month,index) in head.months" :key="'tlMonth'+index">{{month.value}}</th>
      </tr>
      <tr>
        <th v-for="(date,index) in head.dates" :key="'tlDate'+index">
          <div class="date">{{date}}</div>
        </th>
      </tr>
    </table>
    <table class="gantt-body">
      <tr>
        <td v-for="(date,index) in head.dates" :key="'tlBody'+index">
          <div class="gantt-field"></div>
        </td>
      </tr>
    </table>
    <div class="gantt-timebar-wrapper"></div>
    <div class="gantt-timebar" :style="getTimebarStyle(cp,index)" v-for="(cp,index) in projectInfo.checkPoints" :key="'cp'+index">{{cp.name}}</div>
  </div>
</template>

<script>
export default {
  name: 'Gantt',
  data() {
    return {
      head: {
        years: [],
        months: [],
        dates: []
      },
      duration: {
        startTime: new Date(2018, 11, 1),
        endTime: new Date(2019, 9, 1)
      },
      projectInfo: {
        checkPoints: [{ name: 'Begin', dateDuration: 45 }, { name: 'Mid', dateDuration: 12 }, { name: 'End', dateDuration: 25 }]
      }
    }
  },
  created() {
    this.getHead()
  },
  mounted() {
    this.$refs.ganttWrapper.scrollLeft = this.$refs.ganttWrapper.scrollWidth
  },
  methods: {
    getDates(startDate, endDate) {
      var dates = [],
        currentDate = startDate,
        addDays = function(days) {
          var date = new Date(this.valueOf())
          date.setDate(date.getDate() + days)
          return date
        }
      while (currentDate <= endDate) {
        dates.push(currentDate)
        currentDate = addDays.call(currentDate, 1)
      }
      return dates
    },
    getHead() {
      let tempDates = this.getDates(this.duration.startTime, this.duration.endTime)
      let yearColCount = 0
      let monthColCount = 0
      for (let i in tempDates) {
        // Handle the first date
        if (i == 0) {
          this.head.years.push({ value: tempDates[i].getFullYear() })
          this.head.months.push({ value: tempDates[i].getMonth() + 1 })
        } else {
          if (tempDates[i].getMonth() == 0 && tempDates[i].getDate() == 1) {
            this.head.years[this.head.years.length - 1].colspan = yearColCount
            this.head.years.push({ value: tempDates[i].getFullYear() })
            yearColCount = 0
          }
          if (tempDates[i].getDate() == 1) {
            this.head.months[this.head.months.length - 1].colspan = monthColCount
            this.head.months.push({ value: tempDates[i].getMonth() + 1 })
            monthColCount = 0
          }
        }
        this.head.dates.push(tempDates[i].getDate())
        yearColCount++
        monthColCount++
      }
      this.head.years[this.head.years.length - 1].colspan = yearColCount
      this.head.months[this.head.months.length - 1].colspan = monthColCount
    },
    getTimebarStyle(checkPoint, index) {
      const TOP_MARGIN = 80
      const TIMEBAR_WIDTH = 30
      const TABLE_BORDER_WIDTH = 1
      const TIMEBAR_HEIGHT = 25
      const TIMEBAR_MARGIN = 5
      return {
        width: checkPoint.dateDuration * (TIMEBAR_WIDTH + TABLE_BORDER_WIDTH) + 'px',
        height: TIMEBAR_HEIGHT + 'px',
        left: 1 + index * (TIMEBAR_WIDTH + TABLE_BORDER_WIDTH) + 'px',
        top: TOP_MARGIN + index * (TIMEBAR_HEIGHT + TIMEBAR_MARGIN) + 'px'
      }
    }
  }
}
</script>

<style scoped>
.gantt-wrapper {
  position: relative;
  overflow: auto;
  width: 100%;
  height: 70vh;
  background-color: rgb(168, 168, 168);
}
.gantt-head {
  position: static;
  z-index: 1;
  border-collapse: collapse;
}
.gantt-head th {
  border: 1px solid rgb(109, 109, 109);
  font-size: 14px;
}
.gantt-head .year {
  background-color: rgb(107, 107, 107);
  height: 22px;
}
.gantt-head .month {
  background-color: rgb(126, 126, 126);
  height: 22px;
}
.gantt-head .date {
  background-color: rgb(153, 152, 152);
  width: 30px;
  height: 22px;
}
.gantt-body {
  border-collapse: collapse;
}
.gantt-body td {
  border: 1px dashed gray;
}
.gantt-body .gantt-field {
  width: 30px;
  height: 80vh;
}
.gantt-timebar {
  background-color: #2ecaac;
  position: absolute;
  border-radius: 20px;
  cursor: pointer;
  text-align: left;
  vertical-align: middle;
  font-size: 14px;
  padding: 2px 10px;
}
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
</style>
