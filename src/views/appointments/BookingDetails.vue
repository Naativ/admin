<template>
<v-layout column>
  <ParticipantDialog
    @close="participantSet"
    @cancel="cancelDialogue"
    :open="choosingParticipant"
  />
  <v-layout v-if="host" justify-space-between align-center row>
    <v-btn
      :class="{ editbtn: true, sm: this.$vuetify.breakpoint.name === 'xs' }"
      class="edit-speed-dial"
      v-if="!editing"
      absolute
      dark
      fab
      top
      right
      color="pink"
      @click="editing = true"
    >
      <v-icon>edit</v-icon>
    </v-btn>
    <v-speed-dial
      absolute
      dark
      fab
      top
      right
      color="pink"
      v-model="saveSpeedDial"
      direction="bottom"
      :open-on-hover="true"
      transition="slide-y-transition"
      :disabled="!saving"
      v-else
      class="edit-speed-dial"
    >
      <v-btn slot="activator" v-model="saveActivator" color="pink" dark fab>
        <v-icon>save</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn fab dark small color="green" @click="saveData">
        <v-icon>check</v-icon>
      </v-btn>
      <v-btn fab dark small color="red" @click="cancelEdit">
        <v-icon>cancel</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-card class="booking-details">
      <h3>HOST</h3>
      <a :href="'/members/' + host.id">
        <v-text-field
          label="Name"
          v-model="host.name"
          required
          regular
          disabled
        ></v-text-field>
      </a>
      <v-text-field
        label="ID"
        v-model="host.id"
        required
        :box="editing"
        @focus="dialogueOpened('host')"
        :regular="!editing"
        :disabled="!editing"
      ></v-text-field>
      <v-text-field
        label="MRN"
        v-model="host.mrn"
        required
        disabled
      ></v-text-field>
      <v-text-field
        label="Contact Email"
        v-model="host.contactEmail"
        required
        disabled
      ></v-text-field>
    </v-card>
    <v-card class="booking-details">
      <h3>PARTICIPANT</h3>
      <a :href="'/members/' + participant.id">
        <v-text-field
          label="Name"
          v-model="participant.name"
          required
          regular
          disabled
        ></v-text-field>
      </a>
      <v-text-field
        label="ID"
        v-model="participant.id"
        required
        :box="editing"
        @focus="dialogueOpened('participant')"
        :regular="!editing"
        :disabled="!editing"
      ></v-text-field>
      <v-text-field
        label="MRN"
        v-model="participant.mrn"
        required
        disabled
      ></v-text-field>
      <v-text-field
        label="Contact Email"
        v-model="participant.contactEmail"
        required
        disabled
      ></v-text-field>
    </v-card>
  </v-layout>
  <v-card class="booking-details" v-if="bookingPayment && canReadPayout">
    <h3>PAYOUT</h3>
    <v-text-field
      :label="(bookingPayment.amount / 100) | toCurrency(bookingPayment.currency)"
      required
      regular
      disabled
    ></v-text-field>
    <v-text-field
      label="Description"
      v-model="bookingPayment.description"
      required
      regular
      disabled
    ></v-text-field>
    <v-text-field
      label="Status"
      v-model="bookingPayment.status"
      required
      regular
      disabled
    ></v-text-field>
  </v-card>
  <v-card class="booking-details" v-if="booking">
    <h3>BOOKING STATS</h3>
    <v-layout column>
      <v-text-field
        label="Scheduled Start Date"
        v-model="booking.start"
        required
        :box="editing"
        :regular="!editing"
        :disabled="!editing"
      ></v-text-field>
      <v-text-field
        label="Scheduled End Date"
        v-model="booking.end"
        required
        :box="editing"
        :regular="!editing"
        :disabled="!editing"
      ></v-text-field>
      <v-select
        v-model="status"
        :label="!editing ? 'Status' : 'Select your status'"
        :items="statuses"
        item-text="name"
        item-value="id"
        :box="editing"
        :regular="!editing"
        :disabled="!editing"
      />
      <v-select
        label="Type"
        v-model="type"
        :items="types"
        required
        :box="editing"
        :regular="!editing"
        :disabled="!editing"
      ></v-select>
      <v-text-field
        label="Availability ID"
        v-model="booking.availabilityId"
        required
        :box="editing"
        :regular="!editing"
        :disabled="!editing"
      ></v-text-field>
    </v-layout>
  </v-card>
</v-layout>
</template>

