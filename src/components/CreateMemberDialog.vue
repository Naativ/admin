<template>
  <v-dialog v-model="creatingMember" max-width="600" persistent>
    <v-toolbar class="primary">
      <v-spacer/>
    <v-toolbar-title class="primary-title white--text" text-color="white">Create Member</v-toolbar-title>
    <v-spacer/>
    <v-tooltip bottom>
      <span slot="activator">
        <v-btn
          @click="$emit('close')"
          color="white"
          flat
          icon
        >
          <v-icon>close</v-icon>
        </v-btn>
      </span>
      <span>Close</span>
    </v-tooltip>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <v-form ref="cmForm">
          <v-text-field label="First Name" v-model="createMember.firstName" :rules="rules.name"></v-text-field>
          <v-text-field label="Last Name" v-model="createMember.lastName" :rules="rules.name"></v-text-field>
          <v-text-field label="E-mail" v-model="createMember.email" :rules="rules.email"></v-text-field>
          <v-btn color="success" @click="clickCreate">Create</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CreateMemberDialog',
  props: {
    createMember: {
      type: Object,
      required: true
    },
    creatingMember: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      rules: {
        email: [
          v => !!v || 'This is a required field',
          v => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'Please enter a valid email address'
        ],
        name: [
          v => !!v || 'This is a required field',
          v => /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(v) || 'Please enter a valid name'
        ]
      }
    }
  },
  methods: {
    clickCreate() {
      const isValid = this.$refs.cmForm.validate()
      if (isValid) {
        this.$emit('clickCreate')
      }
    }
  }
}
</script>
