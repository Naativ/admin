<template>
  <v-layout row fill-height>
    <div v-if="this.$vuetify.breakpoint.name === 'xs'">
      <v-select
        clearable
        v-model="selected"
        :items="viewing"
        item-text="displayName"
        item-value="id"
        prepend-icon="person"
        @change="selected ? view(selected) : openSearch()"
      />
      <slot />
    </div>
    <v-layout fill-height row v-else>
      <v-flex shrink @mouseenter="mouseOver" @mouseleave="mouseOut">
        <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" hide-overlay stateless>
          <v-toolbar flat class="transparent">
            <v-list class="pa-0">
              <!-- SIDEBAR: TOP ITEM -->
              <slot name="sidebar-search">
                <v-form @submit.prevent="search" lazy-validation>
                  <v-list-tile avatar>
                    <v-list-tile-avatar>
                      <v-icon>search</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                      <v-list-tile-content>
                        <v-autocomplete
                          :loading="loading"
                          @keyup="searchInputDebounce"
                          hide-no-data
                          regular
                          item-text="displayName"
                          :items="usersSearchResults"
                          :search-input.sync="term"
                          placeholder="Search by Name..."
                        >
                          <template slot="item" slot-scope="props">
                            <div
                              @click="view(props.item)"
                              @mouseover="mouseOver"
                            >{{props.item.displayName}}</div>
                          </template>
                        </v-autocomplete>
                      </v-list-tile-content>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-form>
              </slot>

              <slot name="sidebar-return">
                <v-list-tile class="pointer" avatar @click="goToDashboard">
                  <v-list-tile-avatar>
                    <v-icon>arrow_back</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>Return to Dashboard</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </slot>

              <!-- SIDEBAR: LOADED MEMBERS -->
              <slot name="sidebar-members" v-bind:members="viewing">
                <v-list-tile class="mouseover" avatar v-for="member in viewing.slice().reverse()" :key="member.id">
                  <v-list-tile-avatar @click.stop="view(member)">
                    <img :src="member.profileUrl" v-if="member.profileUrl" />
                    <v-icon v-else class="no-profile">person</v-icon>
                  </v-list-tile-avatar>

                  <v-list-tile-content class="collapse-overflow" @click.stop="view(member)">
                    <v-list-tile-title>{{member.displayName}}</v-list-tile-title>
                    <v-list-tile-sub-title>{{member.id}}</v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn icon @click.stop="close(member)">
                      <v-icon>close</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </slot>

              <!-- GIVE ME SOME SPACE LINTER-->
            </v-list>
          </v-toolbar>
        </v-navigation-drawer>
      </v-flex>
      <v-flex grow>
        <v-layout fill-height column>
          <v-flex shrink>
            <slot name="top" v-bind:members="viewing"></slot>
          </v-flex>
          <v-flex grow>
            <v-layout fill-height column>
              <v-flex>
                <slot></slot>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-snackbar v-model="showSnackbar">
      {{snackbarMessage}}
      <v-btn flat dark @click="showSnackbar = false">close</v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
import { debounce } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { UsersActions } from '@/users/UsersStore'

export default {
  data () {
    return {
      drawer: true,
      index: 1,
      length: 0,
      loading: false,
      mini: true,
      pageSize: 25,
      right: null,
      searchInputDebounce: debounce(() => this.search(), 500),
      selected: null,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarTimeout: 6000,
      tags: [],
      target: undefined,
      term: null
    }
  },
  created () {
    this.toggleDebounce = debounce((value) => {
      this.mini = !value
    }, 450)
  },
  methods: {
    ...mapActions({
      removeUser: UsersActions.STOP_VIEWING,
      getUser: UsersActions.GET_USER,
      usersFetch: UsersActions.FETCH_USERS,
      startViewing: UsersActions.START_VIEWING
    }),
    close (member) {
      this.removeUser(member.id)
      this.$emit('close', member)
    },
    view (member) {
      this.term = null
      this.$emit('view', member)
      const { displayName } = member
      this.snackbarMessage = `Data Loaded for ${displayName}`
      this.snackbarTimeout = 6000
      this.showSnackbar = true
    },
    async search (e) {
      const { term, tags } = this
      this.loading = true
      await this.usersFetch({ term, tags: tags.map(e => e.name), first: this.pageSize, after: (this.index - 1) * this.pageSize })
      this.loading = false
    },
    goToDashboard () {
      this.$emit('dashboard')
    },
    mouseOver () {
      this.toggleDebounce(true)
    },
    mouseOut () {
      this.toggleDebounce(false)
    }
  },
  computed: {
    ...mapState({
      viewing: state => state.users.viewing,
      usersSearchResults: state => state.users.searched.results
    })
  }
}
</script>

<style scoped>
.no-profile {
  border: 1px solid #efefef;
}
.mouseover {
  cursor: pointer;
}
.collapse-overflow {
  text-overflow: ellipsis;
  max-width: 160px;
}

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
</style>
