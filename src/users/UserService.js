import { get as _get } from 'lodash'

import { apolloClient } from '@/vue-apollo'

import * as gql from './users.gql'

const doQuery = (query, args) =>
  apolloClient.query({
    query,
    variables: args,
    fetchPolicy: 'no-cache'
  })

const doMutate = (mutation, args) =>
  apolloClient.mutate({
    mutation,
    variables: args
  })

export const search = async ({ ids, term, tags, first, after }) => {
  const result = await doQuery(gql.searchUsers, {
    memberCon: { ids, query: term, tags, first, after }
  })
  return _get(result, 'data.members', [])
}

export const get = async ({ id }) => {
  const result = await doQuery(gql.searchUsers, { memberCon: { ids: [~~id] } })
  return _get(result, 'data.members.nodes[0]', undefined)
}

export const upsert = async params => {
  const statusId = _get(params, 'statusId')
  const result = await doMutate(gql.updateMember, {
    input: {
      contactEmail: _get(params, 'contactEmail'),
      displayName: _get(params, 'displayName'),
      firstName: _get(params, 'firstName'),
      id: ~~_get(params, 'id'),
      lastName: _get(params, 'lastName'),
      name: _get(params, 'name'),
      slug: _get(params, 'slug'),
      statusId: ~~statusId
    }
  })
  return _get(result, 'data.updateMember', undefined)
}

export const updateMemberSubset = params => {
  return doMutate(gql.updateMemberSubset, {
    input: {
      birthday: params.birthday,
      id: params.memberId,
      legalLocaleId: params.legalLocaleId,
      languageId: params.languageId,
      timezoneId: params.timezoneId
    }
  })
}

export const adjustTags = async ({ memberId, set, add, remove }) => {
  const result = await doMutate(gql.adjustTags, {
    input: { memberId, set, add, remove }
  })
  return _get(result, 'data.adjustTags.tags', undefined)
}

export const getCredentials = async memberId => {
  const result = await doQuery(gql.getMemberCredentials, {
    input: { memberId: ~~memberId }
  })
  return _get(result, 'data.getMemberCredentials', undefined)
}

export const getPhone = contactId => {
  return doQuery(gql.getPhone, { input: { contactId } })
    .then(res => _get(res, 'data.phoneNumberByContact[0]', {}))
}

export const createPhone = ({ contactId, number, id }) => {
  return doMutate(gql.createPhone, {
    input: { contactId, number, id }
  })
}

export const updatePhone = ({ contactId, id, number }) => {
  return doMutate(gql.updatePhone, { input: { contactId, id, number } })
}

export const getAddress = async contactId => {
  return doQuery(gql.getAddress, { addressByContactOrTenant: { contactId } })
    .then(res => _get(res, 'data.addressByContactOrTenant[0]', {}))
}

export const updateAddress = addressInput => {
  return doMutate(gql.updateAddress, { addressInput })
}

export const updateSlug = updateSlugInput => {
  return doMutate(gql.updateSlug, { updateSlugInput })
}

export const createSlug = createSlugInput => {
  return doMutate(gql.createSlug, { createSlugInput })
}
