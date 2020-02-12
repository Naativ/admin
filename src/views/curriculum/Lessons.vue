<template>
  <v-layout justify-space-around align-center column>
    <v-progress-circular v-if="pageLoading" color="blue" indeterminate></v-progress-circular>
    <h3>Lessons for Block {{blockId}}</h3>
    <v-container class="table">
      <v-btn @click="openDialog" color="pink" dark absolute right fab>
        <v-icon>add</v-icon>
      </v-btn>
      <v-data-table :items="lessons" :headers="headers" hide-actions>
        <template slot="items" slot-scope="props">
          <td class="px-1" style="width: 0.1%">
            <v-btn style="cursor: move" icon class="sortHandle">
              <v-icon>drag_handle</v-icon>
            </v-btn>
          </td>
          <td @click="openLesson(props.item.id)" class="text-xs">{{ props.item.priority}}</td>
          <td @click="openLesson(props.item.id)" class="text-xs">{{ props.item.id }}</td>
          <td @click="openLesson(props.item.id)" class="text-xs">{{ props.item.blockId}}</td>
          <td @click="openLesson(props.item.id)" class="text-xs">{{ props.item.key}}</td>
          <td @click="openLesson(props.item.id)" class="text-xs">{{ props.item.name}}</td>
          <td @click="openLesson(props.item.id)" class="text-xs">{{ props.item.description}}</td>
          <td class="text-xs">
            <v-text-field
              v-if="props.item.progressions.length && findProgression(props.item) > -1"
              v-model="props.item.progressions[findProgression(props.item)].toId"
              @keydown="hasEditted(props.index)"
            ></v-text-field>
            <v-text-field
              v-else
              @keydown="hasEditted(props.index)"
              v-model="props.item.nextLessonId"
            ></v-text-field>
            <v-btn @click="saveRow(props.item)" v-if="editted[props.index]">Save</v-btn>
          </td>
        </template>
      </v-data-table>
    </v-container>
    <AddDialog
      :showDialog="showDialog"
      :uploadConfig="lessonForm"
      @closeDialog="closeDialog"
      @submitForm="submitForm"
      dialogTitle="Lesson"
    />
    <v-btn v-if="orderChanged" @click="saveOrder">Update Priorities</v-btn>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import { CurriculumActions } from '@/curriculum/CurriculumStore'
import Sortable from 'sortablejs'

import { cloneDeep } from 'lodash'
import { uploadLessonForm } from '@/components/courses/forms'

import AddDialog from '@/components/courses/AddDialog.vue'

