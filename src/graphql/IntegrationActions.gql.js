import gql from 'graphql-tag'

export const INTEGRATION_COMMAND = gql`
  mutation Sendgrid($input: TenantIntegrationCommandInput!) {
    integrationCommand(input: $input){
      payload
    }
  }
`
