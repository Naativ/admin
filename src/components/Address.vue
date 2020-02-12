<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
      <v-text-field
        label="Name"
        v-model="address.name"
        :rules="[v => !!v || 'Name is required']"
        required
      />
      <v-text-field
        label="Street"
        v-model="address.street"
        :rules="[v => !!v || 'Street is required']"
        required
      />
      <v-text-field label="Street 2" v-model="address.street2"/>
      <v-text-field
        label="City"
        v-model="address.city"
        :rules="[v => !!v || 'City is required']"
        required
      />
      <v-text-field
        label="State/Province"
        v-model="address.province"
        :rules="[v => !!v || 'State/Province is required']"
        required
      />
      <v-text-field
        label="Postal Code"
        v-model="address.postalCode"
        :rules="[v => !!v || 'Postal Code is required']"
        required
      />
      <v-text-field
        label="Country"
        v-model="address.country"
        :rules="[v => !!v || 'Country is required']"
        required
      />
      <v-btn
        @click="save()"
        :disabled="!valid"
        :loading="loading"
        color="success"
      >
        Save Address
      </v-btn>
    </v-form>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'

import { UsersActions, UsersMutations } from '@/users/UsersStore'

export default {
  name: 'AddressForm',
  props: {
    memberId: Number
  },
  data() {
    return {
      address: {
        id: null,
        name: null,
        street: null,
        city: null,
        province: null,
        country: null,
        postalCode: null,
        street2: null
      },
      loading: false,
      valid: false
    }
  },
  async mounted() {
    const address = await this.getAddress(this.memberId)
    this.address = { ...address }
  },
  methods: {
    ...mapActions({ getAddress: UsersActions.GET_ADDRESS }),
    ...mapMutations({ updateAddress: UsersMutations.UPDATE_ADDRESS }),
    async save() {
      if (this.$refs.form.validate()) {
        try {
          this.loading = true
          await this.updateAddress({
            id: this.address.id,
            name: this.address.name,
            street: this.address.street,
            city: this.address.city,
            province: this.address.province,
            country: this.address.country,
            postalCode: this.address.postalCode,
            street2: this.address.street2 || '',
            memberId: this.memberId
          })
          this.loading = false
        } catch (e) {
          console.error({ e })
          this.loading = false
        }
      }
    }
  }
}
</script>
