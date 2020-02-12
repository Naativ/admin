<template>
  <v-flex xs12>
    <v-container class="table-wrapper">
      <v-snackbar v-model="snackbar" multi-line :timeout="3000" top>
        {{ snackbarText }}
        <v-btn color="pink" flat @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
      <CreateBooking />
      <v-data-table
        :headers="headers"
        :items="allBookings"
        :rows-per-page-items="[ 15, 30, 50, { text: '$vuetify.dataIterator.rowsPerPageAll', 'value': -1 } ]"
        :loading="loadingBookings > 0"
      >
        <template slot="items" slot-scope="props">
          <tr @click="expandRow(props)">
            <td>{{ props.item.id }}</td>
            <td>
              {{ props.item.type.name }}
              <v-tooltip bottom v-if="props.item.canceled">
                <span slot="activator">Canceled</span>
                <span>
                  This appointment was canceled for the following reason:
                  {{ prop.item.canceledReason}}
                </span>
              </v-tooltip>
            </td>
            <td>{{ props.item.appointments[0] ? props.item.appointments[0].id : '' }}</td>
            <td>{{ props.item.start | momentDate }}</td>
            <td>{{ props.item.end | momentDate }}</td>
            <td>
              <v-tooltip top>
                <a slot="activator" @click="viewUser(props.item.host)">{{ props.item.host.displayName }}</a>
                <span>
                  MRN: {{ props.item.host.mrn }}
                  <br>
                  System ID: {{ props.item.host.id }}
                  <br>
                  Email: {{ props.item.host.contactEmail }}
                  <br>
                  Participant Type: Host
                </span>
              </v-tooltip>
              <br>
              <v-tooltip top>
                <a slot="activator" @click="viewUser(props.item.guest)">{{props.item.guest.displayName}}</a>
                <span>
                  MRN: {{ props.item.guest.mrn }}
                  <br>
                  System ID: {{ props.item.guest.id }}
                  <br>
                  Email: {{ props.item.guest.contactEmail }}
                  <br>
                  Participant Type: Guest
                </span>
              </v-tooltip>
            </td>
            <td>
              <v-menu offset-y>
                <v-btn slot="activator" icon>
                  <v-icon>more_vert</v-icon>
                </v-btn>
                <v-list>
                  <v-list-tile @click="editBooking(props.item)">
                    <v-list-tile-title>Edit Booking</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile @click="reprocessBooking(props.item)">
                    <v-list-tile-title>Reprocess Booking</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </template>
        <template slot="no-data">
          <div v-if="loadingBookings > 0">Searching...</div>
          <div v-else>No bookings have been created.</div>
        </template>
        <template slot="expand" slot-scope="props">
          <div v-if="props.item.appointments[0]" class="pa-3 appointment-details">
            <v-container fluid>
              <v-layout>
                <v-flex xs4>
                  <h4>Schedule:</h4>
                  <ul>
                    <li>Scheduled Date: {{props.item.appointments[0].scheduledDate | momentDate}}</li>
                    <li>Start Time: {{props.item.appointments[0].startTime | momentDate}}</li>
                    <li>End Time: {{props.item.appointments[0].endTime | momentDate}}</li>
                    <li>Time Limit: {{props.item.appointments[0].timeLimit}}</li>
                  </ul>
                </v-flex>
                <v-flex xs4>
                  <h4>Details:</h4>
                  <ul>
                    <li>Rating Score: {{props.item.appointments[0].rating ? props.item.appointments[0].rating.score : 'No Score'}}</li>
                    <li>Comments: {{props.item.appointments[0].comment ? props.item.appointments[0].rating.comment : 'No Comment'}}</li>
                    <li>Status: {{props.item.status.name}}</li>
                  </ul>
                </v-flex>
                <v-flex v-if="!loadingPayout && payable" xs4>
                  <h4>Payout:</h4>
                  <ul>
                    <li>Amount: {{ (payable.amount / 100) | toCurrency(props.item.currency) }} {{ payable.currency }}</li>
                    <li>Status: {{ payable.status }}</li>
                    <li>Description: {{ payable.description }}</li>
                  </ul>
                </v-flex>
                <!-- <v-flex xs4 v-else>
                  <v-progress-circular indeterminate :size="50" :width="5" color="black"></v-progress-circular>
                </v-flex> -->
              </v-layout>
            </v-container>
          </div>
          <v-container v-else>
            <v-layout>
              <v-flex xs4>
                <h4>No appointment</h4>
              </v-flex>
              <v-flex v-if="!loadingPayout && bookingPayable" xs4>
                <h4>Payout:</h4>
                <ul>
                  <li>Amount: {{ (bookingPayable.amount / 100) }} {{ bookingPayable.currency }}</li>
                  <li>Status: {{ bookingPayable.status }}</li>
                  <li>Description: {{ bookingPayable.description }}</li>
                </ul>
              </v-flex>
            </v-layout>
          </v-container>
        </template>
      </v-data-table>
    </v-container>
  </v-flex>
