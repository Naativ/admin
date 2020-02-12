<template>
  <v-layout column ma-5>
    <h1>Payoutsadsfasdf</h1>
    <v-btn
      @click="addPayout"
      color="pink"
      dark
      absolute
      left
      fab
      v-if="canWritePayout()"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <v-data-table :items="payouts" :headers="headers" hide-actions>
      <template slot="items" slot-scope="props">
        <!-- <tr @click="openUnit(props.item.id)"> -->
        <td class="text-xs">{{ props.item.id}}</td>
        <td class="text-xs">{{ (props.item.amount / 100) | toCurrency(props.item.currency)}}</td>
        <td class="text-xs">{{ props.item.currency}}</td>
        <td class="text-xs">{{ props.item.note}}</td>
        <td class="text-xs">{{ props.item.status}}</td>
        <td class="text-xs">{{ props.item.createdOn}}</td>
        <!-- </tr> -->
      </template>
    </v-data-table>
    <PayoutDialog :addDialog="addDialog" @closeDialog="closeDialog" @submitted="submitted" />
  </v-layout>
</template>

<script>
import { getMemberPayout } from '@/users/users.gql'
import PayoutDialog from '@/components/PayoutDialog.vue'
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'

export default {
  components: {
    PayoutDialog
  },
  data () {
    return {
      payouts: [],
      headers: [
        { text: 'Id', value: 'id', sortable: false },
        { text: 'Amount', value: 'amount', sortable: false },
        { text: 'Currency', value: 'currency', sortable: false },
        { text: 'Note', value: 'note', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Created', value: 'createdOn', sortable: false }
      ],
      addDialog: false
    }
  },
  async mounted () {
    this.payouts = await this.getPayoutHistory()
  },
  methods: {
    async getPayoutHistory () {
      const data = await this.$apollo.query({
        query: getMemberPayout,
        variables: {
          ids: [this.id]
        },
        fetchPolicy: 'network-only'
      })
      return data.data.membersByIds[0].payouts
    },
    canWritePayout () {
      return this.permissions.find(p => p.id === 15)
    },
    async submitted () {
      this.payouts = await this.getPayoutHistory()
    },
    addPayout () {
      this.addDialog = true
    },
    closeDialog () {
      this.addDialog = false
    }
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    id () { return ~~this.$route.params.id }
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
