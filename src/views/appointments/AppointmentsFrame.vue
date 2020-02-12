<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12 sm4>
        <v-card>
          <v-list two-line class="mouse-pointer">
            <v-list-tile avatar @click="navigateSearch()">
              <v-list-tile-avatar>
                <v-btn icon>
                  <v-icon>search</v-icon>
                </v-btn>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>Search Appointments</v-list-tile-title>
                <v-list-tile-sub-title>Search Appointments</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <template v-for="(item, index) in viewing">
              <v-subheader v-if="item.header" :key="item.header">{{ item.header }}</v-subheader>
              <v-divider v-else-if="item.divider" :inset="item.inset" :key="index"></v-divider>
              <v-list-tile v-else :key="item.id" avatar @click="navigateUser(item)">
                <v-list-tile-avatar>
                  <v-btn icon>
                    <v-icon>calendar_today</v-icon>
                  </v-btn>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <!-- <v-list-tile-title>{{item.displayName}}</v-list-tile-title> -->
                  <v-list-tile-title v-if="item.appointment">Apt Id: {{item.appointment.id}} </v-list-tile-title>
                  <v-list-tile-title v-else-if="item.booking">Booking Id: {{item.booking.id}} </v-list-tile-title>
                  <v-list-tile-sub-title>
                    <v-layout row>
                      <v-flex xs6 v-if="item.appointment">Host: {{item.appointment.host.name}}</v-flex>
                      <v-flex xs6 v-else-if="item.booking">Host: {{item.booking.host.name}}</v-flex>
                      <!-- <v-flex xs6>System: {{item.id}}</v-flex> -->
                    </v-layout>
                  </v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action @click.stop="closeUser(item)">
                  <v-icon>close</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs12 sm8>
        <router-view></router-view>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapActions, mapState } from 'vuex'
import { UsersActions } from '@/users/UsersStore'

export default {
  data() {
    return {
      target: undefined
    }
  },
  methods: {
    ...mapActions({
      removeAppointment: UsersActions.STOP_VIEWING_APT,
      getUser: UsersActions.GET_USER
    }),
    closeUser(appointment) {
      this.removeAppointment(appointment.id)
      const route = ~~R.pathOr(-1, ['$route', 'params', 'id'], this)
      if (route === appointment.id) {
        this.$router.push('/appointments/')
      }
    },
    navigateUser(item) {
      this.$router.push('/appointments/' + item.id)
    },
    navigateSearch() {
      this.$router.push('/appointments/')
    },
    nil() { }
  },
  computed: {
    ...mapState({
      viewing: state => state.users.searchedAppointment
    })
  },
  async beforeRouteUpdate(to, from, next) {
    const { id } = to.params
    if (id) {
      this.target = await this.getUser({ id })
    } else {
      this.target = undefined
    }
    next()
  }
}
</script>

<style>
</style>
