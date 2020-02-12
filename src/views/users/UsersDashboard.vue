<template>
  <v-card class="main-card">
    <v-card-title primary-title>
      <v-flex xs12>
        <v-form @submit.prevent="resetIndexSearch" ref="form" v-model="valid" lazy-validation>
          <v-layout>
            <v-flex xs9>
              <v-flex xs12>
                <v-text-field required v-model="term" label="Search Term"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-combobox
                  chips
                  :disabled="availableTags.loading"
                  @input="resetIndexSearch"
                  :items="availableTags.values"
                  item-text="name"
                  item-value="id"
                  label="Tags"
                  :loading="loading"
                  v-model="tags"
                  multiple
                  solo
                >
                  <template slot="selection" slot-scope="data">
                    <v-chip
                      :key="'s' + data.item.id"
                      :selected="data.selected"
                      @input="resetIndexRemove(data.item)"
                      close
                    >
                      <strong>{{ data.item.name }}</strong>&nbsp;
                    </v-chip>
                  </template>
                </v-combobox>
              </v-flex>
            </v-flex>
            <v-flex d-flex xs3 child-flex>
              <v-btn
                type="submit"
                :disabled="!valid"
                :loading="loading"
                @click="resetIndexSearch"
              >submit</v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-card-title>
    <!-- Search Results -->
    <v-card-text>
      <div class="text-xs-center" v-if="loading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <v-list v-if="!loading" two-line>
        <template v-for="item in searched.results">
          <v-list-tile :key="item.id" avatar @click="open(item)">
            <v-list-tile-avatar>
              <img :src="item.profileUrl" v-if="item.profileUrl" />
              <v-icon v-else>person</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{item.displayName}}</v-list-tile-title>
              <v-list-tile-sub-title>
                <v-layout row wrap>
                  <v-flex xs6 sm3>MRN: {{item.mrn}}</v-flex>
                  <v-flex xs6 sm3>System ID: {{item.id}}</v-flex>
                  <v-flex xs6 sm3>Email: {{getEmail(item)}}</v-flex>
                  <v-flex xs6 sm3 class="align-right">
                    <v-tooltip left>
                      <a slot="activator">{{item.tags.length}} tags</a>
                      <v-list>
                        <v-list-tile v-for="(tag, index) in item.tags" :key="index">
                          <v-list-tile-title>{{ tag }}</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-tooltip>
                  </v-flex>
                </v-layout>
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
      <v-layout justify-space-around align-center>
        <v-pagination v-if="length >= 1 && !loading" v-model="index" :length="length"></v-pagination>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { get } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { UsersActions } from '@/users/UsersStore'

export default {
  data () {
    return {
      loading: false,
      valid: true,
      term: '',
      tags: [],
      pageSize: 25,
      index: 1,
      length: 0
    }
  },
  methods: {
    ...mapActions([UsersActions.FETCH_USERS]),
    open (user) {
      this.$router.push('/members/' + user.id)
    },
    resetIndexSearch () {
      this.index = 1
      this.search()
    },
    async search () {
      this.loading = true
      const { term, tags } = this
      await this.usersFetch({ term, tags: tags.map(e => e.name), first: this.pageSize, after: (this.index - 1) * this.pageSize })
      this.loading = false
    },
    resetIndexRemove (item) {
      this.index = 1
      this.remove(item)
    },
    remove (item) {
      this.loading = true
      this.tags.splice(this.tags.indexOf(item), 1)
      this.tags = [...this.tags]
      this.search()
      this.loading = false
    },
    getEmail(item) {
      return get(item, 'contacts[0].emails[0].email', 'No Email for this user')
    }
  },
  computed: {
    ...mapState({
      searched: state => state.users.searched,
      availableTags: state => state.tenants.tags
    })
  },
  watch: {
    searched (newVal) {
      this.length = Math.ceil(newVal.totalResults / this.pageSize)
    },
    index (newVal) {
      this.search()
    }
  }
}
</script>

<style scoped>
.full-height {
  height: 77% !important;
}
.main-card {
  min-height: calc(100vh - 200px);
}
</style>
