<template>
  <v-flex xs12>
    <div class="teacher">
      <h1>{{ name }}'s Profile</h1>
      <div v-if="!$apollo.queries.results.loading">
        <v-flex xs4>
          <div class="mx-auto">
            <h3>Profile Image</h3>
            <img class="image" :src="getAvatar">
            <form enctype="multipart/form-data" novalidate>
              <input
                type="file"
                name="avatar"
                :disabled="isSaving"
                @change="filesChange($event.target.files)"
                accept="image/*"
              >
              <div v-if="isUploading">Uploading... please wait</div>
            </form>
          </div>
        </v-flex>
        <v-layout row wrap>
          <v-flex lg6 v-if="results && results.target">
            <h3>Address</h3>
            <Address :memberId="results.target.memberId"/>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex lg6 v-if="results && results.target">
            <h3>Profile Information</h3>
            <MemberInfo :memberId="results.target.memberId"/>
          </v-flex>
        </v-layout>
      </div>
      <div v-else>
        <v-progress-circular indeterminate :size="70" :width="7" color="black"/>
      </div>
    </div>
    <v-snackbar :timeout="8000" :top="true" :right="true" v-model="snackbar">
      {{snackbarMessage}}
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-flex>
</template>

<script>
import MEMBER_BY_ID from '@/graphql/MemberById.gql'
import getTeamByMemberId from '@/graphql/GetTeam'
import UPDATE_MEMBER from '@/graphql/UpdateMember.gql'
// import moment from 'moment'
import Address from '@/components/Address'
import MemberInfo from '@/components/MemberInfo'
import { Actions } from '@/store'
// import { find, defaultTo, pathOr, map } from 'ramda'
// import { log } from 'async'
import { pathOr } from 'ramda'
export default {
  name: 'Teacher',
  data() {
    return {
      name: null,
      visible: false,
      password: '',
      isSaving: false,
      uploadFileName: null,
      isUploading: false,
      currentId: ~~this.$route.params.id,
      snackbar: false,
      snackbarMessage: '',
      saving: false,
      memberInfo: {
        id: '',
        name: '',
        displayName: '',
        contactEmail: '',
        profileUrl: ''
      },
      results: {}
    }
  },
  components: {
    Address,
    MemberInfo
  },
  methods: {
    async filesChange(files) {
      const file = files[0]
      this.isSaving = true
      this.isUploading = true
      const { data } = await this.$store.dispatch(Actions.FILE_UPLOAD, {
        file
      })
      this.isFalse = false
      this.isUploading = false
      this.MemberInfo.profileUrl = data.secure_url
      this.saveData()
    },
    saveData() {
      this.saving = true
      this.$apollo.mutate({
        mutation: UPDATE_MEMBER,
        variables: {
          memberInput: {
            memberId: this.memberInfo.memberId,
            name: this.memberInfo.name,
            displayName: this.memberInfo.displayName,
            contactEmail: this.memberInfo.email,
            profileUrl: this.memberInfo.profileUrl
          }
        },
        update: (store, response) => {
          this.saving = false
          this.snackbar = true
        }
      })
    },
    showTeam(memberId) {
      this.$router.push({
        path: `/teacher/${memberId == null ? '' : memberId}`
      })
    },
    onSuccess(message) {
      this.snackbar = true
      this.snackbarMessage = message
    },
    onError(errorMessage) {
      if (typeof errorMessage === 'string') {
        this.error = errorMessage
      } else {
        const errors = pathOr({}, ['response', 'data', 'errors'], errorMessage)
        this.snackbarMessage = pathOr(
          'There seems to be a problem. Please try again later or contact customer support.',
          ['message'],
          errors[0]
        )
      }
      this.snackbar = true
    }
  },
  computed: {
    getAvatar() {
      return (
        this.memberInfo.profileUrl ||
        'http://res.cloudinary.com/hexly/image/upload/dev/1001/avatar/undefined.jpg'
      )
    }
  },
  apollo: {
    name: {
      query: MEMBER_BY_ID,
      variables() {
        return {
          condition: {
            id: this.currentId
          }
        }
      },
      update({ allHierarchies }) {
        return allHierarchies.nodes[0] ? allHierarchies.nodes[0].name : 'root'
      },
      skip() {
        return this.$store.state.user.principal.tenantId === undefined
      }
    },
    results() {
      return getTeamByMemberId(
        'currentId',
        this.$store.state.user.principal.tenantId
      )
    },
    update({ targetStats, firstLevelStats }) {
      return targetStats.nodes.concat(firstLevelStats.nodes)
    },
    skip() {
      return this.$store.state.user.principal.tenantId === undefined
    }
  }
}
</script>

<style>
.image {
  width: 75%;
  height: 75%;
}
</style>
