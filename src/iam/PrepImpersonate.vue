<template>
  <v-dialog v-model="show" max-width="768" persistent>
    <v-card class="box">
      <h3>Impersonate</h3>
      <v-form v-if="!success">
        <v-text-field
          v-model="tempPin"
          label="Enter a tempory pin"
          required
        >
        </v-text-field>
      </v-form>
      <v-layout justify-space-around align-center column v-if="success">
        <v-text-field :value="impersonate.token" label="Token" outline readonly></v-text-field>
        <h3>The following targets are available:</h3>
        <v-flex class="select">
          <v-select
            :items="impersonate.targets"
            label="Select a target"
            v-model="selection"
          ></v-select>
        </v-flex>
      </v-layout>
      <v-btn v-if="!success" @click="prepImpersonate" :loading="loading">Submit</v-btn>
      <v-btn v-if="selection" @click="open" :loading="loading">Impersonate</v-btn>
      <v-btn @click="cancel">Cancel</v-btn>
    </v-card>
  </v-dialog>
</template>

<script>
import { pathOr } from 'ramda'

import { PREP_IMPERSONATE } from '@/impersonation/impersonate.gql.js'

export default {
  props: {
    showPrepDialog: { type: Boolean, default: false },
    credentialId: String,
    memberId: Number,
    tenantId: Number
  },
  data() {
    return {
      tempPin: '',
      success: false,
      impersonate: {},
      loading: false,
      selection: '',
      parsedTargets: []
    }
  },
  computed: {
    show: {
      get() { return this.showPrepDialog },
      set(v) { this.$emit('closeDialog') }
    },
    cId: {
      get() { return ~~this.credentialId }
    },
    mId: {
      get() { return ~~this.memberId }
    },
    tId: {
      get() { return ~~this.tenantId }
    }
  },
  methods: {
    async prepImpersonate() {
      this.loading = true
      const result = await this.$apollo.mutate({
        mutation: PREP_IMPERSONATE,
        variables: {
          input: {
            tenantId: this.tId,
            credentialId: this.cId,
            memberId: this.mId,
            temporaryPin: this.tempPin
          }
        }
      })
      this.impersonate = pathOr(undefined, ['data', 'iamImpersonationPrepare'], result)

      this.impersonate.targets.forEach((target, index) => {
        const res = /\/\/(?<url>[^/]+)/gm.exec(target)
        const { groups: { url } } = res
        this.impersonate.targets[index] = {
          text: url,
          value: target
        }
      })

      this.success = true
      this.loading = false
    },
    cancel() {
      this.impersonate = {}
      this.success = false
      this.selection = ''
      this.tempPin = ''
      this.$emit('closeDialog', this.form)
    },
    open() {
      window.open(this.selection, '_blank')
    }
  }

}
</script>

<style>
.box {
  padding: 10px;
}
.select {
  width: 100%;
}
</style>
