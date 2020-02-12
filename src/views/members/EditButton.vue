<template>
  <v-tooltip bottom v-if="disabled">
    <template slot="activator">
      <v-btn
        fab
        small
        @click ="editClicked"
        class  ="indigo lighten-1 buttons"
      >
        <v-icon class="white--text">edit</v-icon>
      </v-btn>
    </template>
    <span>Edit</span>
  </v-tooltip>
  <span style="display: flex;" v-else>
    <v-tooltip bottom>
      <template slot="activator">
        <v-btn
          fab
          small
          @click="saveClicked"
          class  ="indigo lighten-1 buttons"
        >
          <v-icon class="white--text">save</v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template slot="activator">
        <v-btn
          fab
          small
          @click="cancelClicked"
          class  ="indigo lighten-1 buttons"
        >
          <v-icon class="white--text">cancel</v-icon>
        </v-btn>
      </template>
      <span>Cancel</span>
    </v-tooltip>
  </span>
</template>

<script>

export default {
  name: 'EditButton',
  props: {
    disabled: Boolean
  },
  methods: {
    editClicked () {
      this.$emit('editClicked')
    },
    saveClicked() {
      this.$emit('saveClicked')
    },
    cancelClicked () {
      this.$emit('cancelClicked')
    }
  }
}
</script>

<style scoped>
  .buttons {
    z-index: 1;
    margin-bottom: 12px;
    position: relative;
    top: 5px;
  }
</style>
