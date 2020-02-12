<template>
  <v-flex xs12>
    <v-snackbar
      :timeout="8000"
      :top="true"
      :right="true"
      v-model="snackbar.show"
      class="snackbar"
    >
      {{snackbar.message}}
      <a
        v-if="snackbar.callback"
        @click="snackbar.callback.fn"
      >
        {{snackbar.callback.label}}
      </a>
      <v-btn
        flat
        color="pink"
        @click.native="snackbar.show = false"
      >Close</v-btn>
    </v-snackbar>
    <div class="team main-container">
      <v-layout
        row
        justify-end
      >
        <v-btn
          @click="show = true"
          class="primary text-capitalize"
          flat
          right
          slot="activator"
        >
          Create Booking
        </v-btn>
      </v-layout>
      <v-dialog
        v-model="show"
        width="50%"
        persistent
      >
        <v-card class="card-wrapper">
          <v-layout
            row
            justify-center
          >
            <h2>Create a New Booking</h2>
          </v-layout>
          <UserAutocomplete
            :disabled="locked"
            @selected="assignHost"
            label="Host"
          />
          <UserAutocomplete
            :disabled="locked"
            @selected="assignGuest"
            label="Guest"
          />
          <v-select
            label="Learning Profile"
            :loading="locked"
            item-text="displayName"
            item-value="id"
            return-object
            :disabled="profileList.length < 1 || locked"
            :items="profileList"
            v-model="booking.profile"
          />
          <v-layout
            row
            justify-space-around
          >
            <DateSelector
              :disabled="locked"
              @selected="updateStartDate"
              :selectedDate="booking.start.date"
              label="Select Date"
            />
            <TimeSelector
              @selected="updateStartTime"
              :disabled="!booking.start.date || locked"
              label="Select Start Time"
            />
            <TimeSelector
              @selected="updateEndTime"
              :disabled="!booking.start.date || locked"
              label="Select End Time"
            />
          </v-layout>
          <v-select
            :disabled="locked"
            :items="statusList"
            label="Booking Status"
            item-text="name"
            item-value="id"
            v-model="booking.statusId"
          />
          <v-select
            :disabled="locked"
            :items="typeList"
            label="Booking Type"
            item-text="name"
            item-value="key"
            v-model="booking.typeKey"
          />
          <v-layout
            row
            justify-space-around
          >
            <v-checkbox
              :disabled="locked"
              v-model="booking.costFree"
              label="Cost Free"
            ></v-checkbox>
            <v-select
              :disabled="locked"
              v-if="!booking.costFree"
              :items="ledgerUnits"
              label="Cost Unit"
              item-text="name"
              item-value="id"
              v-model="booking.costUnitId"
            />
          </v-layout>
          <v-text-field
            type="number"
            v-model="booking.cooldown"
            label="Cooldown"
            :persistent-hint="true"
            hint="In Seconds"
          />
          <v-card-actions>
            <v-layout
              row
              justify-end
            >
              <v-btn
                class="primary text-capitalize"
                @click="create"
                :disabled="locked"
              >
                Create
              </v-btn>
              <v-btn
                class="error text-capitalize"
                @click="show = false"
                :disabled="locked"
              >
                Cancel
              </v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-flex>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'
import DateSelector from '@/components/DateSelector.vue'
import TimeSelector from '@/components/TimeSelector.vue'
import UserAutocomplete from '@/components/UserAutocomplete.vue'

import { PROFILES_BY_MEMBER_IDS } from '@/graphql/member.gql'
import { GET_STATUS_LIST, GET_TYPE_LIST, SCHEDULE_BOOKING } from '@/graphql/Booking'

