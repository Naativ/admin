<template>
  <v-layout justify-space-around align-center column>
    <v-progress-circular v-if="pageLoading" color="blue" indeterminate></v-progress-circular>
    <h3>Available Courses</h3>
    <v-container class="table">
      <v-btn
        @click="openDialog"
        color="pink"
        dark
        absolute
        right
        fab
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-data-table
        :items="sortedCourses"
        :headers="headers"
        hide-actions
      >
      <template slot="items" slot-scope="props">
        <tr @click="openUnit(props.item.id)">
          <td class="px-1" style="width: 0.1%">
            <v-btn style="cursor: move" icon class="sortHandle"><v-icon>drag_handle</v-icon></v-btn>
          </td>
          <td class="text-xs">{{ props.item.id}}</td>
          <td class="text-xs">{{ props.item.key}}</td>
          <td class="text-xs">{{ props.item.description}}</td>
        </tr>
      </template>
      </v-data-table>
    </v-container>
    <AddDialog
      :showDialog="showDialog"
      :uploadConfig="courseForm"
      @closeDialog="closeDialog"
      @submitForm="submitForm"
    />
  </v-layout>
</template>

<script>
import AddDialog from '@/components/courses/AddDialog.vue'

import { uploadCourseForm } from '@/components/courses/forms'
import { mapActions } from 'vuex'
import { CurriculumActions } from '@/curriculum/CurriculumStore'

import Sortable from 'sortablejs'

export default {
  components: {
    AddDialog
  },
  data () {
    return {
      headers: [
        { text: '', sortable: false },
        { text: 'ID', value: 'id' },
        { text: 'Key', value: 'key' },
        { text: 'Description', value: 'description' }
      ],
      courses: {},
      sortedCourses: [],
      showDialog: false,
      courseForm: uploadCourseForm,
      pageLoading: true
    }
  },
  async mounted () {
    this.courses = await this.getCourses()
    this.sortedCourses = await this.courses.results.slice().sort(function(a, b) {
      return a.id - b.id
    })
    this.pageLoading = false
    const table = document.querySelector('.v-datatable tbody')
    const _self = this
    Sortable.create(table, {
      onEnd({ newIndex, oldIndex }) {
        const rowSelected = _self.sortedCourses.splice(oldIndex, 1)[0]
        _self.sortedCourses.splice(newIndex, 0, rowSelected)
      },
      handle: '.sortHandle'
    })
  },
  methods: {
    ...mapActions([CurriculumActions.GET_COURSES, CurriculumActions.UPSERT_COURSE]),
    openDialog () {
      this.showDialog = true
    },
    async closeDialog (val) {
      this.showDialog = false
    },
    openUnit(item) {
      this.$router.push('/curriculum/courses/' + item)
    },
    async submitForm(val) {
      this.showDialog = false
      await this.upsertCourse(val)

      Object.keys(this.courseForm).forEach(index => {
        this.courseForm[index] = ''
      })

      this.courses = await this.getCourses()
      this.sortedCourses = await this.courses.results.slice().sort(function(a, b) {
        return a.id - b.id
      })
    }
  }
}
</script>

<style>
.link {
  cursor: pointer;
  text-decoration: none;
}

.table {
  text-align: left !important;
}
</style>
