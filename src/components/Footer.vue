<template>
  <v-flex xs12>
    <v-footer
      height="auto"
      color="primary lighten-1"
    >
      <v-layout
        justify-center
        row
        wrap
      >
        <v-btn
          color="white"
          flat
          round
          ><a href="./curriculum">Curriculum</a></v-btn>
        <v-btn color="white" flat round><a href="./topic">Topics</a></v-btn>
        <v-btn color="white" flat round><a href="./block">Blocks</a></v-btn>
        <v-btn color="white" flat round><a href="./unit">Units</a></v-btn>
        <v-btn color="white" flat round><a href="./lesson">Lessons</a></v-btn>
        <v-btn color="white" flat round><a href="./content">Content</a></v-btn>
        <v-flex
          primary
          lighten-2
          py-3
          text-xs-center
          white--text
          xs12>
          </v-flex>
      </v-layout>
    </v-footer>
      </v-flex>
</template>
<script>
export default {
  name: 'Footer'
}
</script>
<style scoped>
a {
  color: white;
  text-decoration: none;
}
a:hover {
  font-weight: bolder;
}
</style>