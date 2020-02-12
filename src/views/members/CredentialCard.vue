<template>
  <div>
    <div id="system-title-container">
      <v-toolbar class="indigo darken-1 white--text">
        <v-toolbar-title class="section-subheader">System Information</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <EditButton
            id             ="credentials-edit-btn"
            :disabled      ="disabled"
            @editClicked   ="editClicked"
            @saveClicked   ="saveClicked"
            @cancelClicked ="cancelClicked"
          />
        </v-toolbar-items>
      </v-toolbar>
    </div>
      <v-card tile>
        <v-layout row wrap>
          <v-card-text
            v-if  ="model"
          >
            <v-list-tile-sub-title
              class ="credentials"
              v-for ="(credential, index) in Object.keys(model)"
              :key  ="index"
            >
              <v-text-field
                :label       ="credential"
                prepend-icon ="house"
                :disabled    ="disabled"
                v-model      ="model[credential]"
                :key         ="`address-field-${credential}`"
              >
              </v-text-field>
            </v-list-tile-sub-title>
          </v-card-text>
        </v-layout>
      </v-card>
  </div>
</template>

<script>
import { cloneDeep, get } from 'lodash'

import { CredentialsCardGQL, UsernameUpsert } from '../../users/members.gql'
import EditButton from './EditButton'

export default {
  name: 'CredentialCard',
  components: {
    EditButton
  },
  data () {
    return {
      disabled: true,
      model: null,
      memberId: ~~this.$route.params.id
    }
  },
  methods: {
    editClicked () {
      this.disabled = false
    },
    async saveClicked() {
      const { username } = this.model
      const { identityId } = this.credentials
      const input = {
        identityId,
        username
      }

      try {
        const addressUpdateRes = await this.$apollo.mutate({
          mutation: UsernameUpsert,
          variables: {
            input
          }
        })

        this.$emit('snackbarEmit', 'System Information saved!')

        this.$apollo.queries.credentials.refetch()
        return addressUpdateRes
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        throw new Error('Error updating address!')
      }
    },
    async cancelClicked (index) {
      await this.$apollo.queries.credentials.refetch()
      this.initMember(this.credentials)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)

      delete this.model.__typename
      delete this.model.id
      delete this.model.identityId
      this.disabled = true
    }
  },
  watch: {
    credentials (next) {
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
    }
  },
  apollo: {
    credentials: {
      ...CredentialsCardGQL,
      variables() {
        return {
          input: {
            memberId: this.memberId
          }
        }
      },
      update(data) {
        let credentials = { ...get(data, 'getMemberCredentials.credentials.0') }
        return credentials
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
#credentials-list {
  width: 100%;
}
.section-subheader {
  font-size: 18px !important;
}
#system-title-container {
  display: flex;
  justify-content: space-between;
}
</style>
