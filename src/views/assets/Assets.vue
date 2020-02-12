<template>
  <v-flex xs12>
    <div class='assets ma-2' >
      <h1>Assets</h1>
      <v-tabs centered icons-and-text>
        <v-tabs-slider color="pink"></v-tabs-slider>
        <v-tab :to="'/assets'">Review
          <v-icon>account_box</v-icon>
        </v-tab>
        <v-tab :to="'/assets/upload'">Upload
          <v-icon>cloud_upload</v-icon>
        </v-tab>
        <v-tab :to="'/assets/viewAll'">View All
          <v-icon>image_search</v-icon>
        </v-tab>
      </v-tabs>
      <router-view></router-view>
    </div>
  </v-flex>
</template>
<script>
export default {
  name: 'Assets'
}
</script>
<style scoped>

</style>
