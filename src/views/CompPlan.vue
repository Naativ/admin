<template>
  <div id="vue-div">
    <v-toolbar class="tbar pink white--text" primary-title>
      <v-toolbar-title>
        Comp Plan
      </v-toolbar-title>
    </v-toolbar>
    <div id="main-container">
      <div
        id="one-third-container"
      >
        <v-card id="upper-card" color="blue-grey darken-2" class="white--text">
          <v-card-title class="headline" primary-title>Maybe Search Component?</v-card-title>
          <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
        </v-card>
      </div>

      <div
        id="two-thirds-container"
      >
        <div class="three-column">
          <v-card class="cyan white--text column-card">
            <v-card-title class="headline" primary-title>Card 1</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
            <v-card-actions class="pa-3"></v-card-actions>
          </v-card>
          <v-card class="purple lighten-2 white--text column-card">
            <v-card-title class="headline" primary-title>Card 2</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
          </v-card>
          <v-card class="green white--text column-card">
            <v-card-title class="headline" primary-title>Card 3</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
          </v-card>
        </div>
        <div class="three-column">
          <v-card class="cyan darken-1 white--text column-card">
            <v-card-title class="headline" primary-title>Card 4</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
            <v-card-actions class="pa-3"></v-card-actions>
          </v-card>
          <v-card class="purple lighten-1 white--text column-card">
            <v-card-title class="headline" primary-title>Card 5</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
          </v-card>
          <v-card class="green darken-1 white--text column-card">
            <v-card-title class="headline" primary-title>Card 6</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
          </v-card>
        </div>
        <div class="three-column">
          <v-card class="cyan darken-2 white--text column-card">
            <v-card-title class="headline" primary-title>Card 7</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
            <v-card-actions class="pa-3"></v-card-actions>
          </v-card>
          <v-card class="purple white--text column-card">
            <v-card-title class="headline" primary-title>Card 8</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
          </v-card>
          <v-card class="green darken-2 white--text column-card">
            <v-card-title class="headline" primary-title>Card 9</v-card-title>
            <v-card-text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae rem eaque sequi explicabo soluta odit cumque voluptatibus a, dolorem hic! Blanditiis animi architecto corrupti sunt eos! Totam beatae dolores officia.</v-card-text>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Commissions',
  data () {
    return {
      placeholder: new Array(100).fill('上忍')
    }
  }
}
</script>

<style scoped>
  #main-container {
    display: flex;
    width: 100%;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    overflow-y: hidden;
    flex-grow: 1;
    padding: 1% 7% 1% 3%;
    /* background-color: aqua; */
  }

  #one-third-container {
    display: flex;
    justify-content: center;
    /* background-color: fuchsia; */
    flex-grow: 1;
    width: 100%;
    flex-basis: 0;
  }

  #two-thirds-container {
    display: flex;
    justify-content: space-evenly;
    flex-grow: 2;
    width: 100%;
    /* background-color: red; */
    flex-basis: 0;
  }

  #vue-div {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .three-column {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    /* background-color: cadetblue; */
    flex-basis: 33.33%;
    max-width: 32.5%;
  }

  .column-card {
    max-height: 31%;
  }

  #upper-card {
    width: 99%;
  }
</style>
