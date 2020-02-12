<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    <v-text-field label="Name" v-model="memberInfo.name" :rules="requiredRule('Name')" required></v-text-field>
    <v-text-field
      label="Display Name"
      v-model="memberInfo.displayName"
      :rules="requiredRule('Display Name')"
      required
    ></v-text-field>
    <v-text-field
      label="First Name"
      v-model="memberInfo.firstName"
      :rules="requiredRule('First Name')"
      required
    ></v-text-field>
    <v-text-field
      label="Last Name"
      v-model="memberInfo.lastName"
      :rules="requiredRule('Last Name')"
      required
    ></v-text-field>
    <v-text-field label="Slug" v-model="memberInfo.slug" :rules="requiredRule('Slug')"></v-text-field>
    <v-text-field label="MRN" v-model="memberInfo.mrn" disabled></v-text-field>
    <v-text-field label="Contact Email" disabled v-model="memberInfo.contactEmail"></v-text-field>
    <v-text-field label="Claimed On" v-model="memberInfo.claimedOn" disabled></v-text-field>
    <v-text-field label="Joined On" v-model="memberInfo.joinedOn" disabled format="MM/DD/YYYY"></v-text-field>
    <v-select
      v-model="memberInfo.legalLocaleId"
      label="Select your locale"
      :rules="requiredRule('Locale')"
      :items="settings.legalLocales"
      item-text="name"
      item-value="id"
    />
    <v-select
      v-model="memberInfo.languageId"
      label="Select your Language"
      :rules="requiredRule('Language')"
      :items="settings.languages"
      item-text="name"
      item-value="id"
    />
    <v-select
      v-model="memberInfo.timezoneId"
      label="Select your Timezone"
      :rules="requiredRule('Timezone')"
      :items="settings.timezones"
      item-text="name"
      item-value="id"
      autocomplete
    />
    <v-btn color="success" :disabled="!valid" @click="save()">Save Info</v-btn>
  </v-form>
</template>

<script>
import getLocalSettings from '@/graphql/GetLocaleSettings'
import UPDATE_MEMBER from '@/graphql/UpdateMember.gql'
import MEMBER_BY_ID from '@/graphql/MemberById.gql'
// import { NULL } from 'graphql/language/kinds'
// import moment from 'moment'

export default {
  name: 'MemberInfo',
  props: {
    memberId: Number
  },
  data() {
    return {
      valid: false,
      memberInfo: {
        id: null,
        displayName: null,
        name: null,
        contactEmail: null,
        firstName: null,
        lastName: null,
        slug: null,
        mrn: null,
        claimedOn: null,
        joinedOn: null,
        timezoneId: null,
        languageId: null,
        legalLocaleId: null
      },
      settings: {}
    }
  },
  apollo: {
    memberInfo: {
      query: MEMBER_BY_ID,
      variables() {
        return {
          condition: {
            ids: [this.memberId]
          }
        }
      },
      update({ members }) {
        const nodes = members && members.nodes
        return Object.assign({}, nodes && nodes[0])
      }
    },
    settings: getLocalSettings()
  },
  methods: {
    save() {
      if (this.$refs.form.validate()) {
        this.$apollo.mutate({
          mutation: UPDATE_MEMBER,
          variables: {
            memberInput: {
              id: this.memberInfo.id,
              displayName: this.memberInfo.displayName,
              name: this.memberInfo.name,
              firstName: this.memberInfo.firstName,
              lastName: this.memberInfo.lastName,
              slug: this.memberInfo.slug,
              timezoneId: this.memberInfo.timezoneId,
              languageId: this.memberInfo.languageId,
              legalLocaleId: this.memberInfo.legalLocaleId
            }
          },
          update: async (store, { data: { updateMember } }) => {
            this.memberInfo = { ...updateMember }
          }
        })
      }
    },
    requiredRule(field) {
      return [v => !!v || `${field} is required`]
    }
  }
}
</script>
