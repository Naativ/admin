import { pathOr } from 'ramda'
import { assetMeta, assetCreate, assetSearch as search, assetSetTags } from './content.gql'
import { apolloClient } from '@/vue-apollo'

const doQuery = (query, args = {}) => {
  return apolloClient.query({
    query: query,
    variables: args,
    fetchPolicy: 'network-only'
  })
}

const doMutate = (mutation, args = {}) =>
  apolloClient.mutate({
    mutation,
    variables: args
  })

export const getAssetMeta = async avail => {
  const result = pathOr(
    {},
    ['data', 'assetManagementConfig'],
    await doQuery(assetMeta)
  )
  const tags = pathOr([], ['tags'], result)
  return {
    providers: result.providers || [],
    approval: tags.filter(e => e.key.indexOf('approval:') === 0),
    tags: tags.filter(e => e.key.indexOf('search:') === 0),
    audiences: tags.filter(e => e.key.indexOf('aud:') === 0),
    types: result.types || [],
    allTags: tags
  }
}

export const createAsset = async input => {
  const result = pathOr(
    {},
    ['data', 'assetCreate'],
    await doMutate(assetCreate, { input })
  )
  return result
}

export const setAssetTags = async (assetId, tags) => {
  const result = await apolloClient.mutate({
    mutation: assetSetTags,
    variables: {
      input: {
        assetId,
        tags
      }
    }
  })
  return pathOr({}, ['data', 'assetSetTags'], result)
}

export const searchAssets = async (op, input, jwt) => {
  const { assetSearch } = pathOr(
    { assets: [] },
    ['data'],
    await doQuery(search(op), { input })
  )
  const { results, page, pageSize, totalResults, totalPages } = assetSearch
  // ewwwww
  results.map(a => {
    let url, thumbnailUrl
    if (a.url) {
      url = formatUrl(a.url, jwt)
    }
    if (a.thumbnailUrl) {
      thumbnailUrl = formatUrl(a.thumbnailUrl, jwt)
    }
    return {
      ...a,
      url,
      thumbnailUrl
    }
  })

  return {
    assets: results,
    page,
    pageSize,
    totalResults,
    totalPages
  }
}

const formatUrl = (url, jwt) => {
  return url.split('?__jwt=')[0] + '?__jwt=' + jwt
}
