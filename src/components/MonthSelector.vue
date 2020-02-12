<template>
  <v-flex>
    <v-menu
      ref="menu"
      :close-on-content-click="false"
      v-model="menu"
      :nudge-right="40"
      :return-value.sync="date"
      lazy
      transition="scale-transition"
      offset-y
    >
      <v-text-field
        slot="activator"
        v-model="date"
        label="Choose Month"
        prepend-icon="event"
        readonly
      ></v-text-field>
      <v-date-picker v-model="date" type="month" no-title scrollable>
        <v-spacer></v-spacer>
        <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
        <v-btn flat color="primary" @click="updateDate">OK</v-btn>
      </v-date-picker>
    </v-menu>
  </v-flex>
</template>

<script>
export default {
  name: 'monthSelector',
  data () {
    return {
      date: null,
      menu: false,
      modal: false
    }
  },
  mounted () {
    this.date = `${this.year}-${this.month}`
  },
  props: {
    month: {
      type: [Number, String],
      default: new Date().getMonth() + 1
    },
    year: {
      type: [Number, String],
      default: new Date().getFullYear()
    }
  },
  methods: {
    updateDate () {
      this.$refs.menu.save(this.date)
      this.$emit('date-changed', {
        date: this.date
      })
    }
  }
}
</script>