</template>

<script>
import moment from 'moment'
import { cloneDeep } from 'lodash'

import { booking } from '@/appointments/appointments.gql'
import { appointmentPayable, getPaymentFromBooking } from '@/payouts/payouts.gql'
import { REPROCESS_BOOKING } from '@/graphql/Booking'

import CreateBooking from '../../components/booking/Create.vue'

export default {
  components: { CreateBooking },
  data() {
    return {
      moment,
      surveys: [],
      headers: [
        { text: 'ID', value: 'id', width: '50px' },
        { text: 'Type', value: 'type', width: '75px' },
        { text: 'Appointment ID', value: 'scheduled', width: '150px' },
        { text: 'Start Time', value: 'startTime' },
        { text: 'End Time', value: 'endTime' },
        { text: 'Participants', value: 'participants' },
        { value: 'id', width: '50px', sortable: false }
      ],
      payable: {},
      bookingPayable: {},
      loadingPayout: false,
      appointment: [],
      hostBookings: [],
      guestBookings: [],
      loadingBookings: 0,
      snackbar: false,
      snackbarText: ''
    }
  },
  methods: {
    viewUser(user) {
      this.$router.push('/members/' + user.id)
    },
    editBooking(bookingItem) {
      const apptId = bookingItem.appointments[0] ? bookingItem.appointments[0].id : ''
      const bookingId = bookingItem.id
      this.$router.push(`/appointments/${apptId}_${bookingId}/booking`)
    },
    async reprocessBooking(bookingItem) {
      const { id, end, start, hostId, typeId, statusId, availabilityId } = bookingItem
      this.reporcessing = true
      try {
        await this.$apollo.mutate({
          mutation: REPROCESS_BOOKING,
          variables: {
            input: {
              id,
              end,
              start,
              hostId,
              typeId,
              statusId,
              availabilityId
            }
          }
        })
        this.snackbar = true
        this.snackbarText = `Booking: ${id} successfully reprocessed`
      } catch (err) {
        this.snackbar = true
        this.snackbarText = err.message
      }
      this.reporcessing = false
    },
    async getPayout(id) {
      const { data } = await this.$apollo.query({
        query: appointmentPayable,
        variables: { appointmentId: id },
        fetchPolicy: 'network-only'
      })
      this.payable = data.getPayableFromAppointment
    },
    async getBookingPayable(id) {
      const { data } = await this.$apollo.query({
        query: getPaymentFromBooking,
        variables: { bookingId: id },
        fetchPolicy: 'network-only'
      })
      this.bookingPayable = data.getPaymentFromBooking
    },
    async expandRow(props) {
      props.expanded = !props.expanded
      if (props.expanded && props.item.appointments[0]) {
        this.loadingPayout = true
        props.item.payable = await this.getPayout(props.item.appointments[0].id)
        this.loadingPayout = false
      } else if (props.expanded && !props.item.appointments[0]) {
        props.item.bookingPayable = await this.getBookingPayable(props.item.id)
      }
    }
  },
  apollo: {
    hostBookings: {
      query: booking,
      variables() {
        return {
          input: {
            hostIds: [this.id]
          }
        }
      },
      loadingKey: 'loadingBookings',
      update(response) {
        return response.bookingSearch.results
      }
    },
    guestBookings: {
      query: booking,
      variables() {
        return {
          input: {
            guestIds: [this.id]
          }
        }
      },
      update(response) {
        return response.bookingSearch.results
      }
    }
  },
  computed: {
    id() {
      return ~~this.$route.params.id
    },
    allBookings() {
      return cloneDeep(this.guestBookings.concat(this.hostBookings))
    }
  }
}
</script>

<style>
.table-wrapper {
  background-color: white;
}

.appointment-details ul li {
  list-style: none;
}
</style>
