<template>
  <div>
  <v-container fluid grid-list-md>
    <v-form>
    <input type="text" v-model="slideInfo.name" placeholder="Slide Name" shadow required>
    <v-textarea
      name="input-7-1"
      box
      label="HTML Template"
      auto-grow
      v-model="slideInfo.slide"
    ></v-textarea>
    </v-form>
    <v-btn @click="submitSlide">Submit</v-btn>
  </v-container>
  <v-footer
      height="auto"
      color="primary lighten-1"
    >
      <v-layout
        justify-center
        row
        wrap
      >
        <v-btn color="white" flat round><a href="./curriculum">Curriculum</a></v-btn>
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
  </div>
</template>
<script>
import CREATE_SLIDE from '../graphql/CreateSlide.gql'
// import SLIDES_QUERY from '../graphql/SlidesQuery.gql'
export default {
  name: 'Slides',
  data() {
    return {
      slideInfo: {
        name: '',
        slide: ''
      }
    }
  },
  methods: {
    submitSlide() {
      this.$apollo.mutate({
        mutation: CREATE_SLIDE,
        variables: {
          slideInput: {
            name: this.name,
            slide: this.slide
          }
        },
        update: (store, { data: { slides, submitSlide } }) => {
          slides.push(submitSlide)
        }
      })
    }
  }
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
