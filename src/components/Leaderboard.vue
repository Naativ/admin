<template>
   <v-card>
    <v-toolbar color="cyan" dark>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-list two-line>
      <div v-for="item in leaders" :key="item.contactEmail">
        <v-list-tile :key="item.name" avatar >
          <v-list-tile-avatar>
            <img :src="scaleImage(item.profileUrl)">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{item.name}}</v-list-tile-title>
            <v-list-tile-sub-title>{{item.contactEmail}}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-list-tile-title v-if="!currency">{{ item.total }}</v-list-tile-title>
            <v-list-tile-title v-if="currency">{{ formatCurrency(~~item.total) }}</v-list-tile-title>
          </v-list-tile-action>
        </v-list-tile>
      </div>
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: 'LeaderBoard',
  data: () => ({}),
  props: {
    leaders: Array,
    title: String,
    currency: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatCurrency(total) {
      return total.toLocaleString('us-EN', {
        style: 'currency',
        currency: 'USD'
      })
    },
    scaleImage(image) {
      if (image) {
        return image.replace('/image/upload', '/image/upload/w_80')
      }
      return image
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
