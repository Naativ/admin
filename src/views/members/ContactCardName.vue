<template>
  <span v-if ="model">
    <v-list-tile-sub-title id="sub-title">
      <h4 class="contact-section-heading">Name</h4>
      <EditButton
        :disabled      ="disabled"
        @editClicked   ="editClicked"
        @saveClicked   ="saveClicked"
        @cancelClicked ="cancelClicked"
      />
    </v-list-tile-sub-title>
    <v-text-field
      label        ="Display Name"
      :disabled    ="disabled"
      v-model      ="model.displayName"
    />
    <v-text-field
      label        ="First Name"
      :disabled    ="disabled"
      v-model      ="model.firstName"
    />
    <v-text-field
      label        ="Last Name"
      :disabled    ="disabled"
      v-model      ="model.lastName"
    />
  </span>
</template>

<script>
import { cloneDeep, get } from 'lodash'

import { ContactCardNameGQL, ContactsUpsert } from '../../users/members.gql'
import EditButton from './EditButton'

export default {
  name: 'ContactCardName',
  components: {
    EditButton
  },
  data () {
    return {
      model: null,
      disabled: true,
      memberId: ~~this.$route.params.id
    }
  },
  methods: {
    editClicked () {
      this.disabled = false
    },
    async saveClicked() {
      this.disabled = true

      const { memberId } = this
      const {
        id,
        firstName,
        lastName,
        displayName
      } = this.model
      const input = {
        id,
        memberId,
        firstName,
        lastName,
        displayName
      }

      try {
        await this.$apollo.mutate({
          mutation: ContactsUpsert,
          variables: {
            input
          }
        })
        this.$emit('snackbarEmit', 'Contact name saved!')
        this.$apollo.queries.contact.refetch()
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        throw new Error('Error updating contact name')
      }
    },
    async cancelClicked () {
      this.disabled = true
      this.$apollo.queries.contact.refetch()
      this.initMember(this.contact)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)
    }
  },
  watch: {
    contact (next) {
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
      this.disabled = true
    }
  },
  apollo: {
    contact: {
      ...ContactCardNameGQL,
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
.address-title {
  position: absolute;
  top: 9px;
}
.contact-section-heading {
  display: inline;
}
#sub-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 9px;
}
</style>
