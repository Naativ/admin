<template>
  <v-layout column ma-5>
    <v-card>
      <v-card-title class="secondary white--text" primary-title style="justify-content: center;">
        <h1><span v-if="associations">{{displayName ? 'Associations containing ' + displayName : ''}}</span></h1>
      </v-card-title>
      <AssociationsDataTable
        :associations="associations"
        :currentScreen="'associationsByMember'"
        @handleEdittingMetaDataArr="handleEdittingMetaDataArr"
        @removeConfirm="removeConfirm"
        @view="view"
      />
    </v-card>
  </v-layout>
</template>

<script>
import { getAssociation } from '@/users/users.gql'
import AssociationsDataTable from '@/components/AssociationsDataTable.vue'
import { mapGetters, mapState, mapActions } from 'vuex'
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
      id: ~~this.$route.params.id,
      addDialog: false,
      displayName: null
    }
  },
  apollo: {
    associations: {
      query: getAssociation,
      variables() {
        return {
          input: {
            ids: [this.id]
          }
        }
      },
      update(data) {
        const { members: { nodes } } = data
        const { associations } = nodes[0]
        if (!associations[0]) {
          this.usersViewing.forEach(result => {
            if (!displayName && result.id === this.id) {
              this.displayName = result.displayName
            }
          })

          return []
        }
        const { member: { displayName } } = associations[0]

        this.displayName = displayName

        if (Array.isArray(associations)) {
          const parsedAssociations = associations.map(association => {
            const {
              association: assn,
              associationId
            } = association

            return {
              id: associationId,
              key: assn.key,
              name: assn.name,
              type: assn.type.name
            }
          })
          return parsedAssociations
        } else {
          return this.placeHolderName ? [{ name: this.placeHolderName }] : []
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  methods: {
    ...mapActions({
      userStartViewing: UsersActions.START_VIEWING
    }),
    handleEdittingMetaDataArr(index, inputValue) {
      this.edittingMetaDataArr[index].metadata.percent = inputValue
    },
    removeConfirm(item) {
      this.removeItem = item
      this.removeDialog = true
    },
    async view(props) {
      const { item: { key } } = props
      this.$router.push(`/associations/id/${key}`)
    }
  },
  computed: {
    ...mapGetters({
      permissions: StoreGetters.permissions
    }),
    ...mapState({
      tenantId: state => state.user.principal.tenantId,
      usersViewing: state => state.users.viewing
    })
  },
  watch: {
    '$route' (to, from) {
      const { params: { id: toId } } = to
      this.id = ~~toId
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
