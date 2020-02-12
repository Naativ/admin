<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12>
        <v-text-field
          v-model="value"
          :label="parameter.name"
          @input="onChange($event)"
          :disabled="parameter.implicit"></v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
// {"name":"Tenant ID","type":"int","implicit":true,"nullable":false,"parameterId":1,"isCollection":false}

export default {
  name: 'ReportParameterInput',
  props: {
    parameter: Object
  },
  methods: {
    onChange() {
      const { parameter, value } = this
      this.$emit('change', {
        parameter,
        value
      })
    }
  },
  data() {
    return {
      value: ''
    }
  }
}
</script>

<style scoped>
</style>
