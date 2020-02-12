<template>
  <v-dialog v-model="visible" persistent>
      <v-card>
        <v-card-title><slot>No content</slot></v-card-title>
        <v-card-actions>
          <v-btn @click="$emit('cancel')">Cancel</v-btn>
          <v-btn @click="$emit('confirm')">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  }
}
</script>
