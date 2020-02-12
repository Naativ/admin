<template>
    <v-layout justify-center align-center row class="main-container">
      <v-flex>
        <v-card>
          <v-card-title>
            <h1>Actions</h1>
          </v-card-title>
          <v-card-actions>
            <v-layout justify-center>
              <v-btn color="primary" style="align-self: center;" @click="mergeBtnClick" v-if="security.hasMerge">
                <v-icon>call_merge</v-icon>Merge Accounts
              </v-btn>
              <v-btn color="primary" style="align-self: center;" @click="patching = true" v-if="security.hasSponsorChange">
                <v-icon>compare_arrows</v-icon>Patch Member Out
              </v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-flex>
    <v-snackbar :timeout="8000" :top="true" :right="true" v-model="snackbar">
      {{snackbarMessage}}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
    <UserTreePatchDialog :show="patching" :user="user" @cancel="patching = false"/>
    <v-dialog v-if="user" v-model="mergeAccount.showDialog" :hide-overlay="true" width="56%">
      <v-card>
        <v-card-title>
          <h1>Merge Accounts</h1>
        </v-card-title>
        <v-card-text>
          <v-form ref="mergeForm">
            <v-layout row fill-height justify-space-around>
              <v-flex xs-12 sm-6 style="flex: 1 1; padding: 0px 4px;">
                <v-text-field label="Destination account to keep" :value="user.id" readonly/>
                <v-icon>person</v-icon>
                {{user.name}}
                <br>
                <v-icon>email</v-icon>
                {{user.contactEmail}}
              </v-flex>
              <v-flex xs-12 sm-6 style="flex: 1 1; padding: 0px 4px;">
                <v-autocomplete
                  v-model="mergeAccount.secondName"
                  :items="mergeAccount.searchItems2"
                  :search-input.sync="searchTerm2"
                  item-text="name"
                  item-value="id"
                  hide-no-data
                  return-object
                  :rules="mergeAccount.rules"
                  label="Target Account to remove & merge details into Destination"
                >
                  <template slot="selection" slot-scope="data">
                    <v-icon>person</v-icon>
                    <v-list-tile-content v-text="data.item.id"></v-list-tile-content>
                    <v-icon @click="secondNameReset()">close</v-icon>
                  </template>
                  <template slot="item" slot-scope="data">
                    <v-flex xs4>
                      <v-icon left>person</v-icon>
                      {{data.item.displayName}}
                    </v-flex>
                    <v-flex xs4>{{data.item.contactEmail}}</v-flex>
                    <v-flex xs4>{{data.item.id}}</v-flex>
                  </template>
                </v-autocomplete>
                <div v-if="mergeAccount.secondName">
                  <v-icon>person</v-icon>
                  {{mergeAccount.secondName.name}}
                  <br>
                  <v-icon>email</v-icon>
                  {{mergeAccount.secondName.contactEmail}}
                </div>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-layout row justify-center>
            <v-btn color="dark pink" class="white--text" @click="mergeConfirmation">Merge</v-btn>
            <v-btn @click="mergeCancel">Cancel</v-btn>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-if="user"
      v-model="mergeAccount.showConfirmationDialog"
      width="50%"
      :hide-overlay="true"
    >
      <v-card>
        <v-flex justify-space-around align-center>
          <v-card-title>
            <h1 style="margin: auto;">Are you sure?</h1>
          </v-card-title>
          <v-card-text>This process is irreversible!</v-card-text>
          <v-layout fill-height row justify-space-around>
            <v-card color="grey lighten-4" style="width: 30%;">
              <v-icon large left>person</v-icon>
              <v-card-text>{{user.displayName}}</v-card-text>
              <v-card-text>{{user.contactEmail}}</v-card-text>
              <v-card-text>{{user.id}}</v-card-text>
            </v-card>
            <v-icon x-large>arrow_back</v-icon>
            <v-card color="dark pink" class="white--text" style="width: 30%;">
              <v-icon class="white--text" large left>person</v-icon>
              <v-card-text>{{mergeAccount.secondName.displayName}}</v-card-text>
              <v-card-text>{{mergeAccount.secondName.contactEmail}}</v-card-text>
              <v-card-text>{{mergeAccount.secondName.id}}</v-card-text>
            </v-card>
          </v-layout>
          <v-card-actions>
            <v-layout row justify-center>
              <v-btn color="dark pink" class="white--text" @click="merge" :loading="loading">Merge</v-btn>
              <v-btn :disabled="loading" @click="mergeConfirmationCancel">Back</v-btn>
            </v-layout>
          </v-card-actions>
        </v-flex>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import SEARCH_QUERY from '@/graphql/Search.gql'
