<template>
  <v-layout row justify-center>
    <v-dialog v-model="open" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Choose New User</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field
                  v-model="newParticipantId"
                  label="New System ID"
                  @keyup="loadHost"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md8>
                <v-text-field v-model="name" label="New User" disabled></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <v-alert color="error" :value="!!error">{{error}}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red darken-1" flat @click="$emit('cancel')">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn :disabled="name === 'No Match'" color="blue darken-1" flat @click="close()">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import { UsersActions } from '@/users/UsersStore'

export default {
  props: {
    open: Boolean
  },
  data() {
    return {
      newParticipantId: undefined,
      newParticipant: {},
      error: undefined,
      name: 'No Match'
    }
  },
  methods: {
    ...mapActions({
      getUser: UsersActions.GET_USER
    }),
    async loadHost() {
      if (!this.newParticipantId || this.newParticipantId.length < 0) {
        this.newParticipant = {}
        return
      }
      this.newParticipant = await this.getUser({ id: ~~this.newParticipantId })
      if (this.newParticipant && this.newParticipant.displayName) {
        this.name = this.newParticipant.displayName
      } else {
        this.name = 'No Match'
      }
    },
    async close() {
      this.$emit('close', this.newParticipantId)
    }
  }
}
</script>
