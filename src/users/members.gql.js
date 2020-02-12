import gql from 'graphql-tag'
import { get } from 'lodash'

/**
 * Returns most the details about a member, including contacts and credentials
 */
export const MemberDetailsQuery = {
  query: gql`
    query member($memberId: Int!) {
      credentials: getMemberCredentials(input: { memberId: $memberId }) {
        tenantId
        credentials {
          id
          identityId
          username
        }
      }
      members(condition: { ids: [$memberId] }) {
        nodes {
          awards {
            id
            name
            awardedOn
            metadata
          }
          birthdate
          id
          firstName
          lastName
          name
          displayName
          mrn
          tenantOid
          profileUrl
          statusId
          slugs {
            id
            slug
            hidden
            explicit
          }
          sponsor {
            id
            displayName
            profileUrl
          }

          createdOn
          claimedOn
          joinedOn
          timezoneId
          legalLocaleId
          type {
            id
            key
            name
            priority
          }
          tags
          contacts {
            id
            firstName
            lastName
            displayName
            phoneNumbers {
              id
              type
              contactId
              number
            }
            emails {
              id
              email
              priority
            }
            addresses {
              name
              street
              street2
              city
              province
              country
              postalCode
              lat
              long
            }
          }
        }
      }
    }
  `,
  update(data) {
    let member = { ...get(data, 'members.nodes.0') }
    if (member) {
      member.credentials = [...get(data, 'credentials.credentials', [])]
      member.credentials = [
        ...member.credentials
      ]
      member.tenantId = data.credentials.tenantId
    }
    return member
  }
}

export const MemberDetailsGQL = {
  query: gql`
    query member($memberId: Int!) {
      members(condition: { ids: [$memberId] }) {
        nodes {
          birthdate
          id
          firstName
          lastName
          name
          displayName
          mrn
          tenantOid
          profileUrl
          slugs {
            id
            slug
            hidden
            explicit
          }
          slug
          sponsor {
            id
            displayName
            profileUrl
          }

          createdOn
          claimedOn
          joinedOn
          timezoneId
          legalLocaleId
          type {
            id
            key
            name
            priority
          }
        }
      }
    }
  `
}

export const MiscDetailsGQL = {
  query: gql`
    query member($memberId: Int!) {
      members(condition: { ids: [$memberId] }) {
        nodes {
          statusId
          status
          tags
        }
      }
    }
  `
}

export const ContactCardNameGQL = {
  query: gql`
    query member($memberId: Int!) {
      members(condition: { ids: [$memberId] }) {
        nodes {
          contacts {
            id
            firstName
            lastName
            displayName
          }
        }
      }
    }
  `
}

export const ContactCardEmailGQL = {
  query: gql`
    query member($memberId: Int!) {
      members(condition: { ids: [$memberId] }) {
        nodes {
          contacts {
            id
            emails {
              id
              email
              priority
            }
          }
        }
      }
    }
  `
}

export const ContactCardPhoneGQL = {
  query: gql`
    query member($memberId: Int!) {
      members(condition: { ids: [$memberId] }) {
        nodes {
          contacts {
            id
            phoneNumbers {
              id
              type
              contactId
              number
            }
          }
        }
      }
    }
  `
}

export const ContactCardAddressesGQL = {
  query: gql`
    query member($memberId: Int!) {
      members(condition: { ids: [$memberId] }) {
        nodes {
          contacts {
            id
            memberId
            addresses {
              type
              id
              contactId
              name
              street
              street2
              city
              province
              country
              postalCode
              lat
              long
            }
          }
        }
      }
    }
  `
}

export const CredentialsCardGQL = {
  query: gql`
    query getMemberCredentials($input: getMemberCredentialsInput!) {
      getMemberCredentials(input: $input) {
        tenantId
        credentials {
          id
          identityId
          username
        }
      }
    }
  `
}

export const CheckSlugQuery = gql`
  query checkSlug($input: SlugInput!) {
    checkSlug(input: $input) {
      id
      tenantId
      memberId
      slug
      priority
    }
  }
`

export const COMP_STATS_QUERY = gql`
  query compStatsQuery($input: CompStatsQueryInput) {
    compStatsQuery(input: $input) {
      results {
        memberId
        rank {
          rank
          achieved
          satisfied {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          deltas {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          requirements {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
        }
        nextRank {
          rank
          achieved
          satisfied {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          deltas {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          requirements {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
        }
      }
    }
  }
`

export const UpdateAddressesMutation = gql`
  mutation updateAddress($input: AddressInput) {
    updateAddress(input:$input) {
        id
        contactId
        name
        street
        street2
        city
        province
        country
        postalCode
        lat
        long
      }
    }
  `

export const PhoneUpsert = gql`
  mutation contactPhoneUpsert($input: ContactPhoneInput!) {
    contactPhoneUpsert(input: $input) {
      id
      number
      type
      contactId
    }
  }
`

export const UsernameUpsert = gql`
  mutation iamUpsertUsername($input: IamUpsertUsernameUpsert) {
    iamUpsertUsername(input: $input)
  }
`

export const ContactsUpsert = gql`
  mutation contactsUpsert($input: ContactUpsertInput) {
    contactsUpsert(input: $input) {
      id
      tenantId
      firstName
    }
  }
`

export const UpdateMemberSubset = gql`
  mutation updateMemberSubset($input: MemberInfoInputSubset) {
    updateMemberSubset(input: $input) {
      id
    }
  }
`

export const AddMemberSlug = gql`
  mutation addMemberSlug($input: SlugInput!) {
    addMemberSlug(input: $input) {
      id
    }
  }
`

export const UpdateMemberSlug = gql`
  mutation updateMemberSlug($input: UpdateSlugInput!) {
    updateMemberSlug(input: $input) {
      id
    }
  }
`

export const UpdateMemberStatus = gql`
  mutation updateMember($input: MemberInfoInput) {
    updateMember(input: $input) {
      id
    }
  }
`

export const AdjustTags = gql`
  mutation adjustTags($input: MemberTagAdjustmentInput!) {
    adjustTags(input: $input) {
      id
      name
      tags
    }
  }
`