import MERGE_MUTATION from '@/graphql/MergeAccount.gql'
import { UsersMutations } from '@/users/UsersStore'
import { pathOr } from 'ramda'
import UserTreePatchDialog from '@/views/users/actions/UserTreePatch.vue'

import { StoreGetters } from '@/store'
import { mapGetters } from 'vuex'
const mappedGetters = mapGetters({
  access: StoreGetters.access
})

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
  name: 'Actions',
  watch: {
    searchTerm1: async function (val) {
      if (val) {
        const res = await this.mergeSearch(val)
        this.mergeAccount.searchItems1 = pathOr([], ['data', 'searchHierarchy', 'hierarchies'], res)
      }
    },
    searchTerm2: async function (val) {
      if (val) {
        const res = await this.mergeSearch(val)
        this.mergeAccount.searchItems2 = pathOr([], ['data', 'searchHierarchy', 'hierarchies'], res)
      }
    }
  },
  components: {
    UserTreePatchDialog
  },
  props: {
    user: {
      type: Object,
      default () { return {} }
    }
  },
  data: () => ({
    createMember: {
      lastName: '',
      email: ''
    },
    patching: false,
    creatingMember: false,
    loading: false,
    mergeAccount: { ...mergeAccountDefaultVals },
    searchTerm1: null,
    searchTerm2: null,
    snackbar: false,
    snackbarMessage: ''
  }),
  methods: {
    secondNameReset: function () {
      this.mergeAccount.secondName = ''
      this.mergeAccount.searchItems2 = []
    },
    mergeInit: function () {
      for (let element in this.mergeAccount) {
        this.mergeAccount[element] = mergeAccountDefaultVals[element]
      }
    },
    mergeBtnClick () {
      this.$refs.mergeForm.resetValidation()
      this.mergeInit()
      this.secondNameReset()
      this.mergeAccount.showDialog = true
    },
    async merge () {
      const firstId = this.user.id
      const secondId = this.mergeAccount.secondName.id
      let viewing = this.$store.state.users.viewing
      viewing.forEach((user, index) => {
        if (user.id === secondId) {
          viewing.splice(index, 1)
        }
      })
      try {
        this.loading = true
        await this.$store.commit(
          UsersMutations.SET_ONE,
          { property: 'viewing', value: viewing })
        await this.$apollo.mutate({
          mutation: MERGE_MUTATION,
          variables: {
            input: {
              accountToKeep: firstId,
              accountToDelete: secondId
            }
          }
        })
        this.loading = false
        this.mergeAccount.showDialog = this.mergeAccount.showConfirmationDialog = false
        this.snackbar = true
        this.snackbarMessage = 'Accounts Successfully Merged!'
      } catch (error) {
        console.error(error)
        this.loading = false
        this.mergeAccount.showDialog = this.mergeAccount.showConfirmationDialog = false
        this.onError('Account merge unsuccessful. Please try again later or contact customer support.')
      }
    },
    mergeConfirmation () {
      const formIsValid = this.$refs.mergeForm.validate()
      if (formIsValid) {
        this.$router.push('/members/' + this.user.id + '/actions')
        this.mergeAccount.showDialog = false
        this.mergeAccount.showConfirmationDialog = true
      }
    },
    mergeConfirmationCancel () {
      this.mergeAccount.showDialog = true
      this.mergeAccount.showConfirmationDialog = false
    },
    mergeCancel () {
      this.mergeAccount.showDialog = this.mergeAccount.showConfirmationDialog = false
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
            }
          })
        } catch (error) {
          console.error({ error })
        }
      }
    },
    onSuccess (message) {
      this.snackbar = true
      this.snackbarMessage = message
    },
    onError (errorMessage) {
      if (typeof errorMessage === 'string') {
        this.error = this.snackbarMessage = errorMessage
      } else {
        const errors = pathOr({}, ['response', 'data', 'errors'], errorMessage)
        this.snackbarMessage = pathOr(
          'There seems to be a problem. Please try again later or contact customer support.',
          ['message'],
          errors[0]
        )
      }
      this.snackbar = true
    }
  },
  computed: {
    ...mappedGetters,
    security () {
      return this.access || {}
    }
  }
}
</script>
