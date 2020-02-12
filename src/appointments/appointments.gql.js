const gql = require('graphql-tag')

export const upsert = gql`
  mutation UpsertAppointment($input: AppointmentCreateInput!) {
    upsertAppointment(input: $input) {
      id
    }
  }
`

export const appointment = gql`
  query appointment($id: Int) {
    appointment(id: $id) {
      id
      hostId
      host {
        id
        name
        displayName
        mrn
        contactEmail
      }
      participants {
        id
        name
        displayName
        mrn
        contactEmail
      }
      scheduledDate
      startTime
      endTime
      timeLimit
      maxParticipant
      canceled
      canceledReason
      type
      createdOn
      updatedOn
      participantIds
      rating {
        id
        score
        comment
      }
    }
  }
`

export const appointmentSearch = gql`
query appointmentSearch($input: AppointmentDetailSearch) {
  appointmentSearch(input: $input) {
    page
    pageSize
    totalPages
    totalResults
    results {
      id
      appointment {
        id
        host {
          id
          contactEmail
          name
          firstName
        }
      }
      booking {
        id
        type {
          name
        }
        guest {
          id
          contactEmail
          name
          firstName
        }
        host {
          id
          name
          firstName
        }
      }
    }
  }
}
`

export const booking = gql`
query bookingSearch($input: BookingFilter!) {
  bookingSearch(input: $input) {
    page
    pageSize
    totalPages
    totalResults
    results {
      id
      typeId
      statusId
      hostId
      type {
        name
      }
      appointments {
        id
        scheduledDate
        timeLimit
        startTime
        endTime
        rating {
          score
          comment
        }
      }
      host {
        id
        mrn
        name
        firstName
        contactEmail
        displayName
      }
      status {
        name
      }
      guestId
      guest {
        id
        name
        firstName
        mrn
        contactEmail
        displayName
      }
      profileId
      availabilityId
      start
      end
    }
  }
}
`

export const getBookingStatus = gql`
  query getBookingStatus {
    getBookingStatus {
      id
      key
      name
    }
  }
`

export const getBookingType = gql`
  query getBookingType {
    getBookingType {
      id
      key
      name
    }
  }
`
