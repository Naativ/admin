const gql = require('graphql-tag')

export const appointmentPayable = gql`
  query getPayableFromAppointment($appointmentId: Int) {
    getPayableFromAppointment(appointmentId: $appointmentId) {
      amount
      currency
      status
      description
    }
  }
`

export const getAllPayouts = gql`
  query getAllPayouts($input: allPayoutsInput) {
    getAllPayouts(input: $input) {
      id
      memberId
      amount
      currency
      note
      status
      params
      member {
        id
        displayName
      }
      createdOn
    }
  }
`

export const getPaymentFromBooking = gql`
query getPaymentFromBooking($bookingId: Int!) {
    getPaymentFromBooking(bookingId: $bookingId) {
      amount
      currency
      status
      description
    }
  }
`
