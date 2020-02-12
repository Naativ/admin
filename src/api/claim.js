import { apolloClient } from '@/vue-apollo'
import gql from 'graphql-tag'

const mQuery = gql`
  mutation GenerateToken($input: GenerateOneTimeTokenInput!) {
    generateOneTimeToken(input: $input)
  }
`

export default {
  create: ({ memberId, tenantId, email, type }) => {
    return apolloClient.mutate({
      mutation: mQuery,
      variables: {
        input: {
          tenantId,
          email,
          type
        }
      }
    })
  }
}
