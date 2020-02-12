<template>
  <div>
    <v-flex>
      <v-menu
        :close-on-content-click="false"
        :disabled="disabled"
        :nudge-right="40"
        :return-value.sync="time"
        full-width
        lazy
        min-width="290px"
        offset-y
        ref="menu"
        transition="scale-transition"
        v-model="menu"
      >
        <v-text-field
          :label="label"
          prepend-icon="access_time"
          readonly
          slot="activator"
          v-model="time"
        />
        <v-time-picker @input="updateTime" v-model="time"/>
      </v-menu>
    </v-flex>
  </div>
</template>

<script>
// If you want to use this component in a dialog, the dialog HAS to be persistent
// https://github.com/vuetifyjs/vuetify/issues/5200
export default {
  name: 'TimeSelector',
  data() {
    return {
      menu: false,
      time: null
    }
  },
  props: {
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Select Time' }
  },
  methods: {
    updateTime() {
      this.$refs.menu.save(this.time)
      this.$emit('selected', this.time)
    }
  }
}
</script>
