<template>
  <div>
    <ChangeSponsorDialog
      :showing       ="sponsorChange.show"
      @close         ="sponsorChangeClose"
      :defaultMember ="defaultMember"
    />
    <PrepImpersonate
      v-if="model && model.credentials"
      :credentialId        ="model.credentials[0].id.toString()"
      :showPrepDialog      ="showPrepDialog"
      :memberId            ="model.id"
      :tenantId            ="model.tenantId"
      @closeDialog         ="showPrepDialog = false"
    />
    <v-snackbar :timeout="6000" :top="true" :right="true" v-model="snackbar.show">
      <span v-html="snackbar.message" />
      <v-btn
        v-if="!snackbar.mandatory"
        flat
        color="pink"
        @click.native="snackbar.show = false"
      >Close</v-btn>
    </v-snackbar>
    <v-card id="member-card" v-if="member">
      <v-progress-linear
        :indeterminate ="$apollo.loading"
        ref            ="loader"
        id             ="loader"
      />
      <v-card-title class="member-card-container" primary-title>
        <MemberCard
          :member              ="member"
          :compStats           ="compStats"
          @changeSponsorClick  ="changeSponsor"
          @prepImpersonate     ="showPrepDialog = true"
          @resendPasswordReset ="resendPasswordReset"
          @resendClaimEmail    ="resendClaimEmail"
          @click:avatar        ="avatarClick"
          :linkSponsor         ="true"
        />
      </v-card-title>

      <div class="formatted-fields-container">
        <MemberDetailsCard
          @snackbarEmit="handleSnackbarEmit"
        />
      </div>
      <div class="formatted-fields-container">
        <MiscDetailsCard
          @snackbarEmit="handleSnackbarEmit"
        />
      </div>
      <div class="formatted-fields-container">
        <v-toolbar class="indigo darken-1 white--text">
          <v-toolbar-title class="section-subheader">Contact Information</v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-layout row wrap>
            <ContactCard
              @snackbarEmit="handleSnackbarEmit"
            />
          </v-layout>
        </v-card>
      </div>
      <div class="formatted-fields-container">
        <CredentialCard
          @snackbarEmit="handleSnackbarEmit"
        />
      </div>
    </v-card>
  </div>
</template>

<script>

import { cloneDeep } from 'lodash'
import moment from 'moment'
import { mapGetters, mapState } from 'vuex'

import MemberCard from './MemberCard'
import MemberDetailsCard from './MemberDetailsCard'
import MiscDetailsCard from './MiscDetailsCard'
import CredentialCard from './CredentialCard'
import ContactCard from './ContactCard'
import Unwrapper from '@/components/util/Unwrapper'
import { StoreGetters } from '@/store'
import ChangeSponsorDialog from '@/components/ChangeSponsorDialog'
import EditButton from './EditButton'
import PrepImpersonate from '@/iam/PrepImpersonate.vue'
import { ClaimActions } from '@/stores/ClaimStore'
const { MemberDetailsQuery, COMP_STATS_QUERY } = require('@/users/members.gql.js')

export default {
  components: {
    MemberCard,
    Unwrapper,
    ChangeSponsorDialog,
    EditButton,
    CredentialCard,
    PrepImpersonate,
    ContactCard,
    MemberDetailsCard,
    MiscDetailsCard
  },
  data () {
    return {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      showPrepDialog: false,
      Unwrapper,
      memberId: ~~this.$route.params.id,
      member: null, // the untainted data
      defaultMember: {},
      model: null, // the working copy for this view
      sponsorChange: {
        show: false
      },
      snackbar: {
        show: false,
        message: undefined,
        mandatory: false
      }
    }
  },
  methods: {
    async resendPasswordReset() {
      const { id: memberId, tenantId } = this.model
      const { username } = this.model.credentials[0]
      try {
        await this.$store.dispatch(ClaimActions.RESET, { memberId, tenantId, email: username })
        this.snackbar = {
          show: true,
          message: `Password reset email sent to ${username}`,
          mandatory: undefined
        }
      } catch (error) {
        this.snackbar = {
          show: true,
          message: error.message,
          mandatory: undefined
        }
        throw new Error('Password reset error')
      }
    },
    async resendClaimEmail() {
      const { id: memberId, tenantId } = this.model
      const { username } = this.model.credentials[0]
      try {
        await this.$store.dispatch(ClaimActions.CLAIM, { memberId, tenantId, email: username })
        this.snackbar = {
          show: true,
          message: `Account claim email sent to ${username}`,
          mandatory: undefined
        }
      } catch (error) {
        this.snackbar = {
          show: true,
          message: error.message,
          mandatory: undefined
        }
        throw new Error('Error resending claim email')
      }
    },
    async changeSponsor () {
      if (!this.canChangeSponsor) {
        this.snackbar = {
          message: 'You do not have access to this feature!',
          show: true
        }
      }
      this.sponsorChange.show = true
    },
    async sponsorChangeClose (e) {
      const { message } = e
      this.sponsorChange.show = false
      if (message) {
        this.snackbar.message = message
        this.snackbar.show = true
        await this.$apollo.queries.member.refetch()
      }
    },
    handleSnackbarEmit(message) {
      this.snackbar = {
        show: true,
        message: message,
        mandatory: undefined
      }
    },
    avatarClick() {
      // TODO: picture upload handling
    }
  },
  watch: {
    member (next, prev) {
      this.model = cloneDeep(next)
      this.model.birthdate = this.model.birthdate ? moment(this.model.birthdate).format('L') : null
      this.defaultMember = {
        id: 1,
        member: next,
        sponsor: next.sponsor,
        newSponsor: undefined
      }
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
    },
    '$apollo.loading'(loading) {
      switch (loading) {
        case true:
          if (!this.$refs.loader) break
          this.$refs.loader.$el.style.opacity = 1
          break

        case false:
          if (!this.$refs.loader) break
          this.$refs.loader.$el.style.opacity = 0
          break

        default:
          break
      }
    }
  },
  apollo: {
    member: {
      ...MemberDetailsQuery,
      variables () {
        return {
          memberId: this.memberId
        }
      }
    },
    compStats: {
      query: COMP_STATS_QUERY,
      variables() {
        return {
          input: {
            year: this.year,
            month: this.month,
            membersIn: [this.memberId]
          }
        }
      },
      update({ compStatsQuery: { results } }) {
        this.compStatsData = results[0]

        return results[0]
      }
    }
  },
  computed: {
    ...mapState({
      access: state => state.access
    }),
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    locked () {
      return true
    },
    canChangeSponsor () {
      return this.permissions.find(p => p.id === 11 || p.id === 99)
    }
  },
  async beforeRouteUpdate (to, from, next) {
    await this.$apollo.queries.member.refresh()
    next()
  }
}
</script>

<style scoped>
  .formatted-fields-container {
    padding: 0px 155px 0px 101px;
    margin-bottom: 45px;
  }

  .justify-center {
    justify-content: center;
  }

  .v-subheader * {
    margin: 0px 2px;
  }

  .section-subheader {
    font-size: 18px;
  }

  #member-card {
    max-height: calc(100vh - 158px);
    contain: content;
    overflow-y: scroll;
    background-color: #f1f1f1;
    width: 100%;
  }

  .details-text {
    display: flex;
    flex-wrap: wrap;
  }

  #loader {
    opacity: 0;
    position: sticky;
    top: 0px;
    z-index: 1;
    transition: opacity 1000ms;
  }

  .member-card-container {
    justify-content: center;
    padding-right: 102px;
    padding-top: 0px;
    padding-bottom: 52px;
  }
</style>
