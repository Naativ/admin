<template>
  <v-layout>
    <v-card class="job-details">
      <h3>Job Details</h3>
      <v-layout row wrap>
        <template v-for="(data, index) in details">
          <v-flex xs6 :key="index">
            <v-text-field
              class="fields"
              :label="label(index)"
              v-model="details[index]"
              required
              regular
              disabled
            ></v-text-field>
          </v-flex>
        </template>
      </v-layout>
    </v-card>
  </v-layout>
</template>

<script>
import { jobDetails } from '@/views/appointments/jobDetails.js'

export default {
  data() {
    return {
      details: jobDetails[0]
    }
  },
  methods: {
    label(text) {
      return text.replace('_', ' ')
    }
  },
  computed: {

  }
}
</script>

<style>
.job-details {
  height: 100%;
  padding: 10px 10px;
  width: 100%;
  margin: 10px 10px;
}

.fields {
  height: 100%;
  padding: 0px 10px;
  width: 100%;
  margin: 0px 10px;
}
</style>
