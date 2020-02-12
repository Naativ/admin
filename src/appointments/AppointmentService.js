import { pathOr } from 'ramda'
import { apolloClient } from '@/vue-apollo'
const gql = require('./appointments.gql')

// const doQuery = (query, args) =>
//   apolloClient.query({
//     query,
//     variables: args,
//     fetchPolicy: 'no-cache'
//   })

const doMutate = (mutation, args) =>
  apolloClient.mutate({
    mutation,
    variables: args
  })

export const upsert = async params => {
  const result = await doMutate(gql.upsert, {
    input: params
  })
  return pathOr(undefined, ['data', 'upsertAppointment'], result)
}
