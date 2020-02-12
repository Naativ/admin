<template>
  <div>
    <v-flex>
      <v-menu
        :close-on-content-click="false"
        :disabled="disabled"
        :nudge-right="40"
        :return-value.sync="date"
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
          prepend-icon="event"
          readonly
          slot="activator"
          v-model="date"
        />
        <v-date-picker @input="updateDate" v-model="date"/>
      </v-menu>
    </v-flex>
  </div>
</template>

<script>
export default {
  name: 'dateSelector',
  props: {
    disabled: { type: Boolean, default: false },
    label: { type: String, default: 'Select Month' },
    selectedDate: { type: String, default: new Date() }
  },
  data() {
    return {
      date: null,
      menu: false,
      modal: false
    }
  },
  mounted() {
    this.date = this.selectedDate
  },
  methods: {
    updateDate() {
      this.$refs.menu.save(this.date)
      this.$emit('date-changed', { date: this.date })
      this.$emit('selected', this.date)
    },
    parseDate(d) {
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }
  }
}
</script>
