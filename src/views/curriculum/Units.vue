<template>
  <v-layout justify-space-around align-center column>
    <v-progress-circular v-if="pageLoading" color="blue" indeterminate></v-progress-circular>
    <h3>Units for Course {{courseId}} </h3>
    <v-container class="table">
      <v-btn @click="openDialog" color="pink" dark absolute right fab>
        <v-icon>add</v-icon>
      </v-btn>
      <v-data-table
        must-sort
        :items="units"
        :headers="headers"
        hide-actions
      >
      <template slot="items" slot-scope="props">
        <tr @click="openBlock(props.item.id)">
          <td class="px-1" style="width: 0.1%">
            <v-btn style="cursor: move" icon class="sortHandle"><v-icon>drag_handle</v-icon></v-btn>
          </td>
          <td class="text-xs">{{ props.item.priority}}</td>
          <td class="text-xs">{{ props.item.id}}</td>
          <td class="text-xs">{{ props.item.courseId}}</td>
          <td class="text-xs">{{ props.item.key}}</td>
          <td class="text-xs">{{ props.item.name}}</td>
          <td class="text-xs">{{ props.item.description}}</td>
          <td class="text-xs">{{ props.item.modifiedBy}}</td>
        </tr>
      </template>
      </v-data-table>
    </v-container>
    <AddDialog
      :showDialog="showDialog"
      :uploadConfig="unitForm"
      @closeDialog="closeDialog"
      @submitForm="submitForm"
      dialogTitle="Unit"
    />
    <v-btn
      v-if="orderChanged"
      :loading="loading"
      @click="saveOrder"
    >
      Update Priority
    </v-btn>
  </v-layout>
</template>

<script>
import AddDialog from '@/components/courses/AddDialog.vue'

import { mapActions } from 'vuex'
import { uploadUnitForm } from '@/components/courses/forms'
import { CurriculumActions } from '@/curriculum/CurriculumStore'

import Sortable from 'sortablejs'

export default {
  components: {
    AddDialog
  },
  data() {
    return {
      headers: [
        { text: '', sortable: false },
        { text: 'Priority', value: 'priority' },
        { text: 'ID', value: 'id', sortable: false },
        { text: 'Course ID', value: 'unit_id', sortable: false },
        { text: 'Key', value: 'key', sortable: false },
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Description', value: 'description', sortable: false },
        { text: 'Modified By', value: 'modified_by', sortable: false }
      ],
      units: [],
      orderChanged: false,
      loading: false,
      showDialog: false,
      unitForm: uploadUnitForm,
      pageLoading: true
    }
  },
  async mounted() {
    const { results } = await this.getUnits([this.courseId])
    this.units = results.map(u => { return { ...u } }).sort(function(a, b) {
      return a.priority - b.priority
    })

    this.pageLoading = false
    const table = document.querySelector('.v-datatable tbody')
    Sortable.create(table, {
      onEnd: this.updateUnits,
      handle: '.sortHandle'
    })
  },
  computed: {
    courseId() {
      return ~~this.$route.params.courseId ? ~~this.$route.params.courseId : ''
    }
  },
  methods: {
    ...mapActions([CurriculumActions.GET_UNITS, CurriculumActions.UPSERT_UNIT]),
    async saveOrder() {
      this.loading = true
      const test = [ ...this.units ]
      await test.forEach(row => {
        this.upsertUnit(row)
      })
      this.loading = false
      this.orderChanged = false
    },
    updateUnits({ newIndex, oldIndex }) {
      this.orderChanged = true
      var test = [...this.units]
      this.units = []
      const rowSelected = test.splice(oldIndex, 1)[0]
      test.splice(newIndex, 0, rowSelected)
      test.forEach((t, index) => {
        t.priority = index
        return t
      })
      this.$nextTick(() => {
        this.units = [...test]
      })
    },
    openDialog() {
      this.showDialog = true
    },
    async closeDialog(val) {
      this.showDialog = false
    },
    openBlock(unitId) {
      this.$router.push('/curriculum/courses/' + this.courseId + '/unit/' + unitId)
    },
    async submitForm(val) {
      val.courseId = this.courseId
      await this.upsertUnit(val)

      Object.keys(this.unitForm).forEach(index => {
        this.unitForm[index] = ''
      })
      delete this.unitForm.courseId

      this.showDialog = false
      const { results } = await this.getUnits([this.courseId])
      this.units = results.map(u => { return { ...u } }).sort(function(a, b) {
        return a.priority - b.priority
      })
    }
  }
}
</script>

<style>
.table {
  text-align: left !important;
}
</style>
