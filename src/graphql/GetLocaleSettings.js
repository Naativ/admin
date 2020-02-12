import gql from 'graphql-tag'

const LOCALE_QUERY = gql`
  query {
    allLegalLocales {
      nodes {
        id
        code
        name
        enabled
      }
    }
    allTimezones {
      nodes {
        id
        countryCode
        utcOffset
        name
      }
    }
    allLanguages {
      nodes {
        id
        name
        localName
      }
    }
  }
`

export default () => {
  return {
    query: LOCALE_QUERY,
    update({ allLegalLocales, allTimezones, allLanguages }) {
      return {
        legalLocales: allLegalLocales.nodes,
        timezones: allTimezones.nodes,
        languages: allLanguages.nodes
      }
    }
  }
}
