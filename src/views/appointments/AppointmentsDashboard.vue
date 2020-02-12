<template>
  <v-card>
    <v-card-title primary-title>
      <v-flex xs12>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="search()">
          <v-layout>
            <v-flex xs9>
              <v-flex xs12>
                <v-text-field
                  required
                  v-model="term"
                  label="Search Term"
                  v-on:keyup.enter="search()"
                ></v-text-field>
              </v-flex>
            </v-flex>
            <v-flex d-flex xs3 child-flex>
              <v-btn :disabled="!valid" class="full-height" @click="search()">submit</v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-card-title>
    <!-- Sear h Results -->
    <v-card-text>
      <v-list two-line>
        <template v-for="item in results.results">
          <v-layout :key="item.id">
            <v-list-tile :key="item.id" avatar @click="open(item)">
              <v-list-tile-avatar>
                <v-icon>calendar_today</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-if="item.appointment">Appointment ID: {{item.appointment.id}}</v-list-tile-title>
                <v-list-tile-title v-else-if="item.booking">Booking ID: {{item.booking.id}}</v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-layout row wrap>
                    <v-flex xs3 sm3 v-if="item.appointment">Host: {{item.appointment.host.firstName}}</v-flex>
                    <v-flex xs3 sm3 v-else-if="item.booking">Host: {{item.booking.host.firstName}}</v-flex>
                  </v-layout>
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-layout>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { UsersActions } from '@/users/UsersStore'
import { appointmentSearch } from '@/appointments/appointments.gql'

export default {
  data() {
    return {
      valid: true,
      term: '',
      tags: [],
      results: []
    }
  },
  methods: {
    ...mapActions([UsersActions.PUSH_APT_SEARCH]),
    open(item) {
      const { appointment = {}, booking = {} } = item
      const aid = appointment ? appointment.id : ''
      const bid = booking ? booking.id : ''

      const searchItem = {
        ...item,
        id: aid + '_' + bid
      }
      this.pushAppointment(searchItem)
      this.$router.push(`/appointments/${aid}_${bid}`)
    },
    async search() {
      const { term } = this
      const { data } = await this.$apollo.query({
        query: appointmentSearch,
        variables: { input: { term: term, page: 1, pageSize: 100 } },
        fetchPolicy: 'network-only'
      })
      this.results = data.appointmentSearch
    },
    remove(item) {
      this.tags.splice(this.tags.indexOf(item), 1)
      this.tags = [...this.tags]
    }
  },
  computed: {
    ...mapState({
      searched: state => state.users.searchedAppointment
    })
  }
}
</script>

<style>
.full-height {
  height: 77% !important;
}
</style>
