<template>
  <div>
    <v-autocomplete
      :label="label"
      :loading="loading"
      :item-text="getItemDisplay"
      :item-value="getItemDisplay"
      :items="results"
      :rules="[ v => !!v || 'Field is required' ]"
      :search-input.sync="term"
      hide-no-data
      hint="Find A User"
      no-filter
      return-object
      v-model="userSelected"
    />
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import { searchUsers } from '@/users/users.gql'

export default {
  name: 'UserAutocomplete',
  props: {
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Select Time' }
  },
  data () {
    return {
      loading: false,
      results: [],
      term: null,
      userSelected: {}
    }
  },
  methods: {
    getItemDisplay (item) {
      const { displayName, contacts, id } = item
      if (contacts === undefined) return
      return `${displayName} (${id}) - ${contacts[0].emails[0].email}`
    },
    async getResults() {
      if (!this.term || this.term.length < 3) return []
      this.loading = true
      const res = await this.$apollo.query({
        query: searchUsers,
        variables: {
          memberCon: { ids: null, query: this.term, tags: [], first: 10, after: 0 }
        },
        fetchPolicy: 'network-only'
      })
      this.results.length = 0
      pathOr([], ['data', 'members', 'nodes'], res).forEach(r => this.results.push(r))
      this.loading = false
    }
  },
  watch: {
    term () { this.getResults() },
    userSelected (val) {
      this.$emit('selected', this.userSelected)
    }
  }
}
</script>

<style scoped>
</style>
