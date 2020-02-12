<template>
  <div class="home main-container">
    <h1>Dashboard</h1>
    <div v-if="access.hasDashboard || isSuperAdmin">
      <v-subheader>Yearly Sales</v-subheader>
      <v-container
        fluid
        grid-list-xs
      >
        <v-layout
          row
          wrap
        >
          <v-flex
            sm4
            pa-3
          >
            <DashCard
              color="light-blue"
              darken="1"
              :currency="true"
              :display="totalSales"
              subheading="Total Company Sales"
              icon="person"
            />
          </v-flex>
          <v-flex
            sm4
            pa-3
          >
            <DashCard
              color="indigo"
              darken="1"
              :display="totalPoints"
              subheading="Total Company Points"
              icon="people"
            />
          </v-flex>
          <v-flex
            sm4
            pa-3
          >
            <DashCard
              color="pink"
              darken="1"
              :display="saleCount"
              subheading="Total Orders"
              icon="star"
            />
          </v-flex>
        </v-layout>
      </v-container>
      <v-subheader>Team</v-subheader>
      <v-container
        fluid
        grid-list-xs
      >
        <v-layout
          row
          wrap
        >
          <v-flex
            sm6
            pa-3
          >
            <DashCard
              v-if="memberCount.length === 0"
              color="pink"
              darken="2"
              :display="0"
              subheading="Total Size"
              icon="perm_contact_calendar"
            />
            <DashCard
              v-for="(mCount, index) in memberCount"
              :key="index"
              color="light-blue"
              darken="2"
              :display="mCount.count"
              :subheading="`Total Size (${mCount.type})`"
              icon="person_outline"
            />
          </v-flex>
          <v-flex
            sm6
            pa-3
          >
            <DashCard
              v-if="membersThisMonth.length === 0"
              color="pink"
              darken="2"
              :display="0"
              subheading="Joined this Month"
              icon="perm_contact_calendar"
            />
            <DashCard
              v-for="(mCount, index) in membersThisMonth"
              :key="index"
              color="pink"
              darken="2"
              :display="mCount.count"
              :subheading="`Joined this Month (${mCount.type})`"
              icon="perm_contact_calendar"
            />
          </v-flex>
        </v-layout>
      </v-container>
      <v-subheader>Monthly Sales</v-subheader>
      <v-container
        fluid
        grid-list-xs
      >
        <v-layout
          row
          wrap
        >
          <v-flex
            sm4
            pa-3
          >
            <DashCard
              color="light-blue"
              darken="1"
              :currency="true"
              :display="monthlySales.totalAmount"
              subheading="Monthly Sales"
              icon="person"
            />
          </v-flex>
          <v-flex
            sm4
            pa-3
          >
            <DashCard
              color="indigo"
              darken="1"
              :display="monthlySales.commissionablePoints"
              subheading="Monthly Points"
              icon="people"
            />
          </v-flex>
          <v-flex
            sm4
            pa-3
          >
            <DashCard
              color="pink"
              darken="1"
              :display="monthlySales.saleCount"
              subheading="Monthly Orders"
              icon="star"
            />
          </v-flex>
        </v-layout>
      </v-container>
      <div v-if="tenantId !== 0 && accessToken">
        <v-subheader>Members</v-subheader>
        <MembersMap
          :accessToken="accessToken"
          :mapStyle="mapStyle"
          :tenantId="tenantId"
        />
      </div>
      <v-subheader>Leaderboards</v-subheader>
      <v-container
        fluid
        grid-list-xs
      >
        <v-layout
          row
          wrap
        >
          <v-flex
            sm6
            pa-3
          >
            <LeaderBoard
              :leaders="MonthlySalesLeaders"
              title="Top Sellers"
              :currency="true"
            />
          </v-flex>
          <v-flex
            sm6
            pa-3
          >
            <LeaderBoard
              :leaders="MonthlyFrontlineLeaders"
              title="Top Recruiters"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </div>
    <div v-else>
      <p>Looks like you don't have access to any Dashboard Widgets. Contact your Hexly system administrator to get you set up.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'
