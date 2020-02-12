import gql from 'graphql-tag'

import { get } from 'lodash'

export const OLD_QUERY = gql`
  query TeamByMemberId(
    $bySponsor: MemberSearchCondition!
    $byTarget: MemberSearchCondition!
    $limit: Int
  ) {
    target: members(first: $limit, condition: $byTarget) {
      nodes {
        memberId: id
        tenantId
        tenantOid
        name
        displayName
        firstName
        lastName
        mrn
        slug
        contacts {
          id
          memberId
          tenantId
          emails {
            email
          }
        }
        profileUrl
        claimedOn
        joinedOn
        timezoneId
        languageId
        legalLocaleId
      }
    }
    team: members(first: $limit, condition: $bySponsor) {
      nodes {
        memberId: id
        tenantId
        tenantOid
        name
        displayName
        mrn
        slug
        contacts {
          id
          memberId
          tenantId
          emails {
            email
          }
        }
        profileUrl
      }
    }
  }
`

export const getTeamByMemberId = (memberIdfn, tenantId, limit) => ({
  query: OLD_QUERY,
  variables: function() {
    const memberId = parseInt(this[memberIdfn]) || null
    return {
      byTarget: {
        ids: [memberId]
      },
      bySponsor: {
        sponsorIds: [memberId]
      },
      limit
    }
  },
  update({ target, team }) {
    const info = {
      target: this[memberIdfn] ? target.nodes[0] : null,
      team: team && team.nodes
    }
    return info
  },
  skip() {
    return tenantId === undefined
  }
})

// not sure wtf is up with the old code. but i was dumb when I wrote it
export const NEW_QUERY = gql`
  query ImmediateTeamByMemberId(
    $sponsor: MemberSearchCondition!
    $target: MemberSearchCondition!
    $children: MemberSearchCondition!
  ) {
    sponsor: members(condition: $sponsor) {
      nodes {
        memberId: id
        tenantId
        name
        displayName
        firstName
        lastName
        mrn
        slug
        email: contactEmail
        profileUrl
        claimedOn
        joinedOn
        timezoneId
        languageId
        legalLocaleId
      }
    }
    target: members(condition: $target) {
      nodes {
        memberId: id
        tenantId
        name
        displayName
        firstName
        lastName
        mrn
        slug
        email: contactEmail
        profileUrl
        claimedOn
        joinedOn
        timezoneId
        languageId
        legalLocaleId
      }
    }
    children: members(condition: $children) {
      nodes {
        memberId: id
        tenantId
        name
        displayName
        mrn
        slug
        email: contactEmail
        profileUrl
      }
    }
  }
`

export const getImmediateTeamByMemberId = (memberId, sponsorOid, tenantId) => ({
  query: NEW_QUERY,
  variables: {
    sponsor: {
      tenantOids: [sponsorOid]
    },
    target: {
      ids: [memberId]
    },
    children: {
      sponsorIds: [memberId]
    }
  },
  update({ sponsor, target, children }) {
    const info = {
      sponsor: get(sponsor, 'nodes.0'),
      target: get(target, 'nodes.0'),
      children: get(children, 'nodes', [])
    }
    return info
  },
  skip() {
    return tenantId === undefined
  }
})

export default getTeamByMemberId
