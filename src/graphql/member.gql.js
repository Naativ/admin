import gql from 'graphql-tag'

export const PROFILES_BY_MEMBER_IDS = gql`
  query profiles($input: LmsProfileFilter!) {
    lmsProfiles(input: $input) {
      page
      pageSize
      totalPages
      totalResults
      results {
        id
        displayName
        memberId
        genderId
        priority
        birthdate
      }
    }
  }
`

export const GET_MEMBER_ASSOCIATION = gql`
query memberAssociationDetailSearch($input: MemberAssociationInput) {
  memberAssociationDetailSearch(input: $input) {
    id
    memberId
    memberName
    associationId
    name
  }
}
`
