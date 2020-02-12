<template>
  <v-layout row fill-height class="root">
    <v-navigation-drawer fixed v-model="drawer" app temporary clipped>
      <v-list dense>
        <v-list-tile v-if="hasFeature('global.awards')" to="/awards/">
          <v-list-tile-action>
            <v-icon>turned_in</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Awards</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('global.assets')" to="/appointments/">
          <v-list-tile-action>
            <v-icon>calendar_today</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Appointments</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('global.associations')" to="/associations/">
          <v-list-tile-action>
            <v-icon>recent_actors</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Associations</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('global.assets') && access.hasAssets" to="/assets/">
          <v-list-tile-action>
            <v-icon>collections</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Assets</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('learning.curriculum')" to="/curriculum/courses">
          <v-list-tile-action>
            <v-icon>school</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Curriculum</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('global.dashboard')" to="/dashboard">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="access.hasEmails" to="/emails/">
          <v-list-tile-action>
            <v-icon>email</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Emails</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('global.members') && access.hasMembers" to="/members/">
          <v-list-tile-action>
            <v-icon>people</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Members</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <!-- <v-list-tile to="/about">
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Profile</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>-->

        <v-list-tile v-if="hasFeature('global.payouts') && access.hasPayouts" to="/payouts">
          <v-list-tile-action>
            <v-icon>attach_money</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Payouts</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="hasFeature('global.reports') && access.hasReporting" to="/reports">
          <v-list-tile-action>
            <v-icon>bar_chart</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Reports</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="hasFeature('direct.sales.sales') && access.hasSales" to="/sales">
          <v-list-tile-action>
            <v-icon>shopping_basket</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Sales</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <!-- <v-list-tile to="/import">
          <v-list-tile-action>
            <v-icon>import_export</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Import</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/settings">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Settings</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>-->
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="black" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Hexly Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <v-btn data-cy="Display Name" flat slot="activator">{{displayName}}</v-btn>
          <v-list>
            <v-list-tile data-cy="Logout" @click="logout">
              <v-list-tile-title>Log Out</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>

    <v-layout row fill-height class="main">
      <v-flex>
        <router-view />
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import '@/assets/app.scss'
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'
import { UserActions } from '@/stores/UserStore'
import TENANT_FEATURES from '@/graphql/TenantFeatures.gql'

export default {
  data () {
    return {
      drawer: null,
      features: []
    }
  },
  props: {
    source: String
  },
  computed: {
    ...mapGetters({
      access: StoreGetters.access
    }),
    displayName () {
      return this.$store.getters.getName
    }
  },
  apollo: {
    features: {
      query: TENANT_FEATURES,
      variables () {
        return {
          tenantId: this.$store.state.user.principal.tenantId
        }
      },
      update ({ getTenantFeatures }) {
        return getTenantFeatures
      }
    }
  },
  methods: {
    logout () {
      this.$store.dispatch(UserActions.LOGOUT)
      this.$router.go('/login')
    },
    hasFeature (key) {
      const findRes = this.features.find(f => f.key === key)
      return findRes
    }
  }
}
</script>

<style scoped>
.root {
  padding-top: 75px;
}

.main {
  padding: 0px;
  background-color: #fafafa;
  -webkit-box-shadow: 1px 2px 6px -2px #000;
  box-shadow: 1px 2px 6px -2px #000;
  max-height: calc(100% - 10px);
}

.logo {
  width: 100%;
  max-width: 250px;
  margin: auto;
  display: block;
}
</style>
