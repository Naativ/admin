<template>
  <v-flex xs12>
    <div class="job">
      <h1>Job Details</h1>
      <div class="text-xs-center">
        <v-btn
          color="success"
          @click.native="accept"
        >
          Accept
        </v-btn>

        <v-btn
          color="blue-grey"
          class="white--text"
          @click.native="reject"
        >
          Reject
        </v-btn>

        <v-btn
          color="secondary"
          @click.native="reload"
        >
          Reload
        </v-btn>
      </div>
      <v-data-table
        :headers="headers"
        :items="records"
        hide-actions
        item-key="id"
        expand
      >
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td class="text-xs-right">{{ props.item.existingJson.awarded_date }}</td>
            <td class="text-xs-right">{{ props.item.auxiliaryExisting.seller }}</td>
            <td class="text-xs-right">{{ props.item.existingJson.total_amount }}</td>
            <td class="text-xs-right">{{ props.item.existingJson.total_points }}</td>
            <td class="text-xs-right">{{ props.item.existingJson.commissionable_amount }}</td>
            <td class="text-xs-right">{{ props.item.existingJson.commissionable_points }}</td>
          </tr>
        </template>
        <template slot="expand" slot-scope="props">
          <table class="hidden-header">
            <thead>
              <tr>
                <th>Awarded</th>
                <th>Seller</th>
                <th>Total Amount</th>
                <th>Total Points</th>
                <th>Commissionable Amount</th>
                <th>Commissionable Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-xs-right">{{ props.item.submittedJson.awarded_date || 'N/A' }}</td>
                <td class="text-xs-right">{{ props.item.auxiliarySubmitted.seller || 'N/A' }}</td>
                <td class="text-xs-right">{{ props.item.submittedJson.total_amount || 'N/A' }}</td>
                <td class="text-xs-right">{{ props.item.submittedJson.total_points || 'N/A' }}</td>
                <td class="text-xs-right">{{ props.item.submittedJson.commissionable_amount || 'N/A' }}</td>
                <td class="text-xs-right">{{ props.item.submittedJson.commissionable_points || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </v-data-table>
    </div>

  </v-flex>
</template>
<script>
import GET_FEED_RECORDS from '@/graphql/FeedRecords.gql'
import { FeedActions } from '@/stores/FeedStore'

export default {
  name: 'Job',
  data() {
    return {
      headers: [
        { text: 'Awarded', value: 'awarded_date', sortable: false },
        { text: 'Seller', value: 'seller_id', sortable: false },
        { text: 'Total Amount', value: 'total_amount', sortable: false },
        { text: 'Total Points', value: 'total_points', sortable: false },
        {
          text: 'Commissionable Amount',
          value: 'commissionable_amount',
          sortable: false
        },
        {
          text: 'Commissionable Points',
          value: 'commissionable_points',
          sortable: false
        }
      ],
      records: []
    }
  },
  apollo: {
    records: {
      query: GET_FEED_RECORDS,
      variables() {
        return {
          condition: {
            importId: this.$route.params.id
          }
        }
      },
      update({ allFeedRecords }) {
        return allFeedRecords.nodes
      }
    }
  },
  methods: {
    accept() {
      this.$store.dispatch(FeedActions.JOB_ACTION, {
        id: this.$route.params.id,
        action: 'accept'
      })
    },
    reject() {
      this.$store.dispatch(FeedActions.JOB_ACTION, {
        id: this.$route.params.id,
        action: 'reject'
      })
    },
    reload() {
      this.$store.dispatch(FeedActions.JOB_ACTION, {
        id: this.$route.params.id,
        action: 'reload'
      })
    }
  }
}
</script>

<style scoped>
.hidden-header {
  width: 100%;
  border-collapse: collapse;
}
.hidden-header thead {
  visibility: hidden;
}

.hidden-header tr {
  height: 0;
}

.hidden-header tr th {
  margin: 0px;
  padding: 0px;
  height: 0px;
  line-height: 0px;
}
.hidden-header tbody tr td {
  background-color: rgba(250, 128, 114, 0.2);
}
</style>
