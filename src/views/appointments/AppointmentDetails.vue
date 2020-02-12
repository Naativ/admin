<template>
<v-layout v-if="appointment" column>
  <v-layout justify-space-between align-center row>
      <v-card class="appointment-details">
        <h2>HOST</h2>
        <a :href="'/members/' + host.id">
          <v-text-field
            label="Name"
            v-model="host.displayName"
            required
            regular
            disabled
          />
        </a>
        <v-text-field
          label="ID"
          v-model="host.id"
          required
          disabled
        />
        <v-text-field
          label="MRN"
          v-model="host.mrn"
          required
          disabled
        />
        <v-text-field
          label="Contact Email"
          v-model="host.contactEmail"
          required
          disabled
        />
      </v-card>
    <v-card class="appointment-details">
      <h3>PARTICIPANT</h3>
      <a :href="'/members/' + participant.id">
        <v-text-field
          label="Name"
          v-model="participant.displayName"
          required
          regular
          disabled
        />
      </a>
      <v-text-field
        label="ID"
        v-model="participant.id"
        required
        disabled
      />
      <v-text-field
        label="MRN"
        v-model="participant.mrn"
        required
        disabled
      />
      <v-text-field
        label="Contact Email"
        v-model="participant.contactEmail"
        required
        disabled
      />
    </v-card>
  </v-layout>
  <v-card class="booking-details" v-if="appointmentPayable && canReadPayout">
    <h3>PAYOUT</h3>
    <v-text-field
      :label="(appointmentPayable.amount / 100) | toCurrency(appointmentPayable.currency)"
      required
      regular
      disabled
    ></v-text-field>
    <v-text-field
      label="Description"
      v-model="appointmentPayable.description"
      required
      regular
      disabled
    ></v-text-field>
    <v-text-field
      label="Status"
      v-model="appointmentPayable.status"
      required
      regular
      disabled
    ></v-text-field>
  </v-card>
  <v-layout>
  <v-card class="appointment-details" v-if="appointment.rating">
    <h3>Appointment Rating</h3>
    <v-text-field
      label="Score"
      v-model="appointment.rating.score"
      disabled
    >
    </v-text-field>
    <v-text-field
      label="Comment"
      v-model="appointment.rating.comment"
      disabled
    >
     </v-text-field>
  </v-card>
  </v-layout>
  <v-card class="appointment-details" v-if="appointment">
    <h3>Appointment Stats</h3>
    <v-layout row>
      <v-layout column>
        <v-text-field
          label="Canceled"
          v-model="appointment.canceled"
          required
          regular
          disabled
        />
        <v-text-field
          label="Canceled Reason"
          v-model="appointment.canceledReason"
          required
          disabled
        />
        <v-text-field
          label="Created On"
          v-model="appointment.createdOn"
          required
          disabled
        />
        <v-text-field
          label="Scheduled Date"
          v-model="appointment.scheduledDate"
          required
          disabled
        />
      </v-layout>
      <v-layout column>
        <v-text-field
          label="End Time"
          v-model="appointment.endTime"
          required
          regular
          disabled
        />
        <v-text-field
          label="Start Time"
          v-model="appointment.startTime"
          required
          disabled
        />
        <v-text-field
          label="Type"
          v-model="appointment.type"
          required
          disabled
        />
        <v-text-field
          label="Max Participants"
          v-model="appointment.maxParticipant"
          required
          disabled
        />
      </v-layout>
    </v-layout>
  </v-card>
</v-layout>
<v-layout v-else justify-space-around align-center>
  <v-container>
    <v-card class="no-appointment">
      <h3>This appointment has not happened yet</h3>
    </v-card>
  </v-container>
</v-layout>
</template>

<script>
import { appointment as GET_APPOINTMENT } from '@/appointments/appointments.gql'
import { appointmentPayable } from '@/payouts/payouts.gql'
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'

export default {
  data() {
    return { }
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    host() {
      return this.appointment ? this.appointment.host : ''
    },
    canReadPayout() {
      return this.permissions.find(p => p.id === 14)
    },
    participant() {
      return this.appointment ? this.appointment.participants[0] : ''
    },
    id() {
      const id = this.$route.params.id
      const ids = id.split('_')
      return ids[0]
    }
  },
  apollo: {
    appointmentPayable: {
      query: appointmentPayable,
      variables() {
        return {
          appointmentId: ~~this.id
        }
      },
      update(response) {
        return response.getPayableFromAppointment
      }
    },
    appointment: {
      query: GET_APPOINTMENT,
      variables() {
        return {
          id: ~~this.id
        }
      },
      update(response) {
        return response.appointment
      },
      fetchPolicy: 'network-only'
    }
  }
}
</script>

<style>
.appointment-details {
  height: 100%;
  padding: 10px 10px;
  width: 100%;
  margin: 10px 10px;
}

.no-appointment {
  padding: 30px;
  margin: 20px;
}
</style>
