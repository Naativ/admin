<template>
  <v-card>
    <v-card-text>
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12 sm6>
            <DateSelector
              :selectedDate="startDate"
              :label="'Select Start Date'"
              @date-changed="startDateChanged"
            />
          </v-flex>
          <v-flex xs12 sm6>
            <DateSelector
              :selectedDate="endDate"
              :label="'Select End Date'"
              @date-changed="endDateChanged"
            />
          </v-flex>
          <v-flex xs12>
            <v-text-field
              v-model="toEmail"
              label="To email"
            />
          </v-flex>
        </v-layout>
        <v-btn :loading="loading" @click="getEmails">Search Email</v-btn>
      </v-container>
    </v-card-text>
    <v-data-table :loading="loading" :items="emails" :headers="headers" hide-actions>
      <template slot="items" slot-scope="props">
        <td class="text-xs">{{ props.item.last_event_time }}</td>
        <td class="text-xs">{{ props.item.from_email }}</td>
        <td class="text-xs">{{ props.item.to_email}}</td>
        <td class="text-xs">{{ props.item.subject}}</td>
        <td class="text-xs">{{ props.item.status}}</td>
        <td class="text-xs">{{ props.item.opens_count}}</td>
        <td class="text-xs">{{ props.item.clicks_count}}</td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { TenantsActions } from '@/tenants/TenantsStore'
import { INTEGRATION_COMMAND } from '@/graphql/IntegrationActions.gql'
import DateSelector from '@/components/DateSelector.vue'
import moment from 'moment'

export default {
  name: 'EmailView',
  components: {
    DateSelector
  },
  data () {
    return {
      emails: [],
      loading: false,
      headers: [
        { text: 'Sent', value: 'last_event_time', sortable: false },
        { text: 'From', value: 'from_email', sortable: false },
        { text: 'To', value: 'to_email', sortable: false },
        { text: 'Subject', value: 'subject', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Opens', value: 'opens_count', sortable: false },
        { text: 'Clicks', value: 'clicks_count', sortable: false }
      ],
      startDate: moment()
        .subtract(3, 'days')
        .format('YYYY-MM-DD'),
      endDate: moment()
        .format('YYYY-MM-DD'),
      toEmail: null,
      integrationId: null
    }
  },
  methods: {
    ...mapActions({
      fetchTenantInfo: TenantsActions.FETCH_TENANT_INFO
    }),
    async startDateChanged ({ date }) {
      this.startDate = date
      await this.getEmails()
    },
    async endDateChanged ({ date }) {
      this.endDate = date
      await this.getEmails()
    },
    async getEmails () {
      this.loading = true
      if (this.integrationId) {
        console.log(this.integrationId)
      }
      try {
        const { data } = await this.$apollo.mutate({
          mutation: INTEGRATION_COMMAND,
          variables: { input: {
            command: 'sendgrid_fetch_activity',
            tenantIntegrationId: this.integrationId,
            data: {
              toEmail: this.toEmail,
              startDate: moment(this.startDate).format(),
              endDate: moment(this.endDate).add(48, 'hours').format()
            }
          } }
        })
        this.emails = data.integrationCommand.payload
      } finally {
        this.loading = false
      }
    }
  },
  async mounted () {
    if (this.integrations.length === 0) {
      await this.fetchTenantInfo()
    }
    const integration = this.integrations.find(i => {
      return i.key === 'sendgrid'
    })
    this.integrationId = integration.id
    await this.getEmails()
  },
  computed: {
    ...mapState({
      integrations: state => {
        return state.tenants.info.integrations
      }
    })
  }

}
</script>

<style>
.link {
  margin: auto;
}
</style>
