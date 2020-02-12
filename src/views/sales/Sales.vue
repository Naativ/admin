<template>
  <v-flex xs12>
    <div class="about main-container">
      <h1>Sales</h1>
      <br>
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
          <v-subheader>Order Search</v-subheader>
          <v-container grid-list-md text-xs-center>
            <v-flex xs12>
              <v-text-field
                v-model="searchTerm"
                @keyup="searchInputDebounce"
                append-icon="search"
                type="text"
                name="searchTerm"
                label="Enter Name or Order ID"
              ></v-text-field>
            </v-flex>
          </v-container>
        </v-card-text>
      </v-card>
      <SalesDataTable
        :sales="items"
        :loading="loading"
      />
    </div>
  </v-flex>
</template>

<script>
import DateSelector from '@/components/DateSelector'
import SalesDataTable from '@/components/SalesDataTable'
import SEARCH_SALES_QUERY from '@/graphql/SearchSales.gql'
import { map } from 'ramda'
import moment from 'moment'
import { debounce } from 'lodash'

export default {
  components: {
    DateSelector,
    SalesDataTable
  },
  data() {
    return {
      startDate: moment()
        .startOf('week').subtract(5, 'weeks')
        .format('YYYY-MM-DD'),
      endDate: moment()
        .endOf('week').subtract(1, 'weeks')
        .format('YYYY-MM-DD'),
      loading: false,
      searchTerm: null,
      searchInputDebounce: debounce(() => this.searchInput(), 500),
      sales: []
    }
  },
  methods: {
    startDateChanged({ date }) {
      this.startDate = date
    },
    endDateChanged({ date }) {
      this.endDate = date
    },
    checkIfOrderNumber(inputString) {
      const isNumber = /^\d*$/gm.test(inputString)
      return isNumber
    },
    async searchInput() {
      this.sales = []
      let result
      let input
      if (this.searchTerm === '') { return false }
      this.loading = true
      if (this.checkIfOrderNumber(this.searchTerm)) {
        input = {
          tenantId: this.$store.state.user.principal.tenantId,
          endDate: this.endDate,
          startDate: this.startDate,
          sellerId: null,
          providerOids: [this.searchTerm]
        }
      } else {
        input = {
          tenantId: this.$store.state.user.principal.tenantId,
          query: this.searchTerm,
          endDate: this.endDate,
          startDate: this.startDate,
          sellerId: null
        }
      }
      result = await this.searchSalesQuery(input)
      const { data: { searchSales } } = result
      this.sales = searchSales
      this.loading = false
    },
    searchSalesQuery(input) {
      return this.$apollo.query({
        query: SEARCH_SALES_QUERY,
        variables: {
          saleSearchInput: {
            ...input
          }
        }
      })
    }
  },
  computed: {
    items() {
      return map(sale => {
        return {
          ...sale,
          id: sale.saleId,
          date: moment(sale.awardedDate, 'YYYY-MM-DD').format('MM/DD/YYYY')
        }
      }, this.sales)
    }
  }
}
</script>

<style scoped>
.sale-details ul li {
  list-style: none;
}
</style>
