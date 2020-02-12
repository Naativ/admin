<template>
  <v-container xs6>
    <v-layout column justify-space-around>
      <template>
        <v-progress-linear id="loading-bar" :class="loading ? '' : 'loading-bar-fade'" :indeterminate="loading" />
        <v-card :loading="loading" class="permissions">
          <v-btn
            :class="{ editbtn: true, sm: this.$vuetify.breakpoint.name === 'xs' }"
            v-if="!editing"
            absolute
            dark
            fab
            top
            right
            color="pink"
            @click="editing = true"
          >
            <v-icon>edit</v-icon>
          </v-btn>
          <v-speed-dial
            absolute
            dark
            fab
            top
            right
            color="pink"
            v-model="saveSpeedDial"
            direction="bottom"
            :open-on-hover="true"
            transition="slide-y-transition"
            :disabled="!saving"
            v-else
            class="edit-speed-dial"
          >
            <v-btn slot="activator" v-model="saveActivator" color="pink" dark fab>
              <v-icon>save</v-icon>
              <v-icon>close</v-icon>
            </v-btn>
            <v-btn fab dark small color="green" @click="saveData">
              <v-icon>check</v-icon>
            </v-btn>
            <v-btn fab dark small color="red" @click="cancelEdit">
              <v-icon>cancel</v-icon>
            </v-btn>
          </v-speed-dial>
          <v-layout v-for="(d, i) in parsedPermissions" :key="i" column wrap >
            <v-checkbox
              :label="d.name"
              v-model="d.hasPermission"
              class="text"
              :box="editing"
              :regular="!editing"
              :disabled="!editing"
            ></v-checkbox>
          </v-layout>
          <v-card-text v-if="!parsedPermissions.length && !loading">There are no permissions for this member</v-card-text>
        </v-card>
      </template>
    </v-layout>
    <v-snackbar :timeout="8000" :top="true" :right="true" v-model="snackbar">
      {{snackbarMessage}}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-dialog max-width="25vw" v-model="showConfirmationDialog">
      <v-card>
        <v-card-text class="text-xs-center">
          <v-card-text>Are you sure you want to remove this attribute?</v-card-text>
          <v-btn color="error" @click="removeOneAttribute()">Yes</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { upsertMemberAttribute, getMemberCredentials } from '@/users/users.gql'
import { allPermissions } from '@/graphql/AllPermissions.gql'
import { setPermissions } from '@/graphql/SetPermissions.gql'
import { getPermsByID } from '@/graphql/GetPermsByID.gql'

import { pathOr } from 'ramda'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      allPossiblePermissions: [],
      editing: false,
      identityId: null,
      loading: false,
      parsedPermissions: [],
      permissions: [],
      saveActivator: false,
      saveSpeedDial: false,
      saving: false,
      showConfirmationDialog: false,
      snackbar: false,
      snackbarMessage: ''
    }
  },
  mounted() {
    this.loadPermissions()
  },
  computed: {
    id() {
      return ~~this.$route.params.id
    },
    ...mapState({
      principalPermissions: state => state.user.principal.permissions
    })
  },
  methods: {
    async loadPermissions() {
      this.loading = true
      const credentials = await this.memberCredentials()
      this.identityId = credentials.map(cMap => cMap.identityId)
      this.permissions = await this.getPermsByIdentityId()
      this.parsedPermissions = this.principalPermissions.map(pMap => {
        pMap.hasPermission = this.userPermissionCheck(pMap)
        return pMap
      })
      this.loading = false
    },
    async getAllPermissions() {
      const res = await this.$apollo.query({
        query: allPermissions,
        variables: {
          id: this.id
        },
        fetchPolicy: 'network-only'
      })
      const parsedRes = pathOr([], ['data', 'getAllPossiblePermissions'], res)

      return parsedRes
    },
    async getPermsByIdentityId() {
      const res = await this.$apollo.query({
        query: getPermsByID,
        variables: {
          identityId: this.identityId[0]
        },
        fetchPolicy: 'network-only'
      })
      const parsedRes = pathOr([], ['data', 'iamGetPermsByID'], res)
      const { permissions } = parsedRes
      return permissions
    },
    async memberCredentials() {
      const { data: { getMemberCredentials: { credentials } } } = await this.$apollo.query({
        query: getMemberCredentials,
        variables: {
          input: {
            memberId: this.id
          }
        }
      })
      return credentials
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
      let newPerms = []
      this.parsedPermissions.map(ppMap => {
        if (ppMap.hasPermission) {
          newPerms.push(ppMap.id)
        }
      })
      try {
        await this.$apollo.mutate({
          mutation: setPermissions,
          variables: {
            input: {
              identityId: this.identityId[0],
              permissionIds: newPerms
            }
          }
        })
        this.snackbarMessage = 'Permissions successfully saved!'
        this.snackbar = true
      } catch (error) {
        this.snackbarMessage = 'An error occured while setting permissions'
        this.snackbar = true
        console.error(error)
      }
      this.editing = false
      this.saving = false
      this.loadPermissions()
    },
    async cancelEdit () {
      this.editing = false
    },
    userPermissionCheck(permission) {
      const pIdArr = this.permissions.map(pMap => pMap.id)
      const pCheck = pIdArr.indexOf(permission.id) > -1
      return pCheck
    }
  }
}
</script>

<style>
.permissions {
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 18px 0px 18px 100px;
}

.attribute-remove-button-center {
  text-align: center;
}

.text {
  padding: 0 10px;
}
.editbtn.sm {
  top: -5px !important;
}
.editbtn {
  top: -13px !important;
  right: -28px;
}
.edit-speed-dial {
  top: 15px !important;
  right: -28px;
}
#loading-bar {
  top: -14px;
  position: relative;
  margin: 0;
  opacity: 1;
}
.loading-bar-fade {
  opacity: 0 !important;
  transition: opacity 1500ms ease-out;
}
</style>