<script>
import { booking as GET_BOOKING, getBookingStatus as GET_BOOKING_STATUS, getBookingType as GET_BOOKING_TYPE } from '@/appointments/appointments.gql'
import { forEach, cloneDeep } from 'lodash'
import { UPSERT_BOOKING } from '@/graphql/Booking.js'
import ParticipantDialog from '@/views/users/appointments/ParticipantDialog.vue'
import { getPaymentFromBooking } from '@/payouts/payouts.gql'
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'

export default {
  components: { ParticipantDialog },
  data() {
    return {
      bookingPayment: {},
      bookingIds: [],
      typeIds: [],
      status: '',
      type: '',
      booking: {},
      editing: false,
      saveSpeedDial: false,
      saving: false,
      saveActivator: false,
      statuses: [],
      types: [],
      bookingStatusArray: [],
      bookingTypeArray: [],
      choosingParticipant: false,
      participantType: ''
    }
  },
  async mounted() {
    await this.getBooking()
    await this.getBookingStatusIds()
    await this.getBookingTypeIds()
    await this.getPayment()
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    canReadPayout() {
      return this.permissions.find(p => p.id === 14)
    },
    host() {
      return this.booking ? this.booking.host : ''
    },
    participant() {
      return this.booking ? this.booking.guest : ''
    },
    id() {
      const id = this.$route.params.id
      const ids = id.split('_')
      return ids[1]
    }
  },
  methods: {
    participantSet(id) {
      this.choosingParticipant = false
      if (this.participantType === 'host') {
        this.host.id = id
      } else if (this.participantType === 'participant') {
        this.participant.id = id
      }
    },
    cancelDialogue() {
      this.choosingParticipant = false
    },
    dialogueOpened(participantType) {
      this.choosingParticipant = true
      this.participantType = participantType
    },
    async getBookingStatusIds() {
      const { data } = await this.$apollo.query({
        query: GET_BOOKING_STATUS,
        fetchPolicy: 'network-only'
      })
      this.bookingStatusArray = data.getBookingStatus
      this.statuses = this.bookingStatusArray.map(r => {
        return r.name
      })
      forEach(this.bookingStatusArray, _ => {
        this.bookingIds[~~_.id] = _.name
      })
      this.status = this.bookingIds[~~this.booking.statusId]
    },
    async saveData() {
      const booking = this.bookingStatusArray.filter(booking => {
        return booking.name === this.status
      })
      const type = this.bookingTypeArray.filter(booking => {
        return booking.name === this.type
      })
      const statusId = booking[0].id
      const typeId = type[0].id
      await this.$apollo.mutate({
        mutation: UPSERT_BOOKING,
        variables: {
          input: {
            id: ~~this.booking.id,
            availabilityId: this.booking.availabilityId,
            end: this.booking.end,
            guestId: ~~this.participant.id,
            hostId: ~~this.host.id,
            start: this.booking.start,
            statusId: statusId,
            typeId: typeId
          }
        }
      })
      await this.getBooking()
      this.editing = false
    },
    async cancelEdit() {
      this.editing = false
    },
    async getPayment() {
      const { data } = await this.$apollo.query({
        query: getPaymentFromBooking,
        variables: { bookingId: ~~this.id },
        fetchPolicy: 'network-only'
      })
      this.bookingPayment = data.getPaymentFromBooking
    },
    async getBooking() {
      const res = await this.$apollo.query({
        query: GET_BOOKING,
        variables: {
          input: {
            ids: [~~this.id]
          }
        },
        fetchPolicy: 'network-only'
      })
      this.booking = cloneDeep(res.data.bookingSearch.results[0])
    },
    async getBookingTypeIds() {
      const { data } = await this.$apollo.query({
        query: GET_BOOKING_TYPE,
        fetchPolicy: 'network-only'
      })
      this.bookingTypeArray = data.getBookingType
      this.types = this.bookingTypeArray.map(t => {
        return t.name
      })
      forEach(this.bookingTypeArray, _ => {
        this.typeIds[~~_.id] = _.name
      })
      this.type = this.typeIds[~~this.booking.typeId]
    }
  }
}
</script>

<style>
.booking-details {
  height: 100%;
  padding: 10px 10px;
  width: 100%;
  margin: 10px 10px;
}
.editbtn.sm {
  top: -5px !important;
}
.editbtn {
  top: 15px;
}
.edit-speed-dial {
  top: 88px !important;
}
</style>
