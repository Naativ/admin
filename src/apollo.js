import { ApolloClient } from 'apollo-client'
import { BatchHttpLink } from 'apollo-link-batch-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import store from '@/store'

function getAuth() {
  // get the authentication token from local storage if it exists
  const token = store.state.user.jwt
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : undefined
}

// Create the apollo client
export default function createApolloClient({
  ssr,
  base,
  endpoints,
  persisting
}) {
  let httpLink = new BatchHttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql
    // fetch: customFetch
  })

  // HTTP Auth header injection
  const authLink = setContext((_, { headers = {} }) => {
    const context = {
      headers: {
        ...headers
      }
    }
    const authToken = getAuth()
    if (authToken && authToken.trim().length > 0) {
      context.headers.Authorization = authToken
    } else {
      delete context.headers.Authorization
    }
    return context
  })

  // Concat all the http link parts
  const link = authLink.concat(httpLink)

  // Apollo cache
  const cache = new InMemoryCache()

  const apolloClient = new ApolloClient({
    link,
    cache,
    connectToDevTools: process.env.NODE_ENV !== 'production'
  })

  return apolloClient
}
