<template>
  <v-dialog v-model="show" max-width="768" persistent>
      <v-card class="dialog">
        <v-flex pa-4>
          <h1>Add Payouts</h1>
          <v-form ref="form" lazy-validation>
            <v-layout row>
              <v-select
                class="currency"
                px-2
                :items="currencyList"
                label="Currency"
                v-model="currency"
              ></v-select>
              <v-text-field
                label="Amount"
                prefix="$"
                placeholder="0.00"
                :rules="[v => !!v || 'Amount is required!']"
                v-model="amount"
              >
              </v-text-field>
            </v-layout>
            <v-layout column>
              <v-select
                class="status"
                px-2
                :items="statusList"
                label="Status"
                v-model="status"
              ></v-select>
            </v-layout>
            <v-layout column>
              <v-textarea
                :auto-grow="true"
                row-height="1"
                label="Description of Payment"
                :rules="[v => !!v || 'Discription is required!']"
                v-model="note"
              >
              </v-textarea>
            </v-layout>
            <!-- <v-divider/>
            <h3>Optional</h3> -->
            <v-text-field
              label="Enter Appointment ID (Optional)"
              v-model="appointmentId"
            ></v-text-field>
          </v-form>
          <v-card-actions>
            <v-btn
              flat
              @click="$emit('closeDialog')"
            >Close</v-btn>
            <v-spacer/>
            <v-btn
              :loading="loading"
              flat
              class="primary"
              @click="createPayout"
            >Submit</v-btn>
          </v-card-actions>
        </v-flex>
      </v-card>
  </v-dialog>
</template>

<script>
import { createMemberPayout, linkAppointmentToPayout } from '@/users/users.gql'

export default {
  props: {
    addDialog: { type: Boolean, default: false },
    integrationId: Number
  },
  data() {
    return {
      currencyList: [
        'USD', 'CAD'
      ],
      statusList: [
        { value: 'PENDING', text: 'Pending' },
        { value: 'APPROVAL_PENDING', text: 'Approval Pending' },
        { value: 'PENDING_RELEASE', text: 'Pending Release' },
        { value: 'RELEASED', text: 'Released' }
      ],
      currency: 'USD',
      status: 'PENDING',
      amount: '',
      note: '',
      appointmentId: null,
      loading: false
    }
  },
  computed: {
    show: {
      get() { return this.addDialog },
      set(v) { this.$emit('closeDialog') }
    },
    id () { return ~~this.$route.params.id }
  },
  methods: {
    async createPayout() {
      if (this.$refs.form.validate()) {
        this.loading = true
        const data = await this.$apollo.mutate({
          mutation: createMemberPayout,
          variables: {
            input: {
              status: this.status,
              currency: this.currency,
              amount: parseFloat(this.amount) * 100,
              note: this.note,
              params: {},
              memberId: this.id,
              tenantIntegrationId: this.integrationId
            }
          }
        })

        if (this.appointmentId) {
          await this.$apollo.mutate({
            mutation: linkAppointmentToPayout,
            variables: {
              input: {
                appointmentId: ~~this.appointmentId,
                payoutId: ~~data.data.createPayoutForMember.id
              }
            }
          })
        }
        this.loading = false
        this.show = false
        this.$emit('submitted')
      }
    }
  }

}
</script>

<style>
.dialog {
  padding: 10px;
}
.currency {
  max-width: 100px;
  margin-right: 20px;
}
</style>
