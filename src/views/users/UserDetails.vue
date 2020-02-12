<template>
  <v-flex xs12 class="user-details">
    <hr />
    <ChangeSponsorDialog :showing="sponsorChange.show" @close="sponsorChangeClose" />
    <v-speed-dial
      dark
      fab
      bottom
      right
      fixed
      color="pink"
      v-model="saveSpeedDial"
      direction="top"
      :open-on-hover="true"
      transition="slide-y-transition"
      :disabled="!saving"
      class="edit-speed-dial"
    >
      <v-btn
        slot="activator"
        v-model="saveActivator"
        color="pink"
        dark
        fab
        @click="saveActivator= !saveActivator"
      >
        <v-icon v-if="!editing">more_vert</v-icon>
        <v-icon v-else>save</v-icon>
      </v-btn>
      <v-btn v-if="!editing" fab dark small color="green" @click="startEdit()">
        <v-icon>edit</v-icon>
      </v-btn>
      <v-btn v-if="editing" fab dark small color="green" @click="saveData">
        <v-icon>check</v-icon>
      </v-btn>
      <v-btn v-if="editing" fab dark small color="red" @click="cancelEdit">
        <v-icon>cancel</v-icon>
      </v-btn>
    </v-speed-dial>
    <PrepImpersonate
      v-if="model && credentials"
      :credentialId="credentialId.toString()"
      :showPrepDialog="showPrepDialog"
      :memberId="model.id"
      :tenantId="credentials.tenantId"
      @closeDialog="closeDialog"
    />
    <v-snackbar :timeout="8000" :top="true" :right="true" v-model="snackbar.show">
      <span v-html="snackbar.message" />
      <v-btn
        v-if="!snackbar.mandatory"
        flat
        color="pink"
        @click.native="snackbar.show = false"
      >Close</v-btn>
    </v-snackbar>
    <div v-if="!model">
      <v-alert :value="missing" type="error">Could not load the requested user</v-alert>
      <v-alert :value="!missing" type="info">Loading</v-alert>
    </div>
    <v-layout row wrap v-else justify-space-around>
      <v-flex xs12 sm4 class="align-center">
        <v-flex xs12>
          <img :src="model.profileUrl" class="profile" v-if="model.profileUrl" />
          <v-icon class="profile-icon" v-else>person</v-icon>
        </v-flex>
        <v-flex xs12 sm8 class="margin-center">
          <v-select
            :disabled="!canEditStatus || !canEdit"
            :box="canEditStatus && editing"
            v-model="model.statusId"
            :items="memberStatus"
            item-text="name"
            item-value="id"
            label="Status"
          />
        </v-flex>
        <v-flex xs12 sm8 class="margin-center">
          <v-combobox
            chips
            multiple
            label="Tags"
            v-model="model.tags"
            :box="editing"
            :regular="!editing"
            :items="availableTags.values"
            item-text="blah"
            :disabled="!editing || availableTags.loading"
            :append-icon="editing ? '$vuetify.icons.dropdown' : null"
          ></v-combobox>
        </v-flex>
      </v-flex>

      <v-flex xs12 sm8>
        <v-form ref="form">
          <v-layout justify-center fill-height row wrap>
            <v-flex sm6 xs12>
              <v-text-field v-model="model.mrn" label="Member Number" required regular disabled />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field v-model="model.tenantOid" label="Member Oid" required regular disabled />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.name"
                label="Name"
                required
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.firstName"
                label="First Name"
                required
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.slug.slug"
                label="Slug"
                :rules="(model.slug && model.slug.length) ? rules.slug : []"
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.phone.number"
                label="Phone Number"
                required
                mask="phone"
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field label="Claimed On" v-model="model.claimedOn" disabled />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                label="Joined On"
                v-model="model.joinedOn"
                disabled
                format="MM/DD/YYYY"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field v-model="model.id" label="System ID" regular disabled />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                :disabled="!canEdit"
                v-model="model.birthdate"
                label="Date of Birth"
                placeholder="MM/DD/YYYY"
                :rules="model.birthdate ? rules.birthdate : []"
              ></v-text-field>
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.displayName"
                label="Display Name"
                required
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.lastName"
                label="Last Name"
                required
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                v-model="model.contactEmail"
                :rules="rules.emailRules"
                label="E-mail"
                required
                :box="editing"
                :regular="!editing"
                :disabled="!canEdit"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-select
                :disabled="!canEdit"
                :items="settings.legalLocales"
                item-text="name"
                item-value="id"
                label="Select your locale"
                v-model="model.legalLocaleId"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-select
                :disabled="!canEdit"
                :items="settings.languages"
                item-text="name"
                item-value="id"
                label="Select your Language"
                v-model="model.languageId"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-autocomplete
                :disabled="!canEdit"
                :items="settings.timezones"
                item-text="name"
                item-value="id"
                label="Select your Timezone"
                v-model="model.timezoneId"
              />
            </v-flex>
            <v-flex sm6 xs12>
              <v-text-field
                prepend-icon="vertical_align_top"
                @click:prepend="showSponsor(model.sponsorOid)"
                :append-outer-icon="canChangeSponsor ? 'edit' : null"
                @click="cancelEvent"
                @hover="cancelEvent"
                @click:append-outer="changeSponsor"
                v-model="model.sponsorOid"
                label="Sponsor Oid"
                required
                regular
                :readonly="true"
                :loading="loadingSponsor"
              />
            </v-flex>
            <v-flex sm6 xs12></v-flex>
          </v-layout>
          <v-layout justify-center fill-height row wrap>
            <v-flex sm6 xs12>
              <h3 class="credential-header">Address</h3>
              <v-text-field
                :disabled="!canEdit"
                label="Name"
                required
                v-model="model.address.name"
              />
              <v-text-field
                :disabled="!canEdit"
                label="Street"
                required
                v-model="model.address.street"
              />
              <v-text-field :disabled="!canEdit" label="Street 2" v-model="model.address.street2" />
              <v-text-field
                :disabled="!canEdit"
                label="City"
                required
                v-model="model.address.city"
              />
              <v-text-field
                :disabled="!canEdit"
                label="State/Province"
                v-model="model.address.province"
                required
              />
              <v-text-field
                :disabled="!canEdit"
                label="Postal Code"
                v-model="model.address.postalCode"
                required
              />
              <v-text-field
                :disabled="!canEdit"
                label="Country"
                v-model="model.address.country"
                required
              />
            </v-flex>
            <v-flex sm6 xs12>
              <h3 class="credential-header">User Credentials</h3>

              <div
                :key="index"
                class="credential-card"
                v-for="(data, index) in credentials.credentials"
              >
                <v-text-field
                  :box="editing"
                  :regular="!editing"
                  :disabled="!canEdit"
                  label="Username"
                  v-model="username"
                  prepend-icon="person"
                  required
                />
                <v-text-field v-model="identityId" prepend-icon="lock" required disabled />

                <v-menu bottom left>
                  <v-btn :loading="resetLoading || registerLoading" slot="activator">Actions</v-btn>
                  <v-list>
                    <v-list-tile
                      v-if="canImpersonate"
                      @click="prepImpersonate(credentials.credentials[index].id)"
                    >
                      <v-list-tile-title>Impersonate</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="resetPassword(credentials.credentials[index])">
                      <v-list-tile-title>Reset Password</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="register(credentials.credentials[index])">
                      <v-list-tile-title>Claim Account</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </div>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>
    <v-snackbar v-model="syncing.active" :timeout="1200" bottom vertical auto-height>
      <span style="text-align: center;">{{syncing.message}}</span>
    </v-snackbar>
  </v-flex>
