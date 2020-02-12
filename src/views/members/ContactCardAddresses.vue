<template>
  <div
    v-if  ="model && model.addresses"
  >
    <v-list-tile-sub-title
      v-for ="(address, index) in model.addresses"
      :key  ="index"
    >
      <div class="header-container">
        <h4 class="address-title">Address {{model.addresses.length > 1 ? index+1 : null}}</h4>
        <EditButton
          class          ="edit-button-address"
          :index         ="index"
          :disabled      ="disabled[index]"
          @editClicked   ="editClicked(index)"
          @saveClicked   ="saveClicked(index)"
          @cancelClicked ="cancelClicked(index)"
        />
      </div>
      <div class="addresses">
        <v-select
          prepend-icon ="house"
          label   ="Type"
          :disabled    ="disabled[index]"
          :items  ="[{text:'Shipping', value: 'shipping'}, {text: 'Billing', value: 'billing'}]"
          v-model ="model.type[index].type"
        />
        <v-text-field
          :label       ="addressField"
          prepend-icon ="house"
          :disabled    ="disabled[index]"
          v-model      ="model.addresses[index][addressField]"
          v-for        ="(addressField, addressIndex) in Object.keys(model.addresses[index])"
          :key         ="`address-field-${addressIndex}`"
        >
        </v-text-field>
      </div>
    </v-list-tile-sub-title>
    <v-card-actions>
      <v-tooltip bottom>
        <template slot="activator">
          <v-btn class="indigo lighten-1 white--text" @click="addAddress" round>
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>Add New Address</span>
      </v-tooltip>
    </v-card-actions>
  </div>
</template>

<script>
import { cloneDeep, get } from 'lodash'

import { ContactCardAddressesGQL, UpdateAddressesMutation } from '../../users/members.gql'
import EditButton from './EditButton'

const blankAddress = {
  name: null,
  street: null,
  street2: null,
  city: null,
  province: null,
  country: null,
  postalCode: null,
  lat: null,
  long: null
}

export default {
  name: 'ContactCardAddresses',
  components: {
    EditButton
  },
  data () {
    return {
      model: {},
      disabled: [],
      memberId: ~~this.$route.params.id,
      contactId: null
    }
  },
  methods: {
    editClicked (index) {
      this.setDisabled(index, false)
    },
    async saveClicked(index) {
      this.setDisabled(index, true)

      const { contactId } = this
      const { id } = this.addresses.addresses[index] ? this.addresses.addresses[index] : { id: undefined }
      const { type } = this.model.type[index]

      const input = {
        id,
        contactId,
        name: this.model.addresses[index].name,
        type: type ? type.toUpperCase() : type,
        street: this.model.addresses[index].street,
        street2: this.model.addresses[index].street2,
        city: this.model.addresses[index].city,
        province: this.model.addresses[index].province,
        postalCode: this.model.addresses[index].postalCode,
        country: this.model.addresses[index].country,
        lat: this.model.addresses[index].lat,
        long: this.model.addresses[index].long
      }

      try {
        const addressUpdateRes = await this.$apollo.mutate({
          mutation: UpdateAddressesMutation,
          variables: {
            input
          }
        })
        this.$emit('snackbarEmit', 'Address saved!')

        this.$apollo.queries.addresses.refetch()
        this.initMember(this.addresses)

        return addressUpdateRes
      } catch (error) {
        this.$emit('snackbarEmit', 'Error updating address!')
        throw new Error(error.message)
      }
    },
    async cancelClicked (index) {
      this.setDisabled(index, true)
      this.initMember(this.addresses)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)
      this.model.type = []

      this.model.addresses.forEach((address, index) => {
        delete this.model.addresses[index].id
        delete this.model.addresses[index].contactId
        delete this.model.addresses[index].type
        delete this.model.addresses[index].__typename

        this.model.type.push({
          id: this.addresses.addresses[index].id,
          type: this.addresses.addresses[index].type
        })
      })

      if (!this.model.addresses.length) {
        this.model = {
          ...this.model,
          addresses: [blankAddress]
        }
      }

      const disabled = Array(this.model.addresses.length).fill(true)
      this.$apollo.queries.addresses.refetch()
      this.disabled = disabled
    },
    setDisabled(index, value) {
      const disabled = Array(this.model.addresses.length).fill(true)

      disabled[index] = value
      this.disabled = disabled
    },
    addAddress() {
      this.model.addresses.push(blankAddress)
      this.model.type.push({ type: undefined, id: undefined })
      this.disabled.push(false)
    }
  },
  watch: {
    addresses (next) {
      this.contactId = next.id
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
      this.disabled.fill(true)
    }
  },
  apollo: {
    addresses: {
      ...ContactCardAddressesGQL,
      variables() {
        return {
          memberId: this.memberId
        }
      },
      update(data) {
        let member = { ...get(data, 'members.nodes.0') }
        const { contacts } = member

        if (contacts && Array.isArray(contacts) && contacts.length < 2) {
          return contacts[0]
        }
        return contacts
      }
    }
  }
}
</script>

<style scoped>
.findme {
  border: 2px solid red;
}
.details {
  text-align: left;
}
.addresses {
  display: flex;
  flex-direction: column;
  height: 39vh;
  flex-wrap: wrap;
  min-width: 45vw;
  padding-top: 11px;
  padding-top: 48px;
  position: relative;
}
#contact-list {
  width: 100%;
}
.contact-section-heading {
  display: inline;
}
.header-container {
  display: flex;
  justify-content: space-between;
  margin-top: 19px;
  align-items: center;
}
</style>
