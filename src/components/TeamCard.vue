<template>
  <v-card class="team-card" :class="{ active: active }">
    <v-container fluid grid-list-lg>
      <v-layout row>
        <v-flex xs7>
          <div v-if="!loading">
            <router-link
              :to="{ path: '/members/' + user.memberId, params: { id: user.memberId }}"
              class="headline"
            >{{user.name}}</router-link>
            <div v-if="hasEmail">Email: {{user.contacts[0].emails[0].email}}</div>
            <div>Display Name: {{user.displayName}}</div>
            <div v-if="access.hasSales">
              <div v-if="compStats && compStats.rank && compStats.rank.rank > -1">Rank: {{compStats.rank.rank}}</div>
              <div>Team Size: {{stats.teamSize || 0}}</div>
              <div>Front Line: {{stats.firstLevelSize || 0}}</div>
              <div>Total Points: {{stats.totalPoints || 0}}</div>
              <div>Total Amount: {{stats.totalAmount || 0}}</div>
            </div>
          </div>
          <div v-if="loading">
            <v-progress-circular indeterminate :size="50" :width="5" color="black"></v-progress-circular>
          </div>
        </v-flex>
        <v-flex xs5>
          <v-card-media height="125px" width="125px">
            <img :src="getAvatar" />
          </v-card-media>
        </v-flex>
      </v-layout>
    </v-container>
    <v-card-actions v-if="actions">
      <v-btn v-if="!hideButton" left @click="drillDown">Drill Down</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
// import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'
import { ClaimActions } from '@/stores/ClaimStore'
export default {
  name: 'TeamCard',
  data: () => ({
    show: false,
    resetLoading: false,
    registerLoading: false
  }),
  props: {
    active: Boolean,
    user: Object,
    actions: Boolean,
    stats: Object,
    loading: Boolean,
    hideButton: Boolean,
    compStats: Object
  },
  methods: {
    drillDown () {
      this.$emit('drillDown', this.user)
    },
    viewMember () {
      this.$emit('viewMember', this.user.memberId)
    },
    async resetPassword () {
      this.resetLoading = true
      try {
        const { memberId, tenantId, email } = this.user
        await this.$store.dispatch(ClaimActions.RESET, { memberId, tenantId, email })
        this.$emit('onSuccess', 'Password Reset Email sent successfully')
      } catch (error) {
        this.$emit('onError', error)
      }
      this.resetLoading = false
    },
    async register () {
      this.registerLoading = true
      try {
        const { memberId, tenantId, email } = this.user
        await this.$store.dispatch(ClaimActions.CLAIM, { memberId, tenantId, email })
        this.$emit('onSuccess', 'Register Email sent successfully')
      } catch (error) {
        this.$emit('onError', error)
      }
      this.registerLoading = false
    }
  },
  computed: {
    ...mapGetters({
      access: StoreGetters.access
    }),
    getAvatar () {
      return (
        (this.user && this.user.profileUrl) ||
        'https://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg'
      )
    },
    hasEmailChangePermissions () {
      const superAdmin = this.$store.state.user.principal.permissions.filter(
        perm => {
          return perm.key === 'superadmin'
        }
      )
      return this.user.email.trim().length < 1 || superAdmin.length > 0
    },
    hasEmail () {
      return this.user.contacts[0].emails[0].email
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.team-card {
  margin: 10px;
  min-width: 350px;
  max-width: 500px;
}
.team-card img {
  width: 125px;
  height: 125px;
  margin: auto;
}
.team-card.active {
  box-shadow: 0px 0px 2px 10px rgba(237, 115, 132, 0.2);
}
</style>
