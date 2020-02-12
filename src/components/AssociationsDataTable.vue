<template>
  <v-data-table class="association-table" :loading="loading" :items="associations" :headers="headers" hide-actions>
    <template slot="items" slot-scope="props">
      <tr @click="$emit('view', currentScreen === 'dashboard' ? props.item.id : props, props.item.id)">
        <td class="text-xs">{{ props.item[idObjName] }}</td>
        <td class="text-xs">{{ props.item.name }}</td>
        <td v-if="currentScreen !== 'dashboard'" class="text-xs">{{ props.item[typeObjName] }}</td>
        <td v-if="currentScreen !== 'dashboard'" class="text-xs">{{ props.item[metadataObjName] }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import DataTableInputField from '@/components/DataTableInputField.vue'

const screenEnum = {
  dashboard: 0,
  membersInAssociation: 1,
  associationsByMember: 2
}
const nameColText = [
  'Member Name',
  'Member Name',
  'Association Name'
]
const typeColText = [
  '',
  'Role',
  'Type'
]
const typeObjText = [
  '',
  'role',
  'type'
]
const idColText = [
  'Id',
  'Member Id',
  'Id'
]
const idObjText = [
  'id',
  'id',
  'id'
]
const metadataObjText = [
  'metadata',
  'metadata',
  'metadata'
]

export default {
  name: 'AssociationsDataTable',
  components: {
    DataTableInputField
  },
  props: {
    currentScreen: {
      type: String,
      required: true
    },
    associations: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      headers: [
        { text: idColText[screenEnum[this.currentScreen]], value: 'id', sortable: false },
        { text: nameColText[screenEnum[this.currentScreen]], value: 'name', sortable: false }
      ],
      idObjName: idObjText[screenEnum[this.currentScreen]],
      typeObjName: typeObjText[screenEnum[this.currentScreen]],
      metadataObjName: metadataObjText[screenEnum[this.currentScreen]],
      loading: false
    }
  },
  mounted() {
    if (this.currentScreen !== 'dashboard') {
      this.headers.push({ text: typeColText[screenEnum[this.currentScreen]], value: 'type', sortable: false })
    }
  }
}
</script>

<style>

</style>
