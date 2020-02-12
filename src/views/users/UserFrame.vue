<template>
  <div>
    <v-layout justify-center row class="user">
      <v-container v-if="!user">
        <v-alert v-if="!loading" type="error" :value="true" xs12>Could not load the requested user</v-alert>
      </v-container>
      <div v-else>
        <v-tabs centered icons-and-text>
          <v-tabs-slider color="pink"></v-tabs-slider>
          <v-tab :to="'/members/' + id + '/'">
            Details
            <v-icon>account_box</v-icon>
          </v-tab>
          <v-tab v-if="access.hasMembers" :to="'/members/' + id + '/attributes'">
            Attributes
            <v-icon>accessibility</v-icon>
          </v-tab>
          <v-tab v-if="access.hasAppointments" :to="'/members/' + id + '/appointments'">
            Bookings
            <v-icon>calendar_today</v-icon>
          </v-tab>
          <v-tab v-if="access.hasSurveys" :to="'/members/' + id + '/surveys'">
            Surveys
            <v-icon>notes</v-icon>
          </v-tab>
          <v-tab v-if="access.hasTeam" :to="'/members/' + id + '/team'">
            Team
            <v-icon>group</v-icon>
          </v-tab>
          <v-tab v-if="access.hasMembers" :to="'/members/' + id + '/actions'">
            Actions
            <v-icon>build</v-icon>
          </v-tab>
          <v-tab v-if="access.hasMembers" :to="'/members/' + id + '/assets'">
            Assets
            <v-icon>collections</v-icon>
          </v-tab>
          <v-tab v-if="access.hasPermissions" :to="'/members/' + id + '/permissions'">
            Permissions
            <v-icon>lock</v-icon>
          </v-tab>
          <v-tab :to="'/members/' + id + '/jungle'">
            Graph
            <v-icon>device_hub</v-icon>
          </v-tab>
        </v-tabs>
      </div>
    </v-layout>
    <v-divider />
    <router-view :user="user" v-if="user"></router-view>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { StoreGetters } from '@/store'
import { UsersActions } from '@/users/UsersStore'

import UsersFrame from '@/views/users/UsersFrame.vue'

export default {
  components: {
    UsersFrame
  },
  data () {
    return {
      loading: false,
      unknown: false,
      user: null
    }
  },
  computed: {
    ...mapGetters({
      access: StoreGetters.access,
      permissions: StoreGetters.permissions
    }),
    id () {
      return this.$route.params.id
    }
  },
  methods: {
    ...mapActions({
      view: UsersActions.START_VIEWING,
      getUser: UsersActions.GET_USER
    }),
    canPayout () {
      return this.permissions.find(p => p.id === 14)
    },
    async refresh () {
      this.loading = true
      const result = await this.getUser({
        id: ~~this.$route.params.id
      })
      this.unknown = result === undefined
      this.user = result
      if (result) {
        this.view(result)
      }
      this.loading = false
    }
  },
  async beforeRouteUpdate (to, from, next) {
    if (to.params.id) {
      this.refresh()
    }
    next()
  },
  mounted () {
    this.refresh()
  }
}
</script>

<style scoped>
.user {
  background-color: white;
}
.user > div:first-child {
  width: 100%;
}
</style>
