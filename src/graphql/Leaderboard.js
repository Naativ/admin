import gql from 'graphql-tag'

export const MONTHLY_SALES_LEADERBOARD = gql`
  query salesleaders($leaderInput: LeaderboardInput!) {
    monthlySalesLeaderboard(input: $leaderInput) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`

export const MONTHLY_FRONTLINE_LEADERBOARD = gql`
  query frontlineLeader($leaderInput: LeaderboardInput!) {
    monthlyFrontlineLeaderboard(input: $leaderInput) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`
