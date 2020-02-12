<template>
  <v-layout row justify-center>
    <v-dialog v-model="open" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Transfer Appointment</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <p>Are you sure you want to clear the end date, making this appointment available again?</p>
              </v-flex>
            </v-layout>
          </v-container>
          <v-alert color="error" :value="!!error">{{error}}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red darken-1" flat @click="close(false)">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close(true)">Clear End Date</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import * as R from 'ramda'
import { mapActions } from 'vuex'
import { AppointmentActions } from '@/appointments/AppointmentStore'

export default {
  props: {
    open: Boolean,
    appointment: Object
  },
  updated(to, from) {
    if (to && !to.open) {
      this.transferring = false
      this.error = undefined
    }
  },
  data() {
    return {
      transferring: false,
      error: undefined
    }
  },
  methods: {
    ...mapActions({
      upsertAppointment: AppointmentActions.UPSERT_ONE
    }),
    async close(takeAction) {
      if (takeAction) {
        await this.clear()
      } else {
        this.$emit('close', takeAction)
      }
    },
    async clear() {
      this.transferring = true
      try {
        const { id, scheduledDate, type, startTime } = this.appointment
        const payload = {
          id,
          hostId: parseInt(R.path(['appointment', 'host', 'id'], this)),
          scheduledDate,
          type,
          startTime,
          endTime: undefined,
          participants: R.pathOr([], ['appointment', 'participants'], this).map(e => e.id)
        }
        const result = await this.upsertAppointment(payload)
        this.$emit('updated', result)
        this.$emit('close', true)
      } catch (err) {
        console.warn(err)
        this.error = err.message || 'An unexpected error occurred'
      } finally {
        this.transferring = false
      }
    }
  }
}
</script>
