<template>
    <div class="container">
        <div style="background: gray;width: 750px;font-size: 18px;">
            <div class="object-column" style="display:flex; flex-direction:row;">
                <div class="option-bar" style="padding-left:15px">
                    <mu-select :label="$t('sheet.object')" v-model="submitData.object" style="width:100px;"
                        @change="show()" :disabled="disabled">
                        <mu-option id="objectOption" v-for="item in objects" :key="item" :label="item" :value="item" />
                    </mu-select>
                </div>
                <div class="option-bar" style="padding-left:15px" v-show="show()">
                    <mu-text-field :label="$t('sheet.clientName')" v-model="submitData.clientName" style="width:150px"
                        :disabled="disabled" />
                </div>
                <div class="option-bar" style="padding-left:15px" v-show="show()">
                    <mu-select :label="$t('sheet.category')" v-model="submitData.category" style="width:200px"
                        :disabled="disabled">
                        <mu-option v-for="item in categories" :key="item" :label="item" :value="item" />
                    </mu-select>
                </div>
            </div>
            <div class="list-container" style="display:flex; flex-direction:row;width:800px;margin-left: 15px;">
                <div class="discription-column" style="margin-top: -15px">
                    <p style="text-align:left;line-height:0%;font-size: 15px;">{{$t('sheet.taskDiscription')}}</p>
                    <mu-flex v-for="item in quetionDiscriptions" :key="item">
                        <mu-checkbox :value="item" v-model="submitData.quetionDiscription" :label="item"
                            :disabled="disabled" v-if="disabled" />
                        <mu-checkbox class="checkbox" :value="item" v-model="submitData.quetionDiscription"
                            :label="item" v-else />
                    </mu-flex>
                </div>
                <div class="radio-column" style="margin-top: -15px;margin-left: 35px;">
                    <p style="text-align:left;line-height:0%;font-size: 15px;">{{$t('sheet.timeExpectation')}}</p>
                    <mu-flex v-for="item in expectationLists" :key="item">
                        <mu-radio :value="item" v-model="submitData.expectationList" :label="item"
                            :disabled="disabled" v-if="disabled"/>
                        <mu-radio class="radio" :value="item" v-model="submitData.expectationList" :label="item"
                            :disabled="disabled" v-else/>
                    </mu-flex>
                </div>
            </div>
            <div class="input-container">
                <mu-text-field v-show="isShow" v-model="submitData.statement" :placeholder="placeholder" multi-line
                    :rows="2" :label="statementTitle" style="width:650px;" @focus="placeholder=''"
                    @focusout="placeholder=$t('sheet.placeholder')" @keydown.enter="wordsCheck()" max-length="100"
                    :disabled="disabled" />
                <mu-text-field v-show="!isShow" v-model="submitData.statement" :placeholder="placeholder"
                    :error-text="errorMessage" multi-line :rows="2" :label="statementTitle" style="width:650px;"
                    @keydown.enter="wordsCheck()" max-length="100" :disabled="disabled" />
            </div>
            <div class="btn-container">
                <mu-button @click="close()" flat style="font-size:20px;margin-bottom: 25px;">{{$t('sheet.cancel')}}
                </mu-button>
                <mu-button @click="disabled=false" v-show="disabled" flat style="font-size:20px;margin-bottom: 25px;">
                    {{$t('sheet.edit')}}
                </mu-button>
                <mu-button @click="wordsCheck()" v-show="!disabled" flat style="font-size:20px;margin-bottom: 25px;">
                    {{$t('sheet.submit')}}
                </mu-button>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "emptySheet",
    data() {
        return {
            disabled: true,
            objects: [this.$t('sheet.myself'), this.$t('sheet.client')],
            categories: [this.$t('sheet.generalService'), this.$t('sheet.trialCase'), this.$t('sheet.projectService')],
            quetionDiscriptions: [this.$t('sheet.testAccuracy'), this.$t('sheet.testForConvergence'), this.$t('sheet.adjustMaterialParameters'), this.$t('sheet.adjustBoundaryConditions'), this.$t('sheet.HPCPerformanceTest'), this.$t('sheet.GPUPerformanceTest'), this.$t('sheet.optimizationOperation'), this.$t('sheet.compareWithReferenceData'), this.$t('sheet.sampleExercises/Tests')],
            expectationLists: [this.$t('sheet.more'), this.$t('sheet.yes'), this.$t('sheet.less')],
            placeholder: this.$t('sheet.placeholder'),
            statementTitle: this.$t('sheet.statement'),
            errorMessage: this.$t('sheet.errorMessage'),
            submitData: {
                object: this.$t('sheet.client'),
                clientName: "sss",
                category: this.$t('sheet.generalService'),
                quetionDiscription: [this.$t('sheet.testAccuracy')],
                expectationList: this.$t('sheet.yes'),
                statement: ""
            },
            isShow: true
        }
    },
    methods: {
        placeholderReplace() {
            this.placeholder == "" ? this.placeholder = this.$t('sheet.placeholder') : this.placeholder = ""
        },
        show() {
            if (this.submitData.object == this.$t('sheet.client')) {
                return true
            } else {
                return false
            }
        },
        wordsCheck() {
            if (this.submitData.statement.split('').length > 49) {
                this.$emit('cancel')
                return this.isShow = true
            } else {
                return this.isShow = false
            }
        },
        close() {
            this.submitData = {
                object: "",
                clientName: "",
                category: "",
                quetionDiscription: [],
                expectationList: [],
                statement: ""
            }
            this.$emit('cancel')
        }
    }
}
</script>

<style>
.checkbox:hover {
    background: black;
}

.radio:hover {
    background: black;
}
</style>
