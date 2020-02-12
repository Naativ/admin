<template>
  <v-flex xs12>
    <div class="team main-container">
      <h1 v-bind:target="currentId">Team</h1>
      <v-layout row wrap>
        <v-flex xs4 md3 lg2>
          <MonthSelector :year="year" :month="month" @date-changed="dateChanged"/>
          </v-flex>
          <v-flex xs4 md3 lg2>
          <v-menu right>
            <template slot="activator">
            <v-tooltip top>
            <v-btn slot="activator" icon>
              <v-icon class="borderIcon">more_vert</v-icon>
            </v-btn>
            <span>Actions</span>
            </v-tooltip>
            </template>
            <v-list class="borderMenu">
              <v-list-tile @click="showCreate">
                <v-list-tile-title>Create a Member</v-list-tile-title>
              </v-list-tile>
              <v-divider/>
              <v-list-tile @click="toggleSponsorChange">
                <v-list-tile-title>Change Sponsors</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          </v-flex>
      </v-layout>
      <div>
        <v-breadcrumbs :items="breadcrumbs" divider=" / "></v-breadcrumbs>
        <div v-if="!$apollo.queries.results.loading">
          <v-layout row wrap>
            <v-flex lg4 v-if="results && results.target">
              <TeamCard
                :compStats ="compStats[statsHashTable[results.target.memberId]]"
                :active="true"
                :loading="$apollo.queries.stats.loading"
                @drillDown="drillDown"
                @viewMember="viewMember"
                @onSuccess="onSuccess"
                @onError="onError"
                :user="results.target"
                :actions="true"
                :stats="getStats(results.target)"
                hideButton
              />
            </v-flex>
            <v-flex lg4 v-for="i in results.team" :key="i.memberId">
              <TeamCard
                :compStats ="compStats[statsHashTable[i.memberId]]"
                :loading="$apollo.queries.stats.loading"
                @drillDown="drillDown"
                @viewMember="viewMember"
                @onSuccess="onSuccess"
                @onError="onError"
                :user="i"
                :actions="true"
                :stats="getStats(i)"
              />
            </v-flex>
          </v-layout>
        </div>
        <div v-if="$apollo.queries.results.loading">
          <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
        </div>
      </div>
      <v-snackbar :timeout="8000" v-model="snackbar">
        {{snackbarMessage}}
        <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>
      <CreateMemberDialog
        :creatingMember="creatingMember"
        :createMember="createMember"
        @clickCreate="clickCreate"
        @close="close"
      />
      <v-dialog v-model="emailDialog.showing">
        <v-card>
          <v-card-text>
            <v-form>
              <v-text-field label="E-mail" v-model="emailDialog.email" required></v-text-field>
              <v-btn color="success" @click="doSetEmail()">Set Email</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
      <ChangeSponsorDialog :showing="sponsorChange.show" @close="sponsorChangeClose"/>
    </div>
  </v-flex>
</template>

<script>
import MonthSelector from '@/components/MonthSelector'
import CreateMemberDialog from '@/components/CreateMemberDialog'
import MemberSearch from '../components/MemberSearch'
import ChangeSponsorDialog from '@/components/ChangeSponsorDialog'
import TeamCard from '../components/TeamCard'
import getTeamByMemberId from '@/graphql/GetTeam'
import MONTHLY_STATS_QUERY from '@/graphql/GetMonthlyStats.gql'
import { COMP_STATS_QUERY } from '@/users/members.gql.js'

import CREATE_MEMBER from '@/graphql/CreateMember.gql'
import SET_EMAIL from '@/graphql/SetEmail.gql'
import MEMBER_BY_ID from '@/graphql/MemberById.gql'
import { getHierarchies } from '@/graphql/MemberUpline.gql.js'
import { find, defaultTo, pathOr } from 'ramda'
import { mapState } from 'vuex'
import { Promise } from 'q'

const TEAM_LIMIT = 300

