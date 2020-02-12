<template>
  <v-dialog v-if="user" v-model="show" persistent :hide-overlay="false" width="80%">
    <v-card v-if="noAccess">
      <v-card-title>
        <h1>Member Tree Patch</h1>
      </v-card-title>
      <v-alert type="error" :value="true">
        <strong>Illegal Access Attempt:</strong>
        This account does not have access to change a member's sponsors.
      </v-alert>
      <v-card-actions>
        <v-layout row justify-center>
          <v-btn @click="cancel">Close</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
    <v-card v-else-if="result">
      <v-card-title>
        <h1>Member Tree Patch</h1>
      </v-card-title>
      <v-card-text>This member was patched successfully. Please reload any browser sessions.</v-card-text>
      <v-card-actions>
        <v-layout row justify-center>
          <v-btn color="dark pink" class="white--text" @click="reload">Reload</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
    <v-card v-else>
      <v-card-title>
        <h1>Member Tree Patch</h1>
      </v-card-title>
      <v-card-text>
        <v-form ref="mergeForm">
          <v-layout row wrap>
            <v-flex xs12>
              <p>
                This process will move any team members directly associated with
                <strong>{{user.name}} ({{user.id}})</strong> and place them under
                <strong>{{sponsor.name || 'the company root'}} {{ sponsor.memberId ? '(' + sponsor.memberId + ')' : ''}}</strong>.
              </p>
            </v-flex>
            <v-flex xs12 sm6>
              <v-autocomplete
                v-model="destination"
                :items="items"
                :loading="loading"
                :search-input.sync="searchDebounce"
                item-text="name"
                item-value="id"
                return-object
                label="Sponsor to move under"
                clearable
                :disabled="loading"
              >
                <template slot="item" slot-scope="data">
                  <v-flex xs4>
                    <v-icon left>person</v-icon>
                    {{data.item.displayName}}
                  </v-flex>
                  <v-flex xs4>{{data.item.contactEmail}}</v-flex>
                  <v-flex xs4>{{data.item.id}}</v-flex>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox :disabled="loading" v-model="recalculateTree" label="Recalculate Tree"></v-checkbox>
            </v-flex>
            <v-flex xs12 sm12>
              <v-textarea solo label="Solo textarea" v-model="reason" multi-line></v-textarea>
            </v-flex>
          </v-layout>
          <v-alert type="warning" :value="destination" v-if="destination">
            <template slot="default">
              <v-layout row wrap>
                <v-flex xs12>
                  <p>
                    Proceeding will move
                    <strong>{{user.name}}</strong>
                    under the following new sponsor:
                  </p>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-icon>account_box</v-icon>
                  {{destination.id}}
                </v-flex>
                <v-flex xs12 sm4>
                  <v-icon>person</v-icon>
                  {{destination.name}}
                </v-flex>
                <v-flex xs12 sm4>
                  <v-icon>email</v-icon>
                  {{destination.contactEmail}}
                </v-flex>
              </v-layout>
            </template>
          </v-alert>
          <v-alert type="info" :value="!destination">
            <strong>
              <u>Reminder</u>:
            </strong>
            Not selecting a new sponsor
            will move this
            <strong>{{user.name}}</strong> to the
            <strong>root of the company</strong>
          </v-alert>
        </v-form>
      </v-card-text>
      <v-data-table :headers="table.headers" :items="children">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.memberId }}</td>
          <td>{{ props.item.name }}</td>
        </template>
      </v-data-table>
      <v-card-actions>
        <v-layout row justify-center>
          <v-btn color="dark pink" class="white--text" @click="move" :loading="loading">Confirm Move</v-btn>
          <v-btn @click="cancel" :disabled="loading">Cancel</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { debounce, get } from 'lodash'
import { treePatch } from '@/users/users.gql'
import SEARCH_QUERY from '@/graphql/Search.gql'
import { getImmediateTeamByMemberId } from '@/graphql/GetTeam'

import { StoreGetters } from '@/store'
import { mapGetters } from 'vuex'
const mappedGetters = mapGetters({
  access: StoreGetters.access
})

export default {
  props: {
    user: {
      type: Object,
      default () { return {} }
    },
    show: Boolean
  },
  data () {
    return {
      result: null,
      destination: null,
      searchDebounce: '',
      reason: '',
      recalculateTree: true,
      loading: false,
      items: [],
      table: {
        headers: [
          { text: 'ID', value: 'System ID', width: '50px' },
          {
            text: 'Front Line Team Member',
            align: 'left',
            sortable: false,
            value: 'name'
          }
        ]
      }
    }
  },
  watch: {
    searchDebounce: debounce(function (val) {
      this.search(val)
    }, 300),
    show (val) {
      val && this.$apollo.queries.team.refresh()
    }
  },
  apollo: {
    team () {
      const { id, sponsorOid, tenantId } = this.user
      const query = getImmediateTeamByMemberId(
        id,
        sponsorOid,
        tenantId
      )
      return query
    }

  },
  methods: {
    async search (searchTerm) {
      this.items = []
      if (searchTerm) {
        this.loading = true
        try {
          const result = await this.$apollo.query({
            query: SEARCH_QUERY,
            variables: {
              searchInput: {
                search: searchTerm
              }
            }
          })
          const data = get(result, 'data.searchHierarchy.hierarchies', [])
          this.items = data
        } catch (error) {
          console.error({ error })
        } finally {
          this.loading = false
        }
      }
    },
    async move () {
      this.loading = true
      try {
        const targetId = this.user.id
        const destinationId = (this.destination || {}).id
        const { reason, recalculateTree } = this

        const result = await this.$apollo.mutate({
          mutation: treePatch,
          variables: {
            input: { targetId, destinationId, reason, recalculateTree }
          }
        })
        this.result = result
      } finally {
        this.loading = false
      }
    },
    cancel () {
      this.$emit('cancel')
    },
    clear () {
      this.destination = null
    },
    reload () {
      window.location.reload()
    }
  },
  computed: {
    ...mappedGetters,
    children () {
      return get(this, 'team.children', [])
    },
    sponsor () {
      return get(this, 'team.sponsor', {})
    },
    noAccess () {
      return !get(this, 'access.hasSponsorChange', false)
    }
  }
}
</script>
