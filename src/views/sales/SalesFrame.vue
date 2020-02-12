<template>
  <v-layout fill-height row class="payouts">
    <v-flex>
      <Workbench @dashboard="dashboard" @view="view">
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
      this.$router.push('/sales')
    },
    view (member) {
      this.$router.push(`/sales/${member.id}`)
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
