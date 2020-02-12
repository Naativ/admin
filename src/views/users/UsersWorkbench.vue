<template>
  <v-layout row align-stretch fill-height>
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
    <v-layout row v-else>
      <v-flex shrink @mouseover="mouseOver" @mouseleave="mouseOut">
        <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" hide-overlay stateless>
          <v-toolbar flat class="transparent">
            <v-list class="pa-0">
              <v-list-tile class="mouseover" avatar @click.stop="openSearch">
                <v-list-tile-avatar>
                  <v-icon>search</v-icon>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <!-- TODO: put a search inline here-->
                  <v-list-tile-title>Search</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-btn icon @click.stop="openSearch">
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>

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
            </v-list>
          </v-toolbar>
        </v-navigation-drawer>
      </v-flex>
      <v-flex grow>
        <div class="tray">
          <slot />
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { get, debounce } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { UsersActions } from '@/users/UsersStore'
import { TenantsActions } from '@/tenants/TenantsStore'

export default {
  props: {
    memberId: Number
  },
  data () {
    return {
      drawer: true,
      mini: true,
      right: null,
      selected: null,
      target: undefined,
      ...mapState({
        tags: state => state.tenants.tags
      })
    }
  },
  watch: {
    async memberId (id) {
      this.selected = id
      if (id) {
        this.target = await this.getUser({ id })
      } else {
        this.target = undefined
      }
    }
  },
  created () {
    this.toggleDebounce = debounce((value) => {
      this.mini = !value
    }, 150)
  },
  methods: {
    ...mapActions([TenantsActions.FETCH_MEMBER_TAGS]),
    ...mapActions({
      removeUser: UsersActions.STOP_VIEWING,
      getUser: UsersActions.GET_USER
    }),
    close (member) {
      this.removeUser(member.id)
      const route = get(this, '$route.params.id', -1)
      if (member && route === member.id) {
        this.$router.push('/members/')
      }
    },
    view (member) {
      const id = typeof member === 'object' ? member.id : member
      this.$router.push('/members/' + id)
    },
    openSearch () {
      this.$router.push('/members/')
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
      viewing: state => state.users.viewing
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
.tray {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
