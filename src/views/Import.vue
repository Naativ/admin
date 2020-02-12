<template>
  <v-flex xs12>
    <div class="import">
      <h1>Import</h1>
      <v-icon v-if="!showFileUpload" v-on:click="showFileUpload = true">add</v-icon>
      <v-icon v-if="showFileUpload" v-on:click="showFileUpload = false">remove</v-icon>
    </div>
    <form v-if="showFileUpload" enctype="multipart/form-data" novalidate>
        <input
          type="file"
          name="import"
          :disabled="isSaving"
          @change="filesChange($event.target.files)"
          accept=".csv"
        />
        <div
          v-for="(field) in destination.fields"
          :key="field.name"
        >
          <label class="bold">{{field.name}}: </label>
          <input type="text" v-model="field.value">
        </div>
        <div>
          <div v-if="!isUploading">
            <v-btn color="success" @click="processUpload()" :disabled="!file">Upload</v-btn>
          </div>
          <div v-if="isUploading">Uploading... please wait</div>
        </div>
    </form>
    <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
           <tr @click="goToJob(props.item)">
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.feedTypeName }}</td>
            <td>{{ props.item.statusName }}</td>
            <td>{{ props.item.started }}</td>
            <td>{{ props.item.pending }}</td>
            <td>{{ props.item.complete }}</td>
            <td>{{ props.item.errored }}</td>
            <td>{{ props.item.total }}</td>
            <td>{{ props.item.createdOn | formatDate('DD')}}</td>
          </tr>
        </template>
      </v-data-table>
  </v-flex>
</template>
<script>
import { Actions } from '@/store'
import GET_FEEDS from '@/graphql/Feeds.gql'
const EMPTY_DESTINATION = { url: '', fields: [] }

export default {
  name: 'Import',
  methods: {
    goToJob(job) {
      this.$router.push({ path: `/job/${job.id}` })
    },
    async filesChange(files) {
      this.file = files[0]
    },
    async processUpload() {
      await this.getDestination()
      this.isSaving = true
      this.isUploading = true
      await this.$store.dispatch(Actions.FILE_UPLOAD, {
        file: this.file,
        destination: this.destination
      })
      this.isFalse = false
      this.isUploading = false
      this.file = undefined
      this.destination = EMPTY_DESTINATION
    },
    async getDestination() {
      const { data } = await this.$store.dispatch(
        Actions.GET_UPLOAD_DESTINATION,
        {}
      )

      const destination = data.destination
      destination.fields = Object.keys(destination.fields).reduce(
        (arr, prop) => {
          arr.push({
            name: prop,
            value: destination.fields[prop]
          })
          return arr
        },
        []
      )
      this.destination = destination
    }
  },
  data() {
    return {
      destination: EMPTY_DESTINATION,
      file: undefined,
      uploadFileName: null,
      isUploading: false,
      isSaving: false,
      showFileUpload: false,
      headers: [
        { text: 'ID', value: 'id', sortable: false },
        { text: 'Type', value: 'feedTypeName' },
        { text: 'Status', value: 'statusName' },
        { text: 'Started', value: 'started' },
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'complete' },
        { text: 'Errored', value: 'errored' },
        { text: 'Total Records', value: 'total' },
        { text: 'Date Imported', value: 'createdOn' }
      ],
      items: []
    }
  },
  apollo: {
    items: {
      query: GET_FEEDS,
      variables() {
        return {
          condition: {}
        }
      },
      update({ allFeeds }) {
        return allFeeds.nodes
      }
    }
  }
}
</script>

<style scoped>
.bold {
  font-weight: 600;
}
</style>
