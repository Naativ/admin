import gql from 'graphql-tag'

export const ALL_ADDRESSES_BY_TENANT = gql`
  query allAddresses($input: ContactOrTenantInput) {
    allAddresses(input: $input) {
      lat
      long
    }
  }
`