export default {
  components: {
    AddDialog
  },
  data () {
    return {
      lessons: [],
      headers: [
        { text: '', sortable: false },
        { text: 'Priority', value: 'priority' },
        { text: 'ID', value: 'id' },
        { text: 'Block ID', value: 'block_id' },
        { text: 'Key', value: 'key' },
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Next Lesson', value: 'next_lesson' }
      ],
      orderChanged: false,
      loading: false,
      nextLesson: 123,
      editted: [],
      showDialog: false,
      lessonForm: uploadLessonForm,
      progression: [],
      pageLoading: true
    }
  },
  async mounted () {
    const { results } = await this.getLessons(this.blockId)
    this.pageLoading = false
    this.lessons = cloneDeep(results).sort(function (a, b) {
      return a.priority - b.priority
    })

    this.editted = Array(this.lessons.length)
    const table = document.querySelector('.v-datatable tbody')
    Sortable.create(table, {
      onEnd: this.updateLessons,
      handle: '.sortHandle'
    })
  },
  computed: {
    courseId () {
      return ~~this.$route.params.courseId ? ~~this.$route.params.courseId : ''
    },
    unitId () {
      return ~~this.$route.params.unitId ? ~~this.$route.params.unitId : ''
    },
    blockId () {
      return ~~this.$route.params.blockId ? ~~this.$route.params.blockId : ''
    }
  },
  methods: {
    ...mapActions([
      CurriculumActions.GET_LESSONS,
      CurriculumActions.UPSERT_LESSON,
      CurriculumActions.LESSON_PROGRESSION
    ]),
    openLesson (item) {
      this.$router.push('/curriculum/courses/' + this.courseId + '/unit/' + this.unitId + '/block/' + this.blockId + '/lesson/' + item)
    },
    findProgression (row) {
      return row.progressions.findIndex(r => r.fromId === row.id)
    },
    openLessonDetails (lessonId) {
      this.$router.push('/curriculum/courses/' + this.courseId + '/unit/' + this.unitId + '/block/' + this.blockId + '/lesson/' + lessonId)
    },
    hasEditted (index) {
      this.$nextTick(() => {
        this.editted[index] = true
      })
    },
    async saveRow (row) {
      const val = {
        toId: this.findProgression(row) > -1 ? ~~row.progressions[this.findProgression(row)].toId : ~~row.nextLessonId,
        fromId: row.id
      }
      if (row.progressions.length && this.findProgression(row) > -1) {
        val.id = row.progressions[this.findProgression(row)].id
      }
      await this.lessonProgression(val)
      this.editted = Array(this.lessons.length)
    },
    async saveOrder () {
      this.loading = true
      var arr = []
      this.lessons.forEach((row, index) => {
        this.upsertLesson(row)
        if (index < this.lessons.length - 1) {
          const next = index + 1
          const val = {
            toId: this.lessons[next].id,
            fromId: row.id
          }
          if (row.progressions.length && this.findProgression(row) > -1) {
            val.id = row.progressions[this.findProgression(row)].id
          }
          row.progression = this.lessonProgression(val)
          arr.push(row)
        }
      })
      this.loading = false
      this.orderChanged = false
    },
    updateLessons ({ newIndex, oldIndex }) {
      this.orderChanged = true
      var test = [...this.lessons]
      this.lessons = []
      const rowSelected = test.splice(oldIndex, 1)[0]
      test.splice(newIndex, 0, rowSelected)

      test.forEach((t, index) => {
        if (index < test.length - 1) {
          var next = index + 1
          if (t.progressions.length && this.findProgression(t) > -1) {
            t.progressions[this.findProgression(t)].toId = test[next].id
          } else {
            t.nextLessonId = test[next].id
          }
        }
        t.priority = index
        return t
      })

      this.$nextTick(() => {
        this.lessons = [...test]
      })
    },
    openDialog () {
      this.showDialog = true
    },
    closeDialog () {
      this.showDialog = false
    },
    async submitForm (val) {
      val.blockId = this.blockId
      const wordList = val.metadata[0].value.join(', ')
      const objectivesArr = val.metadata[1].value
      const objectives = this.prepObjectives(objectivesArr)
      const form = { ...val, metadata: { wordList, objectives } }
      await this.upsertLesson(form)

      Object.keys(this.lessonForm).forEach(index => {
        if (index !== 'metadata' && index !== 'blockId') {
          this.lessonForm[index] = ''
        }
      })
      Object.keys(this.lessonForm.metadata).forEach(index => {
        this.lessonForm.metadata[index].value = []
      })
      delete this.lessonForm.blockId

      this.showDialog = false
      const { results } = await this.getLessons(this.blockId)
      this.lessons = cloneDeep(results).sort(function (a, b) {
        return a.priority - b.priority
      })
    },
    prepObjectives (objectives) {
      const objectiveOpener = '<div> At completion of this lesson, students will be able to: </div>'
      let objectiveList = objectives.reduce((prev, cur) => {
        return prev + ' <li>' + cur + '</li>'
      }, '')
      objectiveList = ' <div> <ul>' + objectiveList + '</ul></div>'
      const val = objectiveOpener + objectiveList
      return val
    }
  }
}
</script>

<style scoped>
.table {
  text-align: left !important;
}
</style>
