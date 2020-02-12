import gql from 'graphql-tag'

export const assetMeta = gql`
  query AssetMgmt {
    assetManagementConfig {
      types {
        id
        name
        mimeType
        name
        key
      }
      tags {
        id
        name
        key
        protected
      }
      providers {
        id
        tenantIntegrationId
        name
        key
      }
    }
  }
`

export const assetCreate = gql`
  mutation AssetMake($input: AssetInput!) {
    assetCreate(input: $input) {
      assetId
      thumbnail {
        id
        tenantIntegrationId
        destination
      }
      destination {
        id
        tenantIntegrationId
        destination
      }
    }
  }
`

export const assetSearch = opName => gql`
  query ${opName}($input: AssetSearch) {
    assetSearch(input: $input) {
      page
      pageSize
      totalPages
      totalResults
      results {
        id
        url
        thumbnailUrl
        name
        slug
        description
        categoryKey
        visibilityId
        owner{
          displayName
          mrn
        }
        tags {
          id
          name
          key
        }
      }
    }
  }
`

export const processingStatus = gql`
  query ProcessingStatus($input: AssetProcessingStatusRequest!){
    assetProcessingStatus(input:$input){
      asset{
        id
        visibilityId
        url
        thumbnailUrl
      }
      jobs {
        integrationOid
        logs {
          id
          message
          createdOn
        }  
      }
    }
  }
`

export const assetUpdate = gql`
  mutation assetUpdate($input: AssetUpdate!){
    assetUpdate(input:$input){
      id
      visibilityId
      url
      thumbnailUrl
    }
  }
`

export const assetSetTags = gql`
  mutation assetSetTags($input: AssetTagsInput!){
    assetSetTags(input:$input){
      assetId
      tagId
    }
  }
`

export const getAssetVisibility = gql`
  query getAssetVisibility {
    getAssetVisibility {
      id
      key
      name
    }
  }
`
