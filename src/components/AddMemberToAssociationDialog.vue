<template>
  <v-dialog v-model="show" max-width="768" persistent>
      <v-card class="dialog">
        <v-flex pa-4>
          <h1>Add Member</h1>
          <v-flex xs-12 sm-6 style="flex: 1 1; padding: 0px 4px;">
          <v-form ref="form" lazy-validation>
            <v-autocomplete
              v-model="form.member"
              :items="mergeAccount.searchItems2"
              :search-input.sync="searchTerm2"
              item-text="displayName"
              :rules="[v => !!v || 'Member is required!']"
              item-value="id"
              hide-no-data
              return-object
              label="Search member to add"
            >
              <template slot="selection" slot-scope="data">
                <v-icon>person</v-icon>
                <v-list-tile-content v-text="data.item.id"></v-list-tile-content>
              </template>

            </v-autocomplete>
            <v-select
              :items="roles"
              label="Role"
              item-text="name"
              item-value="key"
              v-model="form.role"
            >
            </v-select>
            <v-text-field
              label="Enter in a percentage"
              v-if="form.role === 'referrer'"
              v-model="form.rate"
              :rules="[v => !!v || 'Rate is required!']"
              required
            />
          </v-form>
          </v-flex>
          <v-card-actions>
            <v-btn
              flat
              @click="$emit('closeDialog')"
            >Close</v-btn>
            <v-spacer/>
            <v-btn
              flat
              class="primary"
              @click="test"
            >Submit</v-btn>
          </v-card-actions>
        </v-flex>
      </v-card>
  </v-dialog>
</template>

<script>
import { pathOr } from 'ramda'
import SEARCH_QUERY from '@/graphql/Search.gql'

const mergeAccountDefaultVals = {
  rules: [
    v => !!v || 'Field is required'
  ],
  secondName: '',
  showDialog: false,
  showConfirmationDialog: false,
  searchItems1: [],
  searchItems2: []
}

export default {
  props: {
    addDialog: { type: Boolean, default: false },
    rolesList: Array
  },
  data() {
    return {
      searchItems2: [],
      mergeAccount: { ...mergeAccountDefaultVals },
      searchTerm2: null,
      role: null,
      rate: '0.75',
      form: {
        member: null,
        role: null,
        rate: null
      }
    }
  },
  computed: {
    show: {
      get() { return this.addDialog },
      set(v) { this.$emit('closeDialog') }
    },
    id () { return ~~this.$route.params.id },
    roles () { return this.rolesList }
  },
  watch: {
    searchTerm2: async function (val) {
      if (val) {
        const res = await this.mergeSearch(val)
        this.mergeAccount.searchItems2 = pathOr([], ['data', 'searchHierarchy', 'hierarchies'], res)
      }
    }
  },
  methods: {
    test() {
      if (this.$refs.form.validate()) {
        this.$emit('submitted', this.form)
      }
    },
    async mergeSearch (searchTerm) {
      if (searchTerm) {
        try {
          return await this.$apollo.query({
            query: SEARCH_QUERY,
            variables: {
              searchInput: {
                search: searchTerm
              }
            },
            fetchPolicy: 'network-only'
          })
        } catch (error) {
          console.error({ error })
        }
      }
    }
  }

}
</script>

<style>
.dialog {
  padding: 10px;
}
.currency {
  max-width: 100px;
  margin-right: 20px;
}
</style>
