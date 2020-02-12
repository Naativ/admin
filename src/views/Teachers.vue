<template>
<v-flex xs12>
  <div class='teachers'>
    <h1>Teachers</h1>
  </div>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-spacer></v-spacer>
  <v-data-table
    :headers="headers"
    :items="members"
    :search="search"
    class="elevation-1"
  >
  <template slot="headerCell" slot-scope="props">
    <v-tooltip>
      <span slot="activator">
        {{props.header.text}}
      </span>
    </v-tooltip>
        </template>
    <template slot="items" slot-scope="props">
      <td class="text-xs-left">{{props.item.id }}</td>
      <td class="text-xs-left">
        <a @click="loadMember(props.item)">{{ props.item.name }}</a>
      </td>
      <td class="text-xs-left">{{ props.item.contactEmail }}</td>
      <td class="text-xs-left">{{ props.item.joinedOn | formatDate }}</td>
      </template>
      <v-alert slot='no-results' :value="true" color="error" icon="warning">
        Your search for "{{ search }}" found no results.
      </v-alert>
  </v-data-table>
</v-card>
</v-flex>
</template>

<script>
import ALL_MEMBERS_BY_TENANTID from '@/graphql/AllMembersByTenantId.gql'

export default {
  name: 'Teachers',
  data() {
    return {
      search: '',
      members: [],
      headers: [
        {
          text: 'ID',
          align: 'left',
          sortable: true,
          value: 'id'
        },
        { text: 'Name', value: 'name' },
        { text: 'Email Address', value: 'contactEmail' },
        { text: 'Joined On', value: 'joinedOn' }
      ]
    }
  },
  methods: {
    loadMember: member => {
      console.log('Load person', member)
    }
  },
  apollo: {
    members: {
      query: ALL_MEMBERS_BY_TENANTID,
      variables: {
        memberCon: {
          query: ''
        }
      },
      update({ members }) {
        console.log(members)
        return members.nodes
      }
    }
  }
}
</script>
<style scoped>
</style>
