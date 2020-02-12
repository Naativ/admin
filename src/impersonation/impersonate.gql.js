const gql = require('graphql-tag')

export const PREP_IMPERSONATE = gql`
mutation iamImpersonationPrepare($input: IamImpersonationPreparation!) {
  iamImpersonationPrepare(input: $input){
      token
      targets
      secondsTtl
    }
  }
`

export const IMPERSONATE_MUTATION = gql`
mutation Impersonate($input: IamImpersonationRequest!) {
  iamImpersonate(input: $input){
    token
    success
    reason
    principal {
      member {
        displayName
        tenantId
      }      
      permissionIds
      username
      identityId
      memberId
    }
  }
}
`