export default {
  name: 'Team',
  async mounted() {
    this.getHierarchies()
  },
  computed: {
    cards() {
      return pathOr([], 'results.target.upline'.split('.'), this) // .filter(e => e.id !== this.currentId)
    },
    breadcrumbs() {
      let breadcrumbs = []
      const routeId = this.$route.params.id
      this.upline.forEach(row => {
        let obj = {}
        obj.text = row.displayName
        obj.disabled = true
        if (parseInt(routeId) !== row.id) {
          obj.to = '/members/' + row.id + '/team'
          obj.disabled = false
        }
        breadcrumbs.push(obj)
      })
      return breadcrumbs
    },
    currentId: {
      get: function () {
        const id = this.$route.params.id
        return parseInt(id)
      },
      set: function () {
      }
    },
    ...mapState({ state: state => state })
  },
  watch: {
    results(newVal) {
      if (!newVal || !newVal.team) {
        return
      }

      const { team, target } = newVal

      this.teamIdArr = [...team.map(t => t.memberId), target.memberId]
    },
    compStats(newVal) {
      if (!newVal || !newVal.length || !this.teamIdArr || !this.teamIdArr.length) {
        return
      }

      let hashTable = {}
      const { teamIdArr } = this
      const newValIdArr = newVal.map(nv => nv.memberId)

      teamIdArr.forEach(tId => {
        const newValIndex = newValIdArr.indexOf(tId)
        hashTable[tId] = newValIndex
      })

      this.statsHashTable = { ...hashTable }
    }
  },
  beforeUpdate() {
    if (this.lineage.length < 1 && this.results.target) {
      this.lineage.push(this.results.target)
    }
  },
  data: () => ({
    pathOr,
    displayName: 'root',
    lineage: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    results: {
      target: undefined,
      team: []
    },
    upline: [],
    selection: '',
    stats: [],
    snackbar: false,
    snackbarMessage: '',
    resetLoading: false,
    registerLoading: false,
    dialog: false,
    sponsorChange: {
      show: false
    },
    emailDialog: {
      memberId: undefined,
      showing: false,
      email: ''
    },
    creatingMember: false,
    createMember: {
      firstName: '',
      lastName: '',
      email: ''
    },
    teamIdArr: [],
    statsHashTable: {}
  }),
  components: {
    TeamCard,
    MonthSelector,
    MemberSearch,
    ChangeSponsorDialog,
    CreateMemberDialog
  },
  methods: {
    async getHierarchies () {
      const res = await this.$apollo.query({
        query: getHierarchies,
        variables: {
          condition: { id: ~~this.$route.params.id }
        },
        fetchPolicy: 'network-only'
      })
      const data = pathOr(undefined, ['data', 'allHierarchies', 'nodes'], res)
      this.upline = data[0].upline
    },
    click(index) {
      const val = this.upline.find(e => e.displayName === this.selection)
      this.$router.push('/members/' + val.id + '/team')
    },
    showCreate() {
      this.creatingMember = true
    },
    close() {
      this.creatingMember = false
    },
    toggleSponsorChange() {
      this.sponsorChange.show = !this.sponsorChange.show
    },
    sponsorChangeClose(cfg) {
      if (cfg && cfg.message) {
        this.snackbarMessage = cfg.message
        this.snackbar = true
      }
      this.sponsorChange.show = false
    },
    setEmail(memberId) {
      this.emailDialog = {
        memberId,
        showing: true,
        email: ''
      }
    },
    doSetEmail() {
      const { tenantId } = this.$store.state.user.principal
      const { email, memberId } = this.emailDialog

      this.$apollo
        .mutate({
          mutation: SET_EMAIL,
          variables: {
            SetEmailInput: {
              tenantId,
              email,
              memberId
            }
          },
          update: async (
            store,
            {
              data: {
                setEmail: { member }
              }
            }
          ) => {
            this.snackbarMessage =
              'Successfully set email ' + member.contactEmail
            this.snackbar = true
            this.emailDialog.showing = false
            this.$apollo.queries.results.refetch()
            this.emailDialog = {
              memberId: undefined,
              showing: false,
              email: ''
            }
            // TODO navigate to them?
            // TODO Set to current target sponsor?
          }
        })
        .catch(error => {
          console.error('errored', error)
          this.onError({
            response: {
              data: {
                errors: [error]
              }
            }
          })
        })
    },
    clickCreate() {
      const { firstName, lastName, email } = this.createMember
      const { tenantId } = this.$store.state.user.principal

      const that = this

      this.$apollo
        .mutate({
          mutation: CREATE_MEMBER,
          variables: {
            createMemberInput: {
              tenantId,
              firstName,
              lastName,
              email
            }
          },
          update: async (
            store,
            {
              data: {
                createMember: { member }
              }
            }
          ) => {
            that.snackbarMessage = 'Successfully created ' + member.name
            this.snackbar = true
            await new Promise(resolve => setTimeout(resolve, 2000))
            that.creatingMember = false
            await that.$apollo.queries.results.refetch()
            that.createMember = {
              firstName: '',
              lastName: '',
              email: ''
            }
            this.$router.push(`/members/${member.id}`)
          }
        })
        .catch(error => {
          console.error('errored', error)
          that.onError({
            response: {
              data: {
                errors: [error]
              }
            }
          })
        })
      // */
    },
    drillDown(user) {
      const newPath = `/members/${user.memberId == null ? '' : user.memberId}/team`
      this.$router.push(newPath)
      this.getHierarchies()
    },
    updateLineage (user, index) {
      const newPath = `/members/${user.memberId == null ? '' : user.memberId}/team`
      this.lineage = this.lineage.slice(0, index + 1)
      this.$router.push(newPath)
    },
    viewMember(memberId) {
      const newPath = `/members/${memberId == null ? '' : memberId}/team`
      this.lineage.length = 0
      this.$router.push(newPath)
    },
    getStats(target) {
      return defaultTo(
        {},
        find(_ => target && _.sellerId === target.memberId, this.stats)
      )
    },
    dateChanged({ date }) {
      const dateSplit = date.split('-')
      this.month = dateSplit[1]
      this.year = dateSplit[0]
    },
    onSuccess(message) {
      this.snackbar = true
      this.snackbarMessage = message
    },
    onError(errorMessage) {
      if (typeof errorMessage === 'string') {
        this.error = errorMessage
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
  apollo: {
    displayName: {
      query: MEMBER_BY_ID,
      variables() {
        return {
          condition: {
            ids: [this.currentId]
          }
        }
      },
      update({ members }) {
        return members.nodes[0]
          ? members.nodes[0].displayName
          : 'root'
      },
      skip() {
        return this.currentId === null
      }
    },
    results() {
      const result = getTeamByMemberId(
        'currentId',
        this.$store.state.user.principal.tenantId,
        TEAM_LIMIT
      )
      return result
    },
    stats: {
      query: MONTHLY_STATS_QUERY,
      variables() {
        return {
          targetCondition: {
            tenantId: this.$store.state.user.principal.tenantId,
            sellerId: this.currentId,
            month: ~~this.month,
            year: ~~this.year
          },
          firstLevelCondition: {
            tenantId: this.$store.state.user.principal.tenantId,
            sponsorId: this.currentId,
            month: ~~this.month,
            year: ~~this.year
          }
        }
      },
      update({ targetStats, firstLevelStats }) {
        return targetStats.nodes.concat(firstLevelStats.nodes)
      }
    },
    compStats: {
      query: COMP_STATS_QUERY,
      variables() {
        return {
          input: {
            year: this.year,
            month: this.month,
            membersIn: this.teamIdArr
          }
        }
      },
      update({ compStatsQuery: { results } }) {
        return results
      }
    }
  }
}
</script>

<style scoped>
.borderMenu {
  padding: 10px 0;
}
.borderIcon {
  padding: 10px 0;
}
</style>
