<template>
  <v-layout justify-space-around align-center column>
    <v-progress-circular v-if="pageLoading" color="blue" indeterminate></v-progress-circular>
    <h3>Blocks for Unit {{unitId}} </h3>
    <v-container class="table">
      <v-btn @click="openDialog" color="pink" dark absolute right fab>
        <v-icon>add</v-icon>
      </v-btn>
      <v-data-table
        :items="blocks"
        :headers="headers"
        hide-actions
      >
      <template slot="items" slot-scope="props">
        <tr @click="openLesson(props.item.id)">
          <td class="px-1" style="width: 0.1%">
            <v-btn style="cursor: move" icon class="sortHandle"><v-icon>drag_handle</v-icon></v-btn>
          </td>
          <td class="text-xs">{{ props.item.priority}}</td>
          <td class="text-xs">{{ props.item.id}}</td>
          <td class="text-xs">{{ props.item.unitId}}</td>
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
      :uploadConfig="blockForm"
      @closeDialog="closeDialog"
      @submitForm="submitForm"
      dialogTitle="Block"
    />
    <v-btn
      v-if="orderChanged"
      :loading="loading"
      @click="savePriority"
    >
      Update Priority
    </v-btn>
  </v-layout>
</template>

<script>
import AddDialog from '@/components/courses/AddDialog.vue'

import { mapActions } from 'vuex'
import { uploadBlockForm } from '@/components/courses/forms'
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
        { text: 'ID', value: 'id' },
        { text: 'Unit ID', value: 'unit_id' },
        { text: 'Key', value: 'key' },
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Created By', value: 'created_by' },
        { text: 'Modified By', value: 'modified_by' }
      ],
      blocks: [],
      orderChanged: false,
      loading: false,
      showDialog: false,
      blockForm: uploadBlockForm,
      pageLoading: true
    }
  },
  async mounted() {
    const { results } = await this.getBlocks([this.unitId])
    this.blocks = results.map(b => { return { ...b } }).sort(function(a, b) {
      return a.priority - b.priority
    })
    this.pageLoading = false
    const table = document.querySelector('.v-datatable tbody')
    Sortable.create(table, {
      onEnd: this.updateBlocks,
      handle: '.sortHandle'
    })
  },
  computed: {
    courseId() {
      return ~~this.$route.params.courseId ? ~~this.$route.params.courseId : ''
    },
    unitId() {
      return ~~this.$route.params.unitId ? ~~this.$route.params.unitId : ''
    }
  },
  methods: {
    ...mapActions([CurriculumActions.GET_BLOCKS, CurriculumActions.UPSERT_BLOCK]),
    savePriority() {
      this.loading = true
      this.blocks.forEach(row => {
        this.upsertBlock(row)
      })
      this.loading = false
      this.orderChanged = false
    },
    updateBlocks({ newIndex, oldIndex }) {
      this.orderChanged = true
      const test = [...this.blocks]
      this.blocks = []
      const rowSelected = test.splice(oldIndex, 1)[0]
      test.splice(newIndex, 0, rowSelected)
      test.forEach((t, index) => {
        t.priority = index
        return t
      })
      this.$nextTick(() => {
        this.blocks = [...test]
      })
    },
    openDialog() {
      this.showDialog = true
    },
    async closeDialog(val) {
      this.showDialog = false
    },
    openLesson(blockId) {
      this.$router.push('/curriculum/courses/' + this.courseId + '/unit/' + this.unitId + '/block/' + blockId)
    },
    async submitForm(val) {
      val.unitId = this.unitId
      await this.upsertBlock(val)

      Object.keys(this.blockForm).forEach(index => {
        this.blockForm[index] = ''
      })
      delete this.blockForm.unitId
      this.showDialog = false
      const data = await this.getBlocks([this.unitId])
      this.blocks = data.results.slice()
    }
  }
}
</script>

<style>
.table {
  text-align: left !important;
}
</style>
