<template>
  <v-layout column ma-5>
    <v-card>
      <v-card-title class="secondary white--text" primary-title style="justify-content: center;">
        <h1>Associations Dashboard</h1>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model      ="searchInput"
          prepend-icon ="search"
          label        ="Search by member name"
          @keyup       ="searchInputDebounce"
          :loading       ="loading"
        >
        </v-text-field>
      </v-card-text>

      <AssociationsDataTable
        :associations  ="members"
        :currentScreen ="'dashboard'"
        @view          ="view"
      />
    </v-card>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { UsersActions } from '@/users/UsersStore'
import { debounce } from 'lodash'

import AssociationsDataTable from '@/components/AssociationsDataTable.vue'

export default {
  components: {
    AssociationsDataTable
  },
  data () {
    return {
      searchInputDebounce: debounce(() => this.search(), 500),
      members: [],
      searchInput: '',
      loading: false,
      addDialog: false
    }
  },
  methods: {
    ...mapActions({
      usersFetch: UsersActions.FETCH_USERS,
      startViewing: UsersActions.START_VIEWING
    }),
    async search(input) {
      const { searchInput } = this
      this.loading = true
      await this.usersFetch({ term: searchInput, first: 25, after: 0 })
      this.loading = false
    },
    async view(id) {
      let displayName

      this.usersSearchResults.forEach(result => {
        if (!displayName && result.id === id) {
          displayName = result.displayName
        }
      })

      this.startViewing({ id, displayName })
      this.$router.push(`/associations/member/${id}`)
    },
    handleEdittingMetaDataArr(index, inputValue) {
      this.edittingMetaDataArr[index].metadata.percent = inputValue
    }
  },
  computed: {
    ...mapState({
      usersSearchResults: state => state.users.searched.results
    })
  },
  watch: {
    usersSearchResults(newVal) {
      if (!Array.isArray(newVal)) {
        this.members = []
        throw new Error('watcher requires an array')
      }
      const mappedMembers = newVal.map(member => {
        const { displayName: name, id } = member
        return { name, id }
      })
      this.members = mappedMembers
    }
  }
}
</script>

<style>
.association-table {
  cursor: default;
}
.link {
  margin: auto;
}
</style>
