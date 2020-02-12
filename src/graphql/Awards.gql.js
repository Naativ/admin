import gql from 'graphql-tag'

export const GET_ALL_AWARDS = gql`
  query getAllAwards {
    recognitionGetAllAwards {
      id,
      key,
      name,
      priority,
      config,
      metadata
    }
  }
`

export const SAVE_AWARD = gql`
  mutation recognitionCreateAward($input: RecognitionAwardInput!) {
    recognitionCreateAward(input: $input) {
      id,
      key,
      name,
      priority,
      config,
      metadata
    }
  }
`
