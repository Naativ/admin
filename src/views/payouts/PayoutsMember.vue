<template>
  <v-layout column ma-5>
    <h1>Payouts</h1>
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

    <v-data-table :items="payouts" :headers="headers" hide-actions :loading="loadingPayouts">
      <template slot="items" slot-scope="props">
        <!-- <tr @click="openUnit(props.item.id)"> -->
        <td class="text-xs">{{ props.item.id}}</td>
        <td class="text-xs">{{ (props.item.amount / 100) | toCurrency(props.item.currency)}}</td>
        <td class="text-xs">{{ props.item.currency}}</td>
        <td class="text-xs">{{ props.item.note}}</td>
        <td class="text-xs" @click="handleStatusClick(props.item)">
          <v-btn class="status" small round>{{ props.item.status}}</v-btn>
        </td>
        <td class="text-xs">{{ props.item.createdOn}}</td>
        <!-- </tr> -->
      </template>
    </v-data-table>
    <PayoutDialog :addDialog="addDialog" @closeDialog="closeDialog" @submitted="submitted" :integrationId="integrationId"/>
    <PayoutStatusChangeDialog
      :showEditStatusModal              ="showEditStatusModal"
      :saving                           ="saving"
      :editPayoutId                     ="editPayoutId"
      :editPayoutStatus                 ="editPayoutStatus"
      @handleStatusChangeSuccessOrError ="handleStatusChangeSuccessOrError"
      @handleCancelDialogClick          ="handleCancelDialogClick"
      @update:returnValue               ="showEditStatusModal = false"
      @mutating                         ="saving = true"
    />
    <v-snackbar
      v-model="showSnackbar"
    >
      {{snackbarMsg}}
      <v-btn
        color="pink"
        flat
        @click="showSnackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
import { getMemberPayout } from '@/users/users.gql'
import { TenantsActions } from '@/tenants/TenantsStore'
import PayoutDialog from '@/components/PayoutDialog.vue'
import PayoutStatusChangeDialog from '@/components/PayoutStatusChangeDialog.vue'
import { mapGetters, mapState, mapActions } from 'vuex'
import { StoreGetters } from '@/store'

export default {
  components: {
    PayoutDialog,
    PayoutStatusChangeDialog
  },
  data () {
    return {
      showEditStatusModal: false,
      editPayoutStatus: null,
      editPayoutId: null,
      saving: false,
      headers: [
        { text: 'Id', value: 'id', sortable: false },
        { text: 'Amount', value: 'amount', sortable: false },
        { text: 'Currency', value: 'currency', sortable: false },
        { text: 'Note', value: 'note', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Created', value: 'createdOn', sortable: false }
      ],
      addDialog: false,
      integrationId: null,
      supportedIntegrations: ['stripe_connect'],
      loadingPayouts: false,
      showSnackbar: false,
      snackbarMsg: ''
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
  },
  methods: {
    ...mapActions({
      fetchTenantInfo: TenantsActions.FETCH_TENANT_INFO
    }),
    handleStatusClick(item) {
      this.editPayoutStatus = item.status
      this.editPayoutId = item.id
      this.showEditStatusModal = true
    },
    handleCancelDialogClick() {
      this.editPayoutStatus = null
      this.editPayoutId = null
      this.showEditStatusModal = false
    },
    async handleStatusChangeSuccessOrError(message) {
      await this.$apollo.queries.payouts.refetch()

      this.snackbarMsg = message
      this.showSnackbar = true
      this.saving = false
      this.showEditStatusModal = false
    },
    async getPayoutHistory () {
      this.loadingPayouts = true
      const data = await this.$apollo.query({
        query: getMemberPayout,
        variables: {
          ids: [this.id]
        },
        fetchPolicy: 'network-only'
      })
      this.loadingPayouts = false
      return data.data.membersByIds[0].payouts
    },
    canWritePayout () {
      return this.permissions.find(p => p.id === 15)
    },
    async submitted () {
      this.$apollo.queries.payouts.refetch()
    },
    addPayout () {
      this.addDialog = true
    },
    closeDialog () {
      this.addDialog = false
    }
  },
  computed: {
    ...mapState({
      integrations: state => {
        return state.tenants.info.integrations
      }
    }),
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    id () { return ~~this.$route.params.id }
  },
  apollo: {
    payouts: {
      query: getMemberPayout,
      variables() {
        return {
          ids: [this.id]
        }
      },
      update(data) {
        return data.membersByIds[0].payouts
      },
      fetchPolicy: 'network-only'
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
.status .v-chip__content {
  cursor: pointer;
}
.v-select__selections {
  padding-top: 0px !important;
}
.card-action-container {
  display: flex;
  justify-content: center;
}
</style>
