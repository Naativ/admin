<template>
  <div>
    <div id="section-header-container">
      <v-toolbar class="indigo darken-1 white--text">
        <v-toolbar-title class="section-subheader">Misc Details</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <EditButton
            id             ="misc-details-edit-btn"
            :disabled      ="disabled"
            @editClicked   ="editClicked"
            @saveClicked   ="saveClicked"
            @cancelClicked ="cancelClicked"
          />
        </v-toolbar-items>
      </v-toolbar>
    </div>
    <v-card>
      <v-layout row wrap>
        <v-form id="form" ref="form">
          <v-card-text class="details" v-if="model">
            <v-layout row wrap>
              <v-flex xs6>
                <v-select
                  class="detail-field"
                  chips
                  deletable-chips
                  multiple
                  label="Tags"
                  v-model="model.tags"
                  :regular="disabled"
                  :items="availableTags.values"
                  item-text="blah"
                  :disabled="disabled || availableTags.loading"
                  :menu-props="{
                    closeOnClick: false,
                    closeOnContentClick: true,
                    disableKeys: true,
                    openOnClick: false,
                    maxHeight: 304
                  }"
                  :append-icon="!disabled ? '$vuetify.icons.dropdown' : null"
                ></v-select>
              </v-flex>
              <v-flex xs6>
                <v-select
                  class="detail-field"
                  chips
                  label="Account Status"
                  v-model="model.status"
                  :regular="disabled"
                  :items="statuses"
                  :disabled="disabled"
                  :menu-props="{
                    closeOnClick: false,
                    closeOnContentClick: true,
                    disableKeys: true,
                    openOnClick: false,
                    maxHeight: 304
                  }"
                  :append-icon="!disabled ? '$vuetify.icons.dropdown' : null"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-form>
      </v-layout>
    </v-card>
  </div>
</template>

<script>
import { cloneDeep, get } from 'lodash'
import { mapState, mapActions } from 'vuex'

import {
  MiscDetailsGQL,
  UpdateMemberStatus,
  AdjustTags
} from '../../users/members.gql'
import EditButton from './EditButton'

import { UsersActions } from '@/users/UsersStore'

export default {
  name: 'MiscDetailsCard',
  components: {
    EditButton
  },
  data () {
    return {
      model: null,
      disabled: true,
      memberId: ~~this.$route.params.id,
      items: [],
      slugModel: [],
      statuses: [
        'Active',
        'Member Disabled',
        'Member Expired',
        'Member Locked'
      ]
    }
  },
  methods: {
    ...mapActions({
      adjustTags: UsersActions.ADJUST_TAGS,
      upsertUser: UsersActions.UPSERT_USER
    }),
    editClicked () {
      this.disabled = false
    },
    async saveClicked() {
      this.disabled = true
      const id = ~~this.$route.params.id
      try {
        let statusId

        switch (this.model.status) {
          case 'Active':
            statusId = 1
            break

          case 'Member Disabled':
            statusId = 2
            break

          case 'Member Expired':
            statusId = 3
            break

          case 'Member Locked':
            statusId = 4
            break

          default:
            throw new Error(`Cannot update to status id of ${this.model.status}`)
        }
        this.$apollo.mutate({
          mutation: UpdateMemberStatus,
          variables: {
            input: {
              id,
              statusId
            }
          }
        })
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        throw new Error(`Error saving Member Status: ${error.message}`)
      }

      try {
        if (this.model.tags.length) {
          await this.$apollo.mutate({
            mutation: AdjustTags,
            variables: {
              input: {
                memberId: id,
                set: this.model.tags
              }
            }
          })
        } else {
          await this.$apollo.mutate({
            mutation: AdjustTags,
            variables: {
              input: {
                memberId: id,
                remove: this.miscDetails.tags
              }
            }
          })
        }
      } catch (error) {
        this.$emit('snackbarEmit', error.message)
        throw new Error(`Error saving Member Tags: ${error.message}`)
      }

      this.$emit('snackbarEmit', 'Member tags and status saved!')
      this.$apollo.queries.miscDetails.refetch()
    },
    async cancelClicked () {
      this.disabled = true
      await this.$apollo.queries.miscDetails.refetch()
      this.initMember(this.miscDetails)
    },
    initMember(contact) {
      this.model = cloneDeep(contact)
    },
    async updateSearch(search) {
      try {
        const slugRes = await this.checkSlug([{ slug: search }])

        if (!slugRes.data) throw new Error('Error verifying slug')

        const { data: { checkSlug } } = slugRes
        if (!checkSlug) {
          this.items = [{ slug: search }]
        } else {
          if (checkSlug.memberId === this.memberId) {
            this.items = [{ slug: search }]
          }
        }
      } catch (error) {

      }
    }
  },
  watch: {
    miscDetails (next) {
      this.initMember(next)
    },
    '$route'(newRoute) {
      const { params: { id } } = newRoute
      this.memberId = ~~id
      this.disabled = true
    },
    'model.slugs'(slugs) {
      this.items = slugs
      this.slugModel = slugs
    }
  },
  computed: {
    ...mapState({
      tenantId: state => state.user.principal.tenantId,
      availableTags: state => ({
        loading: state.tenants.tags.loading,
        values: state.tenants.tags.values.map(e => e.name)
      })
    })
  },
  apollo: {
    miscDetails: {
      ...MiscDetailsGQL,
      variables() {
        return {
          memberId: this.memberId
        }
      },
      update(data) {
        let member = { ...get(data, 'members.nodes.0') }
        return member
      }
    }
  }
}
</script>

<style scoped>
.findme {
  border: 2px solid red;
}
#contact-list {
  width: 100%;
}
.address-title {
  position: absolute;
  top: 9px;
}
.member-section-heading {
  display: inline;
}
#form {
  min-width: 100%;
}
.section-subheader {
  font-size: 18px !important;
}
#section-header-container {
  display: flex;
  justify-content: space-between;
}
.detail-field {
  padding: 12px 10px 0px 10px;
}
</style>
