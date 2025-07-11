<template>
  <div class="flowlog-wrap">
    <div style="text-align: end; margin-bottom: 10px">
      <v-btn color="teal" icon @click="refresh">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>
    <div class="flowlog-container" ref="flowLog" @scroll="onScroll">
      <div
        class="log-block"
        v-for="(event, index) in loadmore.events"
        :key="'log' + index"
      >
        <div class="time-tag">{{ event.time }}</div>
        <div class="event-card" :style="getStyle(event.action)">
          <table>
            <tr>
              <td class="title">Action:</td>
              <td class="textbox">{{ event.action }}</td>
            </tr>
            <tr>
              <td class="title">Detail:</td>
              <td class="textbox">
                <ul class="detail-list">
                  <li v-for="item in event.detail" :key="item">{{ item }}</li>
                </ul>
              </td>
            </tr>
          </table>
          <div class="signature">{{ event.user }}</div>
          <div class="avatar">{{ shortName(event.action) }}</div>
        </div>
      </div>
      <div v-if="loadmore.loading" class="loading-text">Loading...</div>
      <div v-if="loadmore.loadedAll" class="loading-text">All loaded</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, nextTick } from "vue"

interface RawEvent {
  Time: string
  Action: string
  Detail: any
  Operator: string
}
interface Event {
  time: string
  action: string
  detail: string[]
  user: string
}

// ActionTypes 常量
const ActionTypes = {
  Project: "Project",
  Checkpoint: "Checkpoint",
  File: "File",
  Status: "Status",
} as const

// Props
const props = defineProps<{
  flow: RawEvent[]
}>()

// 响应式数据
const loadmore = reactive({
  events: [] as Event[],
  num: 10,
  refreshing: false,
  loading: false,
  loadedAll: false,
})

const events = ref<Event[]>([])

const flowLog = ref<HTMLElement | null>(null)

// 监听 flow 变化，更新事件并刷新视图
watch(
  () => props.flow,
  newFlow => {
    getEvents(newFlow)
    refresh()
  },
  { immediate: true }
)

// 处理原始数据为界面展示格式
function getEvents(raw: RawEvent[]) {
  function mapDetail(action: string, detail: any, index: number): string[] {
    const detailText: string[] = []
    switch (action) {
      case ActionTypes.Project:
        if (index === 0) detailText.push("新增專案 : " + detail.subject)
        else detailText.push("修改專案摘要")
        break
      case ActionTypes.Checkpoint:
        if (detail.checkedPoints?.length > 0) {
          detailText.push(`完成查核點 : ${detail.checkedPoints.join(", ")}`)
        }
        if (detail.uncheckedPoints?.length > 0) {
          detailText.push(`重置查核點 : ${detail.uncheckedPoints.join(", ")}`)
        }
        if (detail.newPoints?.length > 0) {
          detailText.push(`新增查核點 : ${detail.newPoints.join(", ")}`)
        }
        if (detail.deletePoints?.length > 0) {
          detailText.push(`刪除查核點 : ${detail.deletePoints.join(", ")}`)
        }
        break
      case ActionTypes.File:
        detailText.push("新增或移除檔案")
        break
      case ActionTypes.Status:
        detailText.push("專案狀態->" + detail)
        break
      default:
        detailText.push("未定義操作")
    }
    return detailText
  }

  const data = raw.map((item, index) => ({
    time: item.Time,
    action: item.Action,
    detail: mapDetail(item.Action, item.Detail, index),
    user: item.Operator,
  }))
  events.value = data.reverse()
}

// 刷新操作，重置已加载事件数量
function refresh() {
  loadmore.refreshing = true
  if (flowLog.value) flowLog.value.scrollTop = 0

  setTimeout(() => {
    loadmore.num = 10
    loadmore.events = []
    loadmore.loadedAll = false

    for (let i = 0; i < loadmore.num; i++) {
      if (!events.value[i]) {
        loadmore.loadedAll = true
        break
      }
      loadmore.events.push(events.value[i])
    }
    loadmore.refreshing = false
  }, 500)
}

// 监听滚动自动加载更多
function onScroll() {
  if (loadmore.loading || loadmore.loadedAll || !flowLog.value) return
  const el = flowLog.value
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
    load()
  }
}

// 加载更多数据
function load() {
  loadmore.loading = true

  setTimeout(() => {
    if (loadmore.num < events.value.length) {
      const prev = loadmore.num
      loadmore.num += 10

      for (let i = prev; i < loadmore.num; i++) {
        if (!events.value[i]) {
          loadmore.loadedAll = true
          break
        }
        loadmore.events.push(events.value[i])
      }
    }
    loadmore.loading = false
  }, 500)
}

function shortName(name: string): string {
  return name ? name[0].toUpperCase() : ""
}

function getStyle(action: string) {
  switch (action) {
    case ActionTypes.Project:
      return { backgroundColor: "#3799A4" }
    case ActionTypes.Checkpoint:
      return { backgroundColor: "#5F9EA0" }
    case ActionTypes.File:
      return { backgroundColor: "#398DAC" }
    case ActionTypes.Status:
      return { backgroundColor: "#50AAC5" }
    default:
      return { backgroundColor: "#3799A4" }
  }
}
</script>

<style scoped>
.flowlog-container {
  height: 600px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
.log-block {
  display: flex;
  margin-bottom: 10px;
}
.time-tag {
  width: 180px;
  margin-right: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #555;
}
.event-card {
  position: relative;
  display: flex;
  align-items: center;
  width: 80%;
  min-width: 400px;
  min-height: 80px;
  padding: 30px 30px 30px 40px;
  margin-right: 20px;
  text-align: left;
  word-break: normal;
  background-color: cadetblue;
  border-left: 5px solid teal;
  border-radius: 0 10px 10px 0;
  border-bottom: 1px solid rgb(1, 102, 102);
  color: white;
}
.event-card .title {
  text-align: right;
  padding-right: 10px;
  vertical-align: top;
  font-weight: 600;
}
.event-card .textbox {
  vertical-align: top;
  word-break: break-word;
  width: 100%;
}
.detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.avatar {
  position: absolute;
  left: -30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  line-height: 60px;
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  border-radius: 50%;
  border: 3px solid teal;
  background-color: #2d9da7;
}
.signature {
  position: absolute;
  right: 10px;
  bottom: 5px;
  font-size: 16px;
  font-weight: 600;
}
.loading-text {
  color: white;
  text-align: center;
  margin: 10px 0;
}
</style>
