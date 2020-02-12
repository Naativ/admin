import gql from 'graphql-tag'

export const CONTACT_UPSERT = gql`
  mutation contactsUpsert($input: ContactUpsertInput!){ 
    contactsUpsert(input: $input){
      id
    }
  }
`

export const CONTACT_EMAIL_UPSERT = gql`
  mutation contactsUpsertEmail($input: EmailInput){
    contactsUpsertEmail(input: $input){
      id
    }
  }
`
