import Vue from 'vue'
import VueApollo from 'vue-apollo'
import createApolloClient from './apollo'
const JWT_EXPIRED = 'jwt expired'
const NETWORK_ERROR = 'Network error'

// Install the vue plugin
Vue.use(VueApollo)

// Config
const options = {
  ssr: false,
  base:
    process.env.VUE_APP_PLATFORM_GRAPHQL_ENDPOINT ||
    process.env.VUE_APP_GRAPHQL_ENDPOINT ||
    'http://localhost:3000',
  endpoints: {
    graphql: process.env.VUE_APP_GRAPHQL_PATH || '/graphql',
    subscription: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
  },
  persisting: false,
  subscriptions: true
}

// Create apollo client
export const apolloClient = createApolloClient(options)

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  errorHandler(err) {
    if (
      err.message.toString().indexOf(JWT_EXPIRED) > -1 ||
      err.message.toString().indexOf(NETWORK_ERROR) > -1
    ) {
      localStorage.clear()
      window.location = '/'
    }
  }
})