export default {
  name: 'BookingCreateDialog',
  components: { DateSelector, TimeSelector, UserAutocomplete },

  data () {
    return {
      locked: false,
      snackbar: {
        show: false,
        message: undefined,
        callback: undefined
      },
      booking: {
        availabilityId: '',
        end: { date: null, time: null },
        guest: null,
        host: null,
        profile: null,
        start: { date: null, time: null },
        statusId: null,
        typeKey: null,
        costUnitId: null,
        costFree: true,
        cooldown: 0
      },
      search: {
        guest: { term: null, results: [] },
        host: { term: null, results: [] },
        guestProfiles: []
      },
      show: false,
      statusList: [],
      typeList: [],
      profileList: []
    }
  },
  methods: {
    assignHost (user) { this.booking.host = user },
    async assignGuest (user) {
      this.booking.guest = user
      delete this.booking.profile
      this.profileList.length = 0
      const input = {
        memberIds: [user.id]
      }
      this.locked = true
      try {
        const result = await this.$apollo.query({
          query: PROFILES_BY_MEMBER_IDS,
          variables: { input },
          fetchPolicy: 'network-only'
        })
        const profiles = _.get(result, 'data.lmsProfiles.results', [])
        profiles.forEach(p => this.profileList.push(p))
      } catch (err) {
        console.warn('Failed loading profiles', err)
        window.alert('Failed loading profiles')
      } finally {
        this.locked = false
      }
    },
    async create () {
      const {
        start, end, typeKey, statusId,
        host, guest, profile,
        costFree, costUnitId, cooldown = 0
      } = this.booking

      const theStart = moment(`${start.date}T${start.time}`).utc()
      let theEnd = moment(`${start.date}T${end.time}`).utc()
      while (theEnd.isBefore(theEnd)) {
        theEnd = theEnd.add(1, 'days')
      }

      const startDate = theStart.toISOString()
      const endDate = theEnd.toISOString()

      const input = {
        typeKey,
        statusId,
        costFree,
        profileId: profile && profile.memberId === guest.id ? profile.id : undefined,
        costUnitId: costFree ? undefined : costUnitId,
        hostId: host.id,
        guestId: guest.id,
        start: startDate,
        end: endDate,
        cooldown: ~~cooldown
      }
      this.locked = true
      try {
        const result = await this.$apollo.mutate({
          mutation: SCHEDULE_BOOKING,
          variables: {
            input
          }
        })
        const { data: { schedulingBookingUpsert: booking } } = result
        this.snackbar = {
          show: true,
          message: 'Successfully created ',
          callback: {
            label: `Booking ${booking.id}`,
            fn: () => this.$router.push({ path: `/appointments/_${booking.id}/booking` })
          }
        }
        this.show = false
      } catch (err) {
        console.warn({ err })
        this.snackbar = {
          show: true,
          message: 'Failed creating booking: ' + err.message.replace('GraphQL error: ', '')
        }
      } finally {
        this.locked = false
      }
    },
    updateStartDate (date) {
      this.booking.start.date = this.booking.end.date = date
    },
    updateStartTime (time) { this.booking.start.time = time },
    updateEndTime (time) { this.booking.end.time = time }
  },
  computed: {
    ...mapState({
      principal: state => state.user.principal
    }),
    ledgerUnits () {
      const units = [{
        id: 1,
        name: 'US Dollar',
        key: 'usd'
      }, {
        id: 1000,
        tenantId: 1006,
        name: 'Classroom token',
        key: 'lesson'
      }]
      return units.filter(u => !u.tenantId || u.tenantId === this.principal.tenantId)
    }
  },
  watch: {
    snackbar: {
      handler (updated, old) {
        const { show, message, callback } = updated
        if (!show && (message || callback)) {
          this.snackbar = {
            show: false,
            message: undefined,
            callback: undefined
          }
        }
      },
      deep: true
    }
  },
  apollo: {
    statusList: {
      query: GET_STATUS_LIST,
      update ({ bookingStatusList }) { return bookingStatusList }
    },
    typeList: {
      query: GET_TYPE_LIST,
      update ({ bookingTypeList }) { return bookingTypeList }
    }
  }
}
</script>
<style scoped>
.card-wrapper {
  padding: 20px;
}
.snackbar a {
  color: #ff4a9d;
  margin-left: 3px;
}
</style>
