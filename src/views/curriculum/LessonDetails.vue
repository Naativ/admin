<template>
  <v-layout class="lesson-container" column justify-space-around align-center>
    <v-progress-circular v-if="pageLoading" color="blue" indeterminate></v-progress-circular>
    <h3>Lesson Info</h3>
    <v-btn
      class="edit-btn"
      v-if="!editing"
      absolute
      dark
      fab
      top
      right
      color="pink"
      @click="editing = true"
    >
      <v-icon>edit</v-icon>
    </v-btn>
    <v-speed-dial
      absolute
      dark
      fab
      top
      right
      color="pink"
      v-model="saveSpeedDial"
      direction="bottom"
      :open-on-hover="true"
      transition="slide-y-transition"
      :disabled="!saving"
      v-else
      class="edit-speed-dial"
    >
      <v-btn slot="activator" v-model="saveActivator" color="pink" dark fab>
        <v-icon>save</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn fab dark small color="green" @click="saveData">
        <v-icon>check</v-icon>
      </v-btn>
      <v-btn fab dark small color="red" @click="cancelEdit">
        <v-icon>cancel</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-card class="card">
      <v-layout row wrap>
        <template v-for="(data, index) in lessons">
          <v-flex
            xs6
            :key="index"
            v-if="index != 'slides' && index != '__typename' && index != 'metadata'"
          >
            <v-text-field
              class="fields"
              v-model="lessons[index]"
              :label="index"
              required
              :box="editing"
              :regular="!editing"
              :disabled="!editing"
            ></v-text-field>
          </v-flex>
        </template>
        <template v-for="(data, index) in lessons.metadata">
          <v-flex xs6 :key="index + 'data'">
            <v-textarea
              class="fields"
              v-model="lessons.metadata[index]"
              :label="index"
              required
              :box="editing"
              :regular="!editing"
              :disabled="!editing"
            ></v-textarea>
          </v-flex>
        </template>
      </v-layout>
    </v-card>
    <v-card class="card">
      <h3>Slides</h3>
      <v-container>
        <v-data-table :items="lessons.slides" :headers="headers" hide-actions>
          <template slot="items" slot-scope="props">
            <tr @click="openSlide(props.item.id)">
              <td class="px-1" style="width: 0.1%">
                <v-btn style="cursor: move" icon class="sortHandle">
                  <v-icon>drag_handle</v-icon>
                </v-btn>
              </td>
              <td class="text-xs">{{ props.item.priority}}</td>
              <td class="text-xs">{{ props.item.id}}</td>
              <td class="text-xs">{{ props.item.key}}</td>
              <td class="text-xs">{{ props.item.name}}</td>
              <td class="text-xs">{{ props.item.description}}</td>
              <td>
                <ul v-for="p in props.item.assets" :key="p.id">
                  <li>{{ p.id }}</li>
                </ul>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-container>
      <v-layout right>
        <v-btn @click="openDialog">Create Slide</v-btn>
      </v-layout>
    </v-card>
    <EditSlideDialog :editDialog="editDialog" :selected="selectedSlide" @closeSlide="closeSlide" />
    <AddDialog
      :showDialog="showDialog"
      :uploadConfig="slideForm"
      @closeDialog="closeDialog"
      @submitForm="submitForm"
      dialogTitle="Slide"
    />
    <v-btn v-if="orderChanged" :loading="loading" @click="saveOrder">Update Priority</v-btn>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import { CurriculumActions } from '@/curriculum/CurriculumStore'
import { uploadSlideForm } from '@/components/courses/forms'

import EditSlideDialog from '@/components/courses/EditSlideDialog.vue'
import Sortable from 'sortablejs'
import AddDialog from '@/components/courses/AddDialog.vue'

export default {
  components: {
    AddDialog,
    EditSlideDialog
  },
  data () {
    return {
      lessons: {
        metadata: {}
      },
      saveActivator: false,
      showDialog: false,
      saveSpeedDial: false,
      test: undefined,
      saving: false,
      editDialog: false,
      editing: false,
      headers: [
        { text: '', sortable: false },
        { text: 'Priority', value: 'priority' },
        { text: 'ID', value: 'id' },
        { text: 'Key', value: 'key' },
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Asset ID', value: 'assets' }
      ],
      selectedSlide: {},
      orderChanged: false,
      loading: false,
      slideForm: uploadSlideForm,
      pageLoading: true
    }
  },
  async mounted () {
    const data = await this.getLessonsById(this.lessonId)
    this.pageLoading = false
    this.lessons = { ...data, metadata: { ...data.metadata } }

    this.lessons.slides.map(l => { return { ...l } }).sort(function (a, b) {
      return a.priority - b.priority
    })

    const table = document.querySelector('.v-datatable tbody')
    Sortable.create(table, {
      onEnd: this.updateSlides,
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
    },
    lessonId () {
      return ~~this.$route.params.lessonId ? ~~this.$route.params.lessonId : ''
    }
  },
  methods: {
    ...mapActions([
      CurriculumActions.GET_LESSONS_BY_ID,
      CurriculumActions.UPSERT_SLIDE,
      CurriculumActions.UPSERT_LESSON
    ]),
    saveOrder () {
      this.loading = true
      this.lessons.slides.forEach((row, index) => {
        row.lessonId = this.lessonId
        this.upsertSlide(row)
      })
      this.loading = false
      this.orderChanged = false
    },
    updateSlides ({ newIndex, oldIndex }) {
      this.orderChanged = true
      var test = this.lessons.slides.map(l => { return { ...l } }).sort(function (a, b) {
        return a.priority - b.priority
      })
      this.lessons.slides = []
      const rowSelected = test.splice(oldIndex, 1)[0]
      test.splice(newIndex, 0, rowSelected)

      test.forEach((t, index) => {
        t.priority = index
        return t
      })

      this.$nextTick(() => {
        this.lessons.slides = [...test]
      })
    },
    openDialog () {
      this.showDialog = true
    },
    async closeDialog (val) {
      this.showDialog = false
    },
    async submitForm (val) {
      val.lessonId = this.lessonId
      const tips = val.metadata[0].value
      const actions = val.metadata[1].value
      const form = { ...val, metadata: { tips, actions } }
      await this.upsertSlide(form)

      Object.keys(this.slideForm).forEach(index => {
        if (index !== 'metadata' && index !== 'lessonId') {
          this.slideForm[index] = ''
        }
      })
      Object.keys(this.slideForm.metadata).forEach(index => {
        this.slideForm.metadata[index].value = ''
      })
      delete this.slideForm.lessonId

      this.showDialog = false
      const data = await this.getLessonsById(this.lessonId)
      this.lessons = { ...data, metadata: { ...data.metadata } }
    },
    openSlide (slideId) {
      this.selectedSlide = this.lessons.slides.find(s => {
        return s.id === slideId
      })
      this.editDialog = true
    },
    async closeSlide () {
      this.editDialog = false
      this.selectedSlide = {}
      const data = await this.getLessonsById(this.lessonId)
      this.lessons = { ...data }
    },
    async cancelEdit () {
      this.editing = false
    },
    async saveData () {
      this.saving = true
      await this.upsertLesson(this.lessons)
      this.editing = false
      this.saving = false
    }
  }
}
</script>

<style scoped>
.lesson-container {
  margin: 10px 0;
  width: 100%;
}
.fields {
  height: 100%;
  padding: 10px 10px;
  width: 100%;
  margin: 10px 10px;
}
.card {
  width: 90%;
  padding: 20px 10px;
  margin: 5px 0;
}
.center {
  text-align: center;
}

.meta {
  padding: 10px 20px;
  color: grey;
}
</style>
