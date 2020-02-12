<template>
  <span v-if ="model">
    <v-list-tile-sub-title
      v-for ="(email, index) in model.emails"
      :key  ="index"
    >
      <div class ="title-container">
        <h4 class="contact-section-heading">Email {{model.emails.length > 1 ? index+1 : null}}</h4>
        <EditButton
          :index         ="index"
          :disabled      ="disabled[index]"
          @editClicked   ="editClicked(index)"
          @saveClicked   ="saveClicked(index)"
          @cancelClicked ="cancelClicked(index)"
        />
      </div>
      <v-text-field
        prepend-icon ="email"
        :disabled    ="disabled[index]"
        v-model      ="model.emails[index].email"
      />
    </v-list-tile-sub-title>
  </span>
</template>

<script>
import { cloneDeep, get } from 'lodash'

import { ContactCardEmailGQL } from '../../users/members.gql'
import { CONTACT_EMAIL_UPSERT } from '@/graphql/Contacts.js'
import EditButton from './EditButton'

export default {
  name: 'ContactCardEmail',
  components: {
    EditButton
  },
  data () {
    return {
      model: null,
      disabled: [],
      memberId: ~~this.$route.params.id
    }
  },
  methods: {
    editClicked (index) {
      this.setDisabled(index, false)
    },
    async saveClicked(index) {
      try {
        await this.$apollo.mutate({
          mutation: CONTACT_EMAIL_UPSERT,
          variables: {
            input: {
              id: this.model.emails[index].id,
              email: this.model.emails[index].email,
              contactId: this.model.id
            }
          }
        })
        this.$emit('snackbarEmit', 'Email saved!')
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        throw new Error('Error updating email')
      }

      this.$apollo.queries.email.refetch()

      this.setDisabled(index, true)
    },
    async cancelClicked (index) {
      this.setDisabled(index, true)
      await this.$apollo.queries.email.refetch()
      this.initMember(this.email)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)
      const { emails = [] } = this.model

      const disabled = Array(emails.length).fill(true)
      this.disabled = disabled
    },
    setDisabled(index, value) {
      const { emails = [] } = this.model

      const disabled = Array(emails.length).fill(true)

      disabled[index] = value
      this.disabled = disabled
    }
  },
  watch: {
    email (next) {
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
    }
  },
  apollo: {
    email: {
      ...ContactCardEmailGQL,
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
.title-container {
  display: flex;
  justify-content: space-between;
  margin-top: 19px;
  align-items: center;
}
</style>
