<template>
  <v-layout column ma-5>
    <v-card>
      <v-card-title class="secondary white--text" primary-title style="justify-content: center;">
        <h1>
          <span v-if="associations">{{displayName ? 'Members of ' + type + ' ' + displayName : ''}}</span>
        </h1>
      </v-card-title>

      <AssociationsDataTable
        v-if="associations"
        :associations="associations"
        :currentScreen="'membersInAssociation'"
        @view="view"
      />
    </v-card>
  </v-layout>
</template>

<script>
import { GET_MEMBERS_OF_ASSN } from '@/users/users.gql'
import AssociationsDataTable from '@/components/AssociationsDataTable.vue'
import { mapGetters, mapActions } from 'vuex'
import { StoreGetters } from '@/store'
import { UsersActions } from '@/users/UsersStore'

export default {
  components: {
    AssociationsDataTable
  },
  data () {
    return {
      association: {},
      headers: [
        { text: 'Id', value: 'id', sortable: false },
        { text: 'Member Name', value: 'name', sortable: false },
        { text: 'Role', value: 'role', sortable: false },
        { text: 'Rate', value: 'metadata', sortable: false, width: '18%' },
        { text: 'Actions', sortable: false, width: '20%' }
      ],
      key: this.$route.params.key,
      addDialog: false,
      displayName: null,
      type: null
    }
  },
  apollo: {
    associations: {
      query: GET_MEMBERS_OF_ASSN,
      variables() {
        return {
          input: {
            key: this.key,
            tenantId: this.$store.state.user.principal.tenantId
          }
        }
      },
      update(data) {
        if (!data) {
          throw new Error(`Failed to retrieve membership of associationKey: ${this.key}`)
        }
        const { memberships, name, type: { name: type } } = data.getMemberAssociation

        this.displayName = name
        this.type = type

        if (Array.isArray(memberships)) {
          const parsedMemberships = memberships.map(member => {
            const { member: { displayName: name }, memberId: id, role: { name: role }, metadata } = member

            return {
              name,
              id,
              role,
              metadata
            }
          })
          return parsedMemberships
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  methods: {
    ...mapActions({
      userStartViewing: UsersActions.START_VIEWING
    }),
    async view(props) {
      const { item: { id } } = props
      this.$router.push(`/members/${id}`)
    }
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    })
  },
  watch: {
    '$route' (to, from) {
      const { params: { key: toKey } } = to
      this.key = toKey
    }
  }
}
</script>

<style>
input {
  padding: 0 !important;
}

.v-input__slot {
  margin-bottom: 0;
}

.association-table {
  cursor: default;
}
.addbtn.sm {
  top: -5px !important;
}
.addbtn {
  top: 15px;
}
</style>
