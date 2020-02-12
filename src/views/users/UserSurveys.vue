<template>
  <v-flex xs12>
    <v-data-table :headers="headers" :items="surveys" :loading="loaders.surveys" :expand="true">
      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
      <template slot="items" slot-scope="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.surveyId }}</td>
        <td>{{ moment.utc(props.item.modifiedOn).format('MMMM Do YYYY, h:mm:ss a') }}</td>
        <td class="align-center">{{ props.item.answers.length }}</td>
        <td>
          <button class="mouse-pointer" @click="props.expanded = !props.expanded">
            <v-icon v-if="props.expanded">arrow_drop_down</v-icon>
            <v-icon v-else>arrow_left</v-icon>
          </button>
        </td>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat class="main-container">
          <ul>
            <li v-for="question in props.item.answers" :key="question.questionName">
              <strong>{{question.questionName}}:</strong>
              {{ question.values.map(e => e.value).join(", ") }}
            </li>
          </ul>
        </v-card>
      </template>
      <template slot="no-data">
        <div v-if="loaders.surveys">Searching</div>
        <div v-else>No survey responses have been submitted.</div>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
import * as R from 'ramda'
import moment from 'moment'
import { getSurveys } from '@/users/users.gql'

export default {
  data() {
    return {
      moment,
      surveys: [],
      headers: [
        { text: 'ID', value: 'id', width: '50px' },
        { text: 'Survey', value: 'surveyId', width: '50px' },
        { text: 'Submitted', value: 'modifiedOn' },
        { text: 'Answers Provided', value: 'answers', width: '150px' },
        { width: '50px' }
      ]
    }
  },
  apollo: {
    surveys: {
      query: getSurveys,
      variables() {
        return {
          input: {
            memberId: this.id
          }
        }
      },
      update(response) {
        return R.pathOr([], ['surveyResponse'], response)
      }
    }
  },
  computed: {
    id() {
      return ~~this.$route.params.id
    },
    loaders() {
      return {
        surveys: this.$apollo.queries.surveys.loading
      }
    }
  }
}
</script>
