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
        </v-layout>
      </v-container>
    </v-card-text>
    <v-data-table :loading="loading" :items="payouts" :headers="headers" hide-actions>
      <template slot="items" slot-scope="props">
        <td class="text-xs">{{ props.item.id}}</td>
        <td class="text-xs">{{ (props.item.amount / 100) | toCurrency(props.item.currency) }}</td>
        <td class="text-xs">
          <router-link :to="'/payouts/' + props.item.member.id">
            {{ props.item.member.displayName}}
          </router-link>
        </td>
        <td class="text-xs">{{ props.item.currency}}</td>
        <td class="text-xs">{{ props.item.note}}</td>
        <td class="text-xs">{{ props.item.status}}</td>
        <td class="text-xs">{{ $moment(props.item.createdOn).format('lll') }}</td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { TenantsActions } from '@/tenants/TenantsStore'
import { getAllPayouts } from '@/payouts/payouts.gql'
import DateSelector from '@/components/DateSelector.vue'

export default {
  components: {
    DateSelector
  },
  data () {
    return {
      payouts: [],
      loading: false,
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'Amount', value: 'amount', sortable: false },
        { text: 'Member', value: 'member', sortable: false },
        { text: 'Currency', value: 'currency', sortable: false },
        { text: 'Note', value: 'note', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Created', value: 'createdOn', sortable: false }
      ],
      startDate: this.$moment()
        .startOf('week').subtract(5, 'weeks')
        .format('YYYY-MM-DD'),
      endDate: this.$moment()
        .add(2, 'days')
        .format('YYYY-MM-DD'),
      integrationId: null,
      supportedIntegrations: ['stripe_connect']
    }
  },
  methods: {
    ...mapActions({
      fetchTenantInfo: TenantsActions.FETCH_TENANT_INFO
    }),
    async startDateChanged ({ date }) {
      this.startDate = date
      await this.getPayouts()
    },
    async endDateChanged ({ date }) {
      this.endDate = date
      await this.getPayouts()
    },
    async getPayouts () {
      this.loading = true
      try {
        const { data } = await this.$apollo.query({
          query: getAllPayouts,
          variables: {
            input: {
              startDate: this.startDate,
              endDate: this.endDate,
              integrationId: this.integrationId
            }
          },
          fetchPolicy: 'network-only'
        })
        this.payouts = data.getAllPayouts
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
      return this.supportedIntegrations.indexOf(i.key) >= 0
    })
    this.integrationId = integration.id
    await this.getPayouts()
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
