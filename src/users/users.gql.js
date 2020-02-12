const gql = require('graphql-tag')

export const searchUsers = gql`
  query members($memberCon: MemberSearchCondition!) {
    members(condition: $memberCon) {
      nodes {
        id
        displayName
        name
        firstName
        lastName
        contactEmail
        contacts {
          id
          memberId
          tenantId
          emails {
            email
          }
        }
        birthdate
        statusId
        status
        slugs(priority: 0){
          id
          priority
          slug
        }
        tenantOid
        sponsorOid
        mrn
        profileUrl
        createdOn
        joinedOn
        timezoneId
        languageId
        legalLocaleId
        tags
        claimedOn
        tenantId
      }
      totalCount
    }
  }
`

export const getSurveys = gql`
  query Surveys($input: SurveyResponseSearch!) {
    surveyResponse(input: $input) {
      id
      surveyId
      modifiedOn
      answers {
        questionName
        values {
          value
        }
      }
    }
  }
`

export const getAppointments = gql`
  query Appointments($input: AppointmentQuery!) {
    appointments(input: $input) {
      id
      host {
        id
        mrn
        displayName
        contactEmail
      }
      participants {
        id
        mrn
        displayName
        contactEmail
      }
      createdOn
      scheduledDate
      startTime
      endTime
      canceled
      canceledReason
      timeLimit
      maxParticipant
      type
    }
  }
`

export const updateMember = gql`
  mutation updateMember($input: MemberInfoInput!) {
    updateMember(input: $input) {
      id
      displayName
      name
      firstName
      lastName
      slug
      timezoneId
      languageId
      legalLocaleId
      contactEmail
    }
  }
`

export const updateMemberSubset = gql`
  mutation updateMemberSubset($input: MemberInfoInputSubset!) {
    updateMemberSubset(input: $input) {
      id
    }
  }
`

export const adjustTags = gql`
  mutation adjustTags($input: MemberTagAdjustmentInput!) {
    adjustTags(input: $input) {
      id
      name
      tags
    }
  }
`

export const getMemberCredentials = gql`
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

export const getAddress = gql`
  query addressByContactOrTenant($addressByContactOrTenant: ContactOrTenantInput!) {
    addressByContactOrTenant(input: $addressByContactOrTenant) {
      id
      name
      street
      street2
      city
      province
      postalCode
      country
    }
  }
`

export const updateAddress = gql`
  mutation updateAddress($addressInput: AddressInput!) {
    updateAddress(input: $addressInput) {
      id
      name
      street
      street2
      city
      province
      postalCode
      country
    }
  }
`

export const getPhone = gql`
  query phoneNumberByContact($input: ContactOrTenantInput) {
    phoneNumberByContact(input: $input) {
      id
      number
      contactId
    }
  }
`
export const createPhone = gql`
  mutation createPhone($input: ContactPhoneInput!) {
    contactPhoneUpsert(input: $input) {
      id
      number
      contactId
    }
  }
`

export const updatePhone = gql`
  mutation updatePhone($input: ContactPhoneInput!) {
    updatePhoneNumber(input: $input) {
      id
      number
      contactId
    }
  }
`

export const getMemberAttribute = gql`
  query getMemberAttributes($input: GetMemberAttributesInput!) {
    getMemberAttributes(input: $input) {
      id
      key
      value
    }
  }
`

export const removeMemberAttribute = gql`
  mutation removeMemberAttribute($input: RemoveMemberAttributeInput!) {
    removeMemberAttribute(input: $input) {
      id
      key
      memberId
    }
  }
`

export const upsertMemberAttribute = gql`
  mutation upsertMemberAttribute($input: MemberAttributeInput!) {
    upsertMemberAttribute(input: $input) {
      id
      key
      value
    }
  }
`

export const treePatch = gql`
  mutation treePatch($input: MemberTreePatchInput!) {
    memberTreePatch(input: $input) {
      id
      tenantId
      firstName
      sponsorOid
    }
  }
`

export const getMemberPayout = gql`
  query membersByIds($ids: [Int]) {
    membersByIds(ids: $ids) {
      id
      payouts {
        id
        status
        currency
        amount
        note
        createdOn
      }
    }
  }
`

export const createMemberPayout = gql`
  mutation createPayoutForMember($input: PayoutInput) {
    createPayoutForMember(input: $input) {
      id
      status
      currency
      amount
      note
      createdOn
    }
  }
`

export const linkAppointmentToPayout = gql`
  mutation linkAppointmentToPayout($input: AppointmentToPayoutInput) {
    linkAppointmentToPayout(input: $input) {
      id
    }
  }
`

export const queryDurations = gql`
  query Durations($input: ScheduleBookingDurationInput!) {
    durations: schedulingBookingDurations(input: $input){
      hostId
      unit{
        id
        name
        key
      }
      bookingType{
        id
        key
        name
      }
      rates {
        id
        amount
        duration
        priority
      }
    }
  }
`

export const removeDuration = gql`
  mutation removeDuration($input: DurationInput) {
    removeDuration(input: $input) {
      id
      priority
    }
  }
`

export const addDuration = gql`
  mutation addDuration($input: DurationInput) {
    addDuration(input: $input) {
      id
    }
  }
`

export const updateSlug = gql`
  mutation updateSlug($updateSlugInput: UpdateSlugInput!) {
    updateMemberSlug(input: $updateSlugInput){
      id
      slug
      priority
      memberId
    }
  }
`

export const createSlug = gql`
  mutation createSlug($createSlugInput: SlugInput!) {
    addMemberSlug(input: $createSlugInput) {
      id
      slug
      priority
      memberId
    }
  }
`

export const addMemberAssociation = gql`
  mutation addMemberAssociation($input: MemberAssociationInput!) {
    addMemberAssociation(input: $input) {
      id
    }
  }
`

export const associationsSearch = gql`
  query getMemberAssociation($input: MemberAssociationInput!) {
    getMemberAssociation(input: $input) {
      id
      typeId
      name
      key
      metadata
      createdOn
      modifiedOn
    }
  }
`

export const getAssociation = gql`
query getAssociation($input: MemberSearchCondition!){
  members(condition: $input) {
    nodes {
      id
      name
      associations {
        id
        association {
          name
          key
          type {
            id
            name
            key
          }
        }
        associationId
        memberId
        member {
          id
          displayName
          name
        }
        role {
          id
          name
          key
        }
      }
    }
  }
}
`

// if ID property is queried on member, it will break and not throw any sort of trace
// https://github.com/apollographql/apollo-client/pull/4895/files
export const GET_MEMBERS_OF_ASSN = gql`
query getMembersOfAssociation($input: MemberAssociationInput) {
  getMemberAssociation(input: $input) {
    name
    memberships{
      metadata
      memberId
      member {
        displayName
      }
      role {
        name
      }
    }
    type {
      name
    }
  }
}
`
