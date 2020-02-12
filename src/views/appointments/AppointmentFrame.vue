<template>
  <v-flex xs12>
    <v-tabs centered icons-and-text>
      <v-tabs-slider color="pink"></v-tabs-slider>
      <v-tab :to="'/appointments/' + aid + '_' + bid + '/'">Appointment Details
        <v-icon>account_box</v-icon>
      </v-tab>
      <v-tab :to="'/appointments/' + aid + '_' + bid + '/booking'">Booking Details
        <v-icon>notes</v-icon>
      </v-tab>
      <v-tab :to="'/appointments/' + aid + '_' + bid + '/job'">Job Details
        <v-icon>calendar_today</v-icon>
      </v-tab>
    </v-tabs>
    <v-divider/>
    <router-view></router-view>
  </v-flex>
</template>

<script>
export default {
  name: 'AppointmentFrame',
  data() {
    return {

    }
  },
  computed: {
    aid() {
      const id = this.$route.params.id
      const ids = id.split('_')
      return ids[0]
    },
    bid() {
      const id = this.$route.params.id
      const ids = id.split('_')
      return ids[1]
    }
  }
}
</script>
