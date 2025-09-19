<template>
  <div class="flowlog-wrap">
    <div class="d-flex justify-end mb-4">
      <v-btn
        color="teal"
        variant="elevated"
        @click="refresh()"
        :loading="loadmore.refreshing"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <div class="flowlog-container" ref="flowLogRef">
      <v-infinite-scroll
        @load="load"
        :loading="loadmore.loading"
        mode="manual"
        side="end"
      >
        <div
          class="log-block"
          v-for="(event, index) in loadmore.events"
          :key="`log-${index}`"
        >
          <div class="time-tag">
            <v-chip color="primary" variant="outlined" size="small">
              {{ event.time }}
            </v-chip>
          </div>

          <v-card
            class="event-card"
            :color="getActionColor(event.action)"
            elevation="3"
          >
            <div class="avatar">
              <v-avatar
                :color="getActionColor(event.action)"
                size="60"
                class="avatar-circle"
              >
                <span class="text-h5 font-weight-bold">
                  {{ shortName(event.action) }}
                </span>
              </v-avatar>
            </div>

            <v-card-text class="card-content">
              <v-table density="compact" class="event-table">
                <tbody>
                  <tr>
                    <td class="title font-weight-bold">Action:</td>
                    <td class="textbox">{{ event.action }}</td>
                  </tr>
                  <tr>
                    <td class="title font-weight-bold">Detail:</td>
                    <td class="textbox">
                      <ul class="detail-list">
                        <li
                          v-for="(item, idx) in event.detail"
                          :key="`detail-${idx}`"
                          class="mb-1"
                        >
                          <v-chip size="small" variant="text" class="pa-1">
                            {{ item }}
                          </v-chip>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>

            <div class="signature">
              <v-chip
                size="small"
                variant="outlined"
                prepend-icon="mdi-account"
              >
                {{ event.user }}
              </v-chip>
            </div>
          </v-card>
        </div>

        <template v-slot:load-more="{ props }">
          <v-btn
            v-if="!loadmore.loadedAll"
            v-bind="props"
            variant="outlined"
            class="ma-4"
            :loading="loadmore.loading"
          >
            {{ loadmore.text }}
          </v-btn>
        </template>

        <template v-slot:empty>
          <div class="text-center pa-4">
            <v-icon size="64" color="grey">mdi-timeline-outline</v-icon>
            <div class="text-h6 mt-2">No events found</div>
          </div>
        </template>
      </v-infinite-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from "vue"

// Types
enum ActionTypes {
  Project = "Project",
  Checkpoint = "Checkpoint",
  File = "File",
  Status = "Status",
}

interface FlowEvent {
  time: string
  action: ActionTypes
  detail: string[]
  user: string
}

interface RawFlowEvent {
  Time: string
  Action: ActionTypes
  Detail: any
  Operator: string
}

interface LoadMoreState {
  events: FlowEvent[]
  num: number
  refreshing: boolean
  loading: boolean
  text: string
  loadedAll: boolean
}

interface Props {
  flow: RawFlowEvent[]
}

// Props
const props = defineProps<Props>()

// Refs
const flowLogRef = ref<HTMLElement>()
const events = ref<FlowEvent[]>([])

// Reactive state
const loadmore = reactive<LoadMoreState>({
  events: [],
  num: 10,
  refreshing: false,
  loading: false,
  text: "Loading...",
  loadedAll: false,
})

// Watch for flow changes
watch(
  () => props.flow,
  raw => {
    if (raw) {
      getEvents(raw)
      refresh()
    }
  },
  { immediate: true }
)

// Methods
const getEvents = (raw: RawFlowEvent[]) => {
  const data = raw.map((item, index) => ({
    time: item.Time,
    action: item.Action,
    detail: mapDetail(item.Action, item.Detail, index),
    user: item.Operator,
  }))
  events.value = data.reverse()
}

