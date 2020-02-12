import gql from 'graphql-tag'

export const PAYOUT_STATUS_UPDATE = gql`
  mutation updatePayoutStatus($input: UpdatePayoutStatusInput!) {
    updatePayoutStatus(input: $input) {
      id
      memberId
      status
    }
  }
`
