<template>
  <span v-if ="model">
    <v-list-tile-sub-title
      v-for ="(phoneNumber, index) in model.phoneNumbers"
      :key  ="index"
    >
      <div class="title-container">
        <h4 class="contact-section-heading">Phone {{model.phoneNumbers.length > 1 ? index+1 : null}}</h4>
        <EditButton
          :index         ="index"
          :disabled      ="disabled[index]"
          @editClicked   ="editClicked(index)"
          @saveClicked   ="saveClicked(index)"
          @cancelClicked ="cancelClicked(index)"
        />
      </div>
      <div class="phone-details-container">
        <v-text-field
          prepend-icon ="phone"
          :disabled    ="disabled[index]"
          v-model      ="model.phoneNumbers[index].number"
          label="Number"
        />
        <v-select
          prepend-icon ="phone"
          chips
          label="Type"
          v-model="model.phoneNumbers[index].type"
          :regular="disabled[index]"
          :items="phoneTypeEnum"
          :disabled ="disabled[index]"
          :menu-props="{
            closeOnClick: false,
            closeOnContentClick: true,
            disableKeys: true,
            openOnClick: false,
            maxHeight: 304
          }"
          :append-icon="!disabled[index] ? '$vuetify.icons.dropdown' : null"
        ></v-select>
      </div>
    </v-list-tile-sub-title>
  </span>
</template>

<script>
import { cloneDeep, get } from 'lodash'

import { ContactCardPhoneGQL, PhoneUpsert } from '../../users/members.gql'
import EditButton from './EditButton'

export default {
  name: 'ContactCardPhones',
  components: {
    EditButton
  },
  data () {
    return {
      model: null,
      disabled: [],
      memberId: ~~this.$route.params.id,
      phoneTypeEnum: [
        'Unspecified',
        'Cell',
        'Business',
        'Home'
      ]
    }
  },
  methods: {
    editClicked (index) {
      this.setDisabled(index, false)
    },
    async saveClicked(index) {
      try {
        await this.$apollo.mutate({
          mutation: PhoneUpsert,
          variables: {
            input: {
              id: this.model.phoneNumbers[index].id,
              number: this.model.phoneNumbers[index].number,
              type: this.model.phoneNumbers[index].type.toUpperCase(),
              contactId: this.model.phoneNumbers[index].contactId
            }
          }
        })
        this.$emit('snackbarEmit', 'Phone updated!')
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        console.error(error)
        throw new Error('Error Updating phone number!')
      }

      this.$apollo.queries.phones.refetch()

      this.setDisabled(index, true)
    },
    async cancelClicked (index) {
      this.setDisabled(index, true)
      await this.$apollo.queries.phones.refetch()
      this.initMember(this.phones)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)
      const { phoneNumbers = [] } = this.model

      phoneNumbers.forEach((number, index) => {
        if (number.type) {
          let newType = number.type.toLowerCase()
          newType = newType.charAt(0).toUpperCase() + newType.slice(1)
          this.model.phoneNumbers[index].type = newType
        }
      })

      const disabled = Array(phoneNumbers.length).fill(true)
      this.disabled = disabled
    },
    setDisabled(index, value) {
      const { phoneNumbers = [] } = this.model
      const disabled = Array(phoneNumbers.length).fill(true)

      disabled[index] = value
      this.disabled = disabled
    }
  },
  watch: {
    phones (next) {
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
    }
  },
  apollo: {
    phones: {
      ...ContactCardPhoneGQL,
      variables() {
        return {
          memberId: this.memberId
        }
      },
      update(data) {
        let member = { ...get(data, 'members.nodes.0') }
        const { contacts } = member

        if (contacts && Array.isArray(contacts) && contacts.length < 2) {
          let phoneNumbers
          let parsedContacts

          if (contacts[0].phoneNumbers.length) {
            parsedContacts = contacts[0]
          } else {
            phoneNumbers = [{
              contactId: contacts[0].id,
              id: null,
              number: null,
              type: null
            }]
            parsedContacts = { ...contacts[0], phoneNumbers }
          }

          return parsedContacts
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
.address-title {
  position: absolute;
  top: 9px;
}
.contact-section-heading {
  display: inline;
}
.title-container {
  display: flex;
  justify-content: space-between;
  margin-top: 19px;
  align-items: center;
}
.phone-details-container {
  display: flex;
  align-items: flex-end;
}
</style>