import DashCard from '@/components/DashboardCard.vue'
import LeaderBoard from '@/components/Leaderboard.vue'
import MembersMap from '@/components/MembersMap.vue'
import ALL_TENANT_SALES_SUMMARIES_QUERY from '../graphql/AllTenantSales.gql'
import {
  MONTHLY_SALES_LEADERBOARD,
  MONTHLY_FRONTLINE_LEADERBOARD
} from '@/graphql/Leaderboard.js'
import MEMBERS_COUNT from '../graphql/MemberCount.gql'
import MEMBERS_COUNT_BY_RANGE from '../graphql/MemberCountByRange.gql'
import * as R from 'ramda'
import moment from 'moment'

export default {
  name: 'home',
  components: {
    DashCard,
    LeaderBoard,
    MembersMap
  },
  data: () => ({
    monthlySales: {
      totalAmount: 0,
      commissionablePoints: 0,
      saleCount: 0
    },
    totalSales: 0,
    totalPoints: 0,
    saleCount: 0,
    memberCount: 0,
    membersThisMonth: 0,
    MonthlyFrontlineLeaders: [],
    MonthlySalesLeaders: [],
    currentMonth: ~~moment().format('M'),
    currentYear: ~~moment().format('YYYY'),
    tenantId: 0,
    accessToken: '',
    mapStyle: ''
  }),
  mounted () {
    this.tenantId = this.$store.state.user.principal.tenantId
    this.accessToken =
      process.env[`VUE_APP_MAPBOX_${this.tenantId}_ACCESS_TOKEN`]
    this.mapStyle = process.env[`VUE_APP_MAPBOX_${this.tenantId}_MAP_STYLE`]
  },
  apollo: {
    monthlySales () {
      return {
        query: ALL_TENANT_SALES_SUMMARIES_QUERY,
        variables: {
          idCondition: {
            tenantId: this.$store.state.user.principal.tenantId,
            year: this.currentYear
          }
        },
        update ({ allTenantSalesSummaries }) {
          const sales = allTenantSalesSummaries.nodes
          const currentMonth = this.currentMonth
          this.totalSales = R.reduce(
            (acc, sale) => {
              return R.add(acc, sale.totalAmount)
            },
            0,
            sales
          )
          this.totalPoints = R.reduce(
            (acc, sale) => {
              return R.add(acc, sale.totalPoints)
            },
            0,
            sales
          )
          this.saleCount = R.reduce(
            (acc, sale) => {
              return R.add(acc, sale.saleCount)
            },
            0,
            sales
          )

          return (
            R.find(R.propEq('month', currentMonth))(sales) || this.monthlySales
          )
        }
      }
    },
    memberCount: {
      query: MEMBERS_COUNT,
      variables () {
        return {
          input: {
            tenantId: this.$store.state.user.principal.tenantId
          }
        }
      },
      update ({ memberCount }) {
        return memberCount
      }
    },
    membersThisMonth: {
      query: MEMBERS_COUNT_BY_RANGE,
      variables () {
        return {
          input: {
            tenantId: this.$store.state.user.principal.tenantId,
            startDate: moment()
              .startOf('month')
              .format('YYYY-MM-DD'),
            endDate: moment()
              .endOf('month')
              .format('YYYY-MM-DD')
          }
        }
      },
      update ({ memberCountByRange }) {
        return memberCountByRange
      }
    },
    MonthlySalesLeaders: {
      query: MONTHLY_SALES_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId: this.$store.state.user.principal.tenantId,
            month: ~~moment().format('MM'),
            year: ~~moment().format('YYYY'),
            omitTagIds: [8]
          }
        }
      },
      update ({ monthlySalesLeaderboard }) {
        return monthlySalesLeaderboard
      }
    },
    MonthlyFrontlineLeaders: {
      query: MONTHLY_FRONTLINE_LEADERBOARD,
      variables () {
        return {
          leaderInput: {
            tenantId: this.$store.state.user.principal.tenantId,
            month: ~~moment().format('MM'),
            year: ~~moment().format('YYYY'),
            omitTagIds: [8]
          }
        }
      },
      update ({ monthlyFrontlineLeaderboard }) {
        return monthlyFrontlineLeaderboard
      }
    }
  },
  computed: {
    ...mapGetters({
      access: StoreGetters.access,
      permissions: StoreGetters.permissions
    }),
    isSuperAdmin () {
      return this.permissions.find(p => p.id === 11)
    }
    // totalSales() {
    //   const test = null
    //   if (this.allSales) {
    //     const test = R.reduce(R.add, 'totalAmount', this.allSales.nodes)
    //   }
    //   return test
    // }
  }
}
</script>

<style scoped>
</style>
