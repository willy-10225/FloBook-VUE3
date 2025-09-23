<template>
  <mu-paper class="form-editor" :z-depth="5">
    <mu-form :model="form" label-position="left">
      <mu-form-item prop="type" label="專案類別">
        <mu-auto-complete
          :data="formTypeOptions"
          :max-search-results="5"
          v-model="form.type"
          open-on-focus
        ></mu-auto-complete>
      </mu-form-item>
    </mu-form>
    <FormQuestion
      v-for="(item, index) in form.questions"
      :key="item.id"
      :model="item"
      :index="index"
      @movedownQuestionEvent="movedownQuestion(index)"
      @moveupQuestionEvent="moveupQuestion(index)"
      @removeQuestionEvent="removeQuestion(index)"
    />
    <div class="add-button" @click="addItem">
      <mu-ripple>+</mu-ripple>
    </div>
    <mu-button color="primary" @click="submit">送出</mu-button>
  </mu-paper>
</template>

<script>
import FormQuestion from '@/components/Account/FormQuestion.vue'

class Question {
  constructor(name, type, required, disabled, keyword) {
    this.id = Question.id++
    this.name = name || ''
    this.type = type || ''
    this.required = required || false
    this.disabled = disabled || false
    this.keyword = keyword || ''
  }
}
Question.id = 0

// Get from API
const formTypeOptions = ['BenchMark', 'Demo']

export default {
  name: 'FormEditor',
  components: { FormQuestion },
  data() {
    return {
      formTypeOptions,
      form: {
        type: '',
        questions: [new Question('專案名稱', 'Text', true, true)],
      },
    }
  },
  methods: {
    addItem() {
      this.form.questions.push(new Question())
    },
    submit() {},
    movedownQuestion(index) {
      let temp = this.form.questions.splice(index, 1)
      this.form.questions.splice(index + 1, 0, temp[0])
    },
    moveupQuestion(index) {
      let temp = this.form.questions.splice(index, 1)
      this.form.questions.splice(index - 1, 0, temp[0])
    },
    removeQuestion(index) {
      this.form.questions.splice(index, 1)
    },
  },
}
</script>

<style scoped>
.form-editor {
  background: #777;
  padding: 15px;
  margin: 10px 2px 10px 2px;
}
.add-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  font-size: 30px;
  text-align: center;
  padding: 5px;
  margin: 10px 0;
  cursor: pointer;
  background-color: #666;
  border-radius: 5px;
  color: white;
  user-select: none;
}
.add-button:hover {
  background-color: #aaa;
  opacity: 0.9;
}
</style>
