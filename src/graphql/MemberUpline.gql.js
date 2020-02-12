const gql = require('graphql-tag')

export const getHierarchies = gql`
query allHierarchies ($condition: HierarchyCondition) {
  allHierarchies (condition: $condition){
    nodes {
      upline
    }
  }
}
`
