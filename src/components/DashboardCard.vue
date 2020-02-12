<template>
  <v-card :color="`${color} darken-${darken}`" class="white--text my-2" :style="{overflow: 'hidden'}">
    <v-card-title primary-title>
      <div>
        <span class="display-2" v-if="currency">{{display | toCurrency}}</span>
        <span class="display-2" v-else>{{~~display}}</span>
        <p class="subheading">{{subheading}}</p>
      </div>
    </v-card-title>
    <v-icon class="card-icon">{{icon}}</v-icon>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardCard',
  data: () => ({}),
  props: {
    symbol: String,
    display: Number,
    subheading: String,
    icon: String,
    color: String,
    darken: String,
    currency: {
      type: Boolean,
      default: false
    }
  }
}
</script>
// Add "scoped" attribute to limit CSS to this component only
<style scoped>
v-card {
  overflow: hidden;
}

.card-icon {
  position: absolute;
  top: -15px;
  margin-left: 60%;
  font-size: 150px;
  color: rgba(0, 0, 0, 0.25);
}
</style>
