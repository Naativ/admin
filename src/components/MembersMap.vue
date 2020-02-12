<template>
  <mgl-map
    class="map"
    :accessToken="accessToken"
    :mapStyle.sync="mapStyle"
    :boxZoom="false"
    :zoom="2"
    :center="[-99.9995795, 48.3552767]"
    >
    <mgl-marker v-for="c in coordinates" :key="c[0]" :coordinates="[c.long, c.lat]" color="blue"></mgl-marker>
  </mgl-map>
</template>

<script>
import { MglMap, MglMarker } from 'vue-mapbox'
import { ALL_ADDRESSES_BY_TENANT } from '@/graphql/Address.gql.js'

export default {
  props: {
    tenantId: Number,
    mapStyle: String,
    accessToken: String
  },
  components: {
    MglMap,
    MglMarker
  },
  data() {
    return {
      coordinates: []
    }
  },
  apollo: {
    coordinates: {
      query: ALL_ADDRESSES_BY_TENANT,
      variables() {
        return {
          input: {
            tenantId: this.$store.state.user.principal.tenantId
          }
        }
      },
      update({ allAddresses }) {
        return allAddresses
      }
    }
  }
}
</script>

<style scoped>
.map {
  max-width: 750px;
  height: 500px;
  margin: auto;
}
</style>
