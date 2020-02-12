<template>
  <v-layout fill-height row class="payouts">
    <v-flex>
      <Workbench @dashboard="dashboard" @view="view">
        <template slot="top">
          <v-tabs v-if="!!$route.params.id" centered icons-and-text>
            <v-tabs-slider color="pink"></v-tabs-slider>
            <v-tab key="1">
              Associations
              <v-icon>recent_actors</v-icon>
            </v-tab>
          </v-tabs>
        </template>

        <router-view />
      </Workbench>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { StoreGetters } from '@/store'
import Workbench from '@/views/generic/layout/WorkbenchFrame'
import { getAssociation } from '@/users/users.gql'
import { UsersMutations } from '@/users/UsersStore'

export default {
  components: {
    Workbench
  },
  methods: {
    ...mapMutations({ usersSetOne: UsersMutations.SET_ONE }),
    dashboard () {
      this.$router.push('/associations')
    },
    async view (member) {
      this.$router.push(`/associations/member/${member.id}`)
    },
    async getAssociations () {
      this.loading = true
      try {
        const { data } = await this.$apollo.query({
          query: getAssociation,
          variables: {
            input: {
              ids: [this.$route.id]
            }
          },
          fetchPolicy: 'network-only'
        })
        await this.usersSetOne({ property: 'associations', value: data.getAssociation })
      } finally {
        this.loading = false
      }
    }
  },
  computed: {
    ...mapGetters({
      access: StoreGetters.access
    })
  },
  mounted() {
    // this.getAssociations()
  }
}
</script>

<style>
.results {
  margin-top: 5px;
  border-color: black;
  border-style: solid;
  position: absolute;
  z-index: 5;
  width: 600px !important;
}

.search {
  width: 350px;
}

.text {
  padding-right: 10px;
}
