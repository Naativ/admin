import { pathOr } from 'ramda'
import { apolloClient } from '@/vue-apollo'
import {
  getMemberTags as getMemberTagsQuery,
  getTenantInfo as getTenantInfoQuery
} from './tenants.gql'

const doQuery = (query, args) =>
  apolloClient.query({
    query: query,
    variables: args
  })

export const getMemberTags = async () => {
  const result = await doQuery(getMemberTagsQuery)
  const tags = pathOr([], ['data', 'memberTags'], result)
  return tags
}

export const getTenantInfo = async () => {
  const result = await doQuery(getTenantInfoQuery)
  return result
}
