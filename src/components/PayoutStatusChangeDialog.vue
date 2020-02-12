<template>
  <v-dialog @update:returnValue="$emit('update:returnValue')" :value="showEditStatusModal" width="500px" height="140px">
    <v-card>
      <v-toolbar class="black white--text">
        <v-toolbar-title>Edit Status of Payout {{editPayoutId}}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-select
          v-if    ="showEditStatusModal"
          :items  ="paymentStatuses"
          v-model ="editPayoutStatusInternal"
          outline
        />
      </v-card-text>
      <v-card-actions class="card-action-container">
        <v-btn @click="handleStatusChangeConfirmClick" :disabled="saving" :loading="saving" color="secondary">Confirm</v-btn>
        <v-btn @click="$emit('handleCancelDialogClick')" color="secondary">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { PAYOUT_STATUS_UPDATE } from '@/graphql/Payouts.gql'

export default {
  name: 'PayoutStatusChangeDialog',
  props: {
    showEditStatusModal: Boolean,
    editPayoutStatus: String,
    saving: Boolean,
    editPayoutId: Number
  },
  data() {
    return {
      editPayoutStatusInternal: this.editPayoutStatus,
      paymentStatuses: [
        'PENDING',
        'APPROVAL_PENDING',
        'PENDING_RELEASE',
        'RELEASED',
        'SUBMITTED',
        'PROCESSING',
        'PAID',
        'FAILED',
        'NEEDS_ATTENTION'
      ]
    }
  },
  methods: {
    async handleStatusChangeConfirmClick() {
      this.$emit('mutating')

      try {
        await this.$apollo.mutate({
          mutation: PAYOUT_STATUS_UPDATE,
          variables: {
            input: {
              status: this.editPayoutStatusInternal,
              payoutId: this.editPayoutId
            }
          }
        })

        this.$emit('handleStatusChangeSuccessOrError', 'Status successfully updated!')
      } catch (error) {
        this.$emit('handleStatusChangeSuccessOrError', 'There was an error updating payout statuses')

        console.error(error)
      }
    }
  },
  watch: {
    editPayoutStatus(newVal) {
      this.editPayoutStatusInternal = newVal
    }
  }
}
</script>
