<template>
  <v-flex xs12>
    <div class="reports main-container">
      <h1>Reports</h1>
    </div>
    <v-data-table :headers="headers" :items="items" hide-actions class="elevation-1">
      <template slot="items" slot-scope="props">
        <tr @click="expandRow(props)">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.description }}</td>
          <td>
            {{ props.item.parameters.length }}
            {{ props.item.parameters.length == 1 ? 'Parameter' : 'Parameters' }}
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-container grid-list-md fluid class="drawer">
          <v-layout row wrap>
            <v-flex xs4 px-2 py-4>
              <h3>{{props.item.name}}</h3>
              <p>{{props.item.description || 'No Description Available'}}</p>
            </v-flex>
            <v-flex xs7>
              <v-layout row wrap>
                <v-flex xs4 v-for="param in props.item.parameters" :key="param.id">
                  <ReportParameterInput
                    :parameter="param"
                    @change="paramChanged(props.item, $event)"
                  />
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs1 py-4>
              <div class="text-xs-center">
                <v-btn
                  fab
                  dark
                  small
                  color="primary"
                  @click="runReport(props.item)"
                  :disabled="locked"
                >
                  <v-icon dark v-if="!locked">play_arrow</v-icon>
                  <v-icon dark v-if="locked">pause</v-icon>
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
            <v-layout>
          <v-layout column v-if="reportExecutions.length > 0 && !loading">
            <v-flex xs4 px-2 py-4>
              <h3>Previous Reports</h3>
            </v-flex>
              <template v-for="(data, index) in reportExecutions">
                <v-layout row :key="index">
                  <v-text-field
                    label="Date generated"
                    v-model="reportExecutions[index].createdOn"
                    disabled
                    class="report"
                  />
                  <template v-for="(item, i) in reportExecutions[index].parameters">
                    <v-text-field :key="`${i}-param-${index}`"
                      :label="i"
                      v-model="reportExecutions[index].parameters[i]"
                      disabled
                      class="report"
                    />
                  </template>
                  <a class="download" :href="reportExecutions[index].url">Download</a>
                </v-layout>
              </template>
            </v-layout>
            <v-layout v-else-if="loading">
              <v-progress-circular class="loader" indeterminate :size="50" :width="5" color="black"></v-progress-circular>
            </v-layout>
            <v-layout v-else>
              <v-flex xs4 px-2 py-4>
                <h3>No previously run reports</h3>
              </v-flex>
            </v-layout>
          </v-layout>
        </v-container>
      </template>
    </v-data-table>
  </v-flex>
</template>
<script>
import * as R from 'ramda'
// import { reports } from '@/api/reports'
import ReportParameterInput from '@/components/ReportParameterInput.vue'
import GET_REPORTS from '@/graphql/Reports.gql'
import GET_REPORT_EXECUTIONS from '@/graphql/ReportExecutions.gql'
import gql from 'graphql-tag'

export default {
  name: 'Reports',
  components: {
    ReportParameterInput
  },
  methods: {
    async runReport(report) {
      const params = this.inputs[report.id] || {}
      // const tenantId = this.$store.state.user.principal.tenantId
      this.locked = true
      try {
        // await reports.run(report, tenantId, params)
        const result = await this.$apollo.mutate({
          mutation: gql`
            mutation Report($input: ReportInput) {
              reportExecute(input:$input){
                id
                reportId
                rowCount
                name
                description
                url
                createdOn
              }
            }
          `,
          variables: { input: {
            id: report.id,
            parameters: params
          } },
          fetchPolicy: 'no-cache'
        })
        const exe = R.path(['data', 'reportExecute'], result)
        if (exe) {
          // TODO clean this up. use cookies?
          const jwt = R.path(['$store', 'state', 'user', 'jwt'], this)
          const url = `${exe.url}${jwt ? '?__jwt=' + jwt : ''}`
          window.open(url, '_blank')
        } else {
          const err = new Error('No report execution returned')
          err.gql = result
          throw err
        }
      } catch (err) {
        console.warn('error running report', err)
        window.alert('Something has gone very wrong. Please contact support')
        // error handling here!
      } finally {
        this.locked = false
      }
    },
    async getReportExecutions(report) {
      try {
        const { data } = await this.$apollo.query({
          query: GET_REPORT_EXECUTIONS,
          variables: {
            input: {
              reportIds: [report.id],
              limit: 5
            }
          },
          fetchPolicy: 'network-only'
        })
        this.reportExecutions = data.reportExecutions
      } catch (err) {
        console.warn('Error grabbing report execution', err)
      }
    },
    async expandRow(props) {
      this.reportExecutions = []
      props.expanded = !props.expanded
      if (props.expanded) {
        this.loading = true
        await this.getReportExecutions(props.item)
        this.loading = false
      }
    },
    paramChanged(report, { parameter, value }) {
      const input = (this.inputs[report.id] = this.inputs[report.id] || {})
      input[parameter.key] = value
    }
  },
  data() {
    return {
      locked: false,
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description', sortable: false },
        { text: 'Parameters', value: 'params', sortable: false }
      ],
      items: [],
      inputs: {},
      reportExecutions: [],
      loading: false
    }
  },
  apollo: {
    items: {
      query: GET_REPORTS,
      variables() {
        return {
          input: {}
        }
      },
      update(res) {
        this.inputs = {}
        return res.reports
      }
    }
  }
}
</script>

<style>
.drawer {
  background: #eeeeef !important;
}

.report {
  margin: 0 10px;
}

.download {
  margin: auto 10px;
}

.loader {
  margin: auto;
}
</style>
