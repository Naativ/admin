<template>
  <v-layout column ma-5>
    <h1>Sales {{memberName ? `for ${memberName}` : null}}</h1>
    <v-card>
      <v-card-text>
        <v-subheader>Range</v-subheader>
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
    </v-card>
    <SalesDataTable
      :sales="sales"
      :loading="loading"
    />
  </v-layout>
</template>

<script>
import SEARCH_SALES_QUERY from '@/graphql/SearchSales.gql'
import DateSelector from '@/components/DateSelector'
import SalesDataTable from '@/components/SalesDataTable'
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'
import moment from 'moment'

export default {
  components: {
    DateSelector,
    SalesDataTable
  },
  data () {
    return {
      loading: false,
      memberName: null,
      sales: [],
      startDate: moment()
        .startOf('week').subtract(5, 'weeks')
        .format('YYYY-MM-DD'),
      endDate: moment()
        .endOf('week').subtract(1, 'weeks')
        .format('YYYY-MM-DD'),
      addDialog: false
    }
  },
  async mounted () {
    this.sales = await this.getSalesHistory()
  },
  methods: {
    findMemberName() {
      if (!this.sales.length) {
        return null
      }
      const salesIds = this.sales.map(sale => sale.id)
      const index = salesIds.indexOf(this.id)
      this.memberName = this.sales[index].displayName
    },
    async startDateChanged({ date }) {
      this.startDate = date
      this.sales = await this.getSalesHistory()
    },
    async endDateChanged({ date }) {
      this.endDate = date
      this.sales = await this.getSalesHistory()
    },
    async getSalesHistory () {
      const input = {
        tenantId: this.$store.state.user.principal.tenantId,
        endDate: this.endDate,
        startDate: this.startDate,
        sellerId: parseInt(this.id)
      }
      this.loading = true
      const data = await this.$apollo.query({
        query: SEARCH_SALES_QUERY,
        variables: {
          saleSearchInput: {
            ...input
          }
        },
        fetchPolicy: 'network-only'
      })
      this.loading = false
      return data.data.searchSales
    }
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    id () { return ~~this.$route.params.id }
  },
  watch: {
    '$route': async function (to, from) {
      this.memberName = null
      this.sales = await this.getSalesHistory()
    }
  }
}
</script>

<style>
.addbtn.sm {
  top: -5px !important;
}
.addbtn {
  top: 15px;
}
</style>