</template>

<script>
import { get, isEmpty, isEqual } from 'lodash'
import moment from 'moment'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

import { ClaimActions } from '@/stores/ClaimStore'
import { UsersActions, UsersMutations } from '@/users/UsersStore'
import { StoreGetters } from '@/store'

import getLocalSettings from '@/graphql/GetLocaleSettings'
import GET_MEMBER_STATUS from '@/graphql/GetMemberStatus.gql'
import MEMBER_BY_ID from '@/graphql/MemberById.gql'
import { CONTACT_EMAIL_UPSERT } from '@/graphql/Contacts.js'
import iamUpsertUsername from '@/graphql/UpsertUsername.gql'

import PrepImpersonate from '@/iam/PrepImpersonate.vue'
import ChangeSponsorDialog from '@/components/ChangeSponsorDialog'

export default {
  components: {
    PrepImpersonate,
    ChangeSponsorDialog
  },
  data () {
    return {
      loadingSponsor: false,
      syncing: {
        active: false,
        message: 'Transferring data'
      },
      registerLoading: false,
      resetLoading: false,
      sponsorChange: {
        show: false
      },
      tagsBeforeEdit: [],
      showPrepDialog: false,
      saveSpeedDial: false,
      saveActivator: false,
      saving: false,
      editing: false,
      formattedDate: null,
      model: {
        address: {},
        phone: {},
        slug: {}
      },
      moment,
      missing: false,
      isUploading: false,
      isSaving: false,
      valid: true,
      credentials: [],
      credentialId: '',
      identityId: null,
      username: '',
      memberStatus: [],
      rules: {
        birthdate: [
          v => (v && moment(v).isValid()) || 'Birthday Must Be in MM/DD/YYYY Format'
        ],
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+/.test(v) || 'E-mail must be valid'
        ],
        slug: [
          v => !!v || 'Field is required and cannot be changed once submitted',
          v =>
            (v && /^[a-zA-Z0-9]+(?:-[a-z0-9]+)*$/.test(v)) ||
            'Store name must not have spaces or special characters',
          v => {
            return (
              (v && v.length <= 20 && v.length >= 4) ||
              'Store name must be between 4 and 20 characters'
            )
          }
        ]
      },
      settings: {},
      snackbar: {
        show: false,
        message: undefined,
        mandatory: false
      }
    }
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    ...mapState({
      availableTags: state => ({
        loading: state.tenants.tags.loading,
        values: state.tenants.tags.values.map(e => e.name)
      })
    }),
    canEdit () { return this.editing && !this.syncing.active && !this.saving },
    canImpersonate () {
      return this.permissions.find(p => p.id === 11 || p.id === 12)
    },
    canEditStatus () {
      return this.permissions.find(p => p.id === 16)
    },
    canChangeSponsor () {
      return this.permissions.find(p => p.id === 11 || p.id === 99)
    },
    id () { return ~~this.$route.params.id },
    member () { return get(this.target, 'member', {}) }
  },
  methods: {
    ...mapActions({
      adjustTags: UsersActions.ADJUST_TAGS,
      getAddress: UsersActions.GET_ADDRESS,
      getCredentials: UsersActions.GET_USER_CREDENTIALS,
      getPhone: UsersActions.GET_PHONE,
      getUser: UsersActions.GET_USER,
      upsertUser: UsersActions.UPSERT_USER,
      _updateSlug: UsersActions.UPDATE_SLUG,
      createSlug: UsersActions.CREATE_SLUG
    }),
    ...mapMutations({
      _updateAddress: UsersMutations.UPDATE_ADDRESS,
      _updatePhone: UsersMutations.UPDATE_PHONE,
      createPhone: UsersMutations.CREATE_PHONE,
      updateMemberSubset: UsersMutations.UPDATE_SUBSET
    }),
    async getMemberStatus () {
      const { data } = await this.$apollo.query({
        query: GET_MEMBER_STATUS,
        fetchPolicy: 'network-only'
      })
      this.memberStatus = data.getMemberStatus
    },
    async showSponsor (sponsorId) {
      this.loadingSponsor = true
      const { data } = await this.$apollo.query({
        query: MEMBER_BY_ID,
        variables: {
          condition: {
            tenantOids: [sponsorId]
          }
        }
      })
      const sponsor = data.members
      if (sponsor.nodes && sponsor.nodes[0] && sponsor.nodes[0].id) {
        this.loadingSponsor = false
        this.$router.push(`/members/${sponsor.nodes[0].id}`)
      }
    },
    async changeSponsor () {
      this.sponsorChange.show = true
    },
    async sponsorChangeClose () {
      this.sponsorChange.show = false
      await this.sync()
    },
    async cancelEvent (e) {
      e.preventDefault()
      e.stopPropagation()
    },
    startEdit () {
      this.editing = true
      this.tagsBeforeEdit = this.model.tags
      // this.saveActivator =
    },
    requiredRule (field) { return [v => !!v || `${field} is required`] },
    prepImpersonate (id) {
      this.credentialId = id
      this.showPrepDialog = true
    },
    closeDialog () {
      this.credentialId = ''
      this.showPrepDialog = false
    },
    saveAddress () {
      if (isEmpty(this.model.address)) return
      return this._updateAddress({
        id: this.model.address.id,
        name: this.model.address.name,
        street: this.model.address.street,
        city: this.model.address.city,
        province: this.model.address.province,
        country: this.model.address.country,
        postalCode: this.model.address.postalCode,
        street2: this.model.address.street2 || '',
        memberId: this.model.memberId,
        contactId: this.model.contacts[0].id
      })
    },
    saveDate (date) {
      this.$refs.dialog.save(date)
    },
    async updatePhone () {
      if (!this.model.phone.number) return
      const { id, number } = this.model.phone
      const contactId = this.model.contacts[0].id
      return this.model.phone.id
        ? this._updatePhone({ contactId, id, number })
        : this.createPhone({ contactId, id: this.model.id, number })
    },
    async updateSlug () {
      if (!this.model.slug || !this.model.slug.slug) return
      const memberId = ~~this.$route.params.id
      const { tenantId } = this.model
      const { id, slug, priority } = this.model.slug
      return priority >= 0
        ? this._updateSlug({ id, slug, priority, memberId, tenantId })
        : this.createSlug({ slug, memberId, tenantId })
    },
    async sync (mustId) {
      this.syncing.active = true
      this.syncing.message = 'Transferring data'
      const memberId = ~~(mustId || this.$route.params.id)
      if (memberId) {
        const user = await this.getUser({ id: memberId })
        this.credentials = await this.getCredentials(memberId)
        this.model = {
          ...this.model,
          ...user,
          contactEmail: user.contacts[0].emails[0].email,
          slug: { ...user.slugs[0] }
        }
        const { contacts } = this.model
        const address = await this.getAddress(contacts[0].id)
        const phone = await this.getPhone(contacts[0].id)
        this.model = {
          ...this.model,
          address: { ...address },
          phone: { ...phone }
        }
        await this.getMemberStatus()
        if (this.model.birthdate) {
          this.model.birthdate = moment(this.model.birthdate).format('MM/DD/YYYY')
        }
        this.username = this.credentials.credentials[0].username
        this.identityId = this.credentials.credentials[0].identityId
        this.missing = false
      } else {
        this.model = undefined
        this.missing = true
      }
      this.syncing.message = 'Transfer complete'
    },
    upsertUsername () {
      if (!this.credentials.credentials) {
        return null
      }
      const { identityId, username } = this
      this.$apollo.mutate({
        mutation: iamUpsertUsername,
        variables: {
          input: {
            identityId,
            username
          }
        }
      })
    },
    async cancelEdit () {
      this.editing = false
      await this.sync()
    },
    async resetPassword (cred) {
      this.resetLoading = true
      try {
        const { username } = cred
        const { memberId, tenantId } = this.model
        await this.$store.dispatch(ClaimActions.RESET, { memberId, tenantId, email: username })
        this.snackbar = {
          show: true,
          mandatory: true,
          message: `Reset password for ${username}`
        }
      } catch (error) {
        console.warn('failed reset password', error)
        this.snackbar = {
          show: true,
          mandatory: true,
          message: `Error: ${error.message}`
        }
      }
      this.resetLoading = false
    },
    async register (cred) {
      this.registerLoading = true
      try {
        const { username } = cred
        const { memberId, tenantId } = this.model
        await this.$store.dispatch(ClaimActions.CLAIM, { memberId, tenantId, email: username })
        this.snackbar = {
          show: true,
          mandatory: true,
          message: `Sent claim instructions to ${username}`
        }
      } catch (error) {
        console.warn('failed claim', error)
        this.snackbar = {
          show: true,
          mandatory: true,
          message: `Error: ${error.message}`
        }
      }
      this.registerLoading = false
    },
    async saveData () {
      const formIsValid = this.$refs.form.validate()
      if (formIsValid) {
        this.saving = true
        let operation = 'member details'
        try {
          // update the user
          await this.updateSlug()
          await this.updatePhone()
          await this.saveAddress()
          await this.upsertUsername()

          const contactId = this.model.contacts[0].id
          const { id } = this.model.contacts[0]
          const email = this.model.contactEmail

          await this.$apollo.mutate({
            mutation: CONTACT_EMAIL_UPSERT,
            variables: {
              input: {
                id,
                email,
                contactId
              }
            }
          })
          await this.upsertUser({
            displayName: this.model.displayName,
            firstName: this.model.firstName,
            id: this.model.id,
            lastName: this.model.lastName,
            name: this.model.name,
            statusId: this.model.statusId
          })
          await this.updateMemberSubset({
            birthday: this.model.birthdate ? moment(this.model.birthdate).format('YYYY-MM-DD') : null,
            legalLocaleId: this.model.legalLocaleId,
            languageId: this.model.languageId,
            memberId: this.model.id,
            timezoneId: this.model.timezoneId
          })

          this.snackbar = {
            show: true,
            mandatory: true,
            message: 'Updated member details'
          }
          // update the tags
          let tagsStringArray = []
          if (this.model.tags.length > 0) {
            for (let tag of this.model.tags) {
              tagsStringArray.push(`${tag}`)
            }
          }
          operation = 'member tags'
          if (!isEqual(this.tagsBeforeEdit, this.model.tags)) {
            if (tagsStringArray.length > 0) {
              await this.adjustTags({
                memberId: this.model.id,
                set: tagsStringArray
              })
            } else {
              await this.adjustTags({
                memberId: this.model.id,
                set: [],
                add: [],
                remove: this.tagsBeforeEdit
              })
            }
          }
          this.snackbar = {
            show: true,
            mandatory: true,
            message: 'Updated member tags'
          }
          // sync again
          await this.sync()
          this.snackbar = {
            show: true,
            mandatory: false,
            message: 'Updated details and tags'
          }
          this.editing = false
        } catch (error) {
          console.warn('Failed updating member / tags', { error })
          const msg = get(error, 'message', 'No error available').split('\n')[0]
          this.snackbar = {
            show: true,
            mandatory: false,
            message: `Failed to update ${operation}:<br/> ${msg}`
          }
        } finally {
          this.saving = false
        }
      } else {
        this.snackbar = {
          show: true,
          mandatory: true,
          message: 'One or more fields were filled out incorrectly'
        }
      }
    }
  },
  async beforeRouteUpdate (to, from, next) {
    await this.sync(to.params.id)
    next()
  },
  async mounted () {
    await this.sync()
  },
  apollo: {
    settings: getLocalSettings()
  }
}
</script>

<style scoped>
.v-input {
  padding-right: 15px;
}
.user-details {
  padding-top: 15px;
}
.user-details .v-text-field--box .v-input__slot {
  background: #fff !important;
}
.profile {
  width: 200px;
  height: 200px;
  border: 1px solid #ccc;
}
.profile-icon {
  font-size: 110px !important;
  width: 200px;
  height: 200px;
  border: 1px solid #ccc;
}
.credential-card {
  border: 1px solid #efefef;
  padding: 15px;
}

.credential-header {
  padding: 10px 0px;
}

.edit-speed-dial {
  bottom: 20px;
  right: 30px;
}
</style>
