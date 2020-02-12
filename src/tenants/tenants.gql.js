const gql = require('graphql-tag')

export const getTenantInfo = gql`
  query tenantInfo {
    tenant {
      id
      baseUrl
      name
      slug
      integrations {
        id
        tenantId
        priority
        metadata
        statusId
        name
        key
      }
    }
  }
`

export const getMemberTags = gql`
  query Tags {
    memberTags {
      id
      name
      protected
    }
  }
`
