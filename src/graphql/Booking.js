import gql from 'graphql-tag'

export const GET_STATUS_LIST = gql`
  query bookingStatusList {
    bookingStatusList {
      id,
      key,
      name
    }
  }
`

export const GET_TYPE_LIST = gql`
  query bookingTypeList {
    bookingTypeList {
      id,
      key,
      name
    }
  }
`

export const UPSERT_BOOKING = gql`
  mutation bookingUpsert($input: BookingInput!) {
    bookingUpsert(input: $input) {
      id
      typeId
      hostId
      guestId
      start
      end
    }
  }
`

export const SCHEDULE_BOOKING = gql`
  mutation booking($input: ScheduleBookingInput!){
    schedulingBookingUpsert(input:$input){
      id
      typeId
      statusId
      hostId
      availabilityId
    }
  }
`

export const REPROCESS_BOOKING = gql`
  mutation booking($input: BookingInput!){
    reprocessBooking(input:$input){
      id
    }
  }
`
