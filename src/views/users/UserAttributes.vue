<template>
  <v-container xs6>
    <v-layout justify-space-around v-if="attributes.length">
      <template v-for="(data, index) in attributes">
        <v-flex class="attribute-remove-button-center" xs12 column wrap :key="index" >
          <v-card class="attribute">
            <v-container>
              <v-card-title class="card-title">{{data.key}}</v-card-title>
              <vue-json-pretty
                :data="data"
                :deep="1"
                showLength
              />
            </v-container>
          </v-card>
          <v-btn @click="removalConfirmation(attributes[index].key)">Remove</v-btn>
        </v-flex>
      </template>
    </v-layout>
    <v-layout justify-space-around v-else-if="!$apollo.loading">
      <h3>There are no attributes for this member</h3>
    </v-layout>
    <v-layout v-if="this.$store.state.user.principal.tenantId === 1007">
      <v-card class="pa-4 my-5">
        <v-flex xs12>
          <div class="text-xs-left duration">Session Length</div>
          <v-list v-if="durations && durations.rates">
            <template v-for="(data, index) in durations.rates">
              <v-list-tile class="text-xs-left" :key="index">
                <v-flex xs6>
                  Session Length: {{data.duration}} {{~~data.duration === 1 ? 'minute' : 'minutes'}}
                </v-flex>
                <v-flex xs6>
                  Amount: ${{getAmount(data.amount)}}
                </v-flex>
                <v-icon @click="removeDuration(data)">cancel</v-icon>
              </v-list-tile>
            </template>
          </v-list>
          <v-list v-else>
            <v-list-tile class="text-xs-left">
              There are no current session length/amounts defined.
            </v-list-tile>
          </v-list>
          <v-layout v-if="addingDuration" row>
            <v-text-field
              class="mx-3"
              placeholder="0"
              label="Session Length"
              suffix="minutes"
              v-model="newDuration"
              type="number"
              :rules="rules"
            />
            <v-text-field
              placeholder="0.00"
              prefix="$"
              label="Amount"
              v-model="newAmount"
              type="number"
            />
          </v-layout>
          <v-flex right>
            <v-btn
              v-if="!addingDuration"
              class="primary text-capitalize"
              @click="addingDuration = true"
            >
              Add new session length
            </v-btn>
            <v-btn
              v-else
              :disabled="!newAmount || !newDuration"
              class="primary text-capitalize"
              @click="saveDuration"
            >
              Save Session Length
            </v-btn>
          </v-flex>
        </v-flex >
      </v-card>
    </v-layout>
    <v-dialog max-width="25vw" v-model="showConfirmationDialog">
      <v-card>
        <v-card-text class="text-xs-center">
          <v-card-text>Are you sure you want to remove this attribute? This cannot be undone!</v-card-text>
          <v-btn color="error" @click="removeOneAttribute()" :disabled="saving" :loading="saving">Confirm</v-btn>
          <v-btn color="secondary" @click="showConfirmationDialog = false">Cancel</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import VueJsonPretty from 'vue-json-pretty'

import { getMemberAttribute, removeMemberAttribute, upsertMemberAttribute, queryDurations, removeDuration, addDuration } from '@/users/users.gql'

import { pathOr } from 'ramda'
import { cloneDeep } from 'lodash'

export default {
  data() {
    return {
      editing: false,
      attributes: [],
      removalKey: null,
      showConfirmationDialog: false,
      durations: [],
      newDuration: '',
      newAmount: '',
      addingDuration: false,
      saving: false,
      rules: [
        v =>
          (v >= 5) ||
        'Duration length must be greater than 5 minutes'
      ]
    }
  },
  components: {
    VueJsonPretty
  },
  async mounted() {
    await this.loadAttributes()
    await this.getDurations()
  },
  computed: {
    id() {
      return ~~this.$route.params.id
    },
    locked() {
      return this.saving || !this.editing
    }
  },
  methods: {
    async getDurations() {
      const { data } = await this.$apollo.query({
        query: queryDurations,
        variables: { input: { hostId: this.id, bookingTypeKey: 'vip-session', priority: 0 } },
        fetchPolicy: 'network-only'
      })
      this.durations = data.durations[0]
    },
    async saveDuration() {
      this.addingDuration = true
      await this.$apollo.mutate({
        mutation: addDuration,
        variables: { input: {
          hostId: this.id,
          unitId: 1,
          bookingTypeId: 1005,
          duration: ~~this.newDuration,
          amount: ~~this.newAmount * 100,
          priority: 0 } }
      })
      await this.getDurations()
      this.addingDuration = false
      this.newDuration = ''
      this.newAmount = ''
    },
    getAmount(amount) {
      const a = amount / 100
      return a.toFixed(2)
    },
    async removeDuration(duration) {
      await this.$apollo.mutate({
        mutation: removeDuration,
        variables: { input: {
          hostId: this.id,
          unitId: 1,
          bookingTypeId: 1005,
          duration: duration.duration,
          amount: duration.amount,
          priority: 0
        } }
      })
      await this.getDurations()
    },
    async loadAttributes() {
      const result = await this.getAttributes()
      this.attributes = cloneDeep(result)
    },
    async getAttributes() {
      const res = await this.$apollo.query({
        query: getMemberAttribute,
        variables: {
          input: {
            memberId: this.id
          }
        },
        fetchPolicy: 'network-only'
      })
      const parsedRes = pathOr([], ['data', 'getMemberAttributes'], res)
      return parsedRes
    },
    removalConfirmation(key) {
      this.removalKey = key
      this.showConfirmationDialog = true
    },
    async removeOneAttribute() {
      this.saving = true
      await this.$apollo.mutate({
        mutation: removeMemberAttribute,
        variables: {
          input: {
            memberId: this.id,
            key: this.removalKey
          }
        }
      })
      this.saving = false
      this.showConfirmationDialog = false
      this.loadAttributes()
    },
    async upsertAttribute(attribute) {
      await this.$apollo.mutate({
        mutation: upsertMemberAttribute,
        variables: {
          input: {
            id: attribute.id,
            key: attribute.key,
            value: attribute.value
          }
        }
      })
    },
    async saveData() {
      this.saving = true
      const promises = this.attributes.map(data => this.upsertAttribute(data))
      await Promise.all(promises)
      this.editing = false
      this.saving = false
    },
    async cancelEdit () {
      this.editing = false
    }
  }
}
</script>

<style>
.duration {
  min-width: 650px;
}

.attribute {
  margin: 20px 10px;
  text-align: left;
}

.attribute-remove-button-center {
  text-align: center;
}

.text {
  padding: 0 10px;
}

.edit-btn {
  position: absolute !important;
  top: 50 !important;
  right: 100px;
  z-index: 1;
}
.edit-speed-dial {
  top: 88px !important;
}
.vjs-value, .vjs-value__string {
  word-break: break-word;
}
.card-title {
  text-align: center;
  font-size: 29px;
  font-weight: 500;
  margin: auto;
  width: fit-content;
  font-variant-caps: small-caps;
  padding-top: 0;
}
</style>
