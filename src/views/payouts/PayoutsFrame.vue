<template>
  <v-layout fill-height row class="payouts">
    <v-flex>
      <Workbench @dashboard="dashboard" @view="view">
        <template slot="top">
          <v-tabs v-if="!!$route.params.id" centered icons-and-text>
            <v-tabs-slider color="pink"></v-tabs-slider>
            <v-tab key="1">
              Payouts
              <v-icon>attach_money</v-icon>
            </v-tab>
          </v-tabs>
        </template>

        <router-view />
      </Workbench>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import { StoreGetters } from '@/store'
import Workbench from '@/views/generic/layout/WorkbenchFrame'
export default {
  components: {
    Workbench
  },
  methods: {
    dashboard () {
      this.$router.push('/payouts')
    },
    view (member) {
      this.$router.push(`/payouts/${member.id}`)
    }
  },
  computed: {
    ...mapGetters({
      access: StoreGetters.access
    })
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