const mapDetail = (
  action: ActionTypes,
  detail: any,
  index: number
): string[] => {
  const detailText: string[] = []

  switch (action) {
    case ActionTypes.Project:
      if (index === 0) {
        detailText.push("新增專案 : " + detail.subject)
      } else {
        detailText.push("修改專案摘要")
      }
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

const refresh = async () => {
  loadmore.refreshing = true

  if (flowLogRef.value) {
    flowLogRef.value.scrollTop = 0
  }

  await new Promise(resolve => setTimeout(resolve, 500))

  loadmore.num = 10
  loadmore.events = []
  loadmore.loadedAll = false

  for (let i = 0; i < loadmore.num && i < events.value.length; i++) {
    loadmore.events.push(events.value[i])
  }

  if (loadmore.events.length >= events.value.length) {
    loadmore.loadedAll = true
  }

  loadmore.refreshing = false
}

const load = async ({
  done,
}: {
  done: (status: "ok" | "empty" | "error") => void
}) => {
  if (loadmore.loading || loadmore.loadedAll) {
    done("empty")
    return
  }

  loadmore.loading = true

  await new Promise(resolve => setTimeout(resolve, 500))

  if (loadmore.num < events.value.length) {
    const prev = loadmore.num
    loadmore.num += 10

    for (let i = prev; i < loadmore.num && i < events.value.length; i++) {
      loadmore.events.push(events.value[i])
    }

    if (loadmore.events.length >= events.value.length) {
      loadmore.loadedAll = true
    }
  }

  loadmore.loading = false
  done(loadmore.loadedAll ? "empty" : "ok")
}

const shortName = (name: string): string => {
  return name[0]?.toUpperCase() || "U"
}

const getActionColor = (action: ActionTypes): string => {
  const colorMap: Record<ActionTypes, string> = {
    [ActionTypes.Project]: "teal-darken-1",
    [ActionTypes.Checkpoint]: "blue-grey-lighten-1",
    [ActionTypes.File]: "light-blue-darken-1",
    [ActionTypes.Status]: "cyan-lighten-1",
  }
  return colorMap[action] || "teal-darken-1"
}

const scrollToBottom = async () => {
  await nextTick()
  if (flowLogRef.value) {
    flowLogRef.value.scrollTop = flowLogRef.value.scrollHeight
  }
}

// Expose methods for parent component
defineExpose({
  scrollToBottom,
  refresh,
})
</script>

<style scoped>
.flowlog-container {
  height: 600px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.log-block {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.time-tag {
  width: 180px;
  margin-right: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-card {
  position: relative;
  width: 100%;
  min-width: 400px;
  min-height: 120px;
  border-left: 5px solid rgb(var(--v-theme-teal)) !important;
  border-radius: 0 12px 12px 0 !important;
}

.avatar {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.avatar-circle {
  border: 3px solid rgb(var(--v-theme-teal));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding-left: 50px !important;
  padding-right: 60px !important;
}

.event-table {
  background: transparent !important;
}

.event-table :deep(.v-table__wrapper) {
  background: transparent !important;
}

.event-table :deep(table) {
  background: transparent !important;
}

.event-table :deep(td) {
  background: transparent !important;
  border: none !important;
  padding: 4px 8px;
}

.title {
  width: 80px;
  text-align: right;
  padding-right: 16px !important;
  vertical-align: top;
  white-space: nowrap;
}

.textbox {
  vertical-align: top;
  word-break: break-word;
  width: 100%;
}

.detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.signature {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

/* Timeline connector line */
.log-block:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 90px;
  top: 80px;
  width: 2px;
  height: 44px;
  background: linear-gradient(
    to bottom,
    rgb(var(--v-theme-primary)),
    transparent
  );
  z-index: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .time-tag {
    width: 120px;
    margin-right: 20px;
  }

  .event-card {
    min-width: 300px;
  }

  .card-content {
    padding-left: 40px !important;
    padding-right: 50px !important;
  }
}
</style>
