<template>
  <div class="form-question">
    <mu-form ref="form" :model="question" label-position="left">
      <mu-row gutter justify-content="center" align-item="center">
        <mu-col span="6">
          <mu-form-item prop="name">
            <mu-text-field
              v-model="question.name"
              :placeholder="questionName"
              :disabled="question.disabled"
            ></mu-text-field>
          </mu-form-item>
        </mu-col>
        <mu-col span="6">
          <mu-form-item prop="type" label="問題類型">
            <mu-select v-model="question.type" :disabled="question.disabled">
              <mu-option
                v-for="(option, index) in typeOptions"
                :key="index"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
        <mu-col span="6" v-if="question.type == typeOptions[0]">
          <mu-form-item prop="keyword" label="關聯資料集">
            <mu-select
              v-model="question.keyword"
              :disabled="question.disabled"
              @change="createKeyword"
            >
              <mu-option
                v-for="(option, index) in keywords"
                :key="index"
                :label="option"
                :value="option"
              ></mu-option>
              <mu-text-field placeholder="eee"></mu-text-field>
              <mu-option label="hello" value="hello"></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <mu-row align-item="center">
        <mu-col span="1" v-if="!!question.type">預覽</mu-col>
      </mu-row>
      <hr style="border: grey dashed 0.5px;" v-if="!!question.type" />
      <mu-row gutter justify-content="center">
        <mu-col span="6" v-if="question.type == typeOptions[0]">
          <mu-form-item :label="questionName">
            <mu-select v-model="answer">
              <mu-option
                v-for="option in customerOptions"
                :key="option"
                :label="option"
                :value="option"
              ></mu-option>
            </mu-select>
          </mu-form-item>
        </mu-col>
        <mu-col span="6" v-else-if="question.type == typeOptions[1]">
          <mu-form-item :label="questionName">
            <date-picker :value="answer"></date-picker>
          </mu-form-item>
        </mu-col>
        <mu-col span="6" v-else-if="question.type == typeOptions[2]">
          <mu-form-item :label="questionName">
            <mu-text-field v-model="answer"></mu-text-field>
          </mu-form-item>
        </mu-col>
        <mu-col span="12" v-else-if="question.type == typeOptions[3]">
          <mu-form-item :label="questionName">
            <mu-text-field multi-line :rows="3" :rows-max="6" v-model="answer"></mu-text-field>
          </mu-form-item>
        </mu-col>
      </mu-row>
      <footer>
        <mu-row align-items="baseline" gutter style="height:50px">
          <mu-col span="7"></mu-col>
          <mu-col span="2">
            <mu-button icon color="white" @click="movedownQuestion">
              <i class="material-icons">keyboard_arrow_down</i>
            </mu-button>
            <mu-button icon color="white" @click="moveupQuestion">
              <i class="material-icons">keyboard_arrow_up</i>
            </mu-button>
          </mu-col>
          <mu-col span="1">
            <mu-button icon color="error" @click="removeQuestion">
              <i class="material-icons">delete</i>
            </mu-button>
          </mu-col>
          <mu-col span="2">
            <mu-checkbox class="checkbox" v-model="question.required" label="必填"></mu-checkbox>
          </mu-col>
        </mu-row>
      </footer>
    </mu-form>
  </div>
</template>

<script>
import DatePicker from '@/components/common/DatePicker.vue'
// Get from API
const typeOptions = [
  'Dropdown Box',
  'Date Picker',
  'Text',
  'Text Area',
  'File Upload'
]
const keywords = ['員工', '客戶']
const customerOptions = ['台積電', '日月光']
const employerOptions = ['Chris Kao', 'Ray Li', 'Star Wang']

export default {
  name: 'FormQuestion',
  components: { DatePicker },
  props: {
    model: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      typeOptions,
      keywords,
      customerOptions,
      employerOptions,
      question: this.model,
      answer: ''
    }
  },
  computed: {
    questionName() {
      return this.question.name || '問題' + this.index
    },
    keywordOptions() {
      switch (this.question.type) {
        case '員工':
          return this.employerOptions
        case '客戶':
          return this.customerOptions
        default:
          return []
      }
    }
  },
  methods: {
    getKeywordOptions(type) {
      switch (type) {
        case '員工':
          return this.employerOptions
        case '客戶':
          return this.customerOptions
        default:
          return []
      }
    },
    createKeyword() {
      console.log('hey')
    },
    removeQuestion() {
      this.$emit('removeQuestionEvent')
    },
    movedownQuestion() {
      this.$emit('movedownQuestionEvent')
    },
    moveupQuestion() {
      this.$emit('moveupQuestionEvent')
    }
  }
}
</script>

<style scoped lang="less">
.form-question {
  background: #666;
  border-radius: 5px;
  padding: 10px;
  margin: 10px 0;
  footer {
    position: relative;
    border-top: gray dashed 1px;
    height: 50px;
    margin-top: 10px;
    padding-top: 5px;
    .checkbox {
      height: 100%;
    }
  }
}
</style>
